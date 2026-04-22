import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Digital Heroes — Golf With Purpose', template: '%s | Digital Heroes' },
  description: 'Play golf, win prizes, change lives. The platform where every score supports charity.',
  keywords: ['golf', 'charity', 'prize draw', 'stableford', 'subscription'],
  authors: [{ name: 'Digital Heroes', url: 'https://digitalheroes.co.in' }],
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://digitalheroes.co.in',
    siteName: 'Digital Heroes',
    title: 'Digital Heroes — Golf With Purpose',
    description: 'Play golf, win prizes, change lives.',
  },
  twitter: { card: 'summary_large_image', title: 'Digital Heroes', description: 'Golf with purpose.' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-void text-white antialiased selection:bg-emerald/30 selection:text-emerald">
        {children}
      </body>
    </html>
  )
}
