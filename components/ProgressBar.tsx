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
