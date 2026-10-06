import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('Gagal masuk. Coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-14 h-14 rounded-2xl bg-brand-soft flex items-center justify-center mb-6">
        <Wallet className="w-7 h-7 text-brand" strokeWidth={2} />
      </div>
      <h1 className="text-2xl font-semibold mb-2">Keuangan</h1>
      <p className="text-text-muted text-center mb-10 max-w-xs">
        Catatan keuangan pribadi kamu, tersinkron lewat akun Google.
      </p>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full max-w-xs flex items-center justify-center gap-3 bg-surface-raised border border-border rounded-xl py-3.5 font-medium hover:bg-surface transition-colors disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? 'Menyambungkan...' : 'Masuk dengan Google'}
      </button>
      {error && <p className="text-expense text-sm mt-4">{error}</p>}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  )
}
