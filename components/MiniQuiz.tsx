'use client'

import { useState } from 'react'

interface MiniQuizProps {
  question: string
  options: string[]
  correct: number
  explanation?: string
}

export function MiniQuiz({ question, options, correct, explanation }: MiniQuizProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const isAnswered = selected !== null
  const isCorrect = selected === correct

  return (
    <div className="border border-emerald-200 rounded-xl p-6 bg-emerald-50/50 my-8 not-prose">
      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">
        Comprueba tu comprensión
      </p>
      <p className="text-novartis-blue-dark font-medium mb-4">{question}</p>
      <div className="space-y-2 mb-4">
        {options.map((option, idx) => {
          let className =
            'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors'

          if (!isAnswered) {
            className += ' border-emerald-200 hover:border-emerald-400 hover:bg-white cursor-pointer'
          } else if (idx === correct) {
            className += ' border-emerald-500 bg-emerald-50 text-emerald-800'
          } else if (idx === selected) {
            className += ' border-red-300 bg-red-50 text-red-700'
          } else {
            className += ' border-gray-200 opacity-50'
          }

          return (
            <button
              key={idx}
              className={className}
              onClick={() => !isAnswered && setSelected(idx)}
              disabled={isAnswered}
            >
              <span className="flex items-center gap-2">
                {isAnswered && idx === correct && <span>✓</span>}
                {isAnswered && idx === selected && idx !== correct && <span>✗</span>}
                {option}
              </span>
            </button>
          )
        })}
      </div>
      {isAnswered && explanation && (
        <div className={`px-4 py-3 rounded-lg text-sm ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
          {isCorrect ? '¡Correcto! ' : 'No exactamente. '}{explanation}
        </div>
      )}
    </div>
  )
}
