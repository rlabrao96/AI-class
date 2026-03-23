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
  const router = useRouter()

  useEffect(() => {
    setCompleted(getModuleProgress(currentSlug) === 'completed')
  }, [currentSlug])

  const trackModules = modules.filter((m) => m.track === trackSlug)
  const currentIndex = trackModules.findIndex((m) => m.slug === currentSlug)
  const nextModule = trackModules[currentIndex + 1]

  function handleComplete() {
    setModuleCompleted(currentSlug)
    setCompleted(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e4e7] px-4 py-3 flex items-center justify-between gap-4 z-10">
      {completed ? (
        <>
          <span className="flex items-center gap-2 text-green-600 font-medium text-sm">
            <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs">✓</span>
            Módulo completado
          </span>
          {nextModule ? (
            <button
              onClick={() => router.push(`/modules/${nextModule.slug}`)}
              className="bg-[#18181b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#27272a] transition-colors"
            >
              Siguiente: {nextModule.title} →
            </button>
          ) : (
            <button
              onClick={() => router.push(`/certificate/${trackSlug}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Ver certificado →
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
