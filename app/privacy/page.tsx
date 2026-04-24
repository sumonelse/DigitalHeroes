import { Navigation } from '@/components/features/home/Navigation'
import { Footer } from '@/components/features/home/Footer'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="mesh-bg noise min-h-screen">
      <Navigation />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-display text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-6">
            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-white/60">
                We collect information you provide when creating an account, including your name, email address, and payment information. 
                We also collect golf scores you enter for prize draw eligibility.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-white/60">
                Your information is used to: provide our services, process payments, determine prize draw eligibility, 
                communicate with you about your account, and comply with legal obligations.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">3. Data Sharing</h2>
              <p className="text-white/60">
                We share your data with: payment processors (for subscription handling), our charity partners 
                (only your chosen charity receives your contribution), and when required by law.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">4. Data Security</h2>
              <p className="text-white/60">
                We use industry-standard security measures to protect your data. All payment information is encrypted. 
                However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">5. Your Rights</h2>
              <p className="text-white/60">
                Under GDPR and UK data protection laws, you have the right to access, correct, or delete your personal data. 
                You can export your data or request deletion by contacting support@digitalheroes.co.in
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">6. Cookies</h2>
              <p className="text-white/60">
                We use cookies to maintain your login session and improve your experience. You can disable cookies 
                in your browser settings, but this may affect functionality.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">7. Third-Party Services</h2>
              <p className="text-white/60">
                We use Supabase for authentication and database, Stripe for payments, and other service providers. 
                Each provider has their own privacy policies governing their data handling.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">8. Changes to This Policy</h2>
              <p className="text-white/60">
                We may update this policy periodically. We will notify you of any material changes via email 
                or through the platform. Your continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="glass rounded-card p-6">
              <h2 className="text-white font-semibold mb-3">9. Contact</h2>
              <p className="text-white/60">
                If you have questions about this Privacy Policy, please contact us at support@digitalheroes.co.in
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}