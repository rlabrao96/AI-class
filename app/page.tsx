'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { modules } from '@/lib/modules'
import { getAllModulesProgress, ModuleStatus } from '@/lib/progress'

export default function HomePage() {
  const [progress, setProgress] = useState<Record<string, ModuleStatus>>({})

  useEffect(() => {
    setProgress(getAllModulesProgress())
  }, [])

  const completedCount = modules.filter(
    (m) => progress[m.slug] === 'completed'
  ).length

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#18181b] mb-2">
            Capacitación en IA
          </h1>
          <p className="text-[#71717a]">
            Cuatro módulos para entender, usar y aprovechar la IA en tu trabajo de forma responsable.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-10 p-4 border border-[#e4e4e7] rounded-lg bg-[#fafafa]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#18181b]">
              Progreso general
            </span>
            <span className="text-sm text-[#71717a]">
              {completedCount} de {modules.length} módulos
            </span>
          </div>
          <div className="h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${(completedCount / modules.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Certificate banner */}
        {completedCount === modules.length && (
          <div className="mb-8 p-5 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-green-800">
                ¡Completaste todos los módulos!
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Ya puedes obtener tu certificado de finalización.
              </p>
            </div>
            <Link
              href="/certificate"
              className="flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors no-underline"
            >
              Ver certificado →
            </Link>
          </div>
        )}

        {/* Module list */}
        <div className="space-y-3">
          {modules.map((mod) => {
            const status: ModuleStatus = progress[mod.slug] ?? 'not-started'
            const isCompleted = status === 'completed'

            return (
              <Link
                key={mod.slug}
                href={`/modules/${mod.slug}`}
                className="flex items-center gap-4 p-4 border rounded-lg bg-[#fafafa] hover:bg-white hover:shadow-sm transition-all group no-underline"
                style={{
                  borderColor: isCompleted ? '#22c55e' : '#e4e4e7',
                }}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-[#e4e4e7] text-[#71717a]'
                  }`}
                >
                  {isCompleted ? '✓' : mod.number}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#18181b] group-hover:underline">
                    {mod.title}
                  </p>
                  <p className="text-xs text-[#71717a] mt-0.5">{mod.estimatedTime}</p>
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isCompleted
                        ? 'bg-green-50 text-green-700'
                        : 'bg-[#f4f4f5] text-[#71717a]'
                    }`}
                  >
                    {isCompleted ? 'Completado' : 'No iniciado'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
