import { useState, type FormEvent } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import type { Category, CategoryGroup, TransactionType } from '../../types'

const ICON_GROUPS: { label: string; icons: string[] }[] = [
  { label: 'Umum', icons: ['🏷️', '❔', '✨', '➕', '📌', '⭐'] },
  { label: 'Makan & Minum', icons: ['🍚', '🍜', '🍔', '🍕', '🍗', '🍱', '☕', '🧋', '🍰', '🍺', '🥗', '🍳'] },
  { label: 'Belanja', icons: ['🛍️', '👕', '👟', '👜', '💄', '🛒', '🎁', '📦'] },
  { label: 'Transportasi', icons: ['🚌', '🚗', '🏍️', '⛽', '🚕', '🚆', '✈️', '🅿️', '🚲'] },
  { label: 'Tagihan & Rumah', icons: ['🏠', '💡', '📶', '📱', '🔧', '🧹', '🧺', '🪑', '🗑️'] },
  { label: 'Kesehatan', icons: ['💊', '🏥', '🩺', '🦷', '🧘', '🏃', '💉'] },
  { label: 'Pendidikan', icons: ['📚', '🎓', '✏️', '🏫', '💻'] },
  { label: 'Hiburan', icons: ['🎮', '🎬', '🎵', '🎤', '⚽', '🎨', '🎉', '📺'] },
  { label: 'Keuangan & Kerja', icons: ['💼', '💰', '💸', '🏦', '📈', '🧾', '💳'] },
  { label: 'Keluarga & Hewan', icons: ['👨‍👩‍👧', '🐶', '🐱', '👶', '❤️'] },
  { label: 'Lainnya', icons: ['🙏', '🎂', '🧳', '🛠️', '📮', '🔖'] },
]
const COLOR_OPTIONS = ['#3b82f6', '#34d399', '#fb7185', '#38bdf8', '#fbbf24', '#a78bfa', '#f472b6', '#c084fc', '#f97316', '#94a3b8']

interface CategoryFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: Omit<Category, 'id' | 'createdAt'>) => Promise<void>
  initial?: Category
}

export function CategoryFormSheet({ open, onClose, onSubmit, initial }: CategoryFormSheetProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [group, setGroup] = useState<CategoryGroup>(initial?.group ?? 'needs')
  const [icon, setIcon] = useState(initial?.icon ?? ICON_GROUPS[0].icons[0])
  const [color, setColor] = useState(initial?.color ?? COLOR_OPTIONS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nama kategori wajib diisi')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        type,
        group: type === 'income' ? null : group,
        icon,
        color,
      })
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Edit Kategori' : 'Kategori Baru'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex bg-surface-raised border border-border rounded-xl p-1">
          {(['expense', 'income'] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                type === t ? 'bg-brand text-bg' : 'text-text-muted'
              }`}
            >
              {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm text-text-muted mb-2 block">Nama Kategori</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Olahraga"
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 outline-none focus:border-brand"
          />
        </div>

        {type === 'expense' && (
          <div>
            <label className="text-sm text-text-muted mb-2 block">Kelompok</label>
            <div className="flex bg-surface-raised border border-border rounded-xl p-1">
              {(['needs', 'wants'] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    group === g ? 'bg-surface text-text border border-border' : 'text-text-muted'
                  }`}
                >
                  {g === 'needs' ? 'Kebutuhan' : 'Keinginan'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-text-muted mb-2 flex items-center justify-between">
            <span>Ikon</span>
            <span className="text-lg">{icon}</span>
          </label>
          <div className="max-h-56 overflow-y-auto border border-border rounded-xl p-3 flex flex-col gap-3">
            {ICON_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs text-text-muted mb-1.5">{group.label}</p>
                <div className="flex gap-2 flex-wrap">
                  {group.icons.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setIcon(opt)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border shrink-0 ${
                        icon === opt ? 'border-brand bg-brand-soft' : 'border-border bg-surface-raised'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-text-muted mb-2 block">Warna (untuk grafik)</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-text' : ''}`}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-expense text-sm">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full mt-2">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </Sheet>
  )
}
