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
