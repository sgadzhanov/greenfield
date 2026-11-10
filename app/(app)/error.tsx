'use client'

import { logout } from './actions'

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card mt-10 flex flex-col gap-4 text-center">
      <p className="text-5xl">🌧️</p>
      <h1 className="text-xl font-bold">Нещо се обърка</h1>
      <p className="text-muted">Не успяхме да заредим или запишем данните. Нищо не е запазено наполовина.</p>
      <button className="btn" onClick={reset}>Опитай пак</button>
      {/* Way out if the account itself is the problem (for example it was deleted). */}
      <form action={logout}>
        <button className="min-h-11 text-sm font-semibold text-muted">Изход от профила</button>
      </form>
    </div>
  )
}
