import { Navigation } from '@/components/features/home/Navigation'
import { Footer } from '@/components/features/home/Footer'
import { HowItWorks } from '@/components/features/home/HowItWorks'

export const metadata = { title: 'How It Works' }

export default function HowItWorksPage() {
  return (
    <div className="mesh-bg noise min-h-screen">
      <Navigation />
      <main>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}