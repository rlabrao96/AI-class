'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/app/actions/auth'
import { NovartisLogo } from '@/components/NovartisLogo'

const initialState = { error: '' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-novartis-blue text-white py-3 rounded-lg font-semibold hover:bg-novartis-blue-dark transition-colors disabled:opacity-60"
    >
      {pending ? 'Verificando...' : 'Ingresar'}
    </button>
  )
}

export default function PasswordPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="min-h-screen bg-gradient-to-b from-novartis-blue-light via-white to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center flex flex-col items-center">
          <NovartisLogo width={200} className="mb-6" />
          <h1 className="text-xl font-bold text-novartis-blue-dark mb-1">
            Capacitación en IA
          </h1>
          <p className="text-gray-500 text-sm">
            Ingresa la contraseña para acceder al curso
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              required
              className="w-full px-4 py-3 border border-novartis-blue/20 rounded-lg text-novartis-blue-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-novartis-blue focus:border-transparent bg-white"
            />
            {state?.error && (
              <p className="mt-2 text-sm text-novartis-red">{state.error}</p>
            )}
          </div>
          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
