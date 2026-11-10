export function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} className="mt-3 h-3 overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  )
}
