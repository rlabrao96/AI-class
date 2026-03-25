'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, BookOpen } from 'lucide-react'
import { modules } from '@/lib/modules'
import { getAllModulesProgress, ModuleStatus } from '@/lib/progress'
import { NovartisLogo } from '@/components/NovartisLogo'

interface ModuleSidebarProps {
  currentSlug: string
  trackSlug: string
}

export function ModuleSidebar({ currentSlug, trackSlug }: ModuleSidebarProps) {
  const [progress, setProgress] = useState<Record<string, ModuleStatus>>({})
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setProgress(getAllModulesProgress())
  }, [currentSlug])

  const currentModule = modules.find((m) => m.slug === currentSlug)

  const sidebarContent = (
    <div className="flex flex-col h-full pb-16">
      {/* Logo */}
      <div className="mb-6 pb-4 border-b border-novartis-blue/10">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <NovartisLogo width={130} />
        </Link>
      </div>

      <div className="mb-4">
        <Link
          href="/glossary"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-novartis-blue hover:bg-novartis-blue-light transition-colors"
        >
          <BookOpen size={14} className="flex-shrink-0" />
          Glosario de términos
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold text-novartis-blue uppercase tracking-wider mb-3">
          Módulos
        </p>
        <nav className="space-y-1">
          {modules.filter((mod) => mod.track === trackSlug).map((mod) => {
            const status = progress[mod.slug] ?? 'not-started'
            const isCurrent = mod.slug === currentSlug
            return (
              <Link
                key={mod.slug}
                href={`/modules/${mod.slug}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isCurrent
                    ? 'bg-novartis-blue-light text-novartis-blue font-medium'
                    : 'text-gray-500 hover:text-novartis-blue-dark hover:bg-novartis-blue-light/50'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    status === 'completed'
                      ? 'bg-novartis-blue text-white'
                      : 'bg-novartis-blue-light text-novartis-blue'
                  }`}
                >
                  {status === 'completed' ? '✓' : mod.number}
                </span>
                <span className="leading-snug">{mod.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {currentModule && currentModule.toc.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-novartis-blue uppercase tracking-wider mb-3">
            En este módulo
          </p>
          <nav className="space-y-1">
            {currentModule.toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-1.5 text-sm text-gray-500 hover:text-novartis-blue transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}

    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white border border-novartis-blue/20 rounded-lg p-2 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={16} className="text-novartis-blue" /> : <Menu size={16} className="text-novartis-blue" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-novartis-blue-dark/20 backdrop-blur-sm z-20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-novartis-blue/10 p-6 z-20 transition-transform shadow-xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-novartis-blue/10 px-6 py-6 bg-white">
        {sidebarContent}
      </aside>
    </>
  )
}
