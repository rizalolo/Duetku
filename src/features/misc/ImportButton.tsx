import { useState } from 'react'
import { Upload } from 'lucide-react'
import { ImportSheet } from './ImportSheet'

export function ImportButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-surface border border-border rounded-xl p-4 text-left"
      >
        <Upload className="w-5 h-5 text-text-muted" />
        <span className="flex-1 text-sm font-medium">Impor dari Excel</span>
      </button>
      {open && <ImportSheet onClose={() => setOpen(false)} />}
    </>
  )
}
