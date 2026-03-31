# Diseño: Sitio Web Interactivo de Capacitación en IA

**Fecha:** 2026-03-22
**Estado:** Aprobado para implementación

---

## Contexto

Novartis necesita un sitio web estático para un programa interno de capacitación en IA. El objetivo es que equipos mixtos (técnicos y no técnicos) completen 3 módulos de aprendizaje de forma autoguiada. No hay backend pesado — el progreso se guarda en localStorage del navegador. El sitio debe ser rápido de desplegar, fácil de mantener, y el contenido debe poder actualizarse sin conocimientos técnicos profundos (solo editando archivos MDX).

La contraseña de acceso cambia cada 1-2 semanas; el mecanismo debe ser simple (variable de entorno en Vercel + redeploy).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS |
| Contenido | MDX con `@next/mdx` |
| Progreso | localStorage (client-side only) |
| Despliegue | Vercel (zero-config) |
| Fuente | Inter (Google Fonts) |

---

## Estructura de Archivos

```
/
├── app/
│   ├── layout.tsx                  ← Inter font, metadata global
│   ├── page.tsx                    ← Homepage: hero + lista módulos + progreso
│   ├── password/
│   │   └── page.tsx                ← Pantalla de ingreso de contraseña
│   └── modules/
│       └── [slug]/
│           └── page.tsx            ← Página de módulo con sidebar
├── components/
│   ├── ModuleSidebar.tsx           ← Sidebar con lista de módulos + ToC
│   ├── MarkCompleteButton.tsx      ← Botón fijo al fondo, maneja localStorage
│   ├── Quiz.tsx                    ← Componente embeddable en MDX
│   ├── AnimatedDiagram.tsx         ← Wrapper visual para SVG/HTML
│   └── ResourceCard.tsx            ← Tarjeta de recurso externo
├── content/
│   ├── ai-fundamentals.mdx         ← Módulo 1
│   ├── prompting-fundamentals.mdx  ← Módulo 2
│   └── vibe-coding.mdx             ← Módulo 3
├── lib/
│   ├── progress.ts                 ← Helpers localStorage: get/set/getAll
│   └── modules.ts                  ← Definición estática de módulos (slug, título, tiempo, ToC)
├── mdx-components.tsx              ← Registro global: Quiz, AnimatedDiagram, ResourceCard
├── middleware.ts                   ← Redirección a /password si no hay cookie auth_token
├── next.config.mjs                 ← Config MDX + env vars
└── .env.local                      ← SITE_PASSWORD=<tu_contraseña> (no commitear)
```

---

## Autenticación (Password Gate)

**Decisión de diseño:** La validación de contraseña ocurre en un **Server Action** de Next.js (no client-side), para que el secreto nunca se exponga en el bundle del cliente. La variable de entorno es `SITE_PASSWORD` (sin prefijo `NEXT_PUBLIC_`).

**Flujo:**
1. `middleware.ts` intercepta todas las rutas excepto `/password` y `/_next`
2. Verifica cookie `auth_token` (middleware corre en el servidor Edge, sin acceso a localStorage)
3. Si no existe → redirige a `/password`
4. `/password/page.tsx`: formulario centrado con campo de contraseña
5. El formulario llama a un **Server Action** (`app/actions/auth.ts`) que compara el input contra `process.env.SITE_PASSWORD`
6. Si coincide: setea cookie `auth_token=1` con `Max-Age=604800` (7 días), `httpOnly=true`, `SameSite=Lax`, `Secure=process.env.NODE_ENV === 'production'`, y redirige a `/`
7. Si no coincide: devuelve mensaje de error

**Para cambiar contraseña:** actualizar `SITE_PASSWORD` en Vercel → redeploy. Los tokens existentes siguen válidos 7 días (comportamiento aceptable para uso interno).

> Nota: Se usa cookie (no localStorage) porque middleware.ts no tiene acceso a localStorage. La cookie es `httpOnly=true` — solo accesible desde el servidor/middleware, no desde JavaScript del cliente. Si en el futuro se necesita un indicador client-side, se agrega una segunda cookie no-httpOnly separada.

---

## Homepage (`/`)

**Layout:** columna centrada, max-width 640px.

**Contenido:**
1. Título del curso + tagline
2. Barra de progreso global: "X de 3 módulos completados" con barra visual
3. Lista vertical de módulos — cada tarjeta muestra:
   - Número y título del módulo
   - Tiempo estimado
   - Estado: `completed` (verde + ✓) / `not-started` (gris + ○)
4. Clic en tarjeta → navega a `/modules/[slug]`

**Estado de módulo** (lógica — solo dos estados):
- `completed`: `progress_[slug] === 'completed'` en localStorage
- `not-started`: sin registro en localStorage

> Nota: Se eliminó el estado `in-progress` para mantener consistencia con el modelo de datos. Los módulos están en progreso implícitamente cuando el usuario los tiene abiertos.

---

## Página de Módulo (`/modules/[slug]`)

**Layout:** dos columnas (sidebar + contenido).

### Sidebar izquierdo (~240px, sticky en desktop)
- Lista de todos los módulos con su estado visual (✓/○)
- Módulo activo resaltado
- Tabla de contenidos del módulo actual: headings definidos estáticamente en `lib/modules.ts`
- En mobile: oculto por defecto, toggle con botón hamburger (estado local del componente)

### Columna de contenido (flex-1, prose max-w-[720px])
- Breadcrumb: "← Volver al curso"
- Badge: "Módulo N · X min"
- Título del módulo (H1)
- Contenido MDX renderizado (tipografía Tailwind prose)
- Componentes embebidos: `<Quiz />`, `<AnimatedDiagram />`, `<ResourceCard />`

**Carga del MDX en `app/modules/[slug]/page.tsx`:** se usa un mapa estático de imports para evitar dynamic import con variables. Ejemplo:
```ts
const moduleMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'ai-fundamentals': () => import('@/content/ai-fundamentals.mdx'),
  'prompting-fundamentals': () => import('@/content/prompting-fundamentals.mdx'),
  'vibe-coding': () => import('@/content/vibe-coding.mdx'),
}
```
Si el slug no existe en el mapa → `notFound()`.

### Botón fijo al fondo
- "Marcar como completado" → guarda en localStorage, muestra ✓, revela "Siguiente módulo →"
- Si ya está completado al cargar: muestra el estado completado directamente
- Componente: `MarkCompleteButton.tsx` recibe `slug` como prop

---

## Componentes Embebibles en MDX

### `<Quiz />`
```tsx
interface QuizProps {
  moduleSlug: string   // usado para escribir quiz_[slug]_completed en localStorage
  questions: {
    question: string
    options: string[]
    correct: number    // índice de la respuesta correcta (0-based)
  }[]
}
```
- Una pregunta por vez con navegación "Siguiente"
- Feedback inmediato: verde (correcto) / rojo (incorrecto + muestra correcta)
- Resumen final: "X de Y correctas"
- Guarda `quiz_[slug]_completed=true` en localStorage al terminar

### `<AnimatedDiagram />`
```tsx
// Props: children (SVG o HTML)
// Renderiza en: tarjeta con border #e4e4e7, padding 16px, rounded-lg, w-full
// Usado en: Módulo 1 (diagrama del flujo de tokens en un LLM)
```

### `<ResourceCard />`
```tsx
interface ResourceCardProps {
  title: string
  url: string
  description: string
  type: 'video' | 'article' | 'doc'
}
// Icono por tipo: Lucide icons — PlayCircle (video) | FileText (article) | BookOpen (doc)
// aria-hidden="true" en el icono; tipo visible como texto también
// Abre en nueva pestaña, hover con sombra sutil
```

---

## Definición de Módulos (`lib/modules.ts`)

Cada módulo se define estáticamente con su slug, título, tiempo estimado y tabla de contenidos (para el sidebar). Esto evita parsear los archivos MDX en runtime.

```ts
interface Module {
  slug: string
  number: number
  title: string
  estimatedTime: string
  toc: { id: string; label: string }[]  // headings H2 para el sidebar
}
```

---

## Contenido de Módulos (MDX)

El contenido se genera leyendo los PDFs de `/Teoria` y adaptando al contexto del curso. Tono: accesible pero sin simplificar en exceso (audiencia mixta técnica/no técnica). Idioma: español.

### Módulo 1 — Fundamentos de IA (`ai-fundamentals.mdx`)
**Slug:** `ai-fundamentals` | **Tiempo:** 45 min
**Secciones (H2):**
1. Cómo funcionan los LLMs — tokens, probabilidad, ventana de contexto, sin memoria entre sesiones
2. El ecosistema de herramientas — Claude vs ChatGPT vs Copilot, cuándo usar cada uno
3. Límites reales — alucinaciones (qué son y cómo detectarlas), riesgos de privacidad
4. El mindset correcto — AI como colaborador, el loop prompt-evaluar-refinar

**Incluye:**
- `<AnimatedDiagram>` con diagrama visual del flujo token → predicción → respuesta
- `<Quiz moduleSlug="ai-fundamentals" questions={[...]} />` — pasar `moduleSlug` como string literal en el MDX
- 2 `<ResourceCard>`: Anthropic Research (article) + Andrej Karpathy Intro to LLMs (video)

### Módulo 2 — Prompting Fundamentals (`prompting-fundamentals.mdx`)
**Slug:** `prompting-fundamentals` | **Tiempo:** 45 min
**Secciones (H2):**
1. Estructura del prompt — rol, contexto, tarea, formato. Ejemplos antes/después
2. Especificidad > brevedad — por qué los prompts vagos dan respuestas vagas
3. Few-shot prompting — dar ejemplos dentro del prompt para moldear el output
4. Chain of thought — pedir razonamiento paso a paso, cuándo ayuda

**Incluye:**
- `<Quiz moduleSlug="prompting-fundamentals">` con 3 preguntas
- 2 `<ResourceCard>`: Anthropic Prompt Engineering Guide (doc) × 2

### Módulo 3 — Vibe-coding (`vibe-coding.mdx`)
**Slug:** `vibe-coding` | **Tiempo:** 45 min
**Secciones (H2):**
1. Qué es el vibe-coding — construir con AI describiendo lo que quieres, sin escribir código
2. El loop de iteración — cómo pedir código, qué hacer cuando se rompe, describir errores
3. Casos de uso prácticos — limpiar Excel, fórmulas, automatizar emails, scripts de análisis
4. Cómo ir más lejos — Claude Code, conectar herramientas con AI agents

**Incluye:**
- `<Quiz moduleSlug="vibe-coding">` con 3 preguntas (pasar `moduleSlug` como string literal)
- 3 `<ResourceCard>`:
  - Canal YouTube @Itssssss_Jack · type: video · url: https://www.youtube.com/@Itssssss_Jack
  - Simon Willison's Blog · type: article · url: https://simonwillison.net
  - Anthropic Claude Code · type: doc · url: https://docs.anthropic.com/en/docs/claude-code/overview

**Fuentes:** canal YouTube @Itssssss_Jack (inspiración y ResourceCard) + PDFs en `/Teoria` (S02, S07)

---

## Diseño Visual

| Token | Valor |
|-------|-------|
| Background | `#ffffff` |
| Texto principal | `#18181b` |
| Texto secundario | `#71717a` |
| Bordes | `#e4e4e7` |
| Cards background | `#fafafa` |
| Completado | `#22c55e` (green-500) |
| No iniciado | `#a1a1aa` (zinc-400) |
| Fuente | Inter (Google Fonts) |

---

## Progress Tracking (localStorage)

| Clave | Valor | Cuándo se escribe |
|-------|-------|-------------------|
| `progress_[slug]` | `'completed'` | Al hacer clic en "Marcar como completado" |
| `quiz_[slug]_completed` | `'true'` | Al terminar el quiz |

Helper functions en `lib/progress.ts`:
- `getModuleProgress(slug): 'completed' | 'not-started'`
- `setModuleCompleted(slug): void`
- `getAllModulesProgress(): Record<string, 'completed' | 'not-started'>`
- `getQuizCompleted(slug): boolean` — lee `quiz_[slug]_completed` y compara con el string `'true'`
- `setQuizCompleted(slug): void` — escribe `localStorage.setItem('quiz_[slug]_completed', 'true')`

---

## Despliegue (Vercel)

- `next.config.mjs`: habilita MDX, configura env vars
- Variables de entorno en Vercel:
  - `SITE_PASSWORD` — contraseña de acceso (sin prefijo NEXT_PUBLIC_)
- Zero config más allá de esta variable
- `.gitignore` incluye `.env.local` y `.superpowers/`

---

## Verificación

1. `npm run dev` → abrir `http://localhost:3000` → debe redirigir a `/password`
2. Ingresar contraseña incorrecta → mensaje de error, sin acceso
3. Ingresar contraseña correcta → cookie seteada, redirige a homepage con módulos
4. Hacer clic en Módulo 1 → sidebar visible con ToC, contenido MDX renderizado
5. Hacer clic en "Marcar como completado" → estado cambia a verde en sidebar y homepage
6. Completar quiz → resumen de puntaje, `quiz_ai-fundamentals_completed=true` en localStorage
7. Recargar página → progreso persiste
8. Cerrar y reabrir browser → cookie persiste (7 días), no pide password de nuevo
9. `npm run build` → sin errores de TypeScript ni de MDX
10. Deploy a Vercel → funciona con solo la variable `SITE_PASSWORD` configurada
