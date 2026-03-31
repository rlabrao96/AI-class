interface BeforeAfterProps {
  before: { label: string; content: string }
  after: { label: string; content: string }
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
          ❌ {before.label}
        </p>
        <p className="text-sm text-red-800 leading-relaxed">{before.content}</p>
      </div>
      <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
          ✅ {after.label}
        </p>
        <p className="text-sm text-emerald-800 leading-relaxed">{after.content}</p>
      </div>
    </div>
  )
}
