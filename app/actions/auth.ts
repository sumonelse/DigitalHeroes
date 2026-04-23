'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const SignupSchema = LoginSchema.extend({
  full_name: z.string().min(2, 'Full name required').max(100),
  password_confirm: z.string(),
}).refine(data => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
})

export type AuthResult = { success: boolean; error?: string }

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { success: false, error: 'Incorrect email or password.' }
    }
    return { success: false, error: error.message }
  }

  const redirectTo = (formData.get('redirect') as string) || '/dashboard'
  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const parsed = SignupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    password_confirm: formData.get('password_confirm'),
    full_name: formData.get('full_name'),
  })

  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'An account with this email already exists.' }
    }
    return { success: false, error: error.message }
  }

  // If email confirmation is disabled, redirect directly
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/onboarding')
  }

  // Email confirmation required
  return { success: true }
}

export async function signOut(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email || !z.string().email().safeParse(email).success) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-confirm`,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm  = formData.get('password_confirm') as string

  if (password !== confirm) return { success: false, error: 'Passwords do not match.' }
  if (password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { success: false, error: error.message }

  redirect('/dashboard')
}
