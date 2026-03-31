# Reliable AI Systems Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Sistemas de IA Confiables" as Module 3, inserting it between Prompting Fundamentals (M2) and Vibe-coding (currently M3), and renumbering all downstream modules.

**Architecture:** One new MDX content file (`content/reliable-ai-systems.mdx`) plus three file edits: `lib/modules.ts` (insert new entry, renumber 3→4, 4→5, 5→6), `app/modules/[slug]/page.tsx` (add to static import map), and `app/page.tsx` (update tagline). No new components needed — existing Quiz, ResourceCard, and AnimatedDiagram components handle everything. The certificate page and sidebar update automatically because they iterate over the `modules` array.

**Tech Stack:** Next.js 14 App Router, MDX with `@next/mdx` + `remark-gfm` + `rehype-slug`, Tailwind CSS `prose`, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-22-reliable-ai-systems-module-design.md`

---

## File Map

| File | Action | Role |
|------|--------|------|
| `content/reliable-ai-systems.mdx` | **Create** | Full module content: 4 H2 sections, Quiz (5 questions), 5 ResourceCards |
| `lib/modules.ts` | **Modify** | Insert new entry at position 3; change `vibe-coding` → 4, `agents-and-skills` → 5, `legal-ai-risks` → 6 |
| `app/modules/[slug]/page.tsx` | **Modify** | Add `reliable-ai-systems` to static MDX import map (line 8–14) |
| `app/page.tsx` | **Modify** | Update tagline line 28: "Cinco módulos" → "Seis módulos" |

---

## Task 1: Update lib/modules.ts

**Files:**
- Modify: `lib/modules.ts`

Context: The file currently has 5 entries numbered 1–5. We insert a new entry after `prompting-fundamentals` (number 2) and renumber the three downstream entries.

- [ ] **Step 1.1: Renumber vibe-coding from 3 to 4**

In `lib/modules.ts`, find the `vibe-coding` entry and change `number: 3` to `number: 4`.

```ts
  {
    slug: 'vibe-coding',
    number: 4,   // was 3
    title: 'Vibe-coding: Automatiza Sin Código',
```

- [ ] **Step 1.2: Renumber agents-and-skills from 4 to 5**

```ts
  {
    slug: 'agents-and-skills',
    number: 5,   // was 4
    title: 'Agentes de IA, Skills y Extensibilidad',
```

- [ ] **Step 1.3: Renumber legal-ai-risks from 5 to 6**

```ts
  {
    slug: 'legal-ai-risks',
    number: 6,   // was 5
    title: 'Riesgos Legales y Gobernanza de la IA',
```

- [ ] **Step 1.4: Insert new module entry after prompting-fundamentals**

Insert the following block between the closing `},` of the `prompting-fundamentals` entry and the opening `{` of the `vibe-coding` entry:

```ts
  {
    slug: 'reliable-ai-systems',
    number: 3,
    title: 'Sistemas de IA Confiables',
    estimatedTime: '40 min',
    toc: [
      { id: 'por-qué-los-llms-solos-fallan-en-producción', label: 'Por qué los LLMs solos fallan' },
      { id: 'llm-modulo-orquestación-con-critics', label: 'LLM-Modulo: orquestación con critics' },
      { id: 'schema-guided-reasoning-hacer-el-output-verificable', label: 'Schema-Guided Reasoning' },
      { id: 'evaluar-si-tu-sistema-funciona', label: 'Evaluar si tu sistema funciona' },
    ],
  },
```

- [ ] **Step 1.5: Verify the modules array order**

The final order in `lib/modules.ts` must be:
1. `ai-fundamentals` — number: 1
2. `prompting-fundamentals` — number: 2
3. `reliable-ai-systems` — number: 3  ← new
4. `vibe-coding` — number: 4
5. `agents-and-skills` — number: 5
6. `legal-ai-risks` — number: 6

- [ ] **Step 1.6: Commit**

```bash
git add lib/modules.ts
git commit -m "feat: insert reliable-ai-systems as M3, renumber vibe-coding→4, agents→5, legal→6"
```

---

## Task 2: Update app/modules/[slug]/page.tsx

**Files:**
- Modify: `app/modules/[slug]/page.tsx` (lines 8–14)

Context: The static import map must list every slug explicitly — Next.js requires static string literals for MDX imports to work at build time. Simply add one line.

- [ ] **Step 2.1: Add reliable-ai-systems to the import map**

Current block (lines 8–14):
```ts
const moduleMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'ai-fundamentals': () => import('@/content/ai-fundamentals.mdx'),
  'prompting-fundamentals': () => import('@/content/prompting-fundamentals.mdx'),
  'vibe-coding': () => import('@/content/vibe-coding.mdx'),
  'legal-ai-risks': () => import('@/content/legal-ai-risks.mdx'),
  'agents-and-skills': () => import('@/content/agents-and-skills.mdx'),
}
```

Replace with:
```ts
const moduleMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'ai-fundamentals': () => import('@/content/ai-fundamentals.mdx'),
  'prompting-fundamentals': () => import('@/content/prompting-fundamentals.mdx'),
  'reliable-ai-systems': () => import('@/content/reliable-ai-systems.mdx'),
  'vibe-coding': () => import('@/content/vibe-coding.mdx'),
  'legal-ai-risks': () => import('@/content/legal-ai-risks.mdx'),
  'agents-and-skills': () => import('@/content/agents-and-skills.mdx'),
}
```

- [ ] **Step 2.2: Commit**

```bash
git add "app/modules/[slug]/page.tsx"
git commit -m "feat: add reliable-ai-systems to MDX static import map"
```

---

## Task 3: Update app/page.tsx tagline

**Files:**
- Modify: `app/page.tsx` (line 28)

- [ ] **Step 3.1: Update the tagline**

Find line 28:
```tsx
            Cinco módulos para entender, usar y aprovechar la IA en tu trabajo de forma responsable.
```

Replace with:
```tsx
            Seis módulos para entender, usar y aprovechar la IA en tu trabajo de forma responsable.
```

- [ ] **Step 3.2: Commit**

```bash
git add app/page.tsx
git commit -m "fix: update homepage tagline to reflect 6 modules"
```

---

## Task 4: Create content/reliable-ai-systems.mdx

**Files:**
- Create: `content/reliable-ai-systems.mdx`

This is the main task. The file must follow the exact MDX structure of existing modules:
- H1 title (rendered as the MDX h1, separate from the `mod.title` shown in the page header)
- Intro paragraph (3–4 sentences)
- `---` divider
- Four H2 sections, each separated by `---`
- `<Quiz>` component after the last section
- `## Recursos` H2
- Five `<ResourceCard>` components

**Important anchor ID note:** The H2 headings generate anchor IDs via `rehype-slug`. The IDs preserve Unicode (accented characters). The `toc` entries in `lib/modules.ts` (Task 1) must match these IDs exactly. The four H2 headings and their expected rehype-slug IDs are:

| H2 Heading text | Expected anchor ID |
|---|---|
| `## Por qué los LLMs solos fallan en producción` | `por-qué-los-llms-solos-fallan-en-producción` |
| `## LLM-Modulo: orquestación con critics` | `llm-modulo-orquestación-con-critics` |
| `## Schema-Guided Reasoning: hacer el output verificable` | `schema-guided-reasoning-hacer-el-output-verificable` |
| `## Evaluar si tu sistema funciona` | `evaluar-si-tu-sistema-funciona` |

- [ ] **Step 4.1: Create the MDX file with complete content**

Write `content/reliable-ai-systems.mdx` with the following complete content:

```mdx
# Sistemas de IA Confiables

Los modelos de lenguaje son poderosos, pero no son confiables por sí solos. La diferencia entre un prototipo impresionante y un sistema que funciona en producción casi siempre está en la arquitectura que rodea al modelo, no en el modelo en sí. En este módulo aprenderás por qué ocurre esto, qué frameworks existen para diseñar sistemas que detecten y corrijan los errores del LLM antes de que lleguen al usuario, y cómo saber si tu sistema está funcionando bien una vez desplegado.

---

## Por qué los LLMs solos fallan en producción

Cuando usas un LLM en una interfaz de chat, el costo de un error es bajo: ves la respuesta, la evalúas, y si algo está mal, corriges. Cuando ese mismo LLM está integrado en un flujo de negocio automatizado — procesando contratos, generando recomendaciones, clasificando solicitudes — el error puede propagarse antes de que nadie lo detecte.

El problema de fondo es estructural: un LLM predice texto estadísticamente probable, no ejecuta lógica verificada. Esa distinción no importa cuando estás explorando ideas. Importa mucho cuando el output del modelo alimenta directamente una decisión.

### Dos casos reales de falla

**Epic Sepsis Model.** El sistema prometía detectar sepsis con un AUC de 0.76–0.83, y fue desplegado en cientos de hospitales en Estados Unidos. Una validación externa independiente encontró un AUC de ~0.60 — apenas por encima de tirar una moneda al aire. El modelo fue retirado en 2022. La lección no es que la IA sea inútil en salud: es que el rendimiento reportado en el contexto de desarrollo no es igual al rendimiento en tu contexto de producción.

**Jurisprudencia inventada.** En 2023, dos abogados en Nueva York presentaron un escrito judicial citando seis casos de jurisprudencia generados por ChatGPT. Los casos no existían. El modelo los fabricó con total confianza, incluyendo nombres de jueces y números de expediente. Ambos abogados fueron sancionados por el tribunal.

En ambos casos, el fallo no fue técnico — fue arquitectónico. No había ningún mecanismo para verificar el output antes de que llegara al siguiente paso del flujo.

### El framework base: hard verifiers vs soft verifiers

La pregunta que guía el resto del módulo es: *¿cómo diseñas un sistema donde los errores del LLM se detecten antes de llegar al usuario?*

La respuesta empieza con esta distinción:

**Hard verifiers** son checks automáticos y deterministas. Pasan o fallan. Se ejecutan en cada request, sin excepción. Ejemplos: un validador de schema que verifica que el output tiene el formato correcto, una función matemática que verifica que los números cuadran, un solver que verifica que el plan propuesto es factible.

**Soft verifiers** son revisión humana sobre un subconjunto de casos. No son automáticos, no corren siempre, pero siguen siendo valiosos para cubrir lo que no se puede verificar algorítmicamente. Ejemplo: un revisor humano que muestrea el 5% de los outputs cada semana.

La regla es simple: **prefiere hard verifiers siempre que sea posible**. Los soft verifiers cubren lo que genuinamente no se puede automatizar, no lo que no se automatizó por falta de tiempo.

---

## LLM-Modulo: orquestación con critics

LLM-Modulo es un framework de orquestación que separa la generación de la verificación. En lugar de confiar en que el LLM produzca el output correcto en un solo paso, el sistema funciona así: el LLM genera un candidato, un conjunto de *critics* lo evalúan, y un *meta-controller* decide si el candidato pasa o si el LLM debe intentarlo de nuevo.

```
Problema / Especificación
        ↓
    LLM genera candidato
        ↓
  Critics evalúan candidato
  ┌──────────────────────┐
  │ ¿Pasa todos          │
  │ los critics?         │
  └────┬─────────────────┘
    No │               Sí
       ↓               ↓
  Meta-controller   Output aprobado
  agrega feedback        ↓
       ↓           Siguiente paso
  LLM refina
```

### Tipos de critics

No todos los critics tienen el mismo nivel de confianza. De más a menos confiable:

**Critics deterministas** — funciones matemáticas, validadores de schema, solvers, calculadoras. El resultado es binario: pasa o falla. Son los más valiosos porque su veredicto no depende de otro modelo.

**LLM-as-critic** — un segundo LLM evalúa el output del primero. Más flexible que los deterministas (puede evaluar calidad semántica, coherencia lógica), pero introduce la misma incertidumbre que quieres eliminar. Útil cuando no existe un check determinista posible; menos útil cuando sí existe.

**Humano en el loop** — revisión humana cuando los critics anteriores no son suficientes. El humano es el critic de último recurso para casos de alta consecuencia o baja frecuencia.

### Caso de estudio: planificación de supply chain

Una empresa quiere automatizar la planificación de envíos para cumplir demanda al menor costo. El flujo con LLM-Modulo:

- El **ops manager** (domain expert) define las reglas de negocio: capacidad máxima de cada almacén, costos por ruta, restricciones de tiempo.
- El **engineer** codifica esas reglas como critics: un solver que verifica que el plan propuesto no excede ninguna capacidad, una función que verifica que el costo total es el mínimo posible dado el plan.
- El **LLM** genera propuestas de plan de envío en lenguaje natural o como estructura de datos.
- Los critics verifican cada propuesta. Si alguna restricción se viola, el meta-controller le pasa el feedback al LLM: "la ruta A→C excede la capacidad del almacén C en 200 unidades."
- El LLM refina el plan. El loop continúa hasta que el plan pasa todos los critics.

### La distinción de roles es crítica

LLM-Modulo funciona cuando los roles están bien separados:

| Rol | Responsabilidad |
|-----|----------------|
| **Domain expert** (ops manager, abogado, analista) | Dueño de la lógica de negocio, los edge cases, y la definición de correcto/incorrecto |
| **Engineer** | Dueño de hacer esos criterios observables, testeables y auditables. Schemas, checks, monitoring, fallback paths |
| **Modelo** | No es dueño de la lógica de negocio. Su rol es **escalar** la expertise del domain expert |

El error más común al implementar sistemas con LLMs es pedirle al modelo que "use su criterio" en situaciones donde existe lógica de negocio definida. Si la lógica existe, codifícala como critic.

---

## Schema-Guided Reasoning: hacer el output verificable

Schema-Guided Reasoning (SGR) es la aplicación más concreta de LLM-Modulo: en lugar de pedirle al LLM texto libre, defines un schema con pasos intermedios tipados, y el modelo toma decisiones en pasos conocidos entre alternativas conocidas.

### Por qué el texto libre es el enemigo de la verificación

Compara estas dos formas de pedirle al LLM que analice el compliance de un contrato:

**Sin SGR — output libre:**
> "El contrato parece estar en compliance con la cláusula 3.2, aunque hay algunas áreas que podrían mejorarse en términos de especificidad..."

Esto es una opinión. No puedes testearlo automáticamente. No puedes auditarlo. No puedes compararlo con el output de ayer para detectar regresiones.

**Con SGR — output estructurado:**
```json
{
  "clause_3_2": {
    "applicable": true,
    "compliant": false,
    "non_compliance_reasons": ["missing_termination_clause", "undefined_liability_cap"],
    "contract_clauses_addressing_requirement": ["Section 8.1", "Annex B paragraph 3"],
    "minimum_changes_required": ["Add termination clause per template §12", "Define liability cap in Section 8.1"]
  }
}
```

Cada campo es verificable automáticamente. `non_compliance_reasons` viene de una ontología predefinida — el modelo no puede inventar razones. `contract_clauses_addressing_requirement` son citas textuales — se pueden verificar contra el documento.

### Los cuatro principios de SGR

1. El LLM toma decisiones en **pasos conocidos** entre **alternativas conocidas**
2. Cada output intermedio tiene un **tipo** (booleano, enum, lista de strings de una ontología, número)
3. La lógica de negocio vive en el **schema y en los checks** — no en el prompt libre
4. El razonamiento intermedio es **visible y auditable**

### Caso de estudio: compliance de contratos

Jane es abogada y domain expert. Su workflow manual tiene seis pasos:

1. ¿Aplica esta cláusula al tipo de contrato? → `boolean`
2. ¿El contrato cumple con esta cláusula? → `boolean`
3. ¿Cuáles son las razones de no-compliance? → `List[str]` de una ontología predefinida de ~40 categorías
4. ¿Qué cláusulas del contrato abordan el requisito? → `List[str]` con citas textuales verificables
5. ¿Qué cambios mínimos son necesarios? → `List[str]`

Cada paso es automáticamente checkeable. El engineer codifica los checks: ¿los valores en `non_compliance_reasons` pertenecen a la ontología aprobada? ¿Las citas en `contract_clauses_addressing_requirement` existen en el texto del contrato?

### Qué SGR no es

SGR no es un modelo nuevo, no da capacidades nuevas al LLM, y no reemplaza el análisis del problema de negocio. Es una forma de **empaquetar** las respuestas del LLM de forma consistente y verificable. El pensamiento duro sigue siendo del domain expert; el schema formaliza ese pensamiento para que el modelo lo pueda escalar.

---

## Evaluar si tu sistema funciona

Una vez que tu sistema tiene hard verifiers y critics bien diseñados, la pregunta cambia: ya no es "¿produce el output correcto?" sino "¿sigue produciendo el output correcto a medida que el volumen crece, los datos cambian, y el modelo se actualiza?"

Esta sección es sobre monitoreo continuo, no sobre diseño inicial.

### Tres niveles de evaluación continua

**Nivel 1 — Hard verifiers en producción.** Si diseñaste bien el schema, tus checks corren automáticamente en cada request. Cualquier output que viole el schema falla de forma explícita y observable. Este es el nivel más confiable: cobertura total, sin costo marginal por request.

**Nivel 2 — Soft verifiers sobre muestra.** Revisión humana periódica sobre un N% de los casos. La clave es elegir bien qué revisar: casos *borderline* (cerca del threshold de un critic), casos con feedback negativo del usuario, y un sample aleatorio para detectar drift sistemático. El tamaño del sample depende del volumen y del riesgo — no existe una fórmula universal, pero 1–5% suele ser suficiente para flujos de negocio estándar.

**Nivel 3 — LLM-as-judge.** Usar un segundo LLM para evaluar el output del primero. Útil cuando el output es semántico y no existe ground truth fácil (¿es este resumen fiel al documento original?). Tiene limitaciones importantes: sesgo sistemático a favor de respuestas largas, sesgo a favor del propio modelo o familia de modelos, y riesgo de contaminación si el modelo judge fue entrenado con datos similares. Úsalo como señal complementaria, no como verificador principal.

### Cuatro pitfalls que todo equipo comete

**1. Evaluar en datos de desarrollo, no de producción.** El rendimiento en datos que usaste para desarrollar el sistema siempre es mayor que en producción. Reserva un conjunto de datos de producción real — datos que el sistema nunca vio durante el desarrollo — para la evaluación final.

**2. Asumir que un benchmark público transfiere a tu contexto.** El Epic Sepsis Model tenía métricas excelentes en el contexto de desarrollo. Los benchmarks públicos de LLMs (MMLU, GLUE) miden rendimiento en tareas genéricas, no en tu flujo específico. La única evaluación que importa es la que replica fielmente tu caso de uso real.

**3. Leakage temporal.** Si tus datos tienen estructura temporal (transacciones financieras, registros clínicos, logs de sistema), asegúrate de que el conjunto de test es siempre posterior en el tiempo al conjunto de entrenamiento/desarrollo. Mezclar períodos produce estimaciones de rendimiento falsamente optimistas porque el modelo puede aprender patrones específicos de un período y parecer que "predice" el pasado.

**4. Teach-cheat-repeat.** Usar el dataset de evaluación para ajustar el sistema — aunque sea indirectamente, a través de múltiples iteraciones de ajuste manual — contamina la evaluación. Una vez que usas un ejemplo para decidir cómo cambiar el sistema, ese ejemplo ya no es test data limpia.

---

<Quiz
  moduleSlug="reliable-ai-systems"
  questions={[
    {
      question: "¿Cuál es la diferencia principal entre un hard verifier y un soft verifier?",
      options: [
        "Los hard verifiers son más caros de implementar",
        "Los hard verifiers son checks automáticos y deterministas que corren siempre; los soft verifiers son revisión humana sobre un subset de casos",
        "Los soft verifiers son más confiables porque involucran juicio humano",
        "Los hard verifiers solo funcionan con modelos de OpenAI"
      ],
      correct: 1
    },
    {
      question: "En el framework LLM-Modulo, ¿quién es el dueño de la lógica de negocio?",
      options: [
        "El modelo LLM, que usa su criterio para tomar decisiones",
        "El engineer, que codifica las reglas en el schema",
        "El domain expert, que define qué es correcto e incorrecto en su dominio",
        "El meta-controller, que agrega el feedback de los critics"
      ],
      correct: 2
    },
    {
      question: "¿Por qué Schema-Guided Reasoning mejora la auditabilidad respecto al output en texto libre?",
      options: [
        "Porque los outputs estructurados son más cortos y fáciles de leer",
        "Porque el modelo trabaja más rápido con schemas",
        "Porque cada campo del output tiene un tipo definido y puede verificarse automáticamente contra reglas predefinidas",
        "Porque elimina la necesidad de que un domain expert revise el output"
      ],
      correct: 2
    },
    {
      question: "¿Qué hace el meta-controller en el loop de LLM-Modulo cuando un candidato no pasa los critics?",
      options: [
        "Descarta el candidato y entrega un error al usuario",
        "Agrega el feedback de los critics y se lo pasa al LLM para que refine el candidato",
        "Activa la revisión humana automáticamente",
        "Cambia el modelo LLM por uno más potente"
      ],
      correct: 1
    },
    {
      question: "¿Cuál es la principal limitación de usar LLM-as-judge para evaluar outputs?",
      options: [
        "Es demasiado lento para usarse en producción",
        "Solo funciona para evaluar código, no texto",
        "Tiene sesgo sistemático (a favor de respuestas largas y del mismo modelo/familia) y no reemplaza a los hard verifiers",
        "Requiere fine-tuning específico para cada dominio"
      ],
      correct: 2
    }
  ]}
/>

## Recursos

<ResourceCard
  title="LLM-Modulo Framework — Paper original"
  url="https://arxiv.org/abs/2402.01817"
  description="Paper de investigación que introduce el framework LLM-Modulo: arquitectura de orquestación con critics para producir outputs verificables y confiables. Referencia académica del concepto central de este módulo."
  type="doc"
/>

<ResourceCard
  title="Anthropic — Structured Outputs con la API de Claude"
  url="https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency"
  description="Cómo implementar outputs estructurados y consistentes con Claude. Incluye técnicas de schema enforcement, validación de formato, y patrones para aumentar la confiabilidad en flujos de producción."
  type="doc"
/>

<ResourceCard
  title="Anthropic — Build reliable AI workflows with structured reasoning"
  url="https://www.anthropic.com/research/building-effective-agents"
  description="Guía de Anthropic sobre cómo construir agentes y workflows confiables con LLMs. Cubre patrones de orquestación, verificación de outputs, y cuándo usar flujos multi-step vs llamadas únicas."
  type="article"
/>

<ResourceCard
  title="HELM: Holistic Evaluation of Language Models"
  url="https://crfm.stanford.edu/helm/"
  description="Framework de evaluación de Stanford que mide LLMs en múltiples dimensiones: accuracy, robustness, fairness, calibration, efficiency. Referencia para equipos que quieran implementar evaluación holística más allá de accuracy."
  type="doc"
/>

<ResourceCard
  title="STAT News — Epic's Sepsis Model Rollback"
  url="https://www.statnews.com/2021/07/26/epic-deterioration-index-sepsis-prediction/"
  description="Investigación periodística sobre el retiro del modelo de predicción de sepsis de Epic. Caso de estudio real de la diferencia entre rendimiento reportado en desarrollo y rendimiento en producción."
  type="article"
/>
```

- [ ] **Step 4.2: Verify the file was created**

```bash
ls -la "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI/content/reliable-ai-systems.mdx"
```

Expected: file exists with non-zero size.

- [ ] **Step 4.3: Commit**

```bash
git add content/reliable-ai-systems.mdx
git commit -m "feat: add Module 3 content — Sistemas de IA Confiables (LLM-Modulo, SGR, verifiers)"
```

---

## Task 5: Build and verify

**Files:** None — verification only.

- [ ] **Step 5.1: Run production build**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npm run build
```

Expected output includes:
```
✓ Generating static pages (12/12)
```
And the route list must include:
```
├   ├ /modules/reliable-ai-systems
```

If build fails with a TypeScript or MDX error, fix before proceeding.

- [ ] **Step 5.2: Spot-check the module count**

The route list should show 12 static pages total (was 11 before):
- `/` (homepage)
- `/_not-found`
- `/certificate`
- `/password`
- `/modules/ai-fundamentals`
- `/modules/prompting-fundamentals`
- `/modules/reliable-ai-systems`  ← new
- `/modules/vibe-coding`
- `/modules/agents-and-skills`
- `/modules/legal-ai-risks`

- [ ] **Step 5.3: Commit tagline fix (if not done in Task 3)**

If Task 3 was not committed separately, include it now:
```bash
git add app/page.tsx
git commit -m "fix: update homepage tagline to reflect 6 modules"
```

- [ ] **Step 5.4: Push to GitHub**

```bash
git push origin main
```

Expected: push succeeds, Vercel auto-deploys.

---

## Verification checklist

After deployment to Vercel:

- [ ] Homepage shows 6 module cards, tagline reads "Seis módulos..."
- [ ] Module 3 card shows "Sistemas de IA Confiables · 40 min"
- [ ] Clicking Module 3 → page renders with "MÓDULO 3" badge
- [ ] Sidebar shows all 6 modules; clicking a ToC item scrolls to the correct H2
- [ ] Tables in the module render correctly (remark-gfm already installed)
- [ ] Quiz works: 5 questions, feedback on answer, score summary at end
- [ ] All 5 ResourceCards render with correct icons (doc → BookOpen, article → FileText)
- [ ] "Marcar como completado" button works; sidebar and homepage reflect completion
- [ ] After completing all 6 modules, certificate banner appears on homepage
- [ ] Certificate page lists all 6 modules with checkmarks
