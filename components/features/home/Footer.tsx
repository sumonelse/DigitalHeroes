'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="container-hero">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="font-display text-xl font-bold text-white mb-1">Digital Heroes</div>
            <div className="text-xs font-semibold tracking-widest text-emerald uppercase mb-4">Golf With Purpose</div>
            <p className="text-white/40 text-sm leading-relaxed">
              Turning golf scores into charity impact, every single month.
            </p>
          </div>
          {[
            { title: 'Platform', links: [['How It Works', '/how-it-works'], ['Charities', '/charities'], ['Monthly Draws', '/draws'], ['Pricing', '/pricing']] },
            { title: 'Account', links: [['Sign Up', '/signup'], ['Sign In', '/login'], ['Dashboard', '/dashboard'], ['Settings', '/settings']] },
            { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms']] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-white/40 text-sm hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Digital Heroes · digitalheroes.co.in · All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Built for Irish & UK golfers with ❤️ for charity
          </p>
        </div>
      </div>
    </footer>
  )
}
