'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { tracks } from '@/lib/modules'
import { getModuleProgress, ModuleStatus } from '@/lib/progress'

export default function HomePage() {
  const [progressMap, setProgressMap] = useState<Record<string, ModuleStatus>>({})

  useEffect(() => {
    const map: Record<string, ModuleStatus> = {}
    tracks.forEach((track) => {
      track.modules.forEach((m) => {
        map[m.slug] = getModuleProgress(m.slug)
      })
    })
    setProgressMap(map)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">
        {tracks.map((track, trackIndex) => {
          const completedCount = track.modules.filter(
            (m) => progressMap[m.slug] === 'completed'
          ).length
          const allComplete = completedCount === track.modules.length

          return (
            <section key={track.slug}>
              {/* Track divider (skip for first track) */}
              {trackIndex > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-[#e4e4e7]" />
                  <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-widest">
                    Siguiente track
                  </span>
                  <div className="flex-1 h-px bg-[#e4e4e7]" />
                </div>
              )}

              {/* Track header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#18181b] mb-1">{track.title}</h2>
                <p className="text-[#71717a] text-sm">{track.description}</p>
              </div>

              {/* Progress bar */}
              <div className="mb-6 p-4 border border-[#e4e4e7] rounded-lg bg-[#fafafa]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[#18181b]">Progreso</span>
                  <span className="text-sm text-[#71717a]">
                    {completedCount} de {track.modules.length} módulos
                  </span>
                </div>
                <div className="h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(completedCount / track.modules.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Module list */}
              <div className="space-y-3">
                {track.modules.map((mod) => {
                  const status: ModuleStatus = progressMap[mod.slug] ?? 'not-started'
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

              {/* Certificate banner (only when track is complete) */}
              {allComplete && (
                <div className="mt-4 p-4 border border-green-200 rounded-lg bg-green-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      ¡Track completado!
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Ya puedes descargar tu certificado de {track.title}.
                    </p>
                  </div>
                  <Link
                    href={`/certificate/${track.slug}`}
                    className="flex-shrink-0 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Ver certificado →
                  </Link>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
