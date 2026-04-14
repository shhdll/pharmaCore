/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'
import { MoonStar, LogOut, Sun } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { SearchBar } from '../components/ui'
import { users } from '../data/users'
import logo from '../assets/logo.png'

/* ---------------- SIDEBAR ---------------- */

export function Sidebar({ role, navItems = [] }) {
  return (
    <aside
      className="
        fixed left-0 top-0 z-30 h-screen w-[260px]
        hidden md:flex md:flex-col
        border-r border-white/40
        bg-gradient-to-b from-white/90 to-pharmagreen-50/60
        p-5 backdrop-blur-xl
        dark:border-white/10 dark:from-slate-900/95 dark:to-pharmagreen-900/20
      "
    >
      <div className="mb-8 rounded-2xl border border-white/60 bg-white/80 p-3 dark:border-white/10 dark:bg-slate-800/70">
        <img src={logo} alt="PharmaCore" className="h-20 w-full object-contain" />
      </div>

      <div className="mb-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-pharmagreen-500 text-white'
                  : 'hover:bg-white/70 dark:hover:bg-slate-800'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto rounded-xl bg-white/70 p-3 text-xs dark:bg-slate-800/70">
        Signed in as {users.find((u) => u.role === role)?.name || role}
      </div>
    </aside>
  )
}

/* ---------------- TOPBAR ---------------- */

export function Topbar({ role, toggleDarkMode, darkMode, onToast, onLogout }) {
  return (
    <header
      className="
        sticky top-0 z-20 mb-5 flex items-center justify-between gap-3
        rounded-2xl border border-white/60
        bg-white/70 p-4 shadow-sm backdrop-blur-xl
        dark:border-white/10 dark:bg-slate-900/70
      "
    >
      {/* mobile menu placeholder */}
      <button className="md:hidden rounded-xl border px-3 py-2 text-sm">
        Menu
      </button>

      <div className="w-full max-w-[420px]">
        <SearchBar placeholder={`Search ${role} workspace`} />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="rounded-xl border p-2 dark:border-slate-700"
        >
          {darkMode ? <Sun size={16} /> : <MoonStar size={16} />}
        </button>

        <button
          onClick={onToast}
          className="rounded-xl border p-2 dark:border-slate-700"
        >
          Alerts
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm dark:border-slate-700"
        >
          <LogOut size={14} /> Logout
        </button>

        <div className="grid h-9 w-9 place-items-center rounded-full bg-pharmagreen-500 text-sm font-semibold text-white">
          {role?.[0] || 'U'}
        </div>
      </div>
    </header>
  )
}

/* ---------------- BACKGROUND ---------------- */

export function AppBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-br from-white via-emerald-50/70 to-pharmagreen-500/10 dark:from-slate-950 dark:via-slate-900 dark:to-pharmagreen-900/30" />

      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 24, repeat: Infinity }}
        className="pointer-events-none fixed -right-20 top-10 -z-10 h-96 w-96 rounded-full bg-pharmagreen-500/20 blur-[120px]"
      />

      <motion.div
        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity }}
        className="pointer-events-none fixed bottom-0 left-64 -z-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-[100px]"
      />
    </>
  )
}