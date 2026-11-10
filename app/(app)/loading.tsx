export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Зареждане" className="flex animate-pulse flex-col gap-4">
      <div className="h-8 w-1/2 rounded-xl bg-line" />
      <div className="h-72 rounded-3xl bg-line" />
      <div className="h-28 rounded-3xl bg-line" />
    </div>
  )
}
