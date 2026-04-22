'use client'
import { useState, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { signIn, signUp } from '@/app/actions/auth'

interface AuthFormProps { mode: 'login' | 'signup' }

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const action = mode === 'login' ? signIn : signUp

  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const result = await action(formData)
      if (result?.success && mode === 'signup') setIsSuccess(true)
      return result
    },
    null
  )

  const redirect = searchParams.get('redirect') || ''
  const urlError = searchParams.get('error')

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">Check your email</h3>
        <p className="text-white/50 text-sm">
          We've sent a confirmation link to your email address. Click it to activate your account.
        </p>
      </motion.div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {redirect && <input type="hidden" name="redirect" value={redirect} />}

      {/* Error display */}
      <AnimatePresence>
        {(state?.error || urlError) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-rose/10 border border-rose/20 text-sm text-rose"
          >
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 5v4M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {state?.error || urlError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Name — signup only */}
      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
          <input
            name="full_name"
            type="text"
            className="input-field"
            placeholder="Your name"
            required
            autoComplete="name"
          />
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
        <input
          name="email"
          type="email"
          className="input-field"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white/60">Password</label>
          {mode === 'login' && (
            <Link href="/reset-password" className="text-xs text-white/40 hover:text-white transition-colors">
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="input-field pr-12"
            placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
            required
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M3 3l18 18M10.5 10.677A2 2 0 0013.323 13.5M6.362 6.227C4.37 7.44 2.763 9.117 2 12c1.5 5 5.5 8 10 8 2.117 0 4.084-.683 5.731-1.85M9 5.4A9.718 9.718 0 0112 5c4.5 0 8.5 3 10 7-.67 1.774-1.784 3.285-3.192 4.442" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password — signup only */}
      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Confirm Password</label>
          <input
            name="password_confirm"
            type={showPassword ? 'text' : 'password'}
            className="input-field"
            placeholder="Repeat your password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full justify-center mt-6 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isPending ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {mode === 'login' ? 'Signing in…' : 'Creating account…'}
          </>
        ) : (
          mode === 'login' ? 'Sign In' : 'Create Account'
        )}
      </button>
    </form>
  )
}
