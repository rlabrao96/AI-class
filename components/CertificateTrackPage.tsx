'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Track } from '@/lib/modules'
import { getModuleProgress } from '@/lib/progress'

interface CertificateTrackPageProps {
  track: Track
}

export function CertificateTrackPage({ track }: CertificateTrackPageProps) {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const completed = new Set(
      track.modules
        .filter((m) => getModuleProgress(m.slug) === 'completed')
        .map((m) => m.slug)
    )
    setCompletedSlugs(completed)
    setChecked(true)
  }, [track])

  const allComplete = checked && completedSlugs.size === track.modules.length

  if (!checked) return null

  if (!allComplete) {
    const remaining = track.modules.filter((m) => !completedSlugs.has(m.slug))
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-2xl font-bold text-[#18181b] mb-3">
            Certificado no disponible aún
          </h1>
          <p className="text-[#71717a] mb-6">
            Para obtener el certificado de <strong>{track.title}</strong>, debes completar todos los módulos del track.
          </p>
          <div className="text-left space-y-2 mb-8">
            {remaining.map((m) => (
              <div key={m.slug} className="flex items-center gap-2 text-sm text-[#71717a]">
                <span className="w-4 h-4 rounded-full bg-[#e4e4e7] flex-shrink-0" />
                {m.title}
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#18181b] text-white text-sm font-medium rounded-lg hover:bg-[#27272a] transition-colors"
          >
            ← Volver al curso
          </Link>
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 text-sm text-[#71717a] hover:text-[#18181b] transition-colors"
          >
            ← Volver al curso
          </Link>
        </div>

        {/* Certificate */}
        <div className="border-2 border-[#18181b] rounded-2xl p-10 text-center print:border-black">
          <div className="mb-2">
            <span className="text-xs font-semibold text-[#71717a] uppercase tracking-widest">
              Certificado de Finalización
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#18181b] mt-6 mb-2">
            {track.title}
          </h1>
          <p className="text-[#71717a] mb-8">{track.description}</p>

          <div className="mb-8">
            <p className="text-sm text-[#71717a] mb-1">Participante del Programa</p>
            <div className="h-px bg-[#18181b] w-48 mx-auto mt-6" />
          </div>

          <div className="space-y-2 text-left max-w-xs mx-auto mb-8">
            {track.modules.map((m) => (
              <div key={m.slug} className="flex items-center gap-2 text-sm text-[#52525b]">
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                  ✓
                </span>
                {m.title}
              </div>
            ))}
          </div>

          <p className="text-xs text-[#a1a1aa]">{today}</p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 bg-[#18181b] text-white text-sm font-medium rounded-lg hover:bg-[#27272a] transition-colors"
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
