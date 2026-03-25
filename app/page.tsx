'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { tracks } from '@/lib/modules'
import { getModuleProgress, ModuleStatus } from '@/lib/progress'
import { NovartisLogo } from '@/components/NovartisLogo'

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
    <div className="min-h-screen bg-gradient-to-b from-novartis-blue-light via-white to-white">
      {/* Header with logo */}
      <header className="border-b border-novartis-blue/10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <NovartisLogo width={160} />
          <span className="text-xs font-semibold text-novartis-blue uppercase tracking-widest">
            Capacitación en IA
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-14">
        {tracks.map((track, trackIndex) => {
          const completedCount = track.modules.filter(
            (m) => progressMap[m.slug] === 'completed'
          ).length
          const allComplete = completedCount === track.modules.length

          return (
            <section key={track.slug}>
              {/* Track divider */}
              {trackIndex > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-novartis-blue/15" />
                  <span className="text-xs font-semibold text-novartis-blue/50 uppercase tracking-widest">
                    Siguiente track
                  </span>
                  <div className="flex-1 h-px bg-novartis-blue/15" />
                </div>
              )}

              {/* Track header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-novartis-blue-dark mb-1">{track.title}</h2>
                <p className="text-gray-500 text-sm">{track.description}</p>
              </div>

              {/* Progress bar */}
              <div className="mb-6 p-4 border border-novartis-blue/10 rounded-xl bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-novartis-blue-dark">Progreso</span>
                  <span className="text-sm text-gray-500">
                    {completedCount} de {track.modules.length} módulos
                  </span>
                </div>
                <div className="h-2 bg-novartis-blue-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-novartis-blue to-novartis-blue-mid rounded-full transition-all duration-500"
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
                      className="flex items-center gap-4 p-4 border rounded-xl bg-white hover:shadow-md hover:border-novartis-blue/30 transition-all group no-underline"
                      style={{
                        borderColor: isCompleted ? '#0460A9' : '#e4e4e7',
                      }}
                    >
                      <div
                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCompleted
                            ? 'bg-novartis-blue text-white'
                            : 'bg-novartis-blue-light text-novartis-blue'
                        }`}
                      >
                        {isCompleted ? '✓' : mod.number}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-novartis-blue-dark group-hover:text-novartis-blue transition-colors">
                          {mod.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{mod.estimatedTime}</p>
                      </div>

                      <div className="flex-shrink-0">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            isCompleted
                              ? 'bg-novartis-blue/10 text-novartis-blue'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isCompleted ? 'Completado' : 'No iniciado'}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Certificate banner */}
              {allComplete && (
                <div className="mt-4 p-4 border border-novartis-orange/30 rounded-xl bg-novartis-orange-light flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-novartis-blue-dark">
                      ¡Track completado!
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Ya puedes descargar tu certificado de {track.title}.
                    </p>
                  </div>
                  <Link
                    href={`/certificate/${track.slug}`}
                    className="flex-shrink-0 px-4 py-2 bg-novartis-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Ver certificado →
                  </Link>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Footer */}
      <footer className="border-t border-novartis-blue/10 mt-12">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <NovartisLogo width={100} />
          <p className="text-xs text-gray-400">Programa interno de capacitación</p>
        </div>
      </footer>
    </div>
  )
}
