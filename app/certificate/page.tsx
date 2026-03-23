'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { modules } from '@/lib/modules'
import { getAllModulesProgress } from '@/lib/progress'
import Link from 'next/link'

export default function CertificatePage() {
  const router = useRouter()
  const [allComplete, setAllComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const completionDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    const progress = getAllModulesProgress()
    const completed = modules.every((m) => progress[m.slug] === 'completed')
    setAllComplete(completed)
    setLoading(false)
  }, [])

  if (loading) return null

  if (!allComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-[#71717a] mb-4">
            Debes completar todos los módulos para obtener el certificado.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-[#18181b] underline"
          >
            ← Volver al curso
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-4 py-12">
      {/* Print / Download button */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-[#18181b] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#27272a] transition-colors"
        >
          Descargar / Imprimir certificado
        </button>
      </div>

      {/* Certificate */}
      <div
        id="certificate"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-lg border border-[#e4e4e7] px-12 py-14 text-center print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full"
      >
        {/* Top accent line */}
        <div className="w-16 h-1 bg-[#18181b] rounded-full mx-auto mb-8" />

        <p className="text-xs font-semibold text-[#71717a] uppercase tracking-widest mb-2">
          Novartis · Programa de Capacitación
        </p>

        <h1 className="text-3xl font-bold text-[#18181b] mb-2 leading-tight">
          Certificado de Finalización
        </h1>

        <p className="text-[#71717a] text-sm mb-10">
          Este certificado acredita que
        </p>

        <p className="text-2xl font-semibold text-[#18181b] mb-10 border-b border-[#e4e4e7] pb-8">
          Participante del Programa
        </p>

        <p className="text-[#52525b] text-sm leading-relaxed mb-10 max-w-md mx-auto">
          ha completado satisfactoriamente el programa{' '}
          <span className="font-semibold text-[#18181b]">
            Inteligencia Artificial para Equipos de Negocio
          </span>
          , cubriendo los siguientes módulos:
        </p>

        {/* Module list */}
        <div className="text-left space-y-2 mb-10 max-w-xs mx-auto">
          {modules.map((mod) => (
            <div key={mod.slug} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">
                ✓
              </span>
              <span className="text-sm text-[#18181b]">{mod.title}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#a1a1aa] mb-10">
          Fecha de finalización: {completionDate}
        </p>

        {/* Bottom accent */}
        <div className="w-16 h-1 bg-[#18181b] rounded-full mx-auto" />
      </div>

      <div className="mt-6 print:hidden">
        <Link href="/" className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors">
          ← Volver al curso
        </Link>
      </div>
    </div>
  )
}
