import { useRef, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import { useCategories } from '../categories/useCategories'
import { useWallets } from '../wallets/useWallets'
import { useTransactions } from '../transactions/useTransactions'
import { parseImportRows, type ImportResult } from '../../lib/importExcel'

interface ImportSheetProps {
  onClose: () => void
}

export function ImportSheet({ onClose }: ImportSheetProps) {
  const { categories } = useCategories()
  const { wallets } = useWallets()
  const { addTransaction } = useTransactions()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setFileName(file.name)
    setParsing(true)
    setError(null)
    setResult(null)
    setDone(null)
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { cellDates: true })
      const sheetName = wb.SheetNames.find((n) => n.toLowerCase() === 'transaksi') ?? wb.SheetNames[0]
      const sheet = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
      setResult(parseImportRows(rows, categories, wallets))
    } catch (err) {
      console.error(err)
      setError('Gagal membaca file. Pastikan ini file .xlsx yang valid.')
    } finally {
      setParsing(false)
    }
  }

  async function handleImport() {
    if (!result || result.valid.length === 0) return
    setImporting(true)
    setError(null)
    try {
      for (const tx of result.valid) {
        await addTransaction(tx)
      }
      setDone(result.valid.length)
    } catch (err) {
      console.error(err)
      setError('Sebagian data gagal disimpan. Coba impor ulang untuk sisanya.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Sheet open onClose={onClose} title="Impor dari Excel">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">
          File .xlsx dengan kolom Tanggal, Jam, Tipe, Kategori, Dompet, Jumlah, Deskripsi — format
          yang sama seperti hasil "Ekspor ke Excel". Nama kategori & dompet harus sama persis
          dengan yang ada di aplikasi.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-border rounded-xl py-6 text-sm text-text-muted"
        >
          {fileName ?? 'Ketuk untuk pilih file .xlsx'}
        </button>

        {parsing && <p className="text-sm text-text-muted">Membaca file...</p>}

        {result && done === null && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-4 text-sm">
              <span className="text-income">{result.valid.length} baris siap diimpor</span>
              {result.errors.length > 0 && (
                <span className="text-expense">{result.errors.length} baris dilewati</span>
              )}
            </div>
            {result.errors.length > 0 && (
              <div className="bg-surface-raised border border-border rounded-xl p-3 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-text-muted">
                    Baris {e.row}: {e.reason}
                  </p>
                ))}
              </div>
            )}
            {result.valid.length > 0 && (
              <Button onClick={handleImport} disabled={importing} className="w-full">
                {importing ? 'Mengimpor...' : `Impor ${result.valid.length} transaksi`}
              </Button>
            )}
          </div>
        )}

        {done !== null && <p className="text-income text-sm">{done} transaksi berhasil diimpor.</p>}
        {error && <p className="text-expense text-sm">{error}</p>}
      </div>
    </Sheet>
  )
}
