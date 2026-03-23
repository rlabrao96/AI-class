'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type State = { error: string }

export async function login(prevState: State, formData: FormData): Promise<State> {
  if (!process.env.SITE_PASSWORD) {
    throw new Error('SITE_PASSWORD environment variable is not set')
  }

  const password = formData.get('password') as string

  if (password !== process.env.SITE_PASSWORD) {
    return { error: 'Contraseña incorrecta. Inténtalo de nuevo.' }
  }

  cookies().set('auth_token', process.env.SITE_PASSWORD!, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/')
}
