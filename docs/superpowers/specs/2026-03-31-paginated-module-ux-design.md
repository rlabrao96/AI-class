# Paginated Module UX — Design Spec

**Date:** 2026-03-31
**Status:** Approved
**Author:** Claude (brainstorming session)

---

## Overview

Redesign the course module UX from a single long-scroll MDX page to a **paginated, interactive experience**. Each module's 4 TOC sections become 4 separate pages with next/previous navigation, interactive elements (mini-quizzes, callouts, accordions, before/after comparisons), AI-generated images, and progress tracking. The design is reusable across all 10 modules.

## Motivation

The current module format is a single MDX page with ~10K words of continuous text. For a 2-hour module, this creates a "wall of text" that fatigues users. Breaking content into pages with visual breaks and interactive elements keeps engagement high and gives users a sense of progress.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Pagination model | 1 TOC section = 1 page (4 pages per module) |
| Navigation | Free navigation with visit tracking (semi-guiado) |
| Interactive elements | Mini-quiz, callouts, accordions, before/after, images, progress bar |
| Image strategy | Flat diagrams as code (SVG/HTML) + conceptual illustrations via Gemini/Nano Banana |
| Image style | Mix: flat/minimal for processes, AI-generated editorial for concepts |
| Language | Spanish Latino (es_419) for all generated content |

---

## Architecture

### File Structure Change

**Before:** One MDX file per module
```
content/
  ai-fundamentals.mdx          ← single 10K-word file
```

**After:** Directory with one MDX file per section
```
content/
  ai-fundamentals/
    01-como-funcionan-los-llms.mdx
    02-ecosistema-de-herramientas.mdx
    03-limites-reales.mdx
    04-el-mindset-correcto.mdx
```

Each section MDX file contains ~2,500 words of text interspersed with interactive components and images.

### Routing Change

**New route:** `app/modules/[slug]/[page]/page.tsx`

- `[page]` is a number (1-indexed): `/modules/ai-fundamentals/1`, `/modules/ai-fundamentals/2`, etc.
- The existing route `app/modules/[slug]/page.tsx` redirects to `[slug]/1`.
- The page component loads the corresponding MDX file, renders the progress bar, content, and page navigation.

### Module Definition Change

`lib/modules.ts` gets a new `sections` field on each module:

```typescript
export interface Section {
  id: string           // e.g., "como-funcionan-los-llms"
  title: string        // e.g., "Cómo funcionan los LLMs"
  file: string         // e.g., "01-como-funcionan-los-llms"
}

export interface Module {
  slug: string
  number: number
  title: string
  estimatedTime: string
  track: string
  sections: Section[]  // NEW — replaces toc
  toc: TocItem[]       // DEPRECATED — kept for backward compat until migration
}
```

---

## New Components

### 1. `<MiniQuiz>` — Quick comprehension check

**Props:**
```typescript
interface MiniQuizProps {
  question: string
  options: string[]
  correct: number        // 0-indexed
  explanation?: string   // shown after answering
}
```

**Behavior:**
- Renders as a card with green-tinted border
- User clicks an option → immediate feedback: green ✓ for correct, red ✗ for incorrect
- Shows explanation text after answering
- Does not block navigation or page progress
- State not persisted (resets on page reload)

**Usage in MDX:**
```jsx
<MiniQuiz
  question="¿Qué hace un LLM en su núcleo?"
  options={[
    "Busca en una base de datos",
    "Predice el siguiente token más probable",
    "Traduce entre idiomas"
  ]}
  correct={1}
  explanation="Los LLMs predicen el siguiente token basándose en la secuencia anterior."
/>
```

### 2. `<Callout>` — Themed info boxes

**Props:**
```typescript
interface CalloutProps {
  type: 'tip' | 'warning' | 'example' | 'deep-dive'
  children: React.ReactNode
}
```

**Variants:**

| Type | Icon | Color | Use case |
|------|------|-------|----------|
| `tip` | 💡 | Blue border/bg | Key facts, important takeaways |
| `warning` | ⚠️ | Yellow border/bg | Pitfalls, things to avoid |
| `example` | 💬 | Green border/bg | Real-world examples, case studies |
| `deep-dive` | 🔍 | Purple border/bg | Optional deeper context |

**Usage in MDX:**
```jsx
<Callout type="tip">
  Un modelo con 70 mil millones de parámetros no es necesariamente "mejor" que uno con 8 mil millones. Depende de la tarea.
</Callout>
```

### 3. `<Accordion>` — Expandable content

**Props:**
```typescript
interface AccordionProps {
  title: string
  children: React.ReactNode
}
```

**Behavior:**
- Collapsed by default, showing only the title with a ▶ indicator
- Click to expand/collapse with smooth animation
- Used for advanced/optional content that would break the main reading flow

**Usage in MDX:**
```jsx
<Accordion title="¿Cómo funciona RLHF en detalle?">
  El aprendizaje por refuerzo con retroalimentación humana funciona en tres pasos...
</Accordion>
```

### 4. `<BeforeAfter>` — Side-by-side comparison

**Props:**
```typescript
interface BeforeAfterProps {
  before: { label: string; content: string }
  after: { label: string; content: string }
}
```

**Behavior:**
- Two cards side by side: red-tinted (before) and green-tinted (after)
- Responsive: stacks vertically on mobile (< md breakpoint)

**Usage in MDX:**
```jsx
<BeforeAfter
  before={{ label: "Sin IA", content: "2 horas redactando el informe trimestral desde cero" }}
  after={{ label: "Con IA", content: "20 minutos iterando un borrador con Claude y revisando los datos" }}
/>
```

### 5. `<ModuleImage>` — Image with caption

**Props:**
```typescript
interface ModuleImageProps {
  src: string
  alt: string
  caption?: string
}
```

**Behavior:**
- Renders image with rounded corners, subtle border
- Caption below in gray italic text
- Responsive: full width of content area
- Used for AI-generated illustrations (Gemini/Nano Banana)

**Usage in MDX:**
```jsx
<ModuleImage
  src="/media/ai-fundamentals/diagrams/embeddings-map.png"
  alt="Mapa de embeddings"
  caption="Los embeddings organizan palabras por significado: conceptos similares quedan cerca en el espacio."
/>
```

### 6. `<ProgressBar>` — Page-level progress indicator

**Not an MDX component** — integrated into the page layout (`app/modules/[slug]/[page]/page.tsx`).

**Renders:**
- Top of the page, below the module header
- Text: "Sección 2 de 4 · Ecosistema de herramientas"
- Visual bar showing percentage progress (sections visited / total)
- Clickable section dots for quick navigation

### 7. `<PageNavigation>` — Previous/Next arrows

**Not an MDX component** — integrated into the page layout.

**Renders:**
- Bottom of each page, below the content
- Left arrow: "← Cómo funcionan los LLMs" (previous section title)
- Right arrow: "Límites reales →" (next section title)
- First page: only right arrow
- Last page: left arrow + "Completar módulo ✓" button (triggers existing completion flow)

---

## Navigation & Progress Tracking

### Visit Tracking (localStorage)

```typescript
// Key format
`section_visited_${slug}_${pageNumber}` = "true"

// Functions in lib/progress.ts
getSectionVisited(slug: string, page: number): boolean
setSectionVisited(slug: string, page: number): void
getModuleSectionsVisited(slug: string): number  // count of visited sections
```

Pages are marked as visited when the user navigates to them (on mount).

### Sidebar Changes

The `ModuleSidebar` component changes behavior when a module has `sections`:

**Current behavior:** Shows all modules in the track + H2/H3 headings of current page as TOC.

**New behavior:** Shows all modules in the track + **section pages** of the current module with visit indicators:

```
● Cómo funcionan los LLMs        (green dot = visited)
● Ecosistema de herramientas      (green dot = current, highlighted)
○ Límites reales                  (gray dot = not visited)
○ El mindset correcto             (gray dot = not visited)
```

Clicking a section navigates to that page. Below the sections, the existing H2/H3 TOC of the current page is shown (for in-page navigation).

### Quiz Availability

The final quiz (on the last page) is always accessible. If the user hasn't visited all sections, a soft banner appears above the quiz:

```
ℹ️ Te faltan 2 secciones por visitar. Puedes hacer el quiz ahora o volver a revisarlas.
```

This does not block the quiz — it's informational only.

---

## Images

### Flat Diagrams (Code)

Created as inline HTML/SVG within MDX or as React components. Used for:
- Process flows (token pipeline, training stages, prompt→evaluate→refine cycle)
- Comparison tables (tool ecosystem)
- Decision trees (how to detect hallucinations)

These already exist in the project (see `<AnimatedDiagram>` component). New diagrams follow the same pattern.

### AI-Generated Illustrations (Gemini / Nano Banana)

Generated using Gemini Imagen API (user has Pro tokens) and/or Nano Banana. Used for:
- Conceptual visualizations (embeddings space, temperature creativity)
- Hero images for sections
- Abstract tech-editorial illustrations

**Storage:** `public/media/<slug>/diagrams/` — lightweight PNG files (~200KB each).

**Style guide for prompts:**
- Dark gradient backgrounds (deep blue/purple)
- Clean, minimal, tech-editorial aesthetic
- No text in the image (captions handled by `<ModuleImage>`)
- Consistent style across all modules

### Image Plan for ai-fundamentals

| Page | Flat Diagrams (code) | AI Illustrations |
|------|---------------------|------------------|
| 1. Cómo funcionan los LLMs | Token→Embedding→Atención→Predicción pipeline, 3-stage training cycle | "Mapa de significados" (embeddings), "Termómetro de creatividad" (temperatura) |
| 2. Ecosistema de herramientas | Tool comparison (existing), API vs Interface diagram | "Ecosistema AI" (landscape) |
| 3. Límites reales | "Cómo detectar alucinaciones" flow | "Sesgo en datos" (conceptual), "Inyección de prompts" (conceptual) |
| 4. El mindset correcto | Prompt→Evaluar→Refinar cycle | "Profesional aumentado por IA" (hero) |

Total: ~6 flat diagrams + ~7 AI illustrations = 13 images.

---

## Migration Path

### For ai-fundamentals (already expanded)

1. Split the existing `content/ai-fundamentals.mdx` into 4 files in `content/ai-fundamentals/`
2. Add interactive components (`<MiniQuiz>`, `<Callout>`, `<Accordion>`, `<BeforeAfter>`) throughout
3. Generate AI illustrations and save to `public/media/ai-fundamentals/diagrams/`
4. Update `lib/modules.ts` with `sections` field
5. Keep the old `ai-fundamentals.mdx` as backup until migration is verified

### For other 9 modules — Generic Template

Each module follows the same repeatable process. The structure, components, and density targets below are the standard for every module.

#### Section MDX Template

Every section page follows this structure to ensure consistency and engagement:

```mdx
{/* — INTRO (2-3 párrafos) — */}
Introducción al tema. Contextualiza por qué importa y qué van a aprender.

<Callout type="tip">
  Dato clave o takeaway principal de la sección.
</Callout>

{/* — BLOQUE DE CONTENIDO 1 — */}
Explicación conceptual (~500 palabras). Usa analogías, no fórmulas.

{/* Diagrama flat (código HTML/SVG) o <AnimatedDiagram> */}

{/* — BLOQUE DE CONTENIDO 2 — */}
Más profundidad, ejemplos concretos.

<ModuleImage
  src="/media/<slug>/diagrams/<name>.png"
  alt="Descripción"
  caption="Explicación breve de la imagen"
/>

<Accordion title="Profundizar: <tema avanzado>">
  Contenido opcional/avanzado para quien quiera más detalle.
</Accordion>

{/* — BLOQUE DE CONTENIDO 3 — */}
Caso práctico o ejemplo real.

<BeforeAfter
  before={{ label: "Sin IA", content: "..." }}
  after={{ label: "Con IA", content: "..." }}
/>

<Callout type="example">
  Ejemplo real del mundo empresarial.
</Callout>

{/* — MINI-QUIZ DE CIERRE — */}
<MiniQuiz
  question="Pregunta de comprensión sobre esta sección"
  options={["Opción A", "Opción B", "Opción C"]}
  correct={1}
  explanation="Explicación de por qué esa es la respuesta correcta."
/>
```

#### Density Targets — Scaled by Duration

The `/enrich-module` skill accepts a `--duration` flag that controls how much content and interactivity to generate. The targets below scale accordingly:

| Duration | Words (total) | Pages | Words/page | Images/page | Mini-quizzes/page | Callouts/page |
|----------|--------------|-------|------------|-------------|-------------------|---------------|
| `30m` | ~3,000 | 1 (no pagination) | ~3,000 | 2-3 total | 1 final quiz only | 2-3 |
| `1h` | ~6,000 | 3-4 | ~1,500-2,000 | 1-2 | 1 | 2-3 |
| `2h` | ~10,000 | 4-6 | ~2,000-2,500 | 2-3 | 1-2 | 3-4 |
| `3h` | ~15,000 | 6-8 | ~2,000-2,500 | 2-3 | 2 | 4-5 |

**Additional per-page targets (all durations with pagination):**

| Element | Target per page | Notes |
|---------|----------------|-------|
| `<Accordion>` | 1-2 | For advanced/optional content |
| `<BeforeAfter>` | 0-1 | Where a practical comparison makes sense |
| Flat diagrams | 1-2 | Code-based SVG/HTML for processes |
| YouTube embeds | 0-1 | Only if highly relevant to the section |

#### Per-Module Checklist

To migrate any module to the paginated format:

- [ ] **Expand content** — Run `/enrich-module <slug>` for research + media, then manually expand text to ~10K words total
- [ ] **Split into sections** — Create `content/<slug>/` directory, one MDX per TOC section following the template above
- [ ] **Add interactive components** — Insert `<Callout>`, `<MiniQuiz>`, `<Accordion>`, `<BeforeAfter>` per density targets
- [ ] **Generate AI illustrations** — Use Gemini/Nano Banana, save to `public/media/<slug>/diagrams/`
- [ ] **Create flat diagrams** — Code-based diagrams for process flows
- [ ] **Update module definition** — Add `sections` array to the module in `lib/modules.ts`
- [ ] **Move final quiz** — Ensure `<Quiz>` is on the last section page
- [ ] **Move resources** — Ensure `<ResourceCard>` section and multimedia section are on the last page
- [ ] **Test navigation** — Verify ← → arrows, sidebar, progress bar, visit tracking
- [ ] **Backup** — Keep old single-file MDX until migration is verified

#### `/enrich-module` Skill Update

Add **Phase 6 — Paginate** to the existing enrich-module skill (`--phase paginate`):

1. Read the expanded MDX file for the module
2. Identify the H2 section boundaries (these map to TOC items)
3. Split into separate MDX files in `content/<slug>/` directory
4. Insert interactive components at appropriate positions:
   - `<Callout type="tip">` after each section intro
   - `<MiniQuiz>` at the end of each section (generate question from content)
   - `<Accordion>` around any advanced/optional paragraphs
5. Insert `<ModuleImage>` references for any AI-generated images in `media/<slug>/`
6. Update `lib/modules.ts` with the new `sections` array
7. Print summary of what was created

This phase runs after Phase 5 (Integrate) and can be invoked independently with `--phase paginate`.

---

## Dependencies

- **Existing:** Next.js 14, Tailwind CSS, @next/mdx, rehype-slug, remark-gfm
- **New:** None — all components are custom React + Tailwind. No new packages needed.
- **Image generation:** Gemini Imagen API (Pro account), Nano Banana (to be configured)

## Out of Scope

- Real-time progress syncing across devices (stays in localStorage)
- Timed sections or mandatory completion before advancing
- A/B testing different interactive element densities
- Automatic content expansion (the text still needs manual/AI authoring before splitting)
