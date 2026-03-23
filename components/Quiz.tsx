'use client'

import { useState } from 'react'
import { setQuizCompleted } from '@/lib/progress'

interface Question {
  question: string
  options: string[]
  correct: number
}

interface QuizProps {
  moduleSlug: string
  questions: Question[]
}

export function Quiz({ moduleSlug, questions }: QuizProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  )
  const [finished, setFinished] = useState(false)

  const question = questions[current]
  const isAnswered = selected !== null

  function handleSelect(idx: number) {
    if (isAnswered) return
    setSelected(idx)
    const newAnswers = [...answers]
    newAnswers[current] = idx
    setAnswers(newAnswers)
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
      setSelected(null)
    } else {
      setFinished(true)
      setQuizCompleted(moduleSlug)
    }
  }

  const score = answers.filter((a, i) => a === questions[i].correct).length

  if (finished) {
    return (
      <div className="border border-[#e4e4e7] rounded-lg p-6 bg-[#fafafa] my-6">
        <h3 className="text-lg font-semibold text-[#18181b] mb-2">
          Quiz completado
        </h3>
        <p className="text-[#71717a] mb-4">
          Obtuviste{' '}
          <span className="font-bold text-[#18181b]">
            {score} de {questions.length}
          </span>{' '}
          respuestas correctas.
        </p>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                  answers[i] === q.correct
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {answers[i] === q.correct ? '✓' : '✗'}
              </span>
              <div className="text-sm text-[#52525b]">
                <p className="font-medium text-[#18181b]">{q.question}</p>
                {answers[i] !== q.correct && (
                  <p className="text-green-700 mt-0.5">
                    Correcto: {q.options[q.correct]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-[#e4e4e7] rounded-lg p-6 bg-[#fafafa] my-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-medium text-[#71717a] uppercase tracking-wide">
          Pregunta {current + 1} de {questions.length}
        </span>
      </div>

      <p className="text-[#18181b] font-medium mb-4">{question.question}</p>

      <div className="space-y-2 mb-6">
        {question.options.map((option, idx) => {
          let className =
            'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors'

          if (!isAnswered) {
            className += ' border-[#e4e4e7] hover:border-[#18181b] hover:bg-white cursor-pointer'
          } else if (idx === question.correct) {
            className += ' border-green-500 bg-green-50 text-green-800'
          } else if (idx === selected) {
            className += ' border-red-400 bg-red-50 text-red-800'
          } else {
            className += ' border-[#e4e4e7] opacity-60'
          }

          return (
            <button key={idx} className={className} onClick={() => handleSelect(idx)}>
              {option}
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full bg-[#18181b] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#27272a] transition-colors"
        >
          {current < questions.length - 1 ? 'Siguiente pregunta →' : 'Ver resultados'}
        </button>
      )}
    </div>
  )
}
