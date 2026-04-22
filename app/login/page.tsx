import { Suspense } from 'react'
import Link from 'next/link'
import { AuthForm } from '@/components/features/auth/AuthForm'

export const metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-emerald/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold/8 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
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

        {/* Pull quote */}
        <div>
          <blockquote className="font-display text-4xl font-bold text-white leading-tight mb-6">
            "Every score you enter is a chance to{' '}
            <span className="gradient-emerald">change someone's life."</span>
          </blockquote>
          <div className="flex items-center gap-6">
            {[
              { label: 'Prize Pool', value: '£4,250+' },
              { label: 'For Charity', value: '£38k+' },
              { label: 'Members', value: '847' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating draw balls */}
        {[12, 28, 7, 34, 19].map((n, i) => (
          <div
            key={i}
            className="draw-ball absolute animate-float"
            style={{
              left: `${10 + i * 20}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.8}s`,
              opacity: 0.15,
            }}
          >
            {n}
          </div>
        ))}
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald to-[#00c4a0] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="7" r="5" stroke="#08080e" strokeWidth="2" />
                <path d="M7 7 L11 17 L15 7" stroke="#08080e" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-white">Digital Heroes</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-white/40">Sign in to your account to continue playing.</p>
          </div>

          <Suspense>
            <AuthForm mode="login" />
          </Suspense>

          <p className="text-center text-white/40 text-sm mt-8">
            Don't have an account?{' '}
            <Link href="/signup" className="text-emerald hover:text-emerald/80 font-semibold transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
