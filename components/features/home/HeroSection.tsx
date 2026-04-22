'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { PrizePool } from '@/types/database'

const WORDS = ['Lives', 'Communities', 'Futures', 'Dreams', 'Heroes']

function AnimatedWord() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % WORDS.length), 2500)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="gradient-emerald text-glow-emerald inline-block" key={index}>
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block"
      >
        {WORDS[index]}
      </motion.span>
    </span>
  )
}

function CountUp({ target, prefix = '£', duration = 2000 }: { target: number; prefix?: string; duration?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.floor(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
        else setValue(target)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{prefix}{value.toLocaleString()}</span>
}

interface HeroProps { prizePool: PrizePool | null }

export function HeroSection({ prizePool }: HeroProps) {
  const jackpot = prizePool?.jackpot_pool_gbp ?? 4250

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/[0.02] pointer-events-none" />

      {/* Floating golf balls */}
      {[20, 35, 12, 28, 8].map((score, i) => (
        <motion.div
          key={i}
          className="draw-ball absolute opacity-20"
          style={{
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4 + i,
            delay: i * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {score}
        </motion.div>
      ))}

      <div className="container-hero relative z-10 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald animate-pulse-emerald" />
          <span className="text-sm font-medium text-white/80">
            Monthly draw open — <span className="text-emerald font-semibold">500 players</span> competing
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
        >
          <span className="text-white">Play Golf.</span>
          <br />
          <span className="text-white/80">Win Prizes.</span>
          <br />
          <span>Change </span>
          <AnimatedWord />
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Enter your Stableford scores each month. Match the draw numbers.
          Win life-changing prizes — while supporting causes that matter.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/signup" className="btn-primary text-base px-8 py-4">
            <span>Start Playing</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/how-it-works" className="btn-secondary text-base px-8 py-4">
            How It Works
          </Link>
        </motion.div>

        {/* Live stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          <div className="glass rounded-2xl p-6 text-center group hover:glass-emerald transition-all duration-300">
            <div className="font-display text-4xl font-bold gradient-emerald mb-1">
              <CountUp target={jackpot} />
            </div>
            <div className="text-sm text-white/50 font-medium">This Month's Jackpot</div>
            <div className="text-xs text-white/30 mt-1">rolls over if unclaimed</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center group hover:glass-gold transition-all duration-300">
            <div className="font-display text-4xl font-bold gradient-gold mb-1">
              <CountUp target={38420} prefix="£" />
            </div>
            <div className="text-sm text-white/50 font-medium">Raised for Charity</div>
            <div className="text-xs text-white/30 mt-1">and counting</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center group hover:border-sapphire/30 hover:bg-sapphire/5 transition-all duration-300">
            <div className="font-display text-4xl font-bold text-white mb-1">
              <CountUp target={847} prefix="" />
            </div>
            <div className="text-sm text-white/50 font-medium">Active Players</div>
            <div className="text-xs text-white/30 mt-1">across Ireland & UK</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/30 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  )
}
