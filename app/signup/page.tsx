import Link from 'next/link'
import { AuthForm } from '@/components/features/auth/AuthForm'

export const metadata = { title: 'Create Account' }

export default function SignupPage() {
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald to-[#00c4a0] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="7" r="5" stroke="#08080e" strokeWidth="2" />
              <path d="M7 7 L11 17 L15 7" stroke="#08080e" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="11" cy="7" r="2" fill="#08080e" />
            </svg>
          </div>
          <div>
            <div className="font-display text-lg font-bold text-white leading-none">Digital Heroes</div>
            <div className="text-xs font-semibold tracking-widest text-emerald uppercase">Golf With Purpose</div>
          </div>
        </Link>

        <div className="glass rounded-card p-8">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-white/40 text-sm">Join 847 golfers making an impact every month.</p>
          </div>
          <AuthForm mode="signup" />
          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald hover:text-emerald/80 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          By signing up you agree to our{' '}
          <Link href="/terms" className="underline hover:text-white/40">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-white/40">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
