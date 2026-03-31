import { ReactNode } from 'react'

interface CalloutProps {
  type: 'tip' | 'warning' | 'example' | 'deep-dive'
  children: ReactNode
}

const CALLOUT_STYLES = {
  tip: {
    border: 'border-novartis-blue',
    bg: 'bg-novartis-blue-light',
    icon: '💡',
    label: 'Dato clave',
    text: 'text-novartis-blue-dark',
  },
  warning: {
    border: 'border-novartis-yellow',
    bg: 'bg-yellow-50',
    icon: '⚠️',
    label: 'Cuidado',
    text: 'text-yellow-900',
  },
  example: {
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    icon: '💬',
    label: 'Ejemplo real',
    text: 'text-emerald-900',
  },
  'deep-dive': {
    border: 'border-purple-400',
    bg: 'bg-purple-50',
    icon: '🔍',
    label: 'Para profundizar',
    text: 'text-purple-900',
  },
}

export function Callout({ type, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type]

  return (
    <div className={`${style.bg} ${style.border} border-l-4 rounded-r-lg px-5 py-4 my-6 not-prose`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${style.text}`}>
        {style.icon} {style.label}
      </p>
      <div className={`text-sm leading-relaxed ${style.text}`}>{children}</div>
    </div>
  )
}
