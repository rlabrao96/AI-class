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
      <div className="border border-novartis-blue/15 rounded-xl p-6 bg-novartis-blue-light/30 my-6">
        <h3 className="text-lg font-semibold text-novartis-blue-dark mb-2">
          Quiz completado
        </h3>
        <p className="text-gray-500 mb-4">
          Obtuviste{' '}
          <span className="font-bold text-novartis-blue-dark">
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
                    ? 'bg-novartis-blue-light text-novartis-blue'
                    : 'bg-red-100 text-novartis-red'
                }`}
              >
                {answers[i] === q.correct ? '✓' : '✗'}
              </span>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-novartis-blue-dark">{q.question}</p>
                {answers[i] !== q.correct && (
                  <p className="text-novartis-blue mt-0.5">
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
    <div className="border border-novartis-blue/15 rounded-xl p-6 bg-novartis-blue-light/30 my-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-novartis-blue uppercase tracking-wide">
          Pregunta {current + 1} de {questions.length}
        </span>
      </div>

      <p className="text-novartis-blue-dark font-medium mb-4">{question.question}</p>

      <div className="space-y-2 mb-6">
        {question.options.map((option, idx) => {
          let className =
            'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors'

          if (!isAnswered) {
            className += ' border-novartis-blue/15 hover:border-novartis-blue hover:bg-white cursor-pointer'
          } else if (idx === question.correct) {
            className += ' border-novartis-blue bg-novartis-blue-light text-novartis-blue'
          } else if (idx === selected) {
            className += ' border-novartis-red bg-red-50 text-novartis-red'
          } else {
            className += ' border-gray-200 opacity-60'
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
          className="w-full bg-novartis-blue text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-novartis-blue-dark transition-colors"
        >
          {current < questions.length - 1 ? 'Siguiente pregunta →' : 'Ver resultados'}
        </button>
      )}
    </div>
  )
}
