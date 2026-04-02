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
  'prompting-fundamentals': {
    '01-estructura-y-especificidad': () => import('@/content/prompting-fundamentals/01-estructura-y-especificidad.mdx'),
    '02-system-prompts-y-few-shot': () => import('@/content/prompting-fundamentals/02-system-prompts-y-few-shot.mdx'),
    '03-razonamiento-y-refinamiento': () => import('@/content/prompting-fundamentals/03-razonamiento-y-refinamiento.mdx'),
    '04-patrones-y-conversaciones': () => import('@/content/prompting-fundamentals/04-patrones-y-conversaciones.mdx'),
    '05-output-errores-y-biblioteca': () => import('@/content/prompting-fundamentals/05-output-errores-y-biblioteca.mdx'),
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
