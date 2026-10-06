import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { LoginPage } from './features/auth/LoginPage'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './features/transactions/HomePage'
import { WalletsPage } from './features/wallets/WalletsPage'
import { CategoriesPage } from './features/categories/CategoriesPage'
import { AnggaranHutangPage } from './features/budgets/AnggaranHutangPage'
import { AnalyticsPage } from './features/analytics/AnalyticsPage'
import { MorePage } from './features/misc/MorePage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-muted text-sm">
        Memuat...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Router() {
  const { user, loading } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!loading && user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/akun" element={<WalletsPage />} />
          <Route path="/ikhtisar" element={<AnalyticsPage />} />
          <Route path="/anggaran" element={<AnggaranHutangPage defaultTab="anggaran" />} />
          <Route path="/lainnya" element={<MorePage />} />
          <Route path="/kategori" element={<CategoriesPage />} />
          <Route path="/hutang" element={<AnggaranHutangPage defaultTab="hutang" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

export default App
