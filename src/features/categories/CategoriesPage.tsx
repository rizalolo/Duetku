import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useCategories } from './useCategories'
import { CategoryFormSheet } from './CategoryFormSheet'
import type { Category } from '../../types'

function Section({
  title,
  items,
  onEdit,
  onDelete,
}: {
  title: string
  items: Category[]
  onEdit: (c: Category) => void
  onDelete: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <div className="mb-6">
      <p className="text-sm text-text-muted mb-2">{title}</p>
      <div className="flex flex-col gap-2">
        {items.map((c) => (
          <button
            key={c.id}
            onClick={() => onEdit(c)}
            className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 text-left"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
              style={{ backgroundColor: c.color + '33' }}
            >
              {c.icon}
            </div>
            <p className="flex-1 text-sm font-medium truncate">{c.name}</p>
            <span className="text-text-muted p-1.5">
              <Pencil className="w-4 h-4" />
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                onDelete(c.id)
              }}
              className="text-text-muted p-1.5"
            >
              <Trash2 className="w-4 h-4" />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function CategoriesPage() {
  const { categories, deleteCategory, addCategory, updateCategory } = useCategories()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const needs = categories.filter((c) => c.type === 'expense' && c.group === 'needs')
  const wants = categories.filter((c) => c.type === 'expense' && c.group === 'wants')
  const income = categories.filter((c) => c.type === 'income')

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setSheetOpen(true)
  }

  async function handleDelete(id: string) {
    if (confirm('Hapus kategori ini? Transaksi lama yang memakainya tidak akan terhapus.')) {
      await deleteCategory(id)
    }
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Kategori</h1>
        <button
          onClick={openCreate}
          className="w-9 h-9 rounded-full bg-brand text-bg flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <Section title="Kebutuhan" items={needs} onEdit={openEdit} onDelete={handleDelete} />
      <Section title="Keinginan" items={wants} onEdit={openEdit} onDelete={handleDelete} />
      <Section title="Pemasukan" items={income} onEdit={openEdit} onDelete={handleDelete} />

      {sheetOpen && (
        <CategoryFormSheet
          open
          onClose={() => setSheetOpen(false)}
          initial={editing ?? undefined}
          onSubmit={async (payload) => {
            if (editing) await updateCategory(editing.id, payload)
            else await addCategory(payload)
          }}
        />
      )}
    </div>
  )
}
