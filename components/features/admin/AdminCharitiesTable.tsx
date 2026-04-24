'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { adminCreateCharity, adminUpdateCharity, adminDeleteCharity } from '@/app/actions/admin'

type CharityRow = {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  category: string | null
  website_url: string | null
  status: string
  featured_order: number | null
  total_raised_gbp: number
  supporter_count: number
}

export function AdminCharitiesTable({ charities: initialCharities }: { charities: CharityRow[] }) {
  const [charities, setCharities] = useState(initialCharities)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this charity?')) return
    setLoading(true)
    const result = await adminDeleteCharity(id)
    setMsg(result.success ? 'Charity deactivated.' : `Error: ${result.error}`)
    setLoading(false)
    setTimeout(() => { setMsg(''); window.location.reload() }, 2000)
  }

  return (
    <div className="space-y-6">
      {msg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-emerald/10 text-emerald">
          {msg}
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-white/40">{charities.length} charities</div>
        <button onClick={() => setShowForm(true)} className="btn-primary py-2.5 px-5 text-sm">
          + Add Charity
        </button>
      </div>

      <div className="glass rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Charity', 'Category', 'Status', 'Featured', 'Raised', 'Supporters', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {charities.map((charity, i) => (
                <motion.tr
                  key={charity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{charity.name}</div>
                    <div className="text-xs text-white/40">{charity.slug}</div>
                  </td>
                  <td className="px-5 py-4 text-white/50">{charity.category ?? '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      charity.status === 'active' ? 'bg-emerald/10 text-emerald' :
                      charity.status === 'featured' ? 'bg-gold/10 text-gold' :
                      'bg-white/5 text-white/40'
                    }`}>
                      {charity.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/40">{charity.featured_order ?? '—'}</td>
                  <td className="px-5 py-4 text-emerald font-medium">₹{charity.total_raised_gbp.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4 text-white/50">{charity.supporter_count}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {charity.website_url && (
                        <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-white">Visit</a>
                      )}
                      {charity.status !== 'inactive' && (
                        <button onClick={() => handleDelete(charity.id)} className="text-xs text-rose/60 hover:text-rose">Deactivate</button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {charities.length === 0 && (
          <div className="text-center py-16 text-white/30">No charities found.</div>
        )}
      </div>

      {/* Add Charity Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-card p-6 w-full max-w-lg">
            <h2 className="font-display text-xl font-bold text-white mb-5">Add Charity</h2>
            <form action={async (formData) => {
              const result = await adminCreateCharity(formData)
              if (result.success) {
                setShowForm(false)
                window.location.reload()
              } else {
                alert(result.error)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">Name *</label>
                <input name="name" required className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Category</label>
                <input name="category" className="input-field" placeholder="e.g. Health, Education" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Short Description</label>
                <input name="short_description" className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Website URL</label>
                <input name="website_url" type="url" className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Description</label>
                <textarea name="description" className="input-field h-24" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Featured Order</label>
                <input name="featured_order" type="number" className="input-field w-24" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary py-2.5 px-5">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-2.5 px-5">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}