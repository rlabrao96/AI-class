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
