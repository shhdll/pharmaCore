/* eslint-disable no-unused-vars */
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check, Search, X } from 'lucide-react'

export function Card({ children, className = '' }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={`rounded-2xl border border-white/50 bg-white/75 p-4 shadow-panel backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    info: 'bg-pharmagreen-100 text-pharmagreen-600 dark:bg-pharmagreen-900/40 dark:text-pharmagreen-100',
  }

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function StatCard({ title, value, trend, icon: Icon }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
        <Icon size={18} className="text-pharmagreen-500" />
      </div>
      <p className="text-3xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{trend}</p>
    </Card>
  )
}

export function SearchBar({ placeholder }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70">
      <Search size={16} className="text-slate-400" />
      <input className="w-full bg-transparent text-sm outline-none" placeholder={placeholder} />
    </label>
  )
}

export function Table({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100/70 dark:bg-slate-800/80">
          <tr>{columns.map((col) => <th key={col} className="px-4 py-3 font-medium">{col}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border-t border-slate-100/80 hover:bg-pharmagreen-50/60 dark:border-slate-700/60 dark:hover:bg-pharmagreen-900/20">
              {row.cells.map((cell, index) => <td key={index} className="px-4 py-3">{cell}</td>)}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Timeline({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-pharmagreen-500" />
          <div>
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.meta}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityFeed({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-200/70 bg-white/70 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/50">
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
        </div>
      ))}
    </div>
  )
}

export function ChartPlaceholder({ bars }) {
  return (
    <div className="flex h-28 items-end gap-2 rounded-xl bg-gradient-to-b from-pharmagreen-100/60 to-transparent p-3 dark:from-pharmagreen-900/40">
      {bars.map((bar, index) => <div key={index} style={{ height: `${bar}%` }} className="w-full rounded-md bg-pharmagreen-500/75" />)}
    </div>
  )
}

export function Modal({ title, open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-6">
          <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.98 }} className="w-full max-w-xl rounded-2xl border border-white/40 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button onClick={onClose}><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-700/50" />
}

export function CommandPalette({ open, onClose, setRole, toggleDarkMode }) {
  return (
    <Modal title="Command Palette" open={open} onClose={onClose}>
      <div className="space-y-2 text-sm">
        {[
          { label: 'Switch to Admin', action: () => setRole('Admin') },
          { label: 'Switch to Pharmacist', action: () => setRole('Pharmacist') },
          { label: 'Switch to Patient', action: () => setRole('Patient') },
          { label: 'Toggle dark mode', action: toggleDarkMode },
        ].map((cmd) => (
          <button key={cmd.label} onClick={() => { cmd.action(); onClose() }} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            {cmd.label}
          </button>
        ))}
      </div>
    </Modal>
  )
}

export function ToastStack({ items, dismiss }) {
  useEffect(() => {
    const timers = items.map((toast) => setTimeout(() => dismiss(toast.id), 3000))
    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [items, dismiss])

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2">
      <AnimatePresence>
        {items.map((toast) => (
          <motion.div key={toast.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} className="w-80 rounded-xl border border-white/60 bg-white/90 p-3 shadow-lg dark:border-white/10 dark:bg-slate-900/90">
            <div className="flex items-start gap-2">
              <Bell size={16} className="mt-1 text-pharmagreen-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{toast.text}</p>
              </div>
              <button onClick={() => dismiss(toast.id)}><Check size={15} /></button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
