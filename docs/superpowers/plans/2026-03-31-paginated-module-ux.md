# Paginated Module UX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break course modules from single long-scroll pages into paginated, interactive sections with next/previous navigation, mini-quizzes, callouts, accordions, before/after comparisons, AI-generated images, and progress tracking. Apply to ai-fundamentals first; other modules stay as-is.

**Architecture:** Each module's TOC sections become separate MDX files in a directory. A new dynamic route `[slug]/[page]` loads the right MDX, wraps it with ProgressBar and PageNavigation, and tracks visited sections in localStorage. Five new MDX components (MiniQuiz, Callout, Accordion, BeforeAfter, ModuleImage) plus two layout components (ProgressBar, PageNavigation) provide interactive elements. The sidebar shows section pages with visit indicators. Non-paginated modules continue to work via the existing route.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, @next/mdx, localStorage

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `components/MiniQuiz.tsx` | Create | Quick comprehension check component |
| `components/Callout.tsx` | Create | Themed info box (tip/warning/example/deep-dive) |
| `components/Accordion.tsx` | Create | Expandable content section |
| `components/BeforeAfter.tsx` | Create | Side-by-side comparison cards |
| `components/ModuleImage.tsx` | Create | Image with caption wrapper |
| `components/ProgressBar.tsx` | Create | Section progress indicator |
| `components/PageNavigation.tsx` | Create | Previous/Next navigation arrows |
| `mdx-components.tsx` | Modify | Register new MDX components |
| `lib/modules.ts` | Modify | Add Section interface and sections field to ai-fundamentals |
| `lib/progress.ts` | Modify | Add section visit tracking functions |
| `app/modules/[slug]/page.tsx` | Modify | Redirect to /1 for paginated modules |
| `app/modules/[slug]/[page]/page.tsx` | Create | Paginated module page route |
| `components/ModuleSidebar.tsx` | Modify | Show sections with visit indicators |
| `content/ai-fundamentals/01-como-funcionan-los-llms.mdx` | Create | Section 1 with interactive components |
| `content/ai-fundamentals/02-ecosistema-de-herramientas.mdx` | Create | Section 2 with interactive components |
| `content/ai-fundamentals/03-limites-reales.mdx` | Create | Section 3 with interactive components |
| `content/ai-fundamentals/04-el-mindset-correcto.mdx` | Create | Section 4 with quiz, resources, multimedia |

---

### Task 1: Create MiniQuiz Component

**Files:**
- Create: `components/MiniQuiz.tsx`

- [ ] **Step 1: Create MiniQuiz.tsx**

```typescript
'use client'

import { useState } from 'react'

interface MiniQuizProps {
  question: string
  options: string[]
  correct: number
  explanation?: string
}

export function MiniQuiz({ question, options, correct, explanation }: MiniQuizProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const isAnswered = selected !== null
  const isCorrect = selected === correct

  return (
    <div className="border border-emerald-200 rounded-xl p-6 bg-emerald-50/50 my-8 not-prose">
      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">
        Comprueba tu comprensión
      </p>
      <p className="text-novartis-blue-dark font-medium mb-4">{question}</p>
      <div className="space-y-2 mb-4">
        {options.map((option, idx) => {
          let className =
            'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors'

          if (!isAnswered) {
            className += ' border-emerald-200 hover:border-emerald-400 hover:bg-white cursor-pointer'
          } else if (idx === correct) {
            className += ' border-emerald-500 bg-emerald-50 text-emerald-800'
          } else if (idx === selected) {
            className += ' border-red-300 bg-red-50 text-red-700'
          } else {
            className += ' border-gray-200 opacity-50'
          }

          return (
            <button
              key={idx}
              className={className}
              onClick={() => !isAnswered && setSelected(idx)}
              disabled={isAnswered}
            >
              <span className="flex items-center gap-2">
                {isAnswered && idx === correct && <span>✓</span>}
                {isAnswered && idx === selected && idx !== correct && <span>✗</span>}
                {option}
              </span>
            </button>
          )
        })}
      </div>
      {isAnswered && explanation && (
        <div className={`px-4 py-3 rounded-lg text-sm ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
          {isCorrect ? '¡Correcto! ' : 'No exactamente. '}{explanation}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/MiniQuiz.tsx
git commit -m "feat: add MiniQuiz interactive component"
```

---

### Task 2: Create Callout Component

**Files:**
- Create: `components/Callout.tsx`

- [ ] **Step 1: Create Callout.tsx**

```typescript
import { ReactNode } from 'react'

interface CalloutProps {
  type: 'tip' | 'warning' | 'example' | 'deep-dive'
  children: ReactNode
}

const CALLOUT_STYLES = {
  tip: {
    border: 'border-novartis-blue',
    bg: 'bg-novartis-blue-light',
    icon: '💡',
    label: 'Dato clave',
    text: 'text-novartis-blue-dark',
  },
  warning: {
    border: 'border-novartis-yellow',
    bg: 'bg-yellow-50',
    icon: '⚠️',
    label: 'Cuidado',
    text: 'text-yellow-900',
  },
  example: {
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    icon: '💬',
    label: 'Ejemplo real',
    text: 'text-emerald-900',
  },
  'deep-dive': {
    border: 'border-purple-400',
    bg: 'bg-purple-50',
    icon: '🔍',
    label: 'Para profundizar',
    text: 'text-purple-900',
  },
}

export function Callout({ type, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type]

  return (
    <div className={`${style.bg} ${style.border} border-l-4 rounded-r-lg px-5 py-4 my-6 not-prose`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${style.text}`}>
        {style.icon} {style.label}
      </p>
      <div className={`text-sm leading-relaxed ${style.text}`}>{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Callout.tsx
git commit -m "feat: add Callout themed info box component"
```

---

### Task 3: Create Accordion Component

**Files:**
- Create: `components/Accordion.tsx`

- [ ] **Step 1: Create Accordion.tsx**

```typescript
'use client'

import { useState, ReactNode } from 'react'

interface AccordionProps {
  title: string
  children: ReactNode
}

export function Accordion({ title, children }: AccordionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-purple-200 rounded-lg my-6 overflow-hidden not-prose">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left bg-purple-50 hover:bg-purple-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className={`text-purple-500 transition-transform ${open ? 'rotate-90' : ''}`}>
          ▶
        </span>
        <span className="text-sm font-medium text-purple-900">{title}</span>
      </button>
      {open && (
        <div className="px-5 py-4 text-sm text-gray-700 leading-relaxed border-t border-purple-100 prose prose-sm max-w-none">
          {children}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Accordion.tsx
git commit -m "feat: add Accordion expandable content component"
```

---

### Task 4: Create BeforeAfter Component

**Files:**
- Create: `components/BeforeAfter.tsx`

- [ ] **Step 1: Create BeforeAfter.tsx**

```typescript
interface BeforeAfterProps {
  before: { label: string; content: string }
  after: { label: string; content: string }
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
          ❌ {before.label}
        </p>
        <p className="text-sm text-red-800 leading-relaxed">{before.content}</p>
      </div>
      <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
          ✅ {after.label}
        </p>
        <p className="text-sm text-emerald-800 leading-relaxed">{after.content}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/BeforeAfter.tsx
git commit -m "feat: add BeforeAfter comparison component"
```

---

### Task 5: Create ModuleImage Component

**Files:**
- Create: `components/ModuleImage.tsx`

- [ ] **Step 1: Create ModuleImage.tsx**

```typescript
interface ModuleImageProps {
  src: string
  alt: string
  caption?: string
}

export function ModuleImage({ src, alt, caption }: ModuleImageProps) {
  return (
    <figure className="my-8 not-prose">
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg border border-gray-200"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-gray-500 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ModuleImage.tsx
git commit -m "feat: add ModuleImage captioned image component"
```

---

### Task 6: Register New Components in MDX

**Files:**
- Modify: `mdx-components.tsx`

- [ ] **Step 1: Update mdx-components.tsx to register all new components**

Replace the full file content:

```typescript
import type { MDXComponents } from 'mdx/types'
import { Quiz } from '@/components/Quiz'
import { AnimatedDiagram } from '@/components/AnimatedDiagram'
import { ResourceCard } from '@/components/ResourceCard'
import { MiniQuiz } from '@/components/MiniQuiz'
import { Callout } from '@/components/Callout'
import { Accordion } from '@/components/Accordion'
import { BeforeAfter } from '@/components/BeforeAfter'
import { ModuleImage } from '@/components/ModuleImage'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Quiz,
    AnimatedDiagram,
    ResourceCard,
    MiniQuiz,
    Callout,
    Accordion,
    BeforeAfter,
    ModuleImage,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add mdx-components.tsx
git commit -m "feat: register interactive components for MDX"
```

---

### Task 7: Add Section Types and Update Module Definition

**Files:**
- Modify: `lib/modules.ts`

- [ ] **Step 1: Add Section interface and sections field**

Add the `Section` interface after the existing `TocItem` interface (line 4):

```typescript
export interface Section {
  id: string
  title: string
  file: string
}
```

Update the `Module` interface to add the optional `sections` field:

```typescript
export interface Module {
  slug: string
  number: number
  title: string
  estimatedTime: string
  track: string
  sections?: Section[]
  toc: TocItem[]
}
```

- [ ] **Step 2: Add sections to ai-fundamentals module entry**

Replace the ai-fundamentals entry (lines 23-35) with:

```typescript
  {
    slug: 'ai-fundamentals',
    number: 1,
    title: 'Fundamentos de IA',
    estimatedTime: '2 hrs',
    track: 'fundamentos',
    sections: [
      { id: 'como-funcionan-los-llms', title: 'Cómo funcionan los LLMs', file: '01-como-funcionan-los-llms' },
      { id: 'ecosistema-de-herramientas', title: 'El ecosistema de herramientas', file: '02-ecosistema-de-herramientas' },
      { id: 'limites-reales', title: 'Límites reales', file: '03-limites-reales' },
      { id: 'el-mindset-correcto', title: 'El mindset correcto', file: '04-el-mindset-correcto' },
    ],
    toc: [
      { id: 'cómo-funcionan-los-llms', label: 'Cómo funcionan los LLMs' },
      { id: 'el-ecosistema-de-herramientas', label: 'El ecosistema de herramientas' },
      { id: 'límites-reales', label: 'Límites reales' },
      { id: 'el-mindset-correcto', label: 'El mindset correcto' },
    ],
  },
```

- [ ] **Step 3: Add helper function to get section count**

Add at the end of the file, after `getTrack`:

```typescript
export function getModuleSections(slug: string): Section[] {
  const mod = getModule(slug)
  return mod?.sections ?? []
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/modules.ts
git commit -m "feat: add Section type and sections to ai-fundamentals"
```

---

### Task 8: Add Section Visit Tracking to Progress

**Files:**
- Modify: `lib/progress.ts`

- [ ] **Step 1: Add section visit functions at the end of the file**

Append after the existing `getTrackProgress` function:

```typescript
const SECTION_PREFIX = 'section_visited_'

export function getSectionVisited(slug: string, page: number): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`${SECTION_PREFIX}${slug}_${page}`) === 'true'
}

export function setSectionVisited(slug: string, page: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${SECTION_PREFIX}${slug}_${page}`, 'true')
}

export function getModuleSectionsVisited(slug: string, totalSections: number): number {
  if (typeof window === 'undefined') return 0
  let count = 0
  for (let i = 1; i <= totalSections; i++) {
    if (localStorage.getItem(`${SECTION_PREFIX}${slug}_${i}`) === 'true') {
      count++
    }
  }
  return count
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/progress.ts
git commit -m "feat: add section visit tracking to progress"
```

---

### Task 9: Create ProgressBar Component

**Files:**
- Create: `components/ProgressBar.tsx`

- [ ] **Step 1: Create ProgressBar.tsx**

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getModuleSectionsVisited, getSectionVisited } from '@/lib/progress'
import type { Section } from '@/lib/modules'

interface ProgressBarProps {
  slug: string
  sections: Section[]
  currentPage: number
}

export function ProgressBar({ slug, sections, currentPage }: ProgressBarProps) {
  const [visited, setVisited] = useState(0)

  useEffect(() => {
    setVisited(getModuleSectionsVisited(slug, sections.length))
  }, [slug, sections.length, currentPage])

  const percentage = Math.round((visited / sections.length) * 100)
  const currentSection = sections[currentPage - 1]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-novartis-blue-dark">Sección {currentPage} de {sections.length}</span>
          {' · '}
          {currentSection?.title}
        </p>
        <span className="text-xs text-gray-400">{percentage}%</span>
      </div>
      <div className="flex items-center gap-1.5">
        {sections.map((section, idx) => (
          <Link
            key={section.id}
            href={`/modules/${slug}/${idx + 1}`}
            className="flex-1 group"
            title={section.title}
          >
            <div
              className={`h-2 rounded-full transition-colors ${
                idx + 1 === currentPage
                  ? 'bg-novartis-blue'
                  : idx + 1 <= visited || getSectionVisited(slug, idx + 1)
                    ? 'bg-novartis-blue/40'
                    : 'bg-gray-200 group-hover:bg-gray-300'
              }`}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProgressBar.tsx
git commit -m "feat: add ProgressBar section indicator component"
```

---

### Task 10: Create PageNavigation Component

**Files:**
- Create: `components/PageNavigation.tsx`

- [ ] **Step 1: Create PageNavigation.tsx**

```typescript
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setModuleCompleted } from '@/lib/progress'
import type { Section } from '@/lib/modules'

interface PageNavigationProps {
  slug: string
  sections: Section[]
  currentPage: number
  trackSlug: string
}

export function PageNavigation({ slug, sections, currentPage, trackSlug }: PageNavigationProps) {
  const router = useRouter()
  const prevSection = currentPage > 1 ? sections[currentPage - 2] : null
  const nextSection = currentPage < sections.length ? sections[currentPage] : null
  const isLastPage = currentPage === sections.length

  function handleComplete() {
    setModuleCompleted(slug)
    router.push(`/modules/${slug}`)
  }

  return (
    <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200 not-prose">
      {prevSection ? (
        <Link
          href={`/modules/${slug}/${currentPage - 1}`}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-novartis-blue transition-colors"
        >
          <span>←</span>
          <span>{prevSection.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {nextSection ? (
        <Link
          href={`/modules/${slug}/${currentPage + 1}`}
          className="flex items-center gap-2 text-sm font-medium text-novartis-blue hover:text-novartis-blue-dark transition-colors"
        >
          <span>{nextSection.title}</span>
          <span>→</span>
        </Link>
      ) : isLastPage ? (
        <button
          onClick={handleComplete}
          className="bg-novartis-blue text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-novartis-blue-dark transition-colors"
        >
          Completar módulo ✓
        </button>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PageNavigation.tsx
git commit -m "feat: add PageNavigation prev/next component"
```

---

### Task 11: Create Paginated Module Route

**Files:**
- Create: `app/modules/[slug]/[page]/page.tsx`

- [ ] **Step 1: Create the paginated page route**

```typescript
import { notFound, redirect } from 'next/navigation'
import { modules, getModule, getModuleSections } from '@/lib/modules'
import { ModuleSidebar } from '@/components/ModuleSidebar'
import { ProgressBar } from '@/components/ProgressBar'
import { PageNavigation } from '@/components/PageNavigation'
import { SectionVisitTracker } from '@/components/SectionVisitTracker'
import Link from 'next/link'

// Static MDX import map for ai-fundamentals sections
const sectionMap: Record<string, Record<string, () => Promise<{ default: React.ComponentType }>>> = {
  'ai-fundamentals': {
    '01-como-funcionan-los-llms': () => import('@/content/ai-fundamentals/01-como-funcionan-los-llms.mdx'),
    '02-ecosistema-de-herramientas': () => import('@/content/ai-fundamentals/02-ecosistema-de-herramientas.mdx'),
    '03-limites-reales': () => import('@/content/ai-fundamentals/03-limites-reales.mdx'),
    '04-el-mindset-correcto': () => import('@/content/ai-fundamentals/04-el-mindset-correcto.mdx'),
  },
}

export function generateStaticParams() {
  const params: { slug: string; page: string }[] = []
  for (const mod of modules) {
    const sections = getModuleSections(mod.slug)
    if (sections.length > 0) {
      for (let i = 1; i <= sections.length; i++) {
        params.push({ slug: mod.slug, page: String(i) })
      }
    }
  }
  return params
}

export default async function PaginatedModulePage({
  params,
}: {
  params: { slug: string; page: string }
}) {
  const mod = getModule(params.slug)
  if (!mod) notFound()

  const sections = getModuleSections(params.slug)
  if (sections.length === 0) notFound()

  const pageNum = parseInt(params.page, 10)
  if (isNaN(pageNum) || pageNum < 1 || pageNum > sections.length) {
    redirect(`/modules/${params.slug}/1`)
  }

  const section = sections[pageNum - 1]
  const slugSections = sectionMap[params.slug]
  if (!slugSections || !slugSections[section.file]) notFound()

  const { default: SectionContent } = await slugSections[section.file]()

  return (
    <div className="flex min-h-screen bg-white">
      <ModuleSidebar currentSlug={params.slug} trackSlug={mod.track} currentPage={pageNum} />

      <main className="flex-1 min-w-0 pb-24">
        <div className="max-w-[720px] mx-auto px-6 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-novartis-blue text-white text-sm font-semibold rounded-lg hover:bg-novartis-blue-dark transition-colors"
          >
            ← Volver al menú principal
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-novartis-orange uppercase tracking-wider">
              Módulo {mod.number}
            </span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-500">{mod.estimatedTime}</span>
          </div>

          <h1 className="text-3xl font-bold text-novartis-blue-dark mb-4">{mod.title}</h1>

          <ProgressBar slug={params.slug} sections={sections} currentPage={pageNum} />

          <article className="prose prose-zinc prose-novartis max-w-none prose-headings:scroll-mt-6">
            <SectionContent />
          </article>

          <PageNavigation
            slug={params.slug}
            sections={sections}
            currentPage={pageNum}
            trackSlug={mod.track}
          />
        </div>
      </main>

      <SectionVisitTracker slug={params.slug} page={pageNum} />
    </div>
  )
}
```

- [ ] **Step 2: Create SectionVisitTracker client component**

Create `components/SectionVisitTracker.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { setSectionVisited } from '@/lib/progress'

interface SectionVisitTrackerProps {
  slug: string
  page: number
}

export function SectionVisitTracker({ slug, page }: SectionVisitTrackerProps) {
  useEffect(() => {
    setSectionVisited(slug, page)
  }, [slug, page])

  return null
}
```

- [ ] **Step 3: Commit**

```bash
git add app/modules/[slug]/[page]/page.tsx components/SectionVisitTracker.tsx
git commit -m "feat: add paginated module route with section tracking"
```

---

### Task 12: Update Existing Module Route to Redirect Paginated Modules

**Files:**
- Modify: `app/modules/[slug]/page.tsx`

- [ ] **Step 1: Add redirect for paginated modules**

Replace the full file content:

```typescript
import { notFound, redirect } from 'next/navigation'
import { modules, getModule, getModuleSections } from '@/lib/modules'
import { ModuleSidebar } from '@/components/ModuleSidebar'
import { MarkCompleteButton } from '@/components/MarkCompleteButton'
import Link from 'next/link'

// Static import map — Next.js requires static imports for MDX
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

export function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }))
}

export default async function ModulePage({
  params,
}: {
  params: { slug: string }
}) {
  const mod = getModule(params.slug)
  if (!mod) notFound()

  // Redirect to paginated route if module has sections
  const sections = getModuleSections(params.slug)
  if (sections.length > 0) {
    redirect(`/modules/${params.slug}/1`)
  }

  if (!moduleMap[params.slug]) notFound()

  const { default: ModuleContent } = await moduleMap[params.slug]()

  return (
    <div className="flex min-h-screen bg-white">
      <ModuleSidebar currentSlug={params.slug} trackSlug={mod.track} />

      <main className="flex-1 min-w-0 pb-24">
        <div className="max-w-[720px] mx-auto px-6 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-novartis-blue text-white text-sm font-semibold rounded-lg hover:bg-novartis-blue-dark transition-colors"
          >
            ← Volver al menú principal
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-novartis-orange uppercase tracking-wider">
              Módulo {mod.number}
            </span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-500">{mod.estimatedTime}</span>
          </div>

          <h1 className="text-3xl font-bold text-novartis-blue-dark mb-8">{mod.title}</h1>

          <article className="prose prose-zinc prose-novartis max-w-none prose-headings:scroll-mt-6">
            <ModuleContent />
          </article>
        </div>
      </main>

      <MarkCompleteButton slug={params.slug} trackSlug={mod.track} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/modules/[slug]/page.tsx
git commit -m "feat: redirect paginated modules to section 1"
```

---

### Task 13: Update ModuleSidebar for Section Navigation

**Files:**
- Modify: `components/ModuleSidebar.tsx`

- [ ] **Step 1: Update ModuleSidebar to accept currentPage and show sections**

Replace the full file content:

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, BookOpen } from 'lucide-react'
import { modules, getModuleSections } from '@/lib/modules'
import { getAllModulesProgress, ModuleStatus, getSectionVisited } from '@/lib/progress'
import { NovartisLogo } from '@/components/NovartisLogo'
import type { Section } from '@/lib/modules'

interface ModuleSidebarProps {
  currentSlug: string
  trackSlug: string
  currentPage?: number
}

export function ModuleSidebar({ currentSlug, trackSlug, currentPage }: ModuleSidebarProps) {
  const [progress, setProgress] = useState<Record<string, ModuleStatus>>({})
  const [sectionVisits, setSectionVisits] = useState<Record<number, boolean>>({})
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentModule = modules.find((m) => m.slug === currentSlug)
  const sections = getModuleSections(currentSlug)
  const isPaginated = sections.length > 0

  useEffect(() => {
    setProgress(getAllModulesProgress())
    if (isPaginated) {
      const visits: Record<number, boolean> = {}
      for (let i = 1; i <= sections.length; i++) {
        visits[i] = getSectionVisited(currentSlug, i)
      }
      setSectionVisits(visits)
    }
  }, [currentSlug, currentPage, isPaginated, sections.length])

  const sidebarContent = (
    <div className="flex flex-col h-full pb-16">
      {/* Logo */}
      <div className="mb-6 pb-4 border-b border-novartis-blue/10">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <NovartisLogo width={130} />
        </Link>
      </div>

      <div className="mb-4">
        <Link
          href="/glossary"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-novartis-blue hover:bg-novartis-blue-light transition-colors"
        >
          <BookOpen size={14} className="flex-shrink-0" />
          Glosario de términos
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold text-novartis-blue uppercase tracking-wider mb-3">
          Módulos
        </p>
        <nav className="space-y-1">
          {modules.filter((mod) => mod.track === trackSlug).map((mod) => {
            const status = progress[mod.slug] ?? 'not-started'
            const isCurrent = mod.slug === currentSlug
            return (
              <Link
                key={mod.slug}
                href={`/modules/${mod.slug}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isCurrent
                    ? 'bg-novartis-blue-light text-novartis-blue font-medium'
                    : 'text-gray-500 hover:text-novartis-blue-dark hover:bg-novartis-blue-light/50'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    status === 'completed'
                      ? 'bg-novartis-blue text-white'
                      : 'bg-novartis-blue-light text-novartis-blue'
                  }`}
                >
                  {status === 'completed' ? '✓' : mod.number}
                </span>
                <span className="leading-snug">{mod.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Section navigation for paginated modules */}
      {isPaginated && sections.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-novartis-blue uppercase tracking-wider mb-3">
            Secciones
          </p>
          <nav className="space-y-1">
            {sections.map((section: Section, idx: number) => {
              const pageNum = idx + 1
              const isCurrentPage = currentPage === pageNum
              const isVisited = sectionVisits[pageNum] || isCurrentPage
              return (
                <Link
                  key={section.id}
                  href={`/modules/${currentSlug}/${pageNum}`}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isCurrentPage
                      ? 'bg-novartis-blue-light text-novartis-blue font-medium'
                      : 'text-gray-500 hover:text-novartis-blue-dark hover:bg-novartis-blue-light/50'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-3 h-3 rounded-full ${
                      isCurrentPage
                        ? 'bg-novartis-blue'
                        : isVisited
                          ? 'bg-novartis-blue/40'
                          : 'bg-gray-300'
                    }`}
                  />
                  <span className="leading-snug">{section.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* TOC for non-paginated modules */}
      {!isPaginated && currentModule && currentModule.toc.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-novartis-blue uppercase tracking-wider mb-3">
            En este módulo
          </p>
          <nav className="space-y-1">
            {currentModule.toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-1.5 text-sm text-gray-500 hover:text-novartis-blue transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white border border-novartis-blue/20 rounded-lg p-2 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={16} className="text-novartis-blue" /> : <Menu size={16} className="text-novartis-blue" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-novartis-blue-dark/20 backdrop-blur-sm z-20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-novartis-blue/10 p-6 z-20 transition-transform shadow-xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-novartis-blue/10 px-6 py-6 bg-white">
        {sidebarContent}
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ModuleSidebar.tsx
git commit -m "feat: update sidebar with section navigation and visit indicators"
```

---

### Task 14: Split ai-fundamentals into 4 Section MDX Files

**Files:**
- Create: `content/ai-fundamentals/01-como-funcionan-los-llms.mdx`
- Create: `content/ai-fundamentals/02-ecosistema-de-herramientas.mdx`
- Create: `content/ai-fundamentals/03-limites-reales.mdx`
- Create: `content/ai-fundamentals/04-el-mindset-correcto.mdx`

This task requires reading the current `content/ai-fundamentals.mdx` and splitting it at the H2 boundaries, adding interactive components per the spec template. The boundaries are:

- Lines 1-135: Section 1 — "Cómo funcionan los LLMs"
- Lines 136-255: Section 2 — "El ecosistema de herramientas"
- Lines 256-368: Section 3 — "Límites reales"
- Lines 369-551: Section 4 — "El mindset correcto" (includes Quiz, Resources, Multimedia at end)

- [ ] **Step 1: Create content/ai-fundamentals/ directory**

```bash
mkdir -p content/ai-fundamentals
```

- [ ] **Step 2: Create 01-como-funcionan-los-llms.mdx**

Split lines 1-135 from the current MDX. Add interactive components following the section template:
- Add `<Callout type="tip">` after the intro paragraph about tokens
- Add `<Callout type="deep-dive">` in the training explanation section
- Add `<Accordion>` around the RLHF details
- Add `<ModuleImage>` placeholders for AI-generated illustrations
- Add `<MiniQuiz>` at the end with a comprehension question about tokens/prediction

Read the current `content/ai-fundamentals.mdx` lines 1-135, add interactive components at natural break points, and write to `content/ai-fundamentals/01-como-funcionan-los-llms.mdx`.

- [ ] **Step 3: Create 02-ecosistema-de-herramientas.mdx**

Split lines 136-255. Add:
- `<Callout type="tip">` about the mental model for choosing tools
- `<BeforeAfter>` comparing API vs interface usage
- `<Callout type="warning">` about the landscape changing fast
- `<MiniQuiz>` about choosing the right tool

- [ ] **Step 4: Create 03-limites-reales.mdx**

Split lines 256-368. Add:
- `<Callout type="warning">` about hallucinations
- `<Callout type="example">` with the NYC lawyer case
- `<BeforeAfter>` for biased vs unbiased outputs
- `<Accordion>` for prompt injection details
- `<MiniQuiz>` about detecting hallucinations

- [ ] **Step 5: Create 04-el-mindset-correcto.mdx**

Split lines 369 to end. This page includes:
- The existing `<Quiz>` component (final assessment)
- The `<ResourceCard>` section
- The `<Recursos Multimedia>` section (YouTube embeds, infographic, download links)
Add:
- `<BeforeAfter>` for the workflow examples
- `<Callout type="tip">` about the iteration cycle
- `<Callout type="example">` for the organizational AI literacy section
- `<MiniQuiz>` before the final Quiz

Also add a visit-check banner above the Quiz:

```jsx
<SectionVisitBanner slug="ai-fundamentals" totalSections={4} />
```

- [ ] **Step 6: Create SectionVisitBanner component**

Create `components/SectionVisitBanner.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getModuleSectionsVisited } from '@/lib/progress'

interface SectionVisitBannerProps {
  slug: string
  totalSections: number
}

export function SectionVisitBanner({ slug, totalSections }: SectionVisitBannerProps) {
  const [visited, setVisited] = useState(totalSections)

  useEffect(() => {
    setVisited(getModuleSectionsVisited(slug, totalSections))
  }, [slug, totalSections])

  const remaining = totalSections - visited

  if (remaining <= 0) return null

  return (
    <div className="border border-novartis-blue/20 bg-novartis-blue-light/50 rounded-lg px-4 py-3 my-6 not-prose">
      <p className="text-sm text-novartis-blue-dark">
        ℹ️ Te {remaining === 1 ? 'falta' : 'faltan'} {remaining} {remaining === 1 ? 'sección' : 'secciones'} por visitar.
        Puedes hacer el quiz ahora o volver a revisarlas.
      </p>
    </div>
  )
}
```

Register it in `mdx-components.tsx` by adding the import and entry.

- [ ] **Step 7: Commit**

```bash
git add content/ai-fundamentals/ components/SectionVisitBanner.tsx mdx-components.tsx
git commit -m "feat: split ai-fundamentals into 4 paginated sections with interactive components"
```

---

### Task 15: Verify Build and Navigation

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify the redirect works**

Navigate to `http://localhost:3000/modules/ai-fundamentals`
Expected: redirects to `/modules/ai-fundamentals/1`

- [ ] **Step 3: Verify page navigation**

Click the → arrow on page 1. Expected: navigates to `/modules/ai-fundamentals/2`
Click the ← arrow on page 2. Expected: navigates back to `/modules/ai-fundamentals/1`

- [ ] **Step 4: Verify sidebar shows sections with visit indicators**

After visiting pages 1 and 2, the sidebar should show:
- ● Cómo funcionan los LLMs (green/blue dot)
- ● Ecosistema de herramientas (green/blue dot)
- ○ Límites reales (gray dot)
- ○ El mindset correcto (gray dot)

- [ ] **Step 5: Verify progress bar**

On page 2, progress bar should show "Sección 2 de 4 · El ecosistema de herramientas" with 2/4 segments filled.

- [ ] **Step 6: Verify non-paginated modules still work**

Navigate to `http://localhost:3000/modules/prompting-fundamentals`
Expected: loads normally as single page (no redirect, no pagination).

- [ ] **Step 7: Run build to verify no errors**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 8: Commit build verification**

```bash
git commit --allow-empty -m "chore: verify paginated module build passes"
```

---

### Task 16: Update enrich-module Skill with --duration Flag and Phase 6

**Files:**
- Modify: `.agents/skills/enrich-module/SKILL.md`

- [ ] **Step 1: Update SKILL.md invocation section**

In the `## Invocation` section, add `--duration` to the command and `paginate` to `--phase`:

```
/enrich-module <slug> [--phase research|collect|notebook|generate|generate-video|download|integrate|paginate] [--sources url1,url2,...] [--lang es_419] [--duration 2h]
```

Add argument description:
```
- `--duration` — Optional. Target duration for the module. Controls content density and pagination. Default: `1h`. Examples: `30m`, `1h`, `2h`, `3h`.
```

- [ ] **Step 2: Add Duration Scaling section after Argument Parsing**

```markdown
## Duration Scaling

The `--duration` flag determines content density and structure:

| Duration | Words (total) | Pages | Words/page | Images/page | Mini-quizzes/page | Callouts/page |
|----------|--------------|-------|------------|-------------|-------------------|---------------|
| `30m` | ~3,000 | 1 (no pagination) | ~3,000 | 2-3 total | 1 final quiz only | 2-3 |
| `1h` | ~6,000 | 3-4 | ~1,500-2,000 | 1-2 | 1 | 2-3 |
| `2h` | ~10,000 | 4-6 | ~2,000-2,500 | 2-3 | 1-2 | 3-4 |
| `3h` | ~15,000 | 6-8 | ~2,000-2,500 | 2-3 | 2 | 4-5 |

Use this table when:
- Expanding content (Phase 5 Integrate): target the word count for the duration
- Deciding whether to paginate (Phase 6): only paginate if duration >= 1h
- Setting component density: use the targets for the chosen duration
```

- [ ] **Step 3: Append Phase 6 — Paginate to SKILL.md**

Append after Phase 5 (Integrate):

```markdown
---

## Phase 6 — Paginate

**When:** `--phase paginate` or running all phases (after Phase 5). Only runs if `--duration` >= `1h`.

**Purpose:** Split the expanded MDX into separate section files and add interactive components.

**Steps:**

1. **Check if pagination is needed:** If `--duration` is `30m`, skip this phase (single page is fine).

2. **Check idempotency:** If `content/<slug>/` directory already exists, ask the user:
   > "Section files already exist. Re-split (will overwrite) or skip?"

3. **Read the expanded MDX file:** `content/<slug>.mdx`

4. **Identify H2 section boundaries:** Find all `## ` headers. Each becomes a separate file.

5. **Create section directory:**
   ```bash
   mkdir -p "content/<slug>"
   ```

6. **Split into section files:** For each H2 section:
   - Name: `content/<slug>/NN-<section-id>.mdx` (zero-padded number + slugified title)
   - Content: everything from this H2 to the next H2 (or end of file)

7. **Insert interactive components** per the density targets for the chosen duration:
   - `<Callout type="tip">` after each section intro paragraph
   - `<MiniQuiz>` at the end of each section (generate question from the section content)
   - `<Accordion>` around paragraphs that contain advanced/optional detail
   - `<BeforeAfter>` where practical comparisons exist
   - `<ModuleImage>` references for any AI-generated images in `media/<slug>/`

8. **Move Quiz, Resources, and Multimedia** to the last section file.

9. **Add SectionVisitBanner** above the Quiz in the last section:
   ```jsx
   <SectionVisitBanner slug="<slug>" totalSections={N} />
   ```

10. **Update `lib/modules.ts`:** Add `sections` array to the module:
    ```typescript
    sections: [
      { id: '<section-id>', title: '<Section Title>', file: 'NN-<section-id>' },
      ...
    ]
    ```

11. **Update the section import map** in `app/modules/[slug]/[page]/page.tsx` to add the new module's MDX imports.

12. **Print summary:**
    ```
    [Phase 8/8] Pagination complete — content/<slug>/:
      - 4 section files created
      - 8 MiniQuiz components inserted
      - 12 Callout components inserted
      - 3 Accordion components inserted
      - 2 BeforeAfter components inserted
      - Module definition updated
    ```
```

- [ ] **Step 4: Update the phase count references in SKILL.md**

Replace all `7-phase` references with `8-phase` and update phase numbering in progress logging examples.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add --duration flag and Phase 6 (Paginate) to enrich-module skill"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | MiniQuiz component | `components/MiniQuiz.tsx` |
| 2 | Callout component | `components/Callout.tsx` |
| 3 | Accordion component | `components/Accordion.tsx` |
| 4 | BeforeAfter component | `components/BeforeAfter.tsx` |
| 5 | ModuleImage component | `components/ModuleImage.tsx` |
| 6 | Register components in MDX | `mdx-components.tsx` |
| 7 | Section types + module definition | `lib/modules.ts` |
| 8 | Section visit tracking | `lib/progress.ts` |
| 9 | ProgressBar component | `components/ProgressBar.tsx` |
| 10 | PageNavigation component | `components/PageNavigation.tsx` |
| 11 | Paginated module route | `app/modules/[slug]/[page]/page.tsx`, `components/SectionVisitTracker.tsx` |
| 12 | Redirect existing route | `app/modules/[slug]/page.tsx` |
| 13 | Sidebar section navigation | `components/ModuleSidebar.tsx` |
| 14 | Split ai-fundamentals into 4 MDX files | `content/ai-fundamentals/*.mdx`, `components/SectionVisitBanner.tsx` |
| 15 | Build verification | Manual testing |
| 16 | Update enrich-module skill | `.agents/skills/enrich-module/SKILL.md` |
