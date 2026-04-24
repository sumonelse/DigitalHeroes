import { Navigation } from '@/components/features/home/Navigation'
import { Footer } from '@/components/features/home/Footer'

export const metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="mesh-bg noise min-h-screen">
      <Navigation />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-display text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-6">
            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-white/60">
                By accessing and using Digital Heroes, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">2. Subscription & Payments</h2>
              <p className="text-white/60">
                Subscriptions are billed monthly or annually. You can cancel anytime. Your access continues until the end of your billing period. 
                Refunds are not available for partial billing periods.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">3. Prize Draws</h2>
              <p className="text-white/60">
                Prize draws occur monthly. To enter, you must have an active subscription and submit at least 5 Stableford scores 
                during the qualifying period. Prizes are awarded based on number matches with the drawn numbers.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">4. Charity Contributions</h2>
              <p className="text-white/60">
                A minimum of 10% of your subscription fee goes to your chosen charity. Digital Heroes provides a summary of 
                contributions but does not guarantee specific charity outcomes.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">5. Account Responsibilities</h2>
              <p className="text-white/60">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept 
                responsibility for all activities that occur under your account.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">6. Limitation of Liability</h2>
              <p className="text-white/60">
                Digital Heroes is provided "as is" without warranties of any kind. We are not liable for any 
                indirect, incidental, or consequential damages.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">7. Governing Law</h2>
              <p className="text-white/60">
                These terms shall be governed by and construed in accordance with the laws of Ireland and the UK.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">8. Contact</h2>
              <p className="text-white/60">
                If you have any questions about these Terms, please contact us at support@digitalheroes.co.in
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}