import Link from 'next/link'
import { Navigation } from '@/components/features/home/Navigation'
import { Footer } from '@/components/features/home/Footer'

export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <div className="mesh-bg noise min-h-screen">
      <Navigation />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              About Digital Heroes
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Golf with purpose. Play for prizes. Make a difference.
            </p>
          </div>

          <div className="space-y-8">
            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-white/60 leading-relaxed">
                Digital Heroes was created with a simple goal: make golf more engaging while giving back to causes that matter. 
                Every month, golfers around the world enter their scores, compete for real prizes, and simultaneously 
                support charities they care about.
              </p>
            </section>

            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-2xl font-bold mb-4">How It Works</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Participants subscribe monthly and choose a charity to support. Each month, they enter their best 5 Stableford scores. 
                These scores become their "numbers" in the monthly prize draw. Match 3+ numbers and win a prize from the pool. 
                At least 10% of every subscription goes to charity.
              </p>
              <Link href="/how-it-works" className="btn-secondary text-sm">Learn More →</Link>
            </section>

            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-2xl font-bold mb-4">Why Ireland & UK</h2>
              <p className="text-white/60 leading-relaxed">
                Golf is more than a sport here — it's a way of life. We wanted to create something that celebrates that passion 
                while making a real impact. Working with Irish and UK charities means your contributions stay local, where you can see the difference.
              </p>
            </section>

            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-2xl font-bold mb-4">Transparency</h2>
              <p className="text-white/60 leading-relaxed">
                We believe in complete transparency. Prize pools are calculated directly from active subscribers. 
                Charity contributions are tracked and reported. Every draw is verified. 
                No hidden fees, no unclear math — just golf, prizes, and giving.
              </p>
            </section>

            <section className="glass rounded-card p-8">
              <h2 className="text-white font-display text-2xl font-bold mb-4">Join Us</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Whether you're a scratch golfer or just love the game, there's a place for you here. 
                Sign up today and start turning your scores into something meaningful.
              </p>
              <Link href="/signup" className="btn-gold text-sm">Get Started →</Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}