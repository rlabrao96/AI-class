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
