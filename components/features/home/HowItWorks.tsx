"use client";
import { useRef } from "react";
import { motion, useInView } from "motion/react";

const STEPS = [
  {
    number: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 24c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M20 16l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Subscribe",
    subtitle: "Join for ₹999/mo",
    description:
      "Sign up in under 2 minutes. Choose your plan, pick a charity to support, and set your contribution percentage. That's it — you're in.",
    color: "emerald",
    badge: "2 min setup",
  },
  {
    number: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="4"
          y="4"
          width="20"
          height="20"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 14h10M9 10h6M9 18h8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="21"
          cy="21"
          r="5"
          fill="#08080e"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M19 21l1.5 1.5L23 19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Log Your Scores",
    subtitle: "Stableford format",
    description:
      "After every round, enter your Stableford score (1–45). We keep your best 5. Each score becomes one of your draw numbers — simple and powerful.",
    color: "gold",
    badge: "5-score window",
  },
  {
    number: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle
          cx="14"
          cy="14"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M14 8v6l4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 4l16 20"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 3"
          opacity="0.4"
        />
      </svg>
    ),
    title: "Win & Give Back",
    subtitle: "Monthly draws",
    description:
      "Every month, we draw 5 numbers. Match 3 for a cash prize. Match 4 for a bigger win. Match all 5 — hit the jackpot. Every ticket also funds your chosen charity.",
    color: "violet",
    badge: "Monthly draws",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-depth/50 to-transparent pointer-events-none" />

      <div className="container-hero relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-emerald text-sm font-semibold tracking-widest uppercase mb-4"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Effortlessly simple.
            <br />
            <span className="text-white/40">Genuinely impactful.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/50 text-lg max-w-xl mx-auto"
          >
            Three steps to transform your rounds into something that matters.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px bg-gradient-to-r from-emerald/20 via-gold/20 to-violet/20 z-0" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative group"
            >
              <div
                className={`glass rounded-card p-8 h-full transition-all duration-500 hover:-translate-y-1 ${
                  step.color === "emerald"
                    ? "hover:glass-emerald hover:glow-emerald"
                    : step.color === "gold"
                      ? "hover:glass-gold hover:glow-gold"
                      : "hover:border-violet/30 hover:bg-violet/5"
                }`}
              >
                {/* Step number */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`flex items-center justify-center w-14 h-14 rounded-2xl ${
                      step.color === "emerald"
                        ? "bg-emerald/10 text-emerald"
                        : step.color === "gold"
                          ? "bg-gold/10 text-gold"
                          : "bg-violet/10 text-violet"
                    } transition-all duration-300`}
                  >
                    {step.icon}
                  </div>
                  <span className="font-display text-6xl font-bold text-white/5 leading-none select-none">
                    {step.number}
                  </span>
                </div>

                {/* Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-4 ${
                    step.color === "emerald"
                      ? "bg-emerald/10 text-emerald"
                      : step.color === "gold"
                        ? "bg-gold/10 text-gold"
                        : "bg-violet/10 text-violet"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {step.badge}
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm font-semibold text-white/30 mb-4">
                  {step.subtitle}
                </p>
                <p className="text-white/60 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Draw visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-20 glass rounded-card p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <p className="text-white/40 text-sm uppercase tracking-widest mb-2">
              Draw Example
            </p>
            <h3 className="font-display text-2xl font-bold text-white">
              Your 5 scores vs the winning numbers
            </h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* User scores */}
            <div className="text-center">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                Your Scores
              </p>
              <div className="flex gap-3">
                {[12, 18, 24, 31, 18].map((score, i) => (
                  <motion.div
                    key={i}
                    className={`score-badge ${[18, 24, 31].includes(score) ? "active" : ""}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{
                      delay: 0.9 + i * 0.08,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {score}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* VS */}
            <div className="text-white/20 font-display text-3xl">vs</div>

            {/* Winning numbers */}
            <div className="text-center">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
                Winning Numbers
              </p>
              <div className="flex gap-3">
                {[18, 24, 7, 31, 42].map((num, i) => (
                  <motion.div
                    key={i}
                    className={`draw-ball ${[18, 24, 31].includes(num) ? "opacity-100" : "opacity-40"}`}
                    initial={{ y: -30, opacity: 0 }}
                    animate={
                      inView
                        ? {
                            y: 0,
                            opacity: [18, 24, 31].includes(num) ? 1 : 0.4,
                          }
                        : {}
                    }
                    transition={{
                      delay: 1.1 + i * 0.1,
                      type: "spring",
                      stiffness: 150,
                    }}
                  >
                    {String(num).padStart(2, "0")}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              delay: 1.7,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-3 glass-gold rounded-full px-6 py-3">
              <span className="text-gold text-xl">🏆</span>
              <span className="font-semibold text-gold">
                3 numbers matched — ₹
                {(prizePool?.match3_pool_gbp ?? 1187).toLocaleString()} prize
                pool!
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Fallback for SSR (no prizePool prop needed in this simple version)
const prizePool = { match3_pool_gbp: 1187 };
