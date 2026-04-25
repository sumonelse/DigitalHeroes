"use client";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/profile";

const STEPS = ["Welcome", "Pick Charity", "Subscribe"];

const CHARITIES_SAMPLE = [
  {
    id: "irish-heart",
    name: "Irish Heart Foundation",
    category: "Health",
    icon: "❤️",
  },
  { id: "pieta", name: "Pieta House", category: "Mental Health", icon: "🌱" },
  {
    id: "goal",
    name: "GOAL Ireland",
    category: "International Aid",
    icon: "🌍",
  },
  {
    id: "simon",
    name: "Simon Community",
    category: "Homelessness",
    icon: "🏠",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedCharity, setSelectedCharity] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleFinish = () => {
    startTransition(async () => {
      await updateProfile({
        full_name: name || undefined,
        onboarding_complete: true,
      })
      router.push("/pricing?onboarding=true")
    })
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-6">
      {/* Progress */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 ${i > 0 ? "" : ""}`}>
            {i > 0 && (
              <div
                className={`w-8 h-px ${i <= step ? "bg-emerald" : "bg-white/10"}`}
              />
            )}
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
                i < step
                  ? "bg-emerald text-void"
                  : i === step
                    ? "bg-emerald/20 text-emerald border border-emerald/40"
                    : "bg-white/5 text-white/30"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block transition-colors ${i === step ? "text-white" : "text-white/30"}`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="text-7xl mb-6 animate-float">⛳</div>
              <h1 className="font-display text-4xl font-bold text-white mb-3">
                Welcome to Digital Heroes!
              </h1>
              <p className="text-white/50 mb-8 leading-relaxed">
                You're joining a community of golfers who play with purpose.
                Let's get you set up in under 2 minutes.
              </p>
              <div className="glass rounded-2xl p-5 mb-8 text-left space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="First name"
                    autoFocus
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="btn-primary text-base px-10 py-4"
              >
                Let's Go →
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold text-white mb-2">
                  Pick your charity
                </h2>
                <p className="text-white/50">
                  At least 10% of your subscription goes here. You can always
                  change this.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {CHARITIES_SAMPLE.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCharity(c.id)}
                    className={`glass rounded-2xl p-5 text-left transition-all duration-200 group ${
                      selectedCharity === c.id
                        ? "glass-emerald border-emerald/30"
                        : "hover:border-white/15"
                    }`}
                  >
                    <div className="text-3xl mb-2">{c.icon}</div>
                    <div className="font-semibold text-white text-sm leading-tight">
                      {c.name}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">
                      {c.category}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="btn-secondary py-3 px-5 text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedCharity}
                  className="btn-primary flex-1 py-3 text-sm disabled:opacity-50 justify-center"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="text-7xl mb-6">🎯</div>
              <h2 className="font-display text-3xl font-bold text-white mb-3">
                Almost there!
              </h2>
              <p className="text-white/50 mb-8">
                Choose a subscription to start entering monthly draws and
                supporting your charity.
              </p>
              <div className="glass rounded-card p-6 mb-8 text-left">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      plan: "monthly",
                      price: "₹999",
                      period: "/month",
                      save: "",
                    },
                    {
                      plan: "yearly",
                      price: "₹8,330",
                      period: "/year",
                      save: "Save ₹3,668",
                    },
                  ].map((p) => (
                    <a
                      key={p.plan}
                      href={`/api/checkout?plan=${p.plan}`}
                      className={`rounded-2xl p-5 border text-center transition-all hover:-translate-y-0.5 ${
                        p.plan === "yearly"
                          ? "border-emerald/30 bg-emerald/5 hover:glow-emerald"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      {p.save && (
                        <div className="text-xs font-bold text-emerald mb-1">
                          {p.save}
                        </div>
                      )}
                      <div className="font-display text-2xl font-bold text-white">
                        {p.price}
                      </div>
                      <div className="text-white/40 text-xs">{p.period}</div>
                      <div className="text-xs font-semibold text-white/60 mt-2 capitalize">
                        {p.plan}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFinish}
                  disabled={isPending}
                  className="btn-secondary py-3 text-sm"
                >
                  {isPending ? "Saving…" : "Skip for now — go to dashboard"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
