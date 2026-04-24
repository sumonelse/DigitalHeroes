import Link from 'next/link'
import { Navigation } from '@/components/features/home/Navigation'
import { Footer } from '@/components/features/home/Footer'

export const metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <div className="mesh-bg noise min-h-screen">
      <Navigation />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-xl font-bold mb-4">General Inquiries</h2>
              <p className="text-white/60 mb-6">
                For general questions about Digital Heroes, subscriptions, or how the platform works.
              </p>
              <a href="mailto:hello@digitalheroes.co.in" className="text-emerald hover:underline">
                hello@digitalheroes.co.in
              </a>
            </section>

            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-xl font-bold mb-4">Support</h2>
              <p className="text-white/60 mb-6">
                Need help with your account, scores, or have a technical issue? We're here to help.
              </p>
              <a href="mailto:support@digitalheroes.co.in" className="text-emerald hover:underline">
                support@digitalheroes.co.in
              </a>
            </section>

            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-xl font-bold mb-4">Partnerships</h2>
              <p className="text-white/60 mb-6">
                Interested in partnering with Digital Heroes or featuring your charity? Let's talk.
              </p>
              <a href="mailto:partners@digitalheroes.co.in" className="text-emerald hover:underline">
                partners@digitalheroes.co.in
              </a>
            </section>

            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-xl font-bold mb-4">Press</h2>
              <p className="text-white/60 mb-6">
                For media inquiries, press releases, or interview requests.
              </p>
              <a href="mailto:press@digitalheroes.co.in" className="text-emerald hover:underline">
                press@digitalheroes.co.in
              </a>
            </section>
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/40">
              We typically respond within 24-48 hours.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}