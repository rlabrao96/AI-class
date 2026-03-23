# Microsoft + Cloud Track — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second course track "Aplicaciones Microsoft + Cloud" with 4 modules (Copilot+M365, Fabric, Azure AI Foundry, AWS Bedrock), restructure the homepage into two sequential track sections, and generalize the certificate page per track.

**Architecture:** Introduce a `Track` interface and `track` field on `Module` in `lib/modules.ts`. The homepage renders two sections (one per track) each with its own progress bar and certificate banner. Module pages pass `trackSlug` down to `ModuleSidebar` and `MarkCompleteButton` so each filters to its own track. Certificate routes become `/certificate/[trackSlug]`; the old `/certificate` redirects to `/certificate/fundamentos`.

**Tech Stack:** Next.js 14 App Router, TypeScript, MDX (`@next/mdx` + `remark-gfm` + `rehype-slug`), Tailwind CSS, localStorage progress tracking

**Spec:** `docs/superpowers/specs/2026-03-23-microsoft-cloud-track-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/modules.ts` | Modify | Add `Track` interface + `track` field on `Module`; add `track: 'fundamentos'` to all 6 existing modules; add 4 new `microsoft-cloud` modules; export `tracks` array |
| `lib/progress.ts` | Modify | Add `getTrackProgress(track)` helper |
| `app/page.tsx` | Modify | Two-section homepage with per-track headers, progress bars, module cards, certificate banners |
| `app/modules/[slug]/page.tsx` | Modify | Add 4 MDX imports to `moduleMap`; pass `trackSlug` to sidebar + button |
| `components/ModuleSidebar.tsx` | Modify | Accept `trackSlug` prop; filter nav to that track's modules |
| `components/MarkCompleteButton.tsx` | Modify | Accept `trackSlug` prop; scope `nextModule` to current track; link celebration to `/certificate/[trackSlug]` |
| `app/certificate/[trackSlug]/page.tsx` | Create | Per-track certificate page with `generateStaticParams` |
| `app/certificate/page.tsx` | Modify | Server-side redirect to `/certificate/fundamentos` |
| `content/copilot-m365.mdx` | Create | Module 1 of track 2 |
| `content/microsoft-fabric.mdx` | Create | Module 2 of track 2 |
| `content/azure-ai-foundry.mdx` | Create | Module 3 of track 2 |
| `content/aws-bedrock.mdx` | Create | Module 4 of track 2 |

---

## Task 1: Update lib/modules.ts

**Files:**
- Modify: `lib/modules.ts`

Context: Add `Track` interface, add `track` field to `Module` interface, add `track: 'fundamentos'` to all 6 existing module entries, add 4 new `microsoft-cloud` modules, and export a `tracks` array at the bottom.

- [ ] **Step 1.1: Add Track interface and track field to Module**

Replace the top of the file (interfaces only):

```ts
export interface TocItem {
  id: string
  label: string
}

export interface Module {
  slug: string
  number: number
  title: string
  estimatedTime: string
  track: string
  toc: TocItem[]
}

export interface Track {
  slug: string
  title: string
  description: string
  modules: Module[]
}
```

- [ ] **Step 1.2: Add `track: 'fundamentos'` to all 6 existing modules**

Each of the 6 existing module objects needs one new field. Add `track: 'fundamentos',` after `estimatedTime` in each entry. All 6 slugs: `ai-fundamentals`, `prompting-fundamentals`, `reliable-ai-systems`, `vibe-coding`, `agents-and-skills`, `legal-ai-risks`.

- [ ] **Step 1.3: Add 4 new microsoft-cloud module entries**

Append these entries to the `modules` array (after `legal-ai-risks`):

```ts
  {
    slug: 'copilot-m365',
    number: 1,
    title: 'IA en tu día a día Microsoft',
    estimatedTime: '60 min',
    track: 'microsoft-cloud',
    toc: [
      { id: 'cómo-funciona-copilot-en-m365', label: 'Cómo funciona Copilot en M365' },
      { id: 'prompting-en-el-contexto-m365', label: 'Prompting en el contexto M365' },
      { id: 'casos-prácticos-excel-teams-outlook-word', label: 'Casos prácticos: Excel, Teams, Outlook, Word' },
      { id: 'copilot-agents-más-allá-del-chat', label: 'Copilot Agents: más allá del chat' },
    ],
  },
  {
    slug: 'microsoft-fabric',
    number: 2,
    title: 'Tu plataforma de datos unificada',
    estimatedTime: '60 min',
    track: 'microsoft-cloud',
    toc: [
      { id: 'qué-es-microsoft-fabric-y-por-qué-importa', label: 'Qué es Microsoft Fabric' },
      { id: 'conectar-tus-datos-pipelines-con-data-factory', label: 'Pipelines con Data Factory' },
      { id: 'analizar-con-lenguaje-natural-copilot-en-fabric', label: 'Copilot en Fabric' },
      { id: 'governance-y-seguridad-en-fabric', label: 'Governance y seguridad' },
    ],
  },
  {
    slug: 'azure-ai-foundry',
    number: 3,
    title: 'Construye tu propio asistente de IA',
    estimatedTime: '60 min',
    track: 'microsoft-cloud',
    toc: [
      { id: 'qué-es-azure-ai-foundry-y-cómo-encaja-en-el-ecosistema', label: 'Qué es Azure AI Foundry' },
      { id: 'prompt-flow-orquestar-tu-asistente-paso-a-paso', label: 'Prompt Flow' },
      { id: 'conectar-tus-datos-azure-ai-search--sharepoint', label: 'Azure AI Search + SharePoint' },
      { id: 'desplegar-y-monitorear-tu-asistente', label: 'Desplegar y monitorear' },
    ],
  },
  {
    slug: 'aws-bedrock',
    number: 4,
    title: 'Modelos de IA en la infraestructura de AWS',
    estimatedTime: '60 min',
    track: 'microsoft-cloud',
    toc: [
      { id: 'qué-es-amazon-bedrock-y-por-qué-usarlo', label: 'Qué es Amazon Bedrock' },
      { id: 'llamar-modelos-consola-y-api', label: 'Llamar modelos: consola y API' },
      { id: 'rag-con-bedrock-knowledge-bases', label: 'RAG con Knowledge Bases' },
      { id: 'guardrails-y-uso-responsable-en-bedrock', label: 'Guardrails y uso responsable' },
    ],
  },
```

- [ ] **Step 1.4: Add tracks export at the bottom of the file**

After the closing `]` of the `modules` array and after `getModule`, append:

```ts
export const tracks: Track[] = [
  {
    slug: 'fundamentos',
    title: 'Fundamentos de IA',
    description: 'Seis módulos para entender, usar y aprovechar la IA en tu trabajo de forma responsable.',
    modules: modules.filter((m) => m.track === 'fundamentos'),
  },
  {
    slug: 'microsoft-cloud',
    title: 'Aplicaciones Microsoft + Cloud',
    description: 'Cuatro módulos para aplicar lo aprendido en las herramientas Microsoft y AWS que ya usas en tu trabajo.',
    modules: modules.filter((m) => m.track === 'microsoft-cloud'),
  },
]

export function getTrack(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug)
}
```

- [ ] **Step 1.5: Verify TypeScript compiles**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing unrelated errors).

- [ ] **Step 1.6: Commit**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI"
git add lib/modules.ts
git commit -m "feat: add Track interface, track field, microsoft-cloud modules, tracks export"
```

---

## Task 2: Update lib/progress.ts

**Files:**
- Modify: `lib/progress.ts`

Context: Add one new helper `getTrackProgress` that counts completed modules for a given track. The existing functions are unchanged.

- [ ] **Step 2.1: Add getTrackProgress helper**

Add this function at the bottom of `lib/progress.ts`:

```ts
export function getTrackProgress(track: Track): number {
  if (typeof window === 'undefined') return 0
  return track.modules.filter(
    (m) => localStorage.getItem(`${PREFIX}${m.slug}`) === 'completed'
  ).length
}
```

Also add the import at the top of the file (the `Track` type is needed):

```ts
import type { Track } from './modules'
```

- [ ] **Step 2.2: Verify TypeScript compiles**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 2.3: Commit**

```bash
git add lib/progress.ts
git commit -m "feat: add getTrackProgress helper to lib/progress.ts"
```

---

## Task 3: Update components/MarkCompleteButton.tsx

**Files:**
- Modify: `components/MarkCompleteButton.tsx`

Context: The component currently computes `nextModule` from the global `modules` array. This breaks with two tracks — the last module of track 1 would find track 2's first module as "next" and never show the celebration banner. Fix: accept `trackSlug` prop, filter modules to the current track before computing `nextModule`, and link the celebration to `/certificate/${trackSlug}`.

Current interface: `{ slug: string }`
New interface: `{ slug: string; trackSlug: string }`

- [ ] **Step 3.1: Replace MarkCompleteButton.tsx with track-aware version**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getModuleProgress, setModuleCompleted } from '@/lib/progress'
import { modules } from '@/lib/modules'

interface MarkCompleteButtonProps {
  slug: string
  trackSlug: string
}

export function MarkCompleteButton({ slug: currentSlug, trackSlug }: MarkCompleteButtonProps) {
  const [completed, setCompleted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setCompleted(getModuleProgress(currentSlug) === 'completed')
  }, [currentSlug])

  const trackModules = modules.filter((m) => m.track === trackSlug)
  const currentIndex = trackModules.findIndex((m) => m.slug === currentSlug)
  const nextModule = trackModules[currentIndex + 1]
  const isLastModule = !nextModule

  function handleComplete() {
    setModuleCompleted(currentSlug)
    setCompleted(true)
    if (isLastModule) setShowCelebration(true)
  }

  if (showCelebration || (completed && isLastModule)) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="bg-green-600 text-white px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-base">
              ¡Felicitaciones! Completaste el módulo.
            </p>
            <p className="text-green-100 text-sm mt-0.5">
              Has finalizado todos los módulos de esta sección.
            </p>
          </div>
          <button
            onClick={() => router.push(`/certificate/${trackSlug}`)}
            className="flex-shrink-0 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-green-50 transition-colors"
          >
            Ver mi certificado →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e4e7] px-4 py-3 flex items-center justify-between gap-4 z-10">
      {completed ? (
        <>
          <span className="flex items-center gap-2 text-green-600 font-medium text-sm">
            <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs">✓</span>
            Módulo completado
          </span>
          {nextModule && (
            <button
              onClick={() => router.push(`/modules/${nextModule.slug}`)}
              className="bg-[#18181b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#27272a] transition-colors"
            >
              Siguiente: {nextModule.title} →
            </button>
          )}
        </>
      ) : (
        <button
          onClick={handleComplete}
          className="ml-auto bg-[#18181b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#27272a] transition-colors"
        >
          Marcar como completado ✓
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3.2: Verify TypeScript compiles**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npx tsc --noEmit 2>&1 | head -30
```

Expected: TypeScript will report an error in `app/modules/[slug]/page.tsx` because `MarkCompleteButton` now requires `trackSlug` — that's expected and will be fixed in Task 5.

- [ ] **Step 3.3: Commit**

```bash
git add components/MarkCompleteButton.tsx
git commit -m "feat: MarkCompleteButton — accept trackSlug, scope nextModule to track, link certificate per track"
```

---

## Task 4: Update components/ModuleSidebar.tsx

**Files:**
- Modify: `components/ModuleSidebar.tsx`

Context: The sidebar currently shows all modules. With two tracks, it should only show the modules of the current track. Add `trackSlug` prop, keep `currentSlug` (still needed for active highlight, TOC, and progress re-read).

- [ ] **Step 4.1: Add trackSlug prop and filter module list**

Change the `ModuleSidebarProps` interface and add the filter:

```tsx
interface ModuleSidebarProps {
  currentSlug: string
  trackSlug: string
}

export function ModuleSidebar({ currentSlug, trackSlug }: ModuleSidebarProps) {
```

Then replace the line that iterates `modules.map(...)` in the nav section with:

```tsx
{modules.filter((mod) => mod.track === trackSlug).map((mod) => {
```

The rest of the component is unchanged.

- [ ] **Step 4.2: Verify TypeScript compiles**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npx tsc --noEmit 2>&1 | head -30
```

Expected: TypeScript will report an error in `app/modules/[slug]/page.tsx` because `ModuleSidebar` now requires `trackSlug` — expected, fixed in Task 5.

- [ ] **Step 4.3: Commit**

```bash
git add components/ModuleSidebar.tsx
git commit -m "feat: ModuleSidebar — accept trackSlug prop, filter nav to current track"
```

---

## Task 5: Update app/modules/[slug]/page.tsx

**Files:**
- Modify: `app/modules/[slug]/page.tsx`

Context: Three changes: (1) add 4 new MDX imports to `moduleMap`, (2) pass `trackSlug={mod.track}` to `ModuleSidebar`, (3) pass `trackSlug={mod.track}` to `MarkCompleteButton`. This resolves the TypeScript errors introduced in Tasks 3 and 4.

- [ ] **Step 5.1: Add 4 entries to the moduleMap**

Current `moduleMap`:
```ts
const moduleMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'ai-fundamentals': () => import('@/content/ai-fundamentals.mdx'),
  'prompting-fundamentals': () => import('@/content/prompting-fundamentals.mdx'),
  'reliable-ai-systems': () => import('@/content/reliable-ai-systems.mdx'),
  'vibe-coding': () => import('@/content/vibe-coding.mdx'),
  'agents-and-skills': () => import('@/content/agents-and-skills.mdx'),
  'legal-ai-risks': () => import('@/content/legal-ai-risks.mdx'),
}
```

Replace with:
```ts
const moduleMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'ai-fundamentals': () => import('@/content/ai-fundamentals.mdx'),
  'prompting-fundamentals': () => import('@/content/prompting-fundamentals.mdx'),
  'reliable-ai-systems': () => import('@/content/reliable-ai-systems.mdx'),
  'vibe-coding': () => import('@/content/vibe-coding.mdx'),
  'agents-and-skills': () => import('@/content/agents-and-skills.mdx'),
  'legal-ai-risks': () => import('@/content/legal-ai-risks.mdx'),
  'copilot-m365': () => import('@/content/copilot-m365.mdx'),
  'microsoft-fabric': () => import('@/content/microsoft-fabric.mdx'),
  'azure-ai-foundry': () => import('@/content/azure-ai-foundry.mdx'),
  'aws-bedrock': () => import('@/content/aws-bedrock.mdx'),
}
```

- [ ] **Step 5.2: Pass trackSlug to ModuleSidebar and MarkCompleteButton**

Find the JSX in the return statement. Change:
```tsx
<ModuleSidebar currentSlug={params.slug} />
```
to:
```tsx
<ModuleSidebar currentSlug={params.slug} trackSlug={mod.track} />
```

Change:
```tsx
<MarkCompleteButton slug={params.slug} />
```
to:
```tsx
<MarkCompleteButton slug={params.slug} trackSlug={mod.track} />
```

- [ ] **Step 5.3: Verify TypeScript compiles cleanly**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5.4: Commit**

```bash
git add "app/modules/[slug]/page.tsx"
git commit -m "feat: module page — add 4 MDX imports, pass trackSlug to sidebar and complete button"
```

---

## Task 6: Create app/certificate/[trackSlug]/page.tsx

**Files:**
- Create: `app/certificate/[trackSlug]/page.tsx`
- Create: `components/CertificateTrackPage.tsx`

Context: In Next.js 14 App Router, `generateStaticParams` must live in a **Server Component** (no `'use client'`). But the certificate page needs localStorage access (client-side). Solution: split into two files — a thin Server Component page that contains `generateStaticParams` and renders a Client Component, and a `'use client'` component that handles the localStorage check and UI.

- [ ] **Step 6.1: Create the directory**

```bash
mkdir -p "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI/app/certificate/[trackSlug]"
```

- [ ] **Step 6.2: Create components/CertificateTrackPage.tsx (client component)**

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Track } from '@/lib/modules'
import { getModuleProgress } from '@/lib/progress'

interface CertificateTrackPageProps {
  track: Track
}

export function CertificateTrackPage({ track }: CertificateTrackPageProps) {
  const [allComplete, setAllComplete] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const complete = track.modules.every(
      (m) => getModuleProgress(m.slug) === 'completed'
    )
    setAllComplete(complete)
    setChecked(true)
  }, [track])

  if (!checked) return null

  if (!allComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <p className="text-[#18181b] font-semibold mb-2">Aún no completaste todos los módulos</p>
          <p className="text-[#71717a] text-sm mb-6">
            Completa todos los módulos de <strong>{track.title}</strong> para obtener tu certificado.
          </p>
          <Link href="/" className="text-sm text-[#3b82f6] hover:underline">← Volver al curso</Link>
        </div>
      </div>
    )
  }

  const completionDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8 print:bg-white">
      <div className="bg-white border border-[#e4e4e7] rounded-2xl shadow-sm max-w-xl w-full p-10 print:shadow-none print:border-none">
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">🎓</div>
          <p className="text-xs font-semibold text-[#71717a] uppercase tracking-widest mb-1">
            Certificado de finalización
          </p>
          <h1 className="text-2xl font-bold text-[#18181b]">{track.title}</h1>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-[#71717a] mb-1">Este certificado acredita que</p>
          <p className="text-xl font-semibold text-[#18181b]">Participante del Programa</p>
          <p className="text-sm text-[#71717a] mt-1">completó satisfactoriamente todos los módulos</p>
        </div>

        <div className="space-y-2 mb-8">
          {track.modules.map((mod) => (
            <div key={mod.slug} className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-lg">
              <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
              <span className="text-sm font-medium text-[#18181b]">
                Módulo {mod.number} · {mod.title}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-[#71717a]">Fecha de finalización: <strong className="text-[#18181b]">{completionDate}</strong></p>
        </div>

        <div className="flex items-center justify-between gap-4 print:hidden">
          <Link href="/" className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors">
            ← Volver al curso
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-[#18181b] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#27272a] transition-colors"
          >
            Descargar / Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6.3: Create app/certificate/[trackSlug]/page.tsx (server component)**

```tsx
import { notFound } from 'next/navigation'
import { tracks, getTrack } from '@/lib/modules'
import { CertificateTrackPage } from '@/components/CertificateTrackPage'

export function generateStaticParams() {
  return tracks.map((t) => ({ trackSlug: t.slug }))
}

export default function CertificatePage({
  params,
}: {
  params: { trackSlug: string }
}) {
  const track = getTrack(params.trackSlug)
  if (!track) notFound()
  return <CertificateTrackPage track={track} />
}
```

- [ ] **Step 6.4: Verify TypeScript compiles**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 6.5: Commit**

```bash
git add "app/certificate/[trackSlug]/page.tsx" components/CertificateTrackPage.tsx
git commit -m "feat: add parameterized certificate page at /certificate/[trackSlug]"
```

---

## Task 7: Update app/certificate/page.tsx (redirect)

**Files:**
- Modify: `app/certificate/page.tsx`

Context: The old `/certificate` route now redirects to `/certificate/fundamentos` for backwards compatibility (links in MarkCompleteButton history, bookmarks, etc.). Replace the entire file with a server-side redirect. Remove `'use client'`.

- [ ] **Step 7.1: Replace app/certificate/page.tsx with server redirect**

```tsx
import { redirect } from 'next/navigation'

export default function CertificatePage() {
  redirect('/certificate/fundamentos')
}
```

- [ ] **Step 7.2: Commit**

```bash
git add app/certificate/page.tsx
git commit -m "fix: /certificate redirects to /certificate/fundamentos for backwards compatibility"
```

---

## Task 8: Update app/page.tsx (two-section homepage)

**Files:**
- Modify: `app/page.tsx`

Context: Replace the single-track homepage with a two-section layout. Each section shows: track title + description + per-track progress bar + module cards + certificate banner when 100% complete. Import `tracks` from `@/lib/modules`. Progress counting is inlined (reads from `progress` state — no need to import `getTrackProgress` here).

- [ ] **Step 8.1: Replace app/page.tsx with two-section version**

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { tracks } from '@/lib/modules'
import { getModuleProgress, ModuleStatus } from '@/lib/progress'

export default function HomePage() {
  const [progress, setProgress] = useState<Record<string, ModuleStatus>>({})

  useEffect(() => {
    const result: Record<string, ModuleStatus> = {}
    tracks.forEach((track) => {
      track.modules.forEach((mod) => {
        result[mod.slug] = getModuleProgress(mod.slug)
      })
    })
    setProgress(result)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Site header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#18181b] mb-2">Capacitación en IA</h1>
          <p className="text-[#71717a]">Completa los módulos en orden para obtener tu certificado por sección.</p>
        </div>

        <div className="space-y-16">
          {tracks.map((track, trackIndex) => {
            const completedCount = track.modules.filter(
              (m) => progress[m.slug] === 'completed'
            ).length
            const allComplete = completedCount === track.modules.length

            return (
              <section key={track.slug}>
                {/* Divider between tracks */}
                {trackIndex > 0 && (
                  <hr className="border-[#e4e4e7] mb-16 -mt-0" />
                )}

                {/* Track header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#18181b] mb-1">{track.title}</h2>
                  <p className="text-[#71717a] text-sm">{track.description}</p>
                </div>

                {/* Per-track progress bar */}
                <div className="mb-6 p-4 border border-[#e4e4e7] rounded-lg bg-[#fafafa]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#18181b]">Progreso</span>
                    <span className="text-sm text-[#71717a]">
                      {completedCount} de {track.modules.length} módulos
                    </span>
                  </div>
                  <div className="h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / track.modules.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Certificate banner */}
                {allComplete && (
                  <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-green-800">¡Completaste esta sección!</p>
                      <p className="text-xs text-green-700 mt-0.5">Ya puedes obtener tu certificado.</p>
                    </div>
                    <Link
                      href={`/certificate/${track.slug}`}
                      className="flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors no-underline"
                    >
                      Ver certificado →
                    </Link>
                  </div>
                )}

                {/* Module cards */}
                <div className="space-y-3">
                  {track.modules.map((mod) => {
                    const isCompleted = progress[mod.slug] === 'completed'
                    return (
                      <Link
                        key={mod.slug}
                        href={`/modules/${mod.slug}`}
                        className="flex items-center gap-4 p-4 border rounded-lg bg-[#fafafa] hover:bg-white hover:shadow-sm transition-all group no-underline"
                        style={{ borderColor: isCompleted ? '#22c55e' : '#e4e4e7' }}
                      >
                        <div
                          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCompleted ? 'bg-green-500 text-white' : 'bg-[#e4e4e7] text-[#71717a]'
                          }`}
                        >
                          {isCompleted ? '✓' : mod.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#18181b] group-hover:underline">{mod.title}</p>
                          <p className="text-xs text-[#71717a] mt-0.5">{mod.estimatedTime}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isCompleted ? 'bg-green-50 text-green-700' : 'bg-[#f4f4f5] text-[#71717a]'
                            }`}
                          >
                            {isCompleted ? 'Completado' : 'No iniciado'}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8.2: Verify TypeScript compiles**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 8.3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: homepage — two-section layout with per-track progress bars and certificate banners"
```

---

## Task 9: Create content/copilot-m365.mdx

**Files:**
- Create: `content/copilot-m365.mdx`

- [ ] **Step 9.1: Create content/copilot-m365.mdx**

```mdx
# IA en tu día a día Microsoft

Copilot está integrado en las herramientas que ya usas. Este módulo explica cómo funciona dentro de M365, cómo prompting en este contexto es diferente al chat libre, y cómo sacarle el máximo provecho en escenarios reales de trabajo — con atención especial a qué datos es seguro usar y cuáles no.

---

## Cómo funciona Copilot en M365

Microsoft 365 Copilot no es solo un chatbot: es un sistema que combina un modelo de lenguaje (LLM) con **Microsoft Graph** — el grafo de datos de tu organización que conecta emails, documentos, chats, calendarios y reuniones.

Cuando le haces una pregunta a Copilot en Teams, no está buscando en Internet. Está buscando en *tu* contexto organizacional: los emails que recibiste esta semana, los documentos de SharePoint a los que tienes acceso, las transcripciones de tus reuniones. Eso es lo que hace que sea fundamentalmente distinto a usar ChatGPT en el navegador.

### M365 Copilot vs Copilot Chat

| | M365 Copilot | Copilot Chat (web) |
|--|--|--|
| **Acceso a datos org** | Sí — emails, docs, chats | No — solo web pública |
| **Licencia** | Add-on de pago (~$30/usuario/mes) | Gratuito |
| **Contexto** | El documento abierto, tu inbox, tus reuniones | Solo lo que pegas en el chat |
| **Riesgo compliance** | Bajo — datos dentro del tenant | Alto — datos salen a Internet |

### Cómo funciona el contexto

Copilot usa **semantic indexing** — una capa de búsqueda vectorial sobre todos los archivos del tenant — para recuperar los fragmentos más relevantes antes de generar la respuesta. Esto significa que:

1. No tiene que leer todo SharePoint en cada consulta — busca los fragmentos más relevantes
2. Solo puede ver lo que **tú** puedes ver — los permisos de SharePoint se respetan (no hay forma de ver archivos a los que no tienes acceso)
3. Microsoft Purview controla qué se indexa y qué no

> **Compliance:** Copilot solo puede acceder a datos a los que el usuario ya tiene permiso. Si un colega comparte un archivo "confidential" pero no te lo compartió directamente, Copilot no puede acceder a él. El índice respeta los permisos del tenant.

---

## Prompting en el contexto M365

La diferencia más importante entre prompting en M365 y prompting en chat libre es que **el contexto ya está cargado**. No necesitas pegar el documento completo — el modelo ya sabe qué archivo tienes abierto en Word, qué reunión acabas de tener en Teams, qué emails recibiste hoy.

Pero eso no significa que el prompt no importe. La diferencia es que en M365 tienes que ser específico sobre **qué parte del contexto** quieres trabajar, no sobre cuál es el contexto.

### Ejemplos por aplicación

**En Word** (con el documento abierto):
- ✅ `"Resume los tres puntos de acción mencionados en la sección 3 en formato bullet"`
- ✅ `"Reescribe el párrafo de introducción con un tono más ejecutivo y menos técnico"`
- ❌ `"Resume este documento"` — demasiado vago, el output será genérico

**En Outlook** (con un hilo de emails abierto):
- ✅ `"Redacta una respuesta confirmando la reunión del jueves, pero pidiendo que se envíe el deck con 24 horas de anticipación"`
- ✅ `"¿Cuál es el estado actual del proyecto según este hilo?"` — Copilot lee el hilo completo

**En Teams** (en una reunión o en el chat):
- ✅ `"¿Cuáles fueron los acuerdos de la reunión del martes sobre el pipeline de Fabric?"` — busca en transcripciones
- ✅ `"Resume los action items de Walter de las últimas dos semanas"` — busca en chats y reuniones

**En Excel** (con la hoja abierta):
- ✅ `"¿Cuáles son los 5 países con mayor crecimiento YoY en esta tabla?"` — analiza los datos de la hoja
- ✅ `"Explica qué hace la fórmula en la celda D12"` — Copilot puede leer y explicar fórmulas

> **Compliance:** No pegues datos de pacientes, datos de HCP, ni información de ventas confidencial en **Copilot Chat** (la versión web/gratuita). Esos datos salen del perímetro corporativo. M365 Copilot (la versión con licencia) es el canal correcto para trabajar con datos internos — los datos nunca salen del tenant de Novartis.

---

## Casos prácticos: Excel, Teams, Outlook, Word

### Excel: análisis de datos con lenguaje natural

Copilot en Excel es especialmente útil para análisis exploratorio — cuando tienes una tabla de datos y quieres entender qué hay en ella sin escribir fórmulas.

**Escenario:** Tienes el reporte mensual de ventas exportado de SAP en Excel (38 países, 12 meses, 4 líneas de producto).

- `"¿Qué países tuvieron mayor crecimiento en oncología en Q3 vs Q3 del año anterior?"` → Copilot identifica la columna correcta y genera la comparación
- `"Crea una tabla pivot que muestre ventas por región por trimestre"` → genera la pivot directo
- `"¿Hay algún país donde las ventas cayeron más del 10% consecutivamente en dos trimestres?"` → análisis de tendencias

**Limitación importante:** Copilot en Excel funciona sobre los datos que están en la hoja abierta. Para datos de SAP o Salesforce, primero exporta a Excel (o usa Fabric para automatizar esa conexión — ver Módulo 2).

> **Compliance:** Para datos de SAP/Salesforce, exporta primero a Excel/SharePoint. Copilot puede leer archivos en tu OneDrive/SharePoint, pero no conecta directamente a SAP ni a Salesforce.

### Teams: reuniones y colaboración

El caso de uso más inmediato de Copilot en Teams es el resumen post-reunión.

- **Resumen automático:** Al finalizar una reunión grabada, Copilot genera un resumen con los puntos principales y action items detectados
- **Preguntas sobre la reunión:** `"¿Qué dijo Walter sobre el timeline del proyecto Fabric?"` — busca en la transcripción
- **Búsqueda semántica en historial:** `"¿Cuándo fue la última vez que discutimos el presupuesto Q4 en este canal?"` — busca en el historial de chats y reuniones

### Outlook: gestión de email a escala

- **Resumen de hilos largos:** Abre un hilo de 30 emails y usa `"Resume las decisiones tomadas en este hilo"` — Copilot lee todo el hilo
- **Drafting con contexto:** `"Escribe un email a Walter confirmando que el análisis de mercado estará listo para el viernes"` — Copilot conoce el contexto de la conversación previa
- **Triage de inbox:** `"¿Cuáles son los emails de esta semana que requieren acción urgente de mi parte?"` — analiza todo el inbox

### Word: documentos y reportes

- **Generar desde outline:** `"Escribe una introducción de dos párrafos para un reporte sobre performance de ventas en LATAM basado en los puntos del outline"` — Copilot usa el outline que tienes en el documento
- **Mejorar redacción:** `"Reescribe el párrafo seleccionado con un tono más formal, manteniendo los números exactos"` — no inventa datos, solo mejora la prosa
- **Resumen ejecutivo:** `"Genera un resumen ejecutivo de una página de este documento"` — condensa el documento abierto

---

## Copilot Agents: más allá del chat

Los **Copilot Agents** (también llamados "declarative agents") son automatizaciones dentro del ecosistema M365 que responden a triggers o pueden ser invocados desde Teams, SharePoint, o Outlook.

Son distintos de los agentes de IA del Módulo 5 de Fundamentos (que son loops autónomos con tool use). Los Copilot Agents son más simples: definen un scope de datos y un comportamiento, y se activan cuando el usuario los llama.

### Cómo funciona un Copilot Agent

Un agent tiene tres componentes:
1. **Instrucciones:** qué debe hacer el agente (similar a un system prompt)
2. **Knowledge:** las fuentes de datos que puede consultar (SharePoints, archivos específicos, páginas web internas)
3. **Actions:** qué puede hacer además de responder (enviar emails, crear tareas, actualizar listas de SharePoint)

### Ejemplo: Agente de resumen semanal de ventas

Imagina un agente llamado "Sales Weekly" configurado así:
- **Instrucciones:** "Cada lunes, genera un resumen de las actividades de ventas de la semana anterior en formato ejecutivo, con los 3 principales logros y los 3 principales riesgos"
- **Knowledge:** La carpeta de SharePoint `Sales Reports/Weekly` donde el equipo sube los reportes
- **Actions:** Crea un post en el canal de Teams `#ventas-resumen` con el resumen generado

El equipo solo necesita subir el reporte semanal a SharePoint — el agente hace el resto.

### Cómo crear un agente

Los agentes se crean desde **Copilot Studio** (antes Power Virtual Agents) — accesible desde el portal M365 si tienes la licencia habilitada. No requieren código: es una interfaz de configuración con UI.

> **Compliance:** Los Copilot Agents tienen exactamente el mismo scope de permisos que el usuario que los crea. No pueden acceder a más datos de los que tú ya ves. Si creas un agente que lee un SharePoint donde no tienes acceso a todos los archivos, el agente tampoco los verá. DD&IT debe habilitar Copilot Studio en el tenant para que puedas crear agentes.

---

<Quiz
  moduleSlug="copilot-m365"
  questions={[
    {
      question: "¿Qué es Microsoft Graph y cómo lo usa Copilot?",
      options: [
        "Es la interfaz gráfica de M365",
        "Es el grafo de datos organizacional que conecta emails, docs y chats — Copilot lo usa para personalizar respuestas con tu contexto real",
        "Es la herramienta de visualización de Power BI",
        "Es el motor de búsqueda de Bing integrado en M365"
      ],
      correct: 1
    },
    {
      question: "¿Cuál es la diferencia más importante entre M365 Copilot y Copilot Chat (web)?",
      options: [
        "M365 Copilot es más rápido",
        "Copilot Chat tiene acceso a datos más actualizados",
        "M365 Copilot accede a tus datos organizacionales dentro del tenant; Copilot Chat solo usa datos públicos de Internet",
        "Son idénticos pero M365 Copilot tiene una interfaz diferente"
      ],
      correct: 2
    },
    {
      question: "Tienes una tabla de ventas en Excel con 38 países y 12 meses. ¿Cuál es el prompt más efectivo?",
      options: [
        "'Analiza estos datos'",
        "'¿Qué países tuvieron mayor crecimiento en oncología en Q3 vs Q3 del año anterior?'",
        "'Resume la tabla'",
        "'Genera un reporte completo de todas las ventas'"
      ],
      correct: 1
    },
    {
      question: "¿Qué datos es seguro pegar en Copilot Chat (la versión web gratuita)?",
      options: [
        "Datos de HCP con nombres y prescripciones",
        "Información de ventas confidencial por país",
        "Ningún dato interno confidencial — Copilot Chat web envía datos fuera del perímetro corporativo",
        "Datos de SAP si están anonimizados"
      ],
      correct: 2
    },
    {
      question: "Un Copilot Agent creado por ti necesita acceder a un SharePoint donde no tienes permisos de lectura. ¿Qué pasa?",
      options: [
        "El agente puede acceder porque tiene permisos de sistema",
        "El agente tampoco puede acceder — hereda exactamente los permisos del usuario que lo creó",
        "El agente solicita permisos automáticamente a DD&IT",
        "El agente accede pero registra la acción en el log de auditoría"
      ],
      correct: 1
    }
  ]}
/>

## Recursos

<ResourceCard
  title="Microsoft 365 Copilot Overview"
  url="https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview"
  description="Documentación oficial de Microsoft sobre qué es M365 Copilot, cómo funciona con Microsoft Graph, y las diferencias entre M365 Copilot y Copilot Chat."
  type="doc"
/>

<ResourceCard
  title="Arquitectura técnica de M365 Copilot"
  url="https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-architecture"
  description="Diagrama y explicación de cómo M365 Copilot coordina LLMs, Microsoft Graph, y los datos del tenant para generar respuestas personalizadas."
  type="doc"
/>

<ResourceCard
  title="Copilot en Excel: primeros pasos"
  url="https://support.microsoft.com/en-us/topic/get-started-with-copilot-in-excel-d7110502-0334-4b4f-a175-a73abdfc118a"
  description="Guía oficial de Microsoft para usar Copilot en Excel: análisis de datos con lenguaje natural, creación de fórmulas, y generación de visualizaciones."
  type="doc"
/>

<ResourceCard
  title="Microsoft Purview y protección de datos con Copilot"
  url="https://learn.microsoft.com/en-us/purview/ai-microsoft-purview"
  description="Cómo Microsoft Purview controla qué datos puede indexar y usar Copilot. Esencial para equipos con datos sensibles como HCP o información de ventas confidencial."
  type="doc"
/>

<ResourceCard
  title="Microsoft Copilot Adoption Hub"
  url="https://adoption.microsoft.com/en-us/copilot/"
  description="Hub oficial de Microsoft para adopción de Copilot: guías por rol, escenarios de uso, prompts recomendados por aplicación, y recursos de capacitación."
  type="article"
/>
```

- [ ] **Step 9.2: Commit**

```bash
git add content/copilot-m365.mdx
git commit -m "feat: add Module 1 content — IA en tu día a día Microsoft (Copilot M365)"
```

---

## Task 10: Create content/microsoft-fabric.mdx

**Files:**
- Create: `content/microsoft-fabric.mdx`

- [ ] **Step 10.1: Create content/microsoft-fabric.mdx**

```mdx
# Tu plataforma de datos unificada

Los datos de Novartis viven en SAP, Salesforce, SharePoint y Power BI — sin conectarse entre sí. Microsoft Fabric es la plataforma que los unifica. Este módulo explica qué es Fabric, cómo conecta tus fuentes de datos existentes, cómo construir un pipeline básico, y cómo Copilot en Fabric acelera el trabajo con datos. Con atención especial a governance y seguridad.

---

## Qué es Microsoft Fabric y por qué importa

Microsoft Fabric es una plataforma SaaS de analytics end-to-end: cubre todo el ciclo de vida del dato — desde la ingesta hasta el reporte — dentro de un solo tenant de Microsoft. Antes de Fabric, el flujo típico era: SAP exporta a CSV → analista lo transforma en Excel → sube a SharePoint → Power BI lo lee. Con Fabric: SAP → pipeline automatizado → OneLake → Power BI directo. Sin pasos manuales, sin desfase de datos.

### Los 8 workloads de Fabric

Fabric no es un producto único — es una plataforma que agrupa 8 capacidades bajo un mismo tenant y una misma capa de governance:

| Workload | Para qué sirve |
|----------|---------------|
| **Power BI** | Reportes y dashboards de negocio |
| **Data Factory** | Pipelines de ingesta y transformación (ETL/ELT) |
| **Data Engineering** | Notebooks Spark para transformaciones complejas |
| **Data Science** | Entrenamiento y deployment de modelos ML |
| **Data Warehouse** | SQL analítico sobre datos estructurados |
| **Real-Time Intelligence** | Streams de datos en tiempo real (IoT, eventos) |
| **Databases** | Bases de datos operacionales dentro de Fabric |
| **IQ (preview)** | Agentes de IA que responden preguntas sobre los datos |

No tienes que usar todos los workloads. Para el equipo de Business Execution, los más relevantes son Power BI, Data Factory y Data Warehouse.

### OneLake: el data lake único del tenant

OneLake es el concepto más importante de Fabric. Es un **data lake único, tenant-wide**, construido sobre Azure Data Lake Storage Gen2. Lo que lo hace especial es el **zero-copy access**: todos los workloads de Fabric leen del mismo dato en OneLake, sin copiarlo ni moverlo.

Antes de Fabric, cada herramienta tenía su propio storage: Power BI tenía su dataset, el data warehouse tenía su copia, el equipo de data science tenía su propia copia en Blob Storage. Con OneLake, hay una sola copia del dato y todos los workloads la leen.

```
SAP  Salesforce  SharePoint
  ↓       ↓          ↓
      Data Factory
           ↓
         OneLake  ←——— una sola copia del dato
           ↓
  Power BI  |  Data Warehouse  |  Data Science  |  IQ
```

> **Compliance:** Fabric hereda las políticas de Microsoft Purview del tenant. Las sensitivity labels aplicadas en Power BI se propagan automáticamente a todos los workloads que consumen ese dato. Un dataset marcado como "Confidential" no puede ser exportado a formatos no cifrados.

---

## Conectar tus datos: pipelines con Data Factory

Data Factory en Fabric es el motor de ingesta y transformación. Tiene conectores nativos para más de 150 fuentes de datos — incluyendo SAP, Salesforce, SharePoint, SQL Server, y servicios de nube.

### Cómo funciona un pipeline

Un pipeline en Data Factory es un grafo de actividades con tres partes:

1. **Source:** La fuente de datos (SAP, Salesforce, SharePoint, API, etc.)
2. **Transformation:** Qué transformaciones se aplican (filtros, joins, aggregations, renombramiento de columnas)
3. **Destination:** Dónde se escribe el dato resultante (OneLake lakehouse, Data Warehouse, otro sistema)

### Ejemplo: pipeline de ventas SAP → Power BI

Un pipeline típico para el equipo de Business Execution:

```
SAP (source)
  → Seleccionar tablas de ventas del mes
  → Filtrar por región LATAM
  → Renombrar columnas a nombres de negocio
  → Escribir en OneLake (Lakehouse "ventas_latam")
  → Power BI lee desde OneLake (semantic model)
```

Una vez configurado, el pipeline puede programarse para correr diariamente, semanalmente, o dispararse on-demand. Sin intervención manual.

### Dataflows Gen2: transformaciones sin código

Para transformaciones más simples, Dataflows Gen2 ofrece una interfaz visual tipo **Power Query** (la misma que conoces de Excel). Arrastras columnas, defines filtros, aplicas transformaciones — sin escribir código Spark ni SQL.

Cuándo usar cada uno:
- **Pipeline + Dataflow:** cuando la lógica de transformación es simple y el equipo es no-técnico
- **Pipeline + Notebook Spark:** cuando necesitas transformaciones complejas, joins entre fuentes grandes, o lógica personalizada

> **Compliance:** Los pipelines corren con las credenciales del **service principal** configurado por IT, no con tus credenciales personales. Esto es intencional: un pipeline de producción no debe depender de que tú estés logueado. Habla con DD&IT para que configuren el service principal con los permisos mínimos necesarios. Nunca uses tus credenciales personales en pipelines de producción.

---

## Analizar con lenguaje natural: Copilot en Fabric

Copilot en Fabric es una capa de IA generativa sobre los workloads. Es distinto de M365 Copilot (que trabaja con emails y documentos) — aquí el contexto son los datos y los artefactos de Fabric.

Lo clave: **Copilot se comporta distinto en cada workload**.

### Copilot en Power BI

El caso de uso más inmediato. Copilot puede generar:
- **Visualizaciones:** `"Muestra las ventas por país del último trimestre comparadas con el año anterior"` → genera el visual directo en el canvas
- **Páginas de reporte completas:** `"Crea una página de resumen ejecutivo con los KPIs principales de este modelo"` → genera una página con múltiples visuales
- **Narrativas:** `"Escribe un resumen narrativo de los cambios más importantes en este reporte"` → texto interpretativo sobre los datos

### Copilot en Data Warehouse

Copilot genera SQL desde lenguaje natural. Útil para analistas que conocen el negocio pero no son expertos en SQL:

```
Pregunta: "¿Cuáles son los 10 HCPs con mayor volumen de prescripciones en Q1 2025 en la región andina?"

Copilot genera:
SELECT TOP 10
    hcp_id,
    hcp_name,
    region,
    SUM(prescription_volume) as total_prescriptions
FROM dbo.prescriptions
WHERE quarter = 'Q1' AND year = 2025
    AND region = 'Andean'
GROUP BY hcp_id, hcp_name, region
ORDER BY total_prescriptions DESC
```

El analista puede revisar el SQL antes de ejecutarlo — Copilot no ejecuta automáticamente, solo genera.

### Copilot en Data Engineering

Para el equipo técnico: Copilot completa código **Spark (PySpark)** en notebooks. Útil para acelerar la escritura de transformaciones complejas o para entender código existente.

> **Compliance:** Copilot en Fabric requiere F2+ SKU o Premium. Los prompts pueden procesarse en datacenters de US o EU según la configuración del tenant. Antes de usar Copilot en Fabric con datos sensibles (HCP, datos clínicos, información de ventas confidencial), verifica con IT qué región de procesamiento está configurada para el tenant de Novartis.

---

## Governance y seguridad en Fabric

Fabric no es solo una plataforma de datos — es también una plataforma de governance. Estos son los controles que necesitas conocer como usuario de negocio.

### Workspaces y roles

Todo en Fabric vive en un **workspace**. Los workspaces son contenedores con control de acceso propio. Los roles disponibles:

| Rol | Puede hacer |
|-----|-------------|
| **Admin** | Todo: gestionar acceso, publicar, eliminar |
| **Member** | Crear, editar, y publicar contenido |
| **Contributor** | Crear y editar, pero no publicar |
| **Viewer** | Solo ver y descargar reportes |

Principio: asigna el rol mínimo necesario. Los analistas de negocio que solo leen reportes deben ser Viewers, no Members.

### Sensitivity labels (Microsoft Purview)

Los sensitivity labels son etiquetas que se aplican a datasets, reportes y otros items en Fabric, heredadas de las políticas de Purview del tenant. Ejemplos típicos: Public, Internal, Confidential, Highly Confidential.

Un dataset marcado como **Confidential**:
- No puede exportarse a Excel sin cifrado
- No puede compartirse con usuarios externos al tenant
- Las acciones sobre él quedan registradas en el log de auditoría de Purview

### Endorsement: Certified vs Promoted

El endorsement es una señal de calidad para los consumidores de datos internos:
- **Promoted:** el creador del dataset indica que está listo para uso
- **Certified:** DD&IT o un data steward aprobado certifica que el dataset cumple con los estándares de calidad y governance

Cuando busques datos en el OneLake catalog, prioriza los datasets **Certified**.

### Lineage view

Fabric incluye una vista de **lineage** que muestra el grafo completo de dependencias: de dónde viene cada dato y qué reportes lo consumen. Si cambias una transformación en un pipeline, puedes ver exactamente qué reportes se verán afectados antes de hacer el cambio.

> **Compliance:** Para datasets con datos de HCP o información clínica, configura **Row-Level Security (RLS)** en el semantic model de Power BI. RLS permite que diferentes usuarios vean solo los datos correspondientes a su región o territorio, sin necesidad de duplicar el dataset. Nunca uses datos clínicos en workspaces de desarrollo o pruebas — solo en workspaces con clasificación de datos aprobada y con RLS configurado.

---

<Quiz
  moduleSlug="microsoft-fabric"
  questions={[
    {
      question: "¿Qué problema resuelve OneLake en comparación con el modelo anterior de herramientas separadas?",
      options: [
        "Elimina la necesidad de tener Power BI",
        "Permite que todos los workloads lean del mismo dato sin copiarlo, eliminando la fragmentación y el desfase entre herramientas",
        "Reemplaza SAP como sistema de ventas",
        "Almacena los datos en formato Excel para mayor compatibilidad"
      ],
      correct: 1
    },
    {
      question: "¿Por qué los pipelines de producción deben correr con un service principal y no con credenciales personales?",
      options: [
        "Los service principals son más rápidos",
        "Las credenciales personales no tienen suficientes permisos",
        "Un pipeline de producción no debe depender de que un usuario específico esté logueado — el service principal tiene permisos fijos y auditables",
        "Es un requisito técnico de Azure sin implicaciones prácticas"
      ],
      correct: 2
    },
    {
      question: "¿Qué hace Copilot en Power BI que lo diferencia de Copilot en Data Warehouse?",
      options: [
        "Copilot en Power BI genera código SQL; Copilot en Data Warehouse genera visualizaciones",
        "Copilot en Power BI genera visualizaciones y páginas de reporte; Copilot en Data Warehouse genera queries SQL desde lenguaje natural",
        "Son idénticos — Copilot tiene el mismo comportamiento en todos los workloads",
        "Copilot en Data Warehouse requiere más licencias"
      ],
      correct: 1
    },
    {
      question: "Un dataset en Fabric tiene un sensitivity label 'Confidential'. ¿Qué implica esto?",
      options: [
        "Solo los admins pueden verlo",
        "No puede exportarse a Excel sin cifrado y no puede compartirse con usuarios externos al tenant",
        "Debe eliminarse después de 30 días",
        "Solo puede usarse en Power BI, no en otros workloads"
      ],
      correct: 1
    },
    {
      question: "¿Para qué sirve Row-Level Security (RLS) en un semantic model de Power BI?",
      options: [
        "Para encriptar los datos en reposo",
        "Para que diferentes usuarios vean solo los datos de su región o territorio, sin duplicar el dataset",
        "Para bloquear el acceso de Copilot al dataset",
        "Para auditar quién accede al reporte"
      ],
      correct: 1
    }
  ]}
/>

## Recursos

<ResourceCard
  title="What is Microsoft Fabric"
  url="https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview"
  description="Documentación oficial de Microsoft con la arquitectura completa de Fabric: OneLake, los 8 workloads, y cómo se integran en una plataforma SaaS unificada."
  type="doc"
/>

<ResourceCard
  title="Overview of Copilot in Fabric"
  url="https://learn.microsoft.com/en-us/fabric/get-started/copilot-fabric-overview"
  description="Guía completa de las experiencias de Copilot por workload en Fabric: Power BI, Data Engineering, Data Warehouse, Real-Time Intelligence. Incluye requisitos de SKU y configuración de governance."
  type="doc"
/>

<ResourceCard
  title="Microsoft Fabric end-to-end tutorial"
  url="https://learn.microsoft.com/en-us/fabric/get-started/end-to-end-tutorials"
  description="Tutoriales oficiales de Microsoft Fabric de principio a fin: desde crear un workspace hasta publicar un reporte de Power BI, pasando por pipelines y lakehouses."
  type="doc"
/>

<ResourceCard
  title="Data Factory in Microsoft Fabric"
  url="https://learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview"
  description="Documentación de Data Factory en Fabric: conectores disponibles, cómo crear pipelines, Dataflows Gen2, y cómo programar ejecuciones automáticas."
  type="doc"
/>

<ResourceCard
  title="Microsoft Fabric community blog"
  url="https://blog.fabric.microsoft.com/"
  description="Blog oficial de la comunidad de Microsoft Fabric con anuncios de nuevas funcionalidades, casos de uso reales, y tutoriales de la comunidad."
  type="article"
/>
```

- [ ] **Step 10.2: Commit**

```bash
git add content/microsoft-fabric.mdx
git commit -m "feat: add Module 2 content — Tu plataforma de datos unificada (Microsoft Fabric)"
```

---

## Task 11: Create content/azure-ai-foundry.mdx

**Files:**
- Create: `content/azure-ai-foundry.mdx`

- [ ] **Step 11.1: Create content/azure-ai-foundry.mdx**

```mdx
# Construye tu propio asistente de IA

Azure AI Foundry es la plataforma de Microsoft para que equipos con bajo o nulo código construyan chatbots y asistentes de IA conectados a sus propios datos internos. Está habilitada por DD&IT en Novartis y es la opción natural para quien ya trabaja en el ecosistema Microsoft. Este módulo explica cómo funciona, cómo conectar datos internos con Prompt Flow, cómo crear un asistente que responda sobre tus documentos, y cómo desplegarlo de forma segura.

---

## Qué es Azure AI Foundry y cómo encaja en el ecosistema

Azure AI Foundry (anteriormente Azure AI Studio) es el hub central de Microsoft para el desarrollo de aplicaciones de IA generativa. No es una herramienta de usuario final como Copilot — es una plataforma para **construir** tus propias aplicaciones de IA.

### Foundry vs Copilot: la distinción clave

| | M365 Copilot | Azure AI Foundry |
|--|--|--|
| **Qué es** | Asistente de IA integrado en apps M365 | Plataforma para construir tus propias apps de IA |
| **Quién lo usa** | Todos los usuarios de M365 | Citizen developers y pro-code developers |
| **Customización** | Limitada (agents con Copilot Studio) | Total: modelos, flows, datos, deployment |
| **Acceso a datos** | Microsoft Graph (emails, docs del usuario) | Cualquier fuente que configures |
| **Deployment** | Integrado en M365 | Endpoint REST, Teams bot, web app, Power Apps |

La regla de oro: si quieres usar Copilot para trabajar mejor con tus herramientas M365, usa Copilot. Si quieres construir una aplicación de IA que responda preguntas sobre los documentos del equipo, analice datos específicos del negocio, o automatice un proceso con lógica personalizada — usa Azure AI Foundry.

### Foundry vs AWS Bedrock

Foundry y Bedrock son equivalentes funcionales — plataformas managed para construir apps de IA sobre modelos de fundación. La diferencia es el stack:

| | Azure AI Foundry | AWS Bedrock |
|--|--|--|
| **Ecosistema** | Azure AD, SharePoint, Teams, M365 | S3, IAM, VPC, Lambda |
| **Modelos disponibles** | GPT-4, Llama, Mistral, Phi, DeepSeek | Claude, Llama, Mistral, Amazon Nova, DeepSeek |
| **Conectores nativos** | SharePoint, Azure Search, Azure SQL | S3, Confluence, Salesforce, SharePoint |
| **Recomendado para** | Stack Microsoft-first | Stack AWS-first |

Para Novartis, con M365, SharePoint, Teams y Azure AD como plataforma principal, **Foundry es el punto de partida más natural**. Los datos ya están en el ecosistema Microsoft.

> **Compliance:** Azure AI Foundry corre dentro del tenant de Azure de Novartis. Los modelos se invocan dentro del perímetro corporativo — los datos no salen a Internet. DD&IT habilita el acceso y gestiona las políticas de uso. Para empezar a usar Foundry, solicita acceso a tu admin de Azure.

---

## Prompt Flow: orquestar tu asistente paso a paso

**Prompt Flow** es el motor de orquestación de Azure AI Foundry. En lugar de hacer una sola llamada al modelo con un prompt largo, defines un **grafo de pasos** donde cada paso tiene inputs y outputs tipados.

### Conexión con lo que ya aprendiste

Si viste el Módulo 3 de Fundamentos (Sistemas de IA Confiables), Prompt Flow es la implementación visual de LLM-Modulo:

```
Usuario hace pregunta
      ↓
  [Nodo Retrieval]      ← busca en el índice de documentos
      ↓
  [Nodo Prompt]         ← construye el prompt con contexto recuperado
      ↓
  [Nodo LLM]            ← llama al modelo (GPT-4, etc.)
      ↓
  [Nodo Python]         ← valida el output (hard verifier opcional)
      ↓
  Respuesta al usuario
```

Cada nodo puede ser un critic, una herramienta, o el generador — exactamente el patrón LLM-Modulo, pero con interfaz visual.

### Tipos de nodos en Prompt Flow

| Tipo | Qué hace |
|------|---------|
| **LLM** | Llama a un modelo de lenguaje (GPT-4, Llama, Phi, etc.) |
| **Prompt** | Template de prompt con variables que se rellenan en runtime |
| **Python** | Ejecuta código Python arbitrario (validaciones, transformaciones, llamadas a APIs) |
| **Retrieval** | Busca fragmentos relevantes en un índice de Azure AI Search |
| **Tool** | Invoca una función externa (API REST, función de Azure) |

### Ejemplo: Q&A sobre reportes de ventas

Un flow de pregunta-respuesta sobre documentos internos:

```
input: pregunta del usuario
  ↓
[Retrieval] — busca en índice "sales_reports_latam"
  ↓ top 5 fragmentos relevantes
[Prompt] — construye: "Responde basándote en estos fragmentos: {context}\n\nPregunta: {question}"
  ↓ prompt completo
[LLM: GPT-4] — genera respuesta
  ↓ respuesta raw
[Python] — extrae las citas de fuente del output
  ↓ respuesta + citas
output: respuesta con referencias a documentos fuente
```

### Crear un flow

En Foundry, los flows se crean desde la interfaz visual (drag-and-drop de nodos) o en código (YAML). Para empezar, la interfaz visual es suficiente. Para flows complejos o que necesitan versionarse en git, el formato YAML es más manejable.

> **Compliance:** Los flows solo pueden acceder a las **connections** configuradas por el admin en Foundry. Una connection es una credencial gestionada que permite al flow acceder a Azure AI Search, Azure OpenAI, bases de datos, o APIs. No puedes conectar una fuente de datos sin que DD&IT haya creado la connection correspondiente — esto es una capa de control intencionada.

---

## Conectar tus datos: Azure AI Search + SharePoint

Para que el asistente pueda responder preguntas sobre tus documentos internos, necesitas dos cosas: (1) un **índice vectorial** que contenga los documentos y (2) una conexión desde Foundry a ese índice.

### Azure AI Search: el motor de RAG

Azure AI Search es el servicio de búsqueda vectorial de Microsoft. Cuando conectas una fuente de documentos:

1. Los documentos se **fragmentan** en chunks de ~500-1000 tokens
2. Cada chunk se convierte en un **embedding** (vector numérico que representa su significado)
3. Los embeddings se almacenan en el índice
4. Cuando el usuario hace una pregunta, su pregunta también se convierte en embedding y se buscan los chunks más similares (búsqueda semántica, no por keywords)

```
SharePoint                    Azure AI Search
  Reportes de ventas            Índice "sales_docs"
  Análisis de mercado    →     [embedding chunk 1]
  Guías de proceso             [embedding chunk 2]
  Presentaciones               [embedding chunk 3]
                               ...
```

### Conectar SharePoint al índice

Foundry tiene un conector nativo para SharePoint. El proceso:

1. En Foundry, ve a **Indexes** → **New index**
2. Selecciona SharePoint como fuente
3. Configura qué sitios/carpetas indexar (ej: `Sales/Reports/LATAM`)
4. Configura el schedule de re-indexado (diario, semanal)
5. Foundry indexa los documentos automáticamente

El índice se actualiza según el schedule configurado — si alguien sube un nuevo reporte al SharePoint el lunes y el índice corre el martes, el asistente sabrá del nuevo reporte desde el martes.

### Security trimming

Esta es la característica de compliance más importante de Azure AI Search: **el índice hereda los permisos de SharePoint**.

Si un documento en SharePoint es visible solo para el equipo de ventas de Argentina, el índice lo sabe. Cuando Walter (que está en el equipo de Argentina) hace una pregunta al asistente, puede obtener información de ese documento. Cuando alguien del equipo de Brasil hace la misma pregunta, el asistente no puede usar ese documento — no aparece en los resultados de búsqueda.

Esto significa que no necesitas gestionar permisos en dos lugares. Gestiona los permisos en SharePoint y el asistente los hereda automáticamente.

> **Compliance:** El índice hereda los permisos de SharePoint — si un usuario no tiene acceso a un documento, el asistente tampoco puede usarlo para responder sus preguntas. Para datos especialmente sensibles (HCP, información clínica), considera crear índices separados con acceso restringido en lugar de mezclarlos con documentos de acceso general.

---

## Desplegar y monitorear tu asistente

Una vez que el flow está construido y probado en Foundry, el siguiente paso es desplegarlo para que el equipo pueda usarlo.

### Opciones de deployment

Foundry despliega el flow como un **endpoint REST** — una URL que acepta preguntas y devuelve respuestas. Desde ese endpoint, puedes integrarlo en distintas interfaces:

| Canal | Cómo | Cuándo usarlo |
|-------|------|--------------|
| **Teams bot** | Conectar el endpoint a Bot Framework → publicar en Teams | El equipo ya vive en Teams, quieren chat directo |
| **Web app** | Azure App Service con una interfaz de chat simple | Necesitas una UI personalizada o acceso desde el browser |
| **Power Apps** | Conector a Power Apps/Power Automate | El equipo usa Power Apps, quieren integrar el asistente en un proceso existente |
| **API directa** | Llamada REST desde código Python/JS | Los developers quieren integrarlo en aplicaciones propias |

### Evaluación integrada

Foundry incluye evaluadores automáticos que puedes correr sobre el flow antes de desplegarlo a producción:

- **Groundedness:** ¿Está la respuesta anclada en los documentos recuperados? (vs alucinar información)
- **Relevance:** ¿Es la respuesta relevante para la pregunta?
- **Coherence:** ¿La respuesta tiene sentido y fluye bien?

Conexión con Módulo 3 de Fundamentos: estos evaluadores son **LLM-as-judge** — un segundo modelo evalúa el output del primero. Úsalos como señal, no como verificación definitiva.

### Monitoreo en producción

Una vez desplegado, Foundry registra todas las conversaciones y expone métricas en Azure Monitor:

- **Llamadas por día:** cuántas preguntas está recibiendo el asistente
- **Latencia:** cuánto tarda en responder (p50, p95, p99)
- **Tokens consumidos:** costo de inferencia (Azure cobra por token)
- **Trazas:** cada conversación completa — pregunta, fragmentos recuperados, prompt enviado al modelo, respuesta. Útil para debugging cuando el asistente da una respuesta incorrecta.

> **Compliance:** Los endpoints deben configurarse con **autenticación Azure AD**. No uses endpoints públicos sin autenticación para asistentes que acceden a datos internos — cualquiera con la URL podría hacer preguntas y obtener información del SharePoint. DD&IT debe revisar la configuración de autenticación antes del deployment a producción.

---

<Quiz
  moduleSlug="azure-ai-foundry"
  questions={[
    {
      question: "¿Cuál es la diferencia principal entre M365 Copilot y Azure AI Foundry?",
      options: [
        "M365 Copilot es más caro",
        "Copilot es un asistente integrado en apps M365; Foundry es una plataforma para construir tus propias aplicaciones de IA",
        "Azure AI Foundry solo funciona con el modelo GPT-4",
        "Son la misma plataforma con nombres distintos"
      ],
      correct: 1
    },
    {
      question: "En Prompt Flow, ¿qué hace un nodo de tipo Retrieval?",
      options: [
        "Llama al modelo LLM para generar texto",
        "Ejecuta código Python para validar el output",
        "Busca fragmentos relevantes en un índice de Azure AI Search según la pregunta del usuario",
        "Envía el resultado final al usuario"
      ],
      correct: 2
    },
    {
      question: "¿Qué significa 'security trimming' en Azure AI Search?",
      options: [
        "Que el índice borra documentos viejos automáticamente",
        "Que el índice hereda los permisos de SharePoint — un usuario solo puede obtener información de documentos a los que ya tiene acceso",
        "Que el índice cifra todos los embeddings",
        "Que el índice no almacena los documentos originales, solo los embeddings"
      ],
      correct: 1
    },
    {
      question: "¿Por qué el evaluador de 'groundedness' en Foundry no reemplaza a los hard verifiers del Módulo 3?",
      options: [
        "Porque groundedness es más caro de ejecutar",
        "Porque es un LLM-as-judge — usa un segundo modelo para evaluar el primero, lo que introduce los mismos sesgos que se quieren eliminar. Es una señal útil, no una verificación definitiva",
        "Porque solo funciona para documentos en inglés",
        "Porque requiere permisos especiales de DD&IT"
      ],
      correct: 1
    },
    {
      question: "¿Por qué los endpoints de Foundry deben configurarse con autenticación Azure AD?",
      options: [
        "Es un requisito técnico de Azure sin implicaciones prácticas",
        "Para que el endpoint funcione con Teams",
        "Sin autenticación, cualquier persona con la URL puede hacer preguntas al asistente y obtener información del SharePoint interno",
        "Para que el modelo pueda acceder a Microsoft Graph"
      ],
      correct: 2
    }
  ]}
/>

## Recursos

<ResourceCard
  title="Azure AI Foundry overview"
  url="https://learn.microsoft.com/en-us/azure/ai-studio/what-is-ai-studio"
  description="Documentación oficial de Azure AI Foundry (antes Azure AI Studio): qué es, cómo se estructura, modelos disponibles, y cómo empezar."
  type="doc"
/>

<ResourceCard
  title="Prompt Flow documentation"
  url="https://learn.microsoft.com/en-us/azure/machine-learning/prompt-flow/overview-what-is-prompt-flow"
  description="Documentación completa de Prompt Flow: tipos de nodos, cómo crear flows, evaluación, deployment, y monitoreo en producción."
  type="doc"
/>

<ResourceCard
  title="Azure AI Search para RAG"
  url="https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview"
  description="Cómo usar Azure AI Search como motor de RAG: indexación de documentos, búsqueda vectorial, security trimming, y conexión con Foundry."
  type="doc"
/>

<ResourceCard
  title="Build a RAG solution with Azure AI Foundry"
  url="https://learn.microsoft.com/en-us/azure/ai-studio/tutorials/deploy-chat-web-app"
  description="Tutorial paso a paso: construir un asistente de Q&A sobre documentos propios con Azure AI Foundry, Azure AI Search, y despliegue como web app."
  type="doc"
/>

<ResourceCard
  title="Azure AI Foundry pricing"
  url="https://azure.microsoft.com/en-us/pricing/details/ai-studio/"
  description="Precios de Azure AI Foundry: costo por token según modelo, costo de Azure AI Search por índice, y opciones de deployment."
  type="doc"
/>
```

- [ ] **Step 11.2: Commit**

```bash
git add content/azure-ai-foundry.mdx
git commit -m "feat: add Module 3 content — Construye tu propio asistente de IA (Azure AI Foundry)"
```

---

## Task 12: Create content/aws-bedrock.mdx

**Files:**
- Create: `content/aws-bedrock.mdx`

- [ ] **Step 12.1: Create content/aws-bedrock.mdx**

```mdx
# Modelos de IA en la infraestructura de AWS

El equipo tiene acceso a AWS con Bedrock habilitado por DD&IT. Bedrock es la plataforma managed de AWS para acceder a modelos de fundación — incluyendo Claude de Anthropic, Llama, Mistral y otros — sin gestionar infraestructura. Este módulo explica cómo funciona, cómo llamar modelos desde la consola y con Python, cómo construir un sistema RAG con Knowledge Bases, y qué garantías de privacidad ofrece para datos sensibles.

---

## Qué es Amazon Bedrock y por qué usarlo

Amazon Bedrock es un servicio **fully managed** de AWS para acceder a modelos de fundación de múltiples proveedores desde una sola plataforma. En lugar de gestionar GPUs, instalaciones, y actualizaciones de modelos, Bedrock maneja todo eso — tú solo consumes la API.

### Catálogo de modelos

Bedrock da acceso a más de 100 modelos de distintos proveedores:

| Proveedor | Modelos principales |
|-----------|-------------------|
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus |
| **Amazon** | Amazon Nova Pro, Nova Lite, Nova Micro |
| **Meta** | Llama 3.1 (8B, 70B, 405B) |
| **Mistral AI** | Mistral Large, Mistral 7B |
| **DeepSeek** | DeepSeek R1 |

La ventaja de tener múltiples modelos en una plataforma: puedes cambiar de modelo sin cambiar tu arquitectura. Si Claude 3.5 Sonnet es demasiado caro para un caso de uso de alto volumen, puedes cambiarlo por Amazon Nova Lite con un cambio de una línea de código — la API es la misma.

### Por qué importa para Novartis

Novartis puede usar Claude (el mismo modelo detrás de Claude.ai en el navegador) pero con sus datos **dentro del perímetro de AWS** — no salen a Internet. Bedrock tiene certificaciones enterprise que cubren los requisitos de compliance de una compañía farmacéutica:

- **FedRAMP High:** nivel de certificación de seguridad del gobierno de EE.UU.
- **HIPAA eligible:** puede usarse con datos de salud bajo el Business Associate Agreement (BAA) con AWS
- **SOC 2 Type II:** auditoría de controles de seguridad

Y lo más importante: **AWS no usa tus prompts ni tus datos para mejorar los modelos base**. Lo que envías a Bedrock es tuyo y se queda en tu cuenta AWS.

> **Compliance:** Bedrock tiene **VPC isolation** — el tráfico entre tu aplicación y el servicio Bedrock nunca sale a Internet público. Se configura usando AWS PrivateLink, que crea un endpoint privado dentro de tu VPC. Para datos de Novartis, esto significa que las queries al modelo y las respuestas viajan solo por la red de AWS, no por Internet.

---

## Llamar modelos: consola y API

### La consola de AWS: playground antes de codificar

Antes de escribir código, usa la consola de AWS para explorar los modelos disponibles. En la consola de Bedrock:

1. Ve a **Model catalog** → selecciona un modelo → **Open in playground**
2. El playground tiene tres modos: **Chat**, **Text completion**, y **Image**
3. Puedes ajustar parámetros: temperatura (creatividad), max tokens (longitud máxima), top P
4. Compara respuestas de distintos modelos con el mismo prompt

Úsalo para: explorar capacidades antes de comprometerte a un modelo, comparar calidad/velocidad/costo entre opciones, probar prompts antes de codificarlos.

### La Converse API: la interfaz recomendada

Bedrock tiene cuatro APIs. La recomendada para la mayoría de los casos es la **Converse API**: ofrece una interfaz unificada para todos los modelos, con el mismo formato de request y response independientemente de qué modelo uses.

Ejemplo básico con Python (boto3, el SDK oficial de AWS):

```python
import boto3

client = boto3.client('bedrock-runtime', region_name='us-east-1')

response = client.converse(
    modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
    messages=[
        {
            'role': 'user',
            'content': [{'text': 'Resume este reporte de ventas en 3 puntos ejecutivos'}]
        }
    ],
    inferenceConfig={
        'maxTokens': 500,
        'temperature': 0.3,  # más determinista para resúmenes
    }
)

print(response['output']['message']['content'][0]['text'])
```

Para cambiar a Amazon Nova Pro, solo cambia `modelId`:

```python
modelId='amazon.nova-pro-v1:0'  # misma estructura de request y response
```

### System prompts con la Converse API

Para asistentes con instrucciones persistentes (como un agente que siempre responde en español y con tono ejecutivo):

```python
response = client.converse(
    modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
    system=[
        {'text': 'Eres un analista de negocios senior. Responde siempre en español. Usa formato bullet para listas. Cita números específicos cuando estén disponibles.'}
    ],
    messages=[
        {'role': 'user', 'content': [{'text': '¿Cuáles son los riesgos principales del mercado en Q2?'}]}
    ]
)
```

### Cuándo usar las otras APIs

- **InvokeModel API:** cuando necesitas parámetros específicos de un modelo que Converse no expone (poco común)
- **Responses API / Chat Completions API:** compatibles con el formato de OpenAI — útil si ya tienes código escrito para OpenAI y quieres migrarlo a Bedrock sin reescribir

> **Compliance:** Las credenciales AWS para llamar a Bedrock deben configurarse con **IAM roles de mínimo privilegio**. Un rol de aplicación que solo necesita llamar a modelos de Bedrock no debería tener permisos para S3, EC2, ni ningún otro servicio. El principio: acceso mínimo necesario. Usa IAM roles (no access keys hardcodeadas en el código) siempre que sea posible.

---

## RAG con Bedrock Knowledge Bases

### El problema que RAG resuelve

Los modelos de fundación tienen una limitación crítica: su conocimiento está congelado en la fecha de entrenamiento. No saben nada sobre tus reportes de ventas del Q1, ni sobre los cambios regulatorios del mes pasado, ni sobre los procesos específicos de Novartis.

La solución es **RAG (Retrieval-Augmented Generation)**: antes de generar la respuesta, el sistema recupera fragmentos relevantes de tus documentos propios y los incluye en el contexto del modelo.

```
Pregunta: "¿Qué países tuvieron mejor performance en oncología en Q3?"
       ↓
[Buscar en índice de reportes de ventas]
       ↓
Fragmentos relevantes:
  - "Argentina: ventas oncología Q3 +18% YoY..."
  - "Brasil: oncología Q3 alcanzó $4.2M..."
  - "Colombia: nueva indicación aprobada en Q3..."
       ↓
[Prompt con contexto]: "Basándote en estos fragmentos: [fragmentos]\nResponde: ¿Qué países...?"
       ↓
Respuesta: "Los países con mejor performance en oncología en Q3 fueron Argentina (+18% YoY),
           Brasil ($4.2M en ventas), y Colombia (nueva indicación aprobada)."
```

### Bedrock Knowledge Bases

Knowledge Bases es el servicio managed de Bedrock para RAG. Configuras las fuentes de datos y Bedrock maneja el indexado, los embeddings, y el vector store automáticamente.

**Fuentes de datos soportadas:**
- S3 (el caso más común — sube tus documentos a un bucket)
- SharePoint (conector nativo)
- Confluence
- Salesforce
- Sitios web (crawling)

**Cómo configurar una Knowledge Base:**

1. En la consola de Bedrock → **Knowledge Bases** → **Create knowledge base**
2. Selecciona la fuente (ej: S3 bucket `novartis-sales-reports`)
3. Configura el embedding model (Amazon Titan Text Embeddings v2 por defecto)
4. Selecciona el vector store (Amazon OpenSearch Serverless por defecto, o Aurora PostgreSQL)
5. Define el schedule de re-indexado

**Consultar la Knowledge Base desde Python:**

```python
import boto3

bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-east-1')

response = bedrock_agent.retrieve_and_generate(
    input={'text': '¿Qué países tuvieron mejor performance en oncología en Q3 2024?'},
    retrieveAndGenerateConfiguration={
        'type': 'KNOWLEDGE_BASE',
        'knowledgeBaseConfiguration': {
            'knowledgeBaseId': 'TU_KNOWLEDGE_BASE_ID',
            'modelArn': 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0',
        }
    }
)

print(response['output']['text'])
# También incluye las fuentes citadas:
for citation in response['citations']:
    print(citation['retrievedReferences'])
```

### La respuesta incluye las fuentes

Una ventaja clave de Knowledge Bases: la respuesta incluye **qué documentos se usaron** para generarla. Esto hace el sistema auditable — puedes verificar que la respuesta está basada en documentos reales, no inventada por el modelo.

> **Compliance:** Los documentos en Knowledge Bases se almacenan **encriptados en S3 dentro de tu cuenta AWS**. Los embeddings se guardan en tu propio vector store (OpenSearch Serverless en tu cuenta). Bedrock no tiene acceso a tus datos después del indexado. Nada sale de tu infraestructura AWS.

---

## Guardrails y uso responsable en Bedrock

Bedrock Guardrails es una capa de filtros que se aplica **antes y después** de cada llamada al modelo. Es independiente del modelo — el mismo guardrail funciona con Claude, Llama, Amazon Nova, y cualquier otro modelo en Bedrock.

### Conexión con lo que ya aprendiste

Si viste el Módulo 3 de Fundamentos (Sistemas de IA Confiables): los Guardrails son **hard verifiers automáticos** que se ejecutan en cada request. Son deterministas — o bloquean o no bloquean, sin ambigüedad. Exactamente el tipo de critic más confiable según LLM-Modulo.

### Tipos de filtros en Guardrails

**Content filters** — bloquean contenido dañino o inapropiado:
- Categorías: hate speech, violencia, contenido sexual, contenido que promueve actividades ilegales
- Nivel configurable: Low, Medium, High (cuánto tolerar antes de bloquear)

**Topic denial** — bloquean preguntas fuera del scope del asistente:
- Defines los temas que el asistente NO debe responder
- Ejemplo: para un asistente de ventas internas, negar temas como "inversiones personales", "salud de competidores", "política"

**Sensitive information filters (PII)** — detectan y enmascaran información personal identificable:
- Tipos detectados: nombres, emails, números de teléfono, números de documento, fechas de nacimiento, números de tarjeta de crédito
- Configuración: puedes enmascarar (reemplazar con `[NOMBRE]`) o bloquear directamente
- Crítico para un contexto farmacéutico: configura PII filters para datos de HCP

**Grounding check** — verifica que la respuesta esté anclada en los documentos de contexto:
- Calcula un score de grounding (0-1): qué tan soportada está la respuesta por el contexto
- Si el score cae por debajo de un threshold configurado, bloquea la respuesta
- Esto es un **critic determinista** — el equivalente en Bedrock al hard verifier de groundedness

**Word filters** — bloquean palabras o frases específicas configurables.

### Ejemplo práctico: guardrail para datos de HCP

Para un asistente que responde preguntas sobre prescripciones de HCPs, configurarías:

```python
# Configuración del guardrail (una vez, no en cada llamada):
# - PII filter: enmascarar nombres de personas
# - PII filter: enmascarar números de documento
# - Topic denial: "preguntas sobre información financiera personal de HCPs"
# - Grounding check: threshold 0.7 (respuestas con menos de 70% de soporte se bloquean)

response = client.converse(
    modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
    guardrailConfig={
        'guardrailIdentifier': 'TU_GUARDRAIL_ID',
        'guardrailVersion': 'DRAFT',
        'trace': 'enabled'  # registra qué filtros se activaron
    },
    messages=[...]
)
```

Si el guardrail bloquea la respuesta, el campo `stopReason` en la respuesta indica cuál filtro se activó — útil para debugging y auditoría.

> **Compliance:** Para datos HIPAA-eligible (información clínica, datos de pacientes), habilita el **HIPAA BAA** con AWS antes de usar Bedrock para ese tipo de datos. Para datos de Novartis en general, configura **AWS PrivateLink** para que el tráfico a Bedrock no salga a Internet público. Ambas configuraciones son a nivel de cuenta AWS y las gestiona DD&IT.

---

<Quiz
  moduleSlug="aws-bedrock"
  questions={[
    {
      question: "¿Por qué la Converse API es la interfaz recomendada de Bedrock frente a las otras APIs?",
      options: [
        "Es la más barata",
        "Ofrece una interfaz unificada para todos los modelos — mismo formato de request y response, lo que permite cambiar de modelo sin reescribir el código",
        "Es la única compatible con Python",
        "Incluye acceso gratuito a los modelos de Anthropic"
      ],
      correct: 1
    },
    {
      question: "¿Qué problema resuelve RAG para un asistente basado en LLMs?",
      options: [
        "Hace que el modelo responda más rápido",
        "Permite que el asistente responda sobre documentos propios actualizados, evitando que el modelo alucine información que no conoce",
        "Reduce el costo de las llamadas al modelo",
        "Elimina la necesidad de configurar permisos IAM"
      ],
      correct: 1
    },
    {
      question: "¿Dónde se almacenan los embeddings de una Bedrock Knowledge Base?",
      options: [
        "En los servidores de AWS compartidos con otros clientes",
        "En tu propia cuenta AWS (OpenSearch Serverless o Aurora PostgreSQL) — nunca salen de tu infraestructura",
        "En el modelo de fundación, como parte del fine-tuning",
        "En S3 público para acceso rápido"
      ],
      correct: 1
    },
    {
      question: "¿Qué hace el filtro de tipo 'grounding check' en Bedrock Guardrails?",
      options: [
        "Bloquea preguntas sobre temas fuera del scope",
        "Enmascara nombres y datos personales en la respuesta",
        "Calcula qué tan soportada está la respuesta por el contexto recuperado y la bloquea si el score cae por debajo de un threshold",
        "Filtra contenido violento o inapropiado"
      ],
      correct: 2
    },
    {
      question: "¿Qué significa que Bedrock tenga VPC isolation para Novartis?",
      options: [
        "Que Bedrock solo puede usarse desde la red interna de Novartis",
        "Que los modelos de Bedrock están instalados en los servidores de Novartis",
        "Que el tráfico entre la aplicación y Bedrock viaja por la red privada de AWS (PrivateLink) sin salir a Internet público",
        "Que los datos se cifran automáticamente en reposo"
      ],
      correct: 2
    }
  ]}
/>

## Recursos

<ResourceCard
  title="What is Amazon Bedrock"
  url="https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"
  description="Documentación oficial de AWS: qué es Bedrock, modelos disponibles, APIs soportadas, y cómo empezar. Punto de entrada para cualquier integración."
  type="doc"
/>

<ResourceCard
  title="Amazon Bedrock Converse API"
  url="https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference-call.html"
  description="Documentación de la Converse API: formato de request y response, cómo pasar system prompts, multi-turn conversations, y ejemplos en Python con boto3."
  type="doc"
/>

<ResourceCard
  title="Bedrock Knowledge Bases"
  url="https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html"
  description="Cómo crear y consultar Knowledge Bases en Bedrock: configuración de fuentes de datos, modelos de embedding, vector stores, y la API retrieve_and_generate."
  type="doc"
/>

<ResourceCard
  title="Bedrock Guardrails"
  url="https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html"
  description="Documentación completa de Guardrails: tipos de filtros disponibles, configuración de PII filters, topic denial, grounding check, y cómo activarlos en llamadas a la API."
  type="doc"
/>

<ResourceCard
  title="Amazon Bedrock pricing"
  url="https://aws.amazon.com/bedrock/pricing/"
  description="Precios de Bedrock por modelo y por API: costo por 1000 tokens de input y output para cada modelo disponible. Útil para estimar costos antes de escalar."
  type="doc"
/>
```

- [ ] **Step 12.2: Commit**

```bash
git add content/aws-bedrock.mdx
git commit -m "feat: add Module 4 content — Modelos de IA en la infraestructura de AWS (Bedrock)"
```

---

## Task 13: Build and verify

**Files:** None — verification only.

- [ ] **Step 13.1: Run production build**

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI" && npm run build 2>&1
```

Expected output includes:
```
✓ Generating static pages (17/17)
```

Route list must include all of:
```
├ /modules/copilot-m365
├ /modules/microsoft-fabric
├ /modules/azure-ai-foundry
├ /modules/aws-bedrock
├ /certificate/fundamentos
├ /certificate/microsoft-cloud
```

If the build fails with TypeScript errors, fix them before proceeding.

- [ ] **Step 13.2: Verify page count**

Expected static pages (17 total):
- `/` (homepage)
- `/_not-found`
- `/certificate` (redirect)
- `/certificate/fundamentos`
- `/certificate/microsoft-cloud`
- `/glossary`
- `/password`
- `/modules/ai-fundamentals`
- `/modules/prompting-fundamentals`
- `/modules/reliable-ai-systems`
- `/modules/vibe-coding`
- `/modules/agents-and-skills`
- `/modules/legal-ai-risks`
- `/modules/copilot-m365`
- `/modules/microsoft-fabric`
- `/modules/azure-ai-foundry`
- `/modules/aws-bedrock`

- [ ] **Step 13.3: Push to GitHub**

```bash
git push origin main
```

Expected: push succeeds, Vercel auto-deploys.

---

## Verification checklist

After Vercel deployment:

- [ ] Homepage shows two sections: "Fundamentos de IA" (6 modules) and "Aplicaciones Microsoft + Cloud" (4 modules)
- [ ] Each section has its own progress bar
- [ ] Module cards in each section show the correct within-track number (track 2 starts at M1)
- [ ] Clicking a track 2 module → sidebar shows only the 4 Microsoft+Cloud modules
- [ ] Completing last module of track 1 → celebration banner links to `/certificate/fundamentos`
- [ ] Completing last module of track 2 → celebration banner links to `/certificate/microsoft-cloud`
- [ ] `/certificate` redirects to `/certificate/fundamentos`
- [ ] `/certificate/fundamentos` shows track 1 modules; `/certificate/microsoft-cloud` shows track 4 modules
- [ ] Tables in all 4 new modules render correctly (remark-gfm)
- [ ] Quiz works in all 4 new modules (5 questions each)
- [ ] All ResourceCards render with correct icons
