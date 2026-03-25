'use client'

import { PlayCircle, FileText, BookOpen } from 'lucide-react'

interface ResourceCardProps {
  title: string
  url: string
  description: string
  type: 'video' | 'article' | 'doc'
}

const icons = {
  video: PlayCircle,
  article: FileText,
  doc: BookOpen,
}

const typeLabels = {
  video: 'Video',
  article: 'Artículo',
  doc: 'Documentación',
}

export function ResourceCard({ title, url, description, type }: ResourceCardProps) {
  const Icon = icons[type]

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-4 border border-novartis-blue/10 rounded-xl bg-white hover:shadow-md hover:border-novartis-blue/25 transition-all no-underline group"
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon
          size={20}
          className="text-novartis-blue/50 group-hover:text-novartis-blue transition-colors"
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-novartis-blue uppercase tracking-wide">
            {typeLabels[type]}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-novartis-blue-dark mb-1 group-hover:underline">
          {title}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </a>
  )
}
