'use client'

import { useFormState } from 'react-dom'
import { login } from '@/app/actions/auth'

const initialState = { error: '' }

export default function PasswordPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#18181b] mb-2">
            Capacitación en IA
          </h1>
          <p className="text-[#71717a] text-sm">
            Ingresa la contraseña para acceder al curso
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              required
              className="w-full px-4 py-3 border border-[#e4e4e7] rounded-lg text-[#18181b] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#18181b] focus:border-transparent"
            />
            {state?.error && (
              <p className="mt-2 text-sm text-red-500">{state.error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-[#18181b] text-white py-3 rounded-lg font-medium hover:bg-[#27272a] transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
