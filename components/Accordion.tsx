'use client'

import { useState, ReactNode } from 'react'

interface AccordionProps {
  title: string
  children: ReactNode
}

export function Accordion({ title, children }: AccordionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-purple-200 rounded-lg my-6 overflow-hidden not-prose">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left bg-purple-50 hover:bg-purple-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className={`text-purple-500 transition-transform ${open ? 'rotate-90' : ''}`}>
          ▶
        </span>
        <span className="text-sm font-medium text-purple-900">{title}</span>
      </button>
      {open && (
        <div className="px-5 py-4 text-sm text-gray-700 leading-relaxed border-t border-purple-100 prose prose-sm max-w-none">
          {children}
        </div>
      )}
    </div>
  )
}
