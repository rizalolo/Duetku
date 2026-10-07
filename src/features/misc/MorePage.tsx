import { Link } from 'react-router-dom'
import { Tag, LogOut, ChevronRight, Moon, Sun } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../settings/ThemeContext'
import { ExportButton } from './ExportButton'
import { ImportButton } from './ImportButton'

export function MorePage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-semibold mb-6">Lainnya</h1>

      <div className="flex items-center gap-3 mb-6">
        {user?.photoURL && (
          <img src={user.photoURL} alt="" className="w-11 h-11 rounded-full" referrerPolicy="no-referrer" />
        )}
        <div>
          <p className="font-medium">{user?.displayName}</p>
          <p className="text-sm text-text-muted">{user?.email}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-text-muted mb-2">Tampilan</p>
        <div className="flex bg-surface border border-border rounded-xl p-1">
          {([
            { value: 'dark' as const, label: 'Gelap', icon: Moon },
            { value: 'light' as const, label: 'Terang', icon: Sun },
          ]).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                theme === value ? 'bg-brand text-bg font-semibold' : 'text-text-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <Link
          to="/kategori"
          className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4"
        >
          <Tag className="w-5 h-5 text-text-muted" />
          <span className="flex-1 text-sm font-medium">Kategori</span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <ExportButton />
        <ImportButton />
      </div>

      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 text-expense text-sm font-medium px-4 py-3"
      >
        <LogOut className="w-4 h-4" />
        Keluar
      </button>
    </div>
  )
}
