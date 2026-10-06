interface PlaceholderPageProps {
  title: string
  note: string
}

export function PlaceholderPage({ title, note }: PlaceholderPageProps) {
  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-semibold mb-4">{title}</h1>
      <div className="bg-surface border border-border rounded-2xl p-5 text-sm text-text-muted">
        {note}
      </div>
    </div>
  )
}
