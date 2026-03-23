import { notFound } from 'next/navigation'
import { modules, getModule } from '@/lib/modules'
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
  if (!mod || !moduleMap[params.slug]) notFound()

  const { default: ModuleContent } = await moduleMap[params.slug]()

  return (
    <div className="flex min-h-screen bg-white">
      <ModuleSidebar currentSlug={params.slug} trackSlug={mod.track} />

      <main className="flex-1 min-w-0 pb-24">
        <div className="max-w-[720px] mx-auto px-6 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-[#18181b] text-white text-sm font-medium rounded-lg hover:bg-[#27272a] transition-colors"
          >
            ← Volver al menú principal
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wider">
              Módulo {mod.number}
            </span>
            <span className="text-xs text-[#a1a1aa]">·</span>
            <span className="text-xs text-[#71717a]">{mod.estimatedTime}</span>
          </div>

          <h1 className="text-3xl font-bold text-[#18181b] mb-8">{mod.title}</h1>

          <article className="prose prose-zinc max-w-none prose-headings:scroll-mt-6">
            <ModuleContent />
          </article>
        </div>
      </main>

      <MarkCompleteButton slug={params.slug} trackSlug={mod.track} />
    </div>
  )
}
