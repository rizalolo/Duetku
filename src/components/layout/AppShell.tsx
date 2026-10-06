import { NavLink, Outlet } from 'react-router-dom'
import { Home, Wallet, PieChart, BarChart3, Menu } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Beranda', icon: Home, end: true },
  { to: '/akun', label: 'Akun', icon: Wallet, end: false },
  { to: '/ikhtisar', label: 'Ikhtisar', icon: PieChart, end: false },
  { to: '/anggaran', label: 'Anggaran', icon: BarChart3, end: false },
  { to: '/lainnya', label: 'Lainnya', icon: Menu, end: false },
]

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-20 safe-top">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-border safe-bottom">
        <div className="max-w-lg mx-auto grid grid-cols-5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs ${
                  isActive ? 'text-brand' : 'text-text-muted'
                }`
              }
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
