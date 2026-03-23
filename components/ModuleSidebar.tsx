'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, BookOpen } from 'lucide-react'
import { modules } from '@/lib/modules'
import { getAllModulesProgress, ModuleStatus } from '@/lib/progress'

interface ModuleSidebarProps {
  currentSlug: string
}

export function ModuleSidebar({ currentSlug }: ModuleSidebarProps) {
  const [progress, setProgress] = useState<Record<string, ModuleStatus>>({})
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setProgress(getAllModulesProgress())
  }, [currentSlug])

  const currentModule = modules.find((m) => m.slug === currentSlug)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">
          Módulos
        </p>
        <nav className="space-y-1">
          {modules.map((mod) => {
            const status = progress[mod.slug] ?? 'not-started'
            const isCurrent = mod.slug === currentSlug
            return (
              <Link
                key={mod.slug}
                href={`/modules/${mod.slug}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isCurrent
                    ? 'bg-[#f4f4f5] text-[#18181b] font-medium'
                    : 'text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5]'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-[#e4e4e7] text-[#71717a]'
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
          <p className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">
            En este módulo
          </p>
          <nav className="space-y-1">
            {currentModule.toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-1.5 text-sm text-[#71717a] hover:text-[#18181b] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-[#e4e4e7]">
        <Link
          href="/glossary"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-colors"
        >
          <BookOpen size={14} className="flex-shrink-0" />
          Glosario de términos
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white border border-[#e4e4e7] rounded-md p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-[#e4e4e7] p-6 z-20 transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-[#e4e4e7] px-6 py-8">
        {sidebarContent}
      </aside>
    </>
  )
}
