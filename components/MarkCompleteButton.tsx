'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getModuleProgress, setModuleCompleted } from '@/lib/progress'
import { modules } from '@/lib/modules'

interface MarkCompleteButtonProps {
  slug: string
}

export function MarkCompleteButton({ slug: currentSlug }: MarkCompleteButtonProps) {
  const [completed, setCompleted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setCompleted(getModuleProgress(currentSlug) === 'completed')
  }, [currentSlug])

  const currentIndex = modules.findIndex((m) => m.slug === currentSlug)
  const nextModule = modules[currentIndex + 1]
  const isLastModule = !nextModule

  function handleComplete() {
    setModuleCompleted(currentSlug)
    setCompleted(true)
    if (isLastModule) setShowCelebration(true)
  }

  // Full-screen celebration overlay for last module
  if (showCelebration || (completed && isLastModule)) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-10">
        {/* Celebration banner */}
        <div className="bg-green-600 text-white px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-base">
              ¡Felicitaciones! Completaste el curso.
            </p>
            <p className="text-green-100 text-sm mt-0.5">
              Has finalizado los 4 módulos del programa de Capacitación en IA.
            </p>
          </div>
          <button
            onClick={() => router.push('/certificate')}
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
