'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ShareButton() {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle')

  async function share() {
    setState('busy')
    try {
      const res = await fetch('/share/card')
      if (res.redirected) return router.push('/login') // session expired
      if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) throw new Error(String(res.status))
      const file = new File([await res.blob()], 'razhodki.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Разходки' }).catch(() => {}) // user closed the sheet
      } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(file)
        link.download = file.name
        link.click()
        URL.revokeObjectURL(link.href)
      }
      setState('idle')
    } catch {
      setState('failed')
    }
  }

  return (
    <>
      <button className="btn w-full" onClick={share} disabled={state === 'busy'}>
        {state === 'busy' ? 'Момент…' : 'Сподели серията си'}
      </button>
      {state === 'failed' && <p role="alert" className="text-sm font-medium text-danger">Не успяхме да създадем картичката. Опитай пак.</p>}
    </>
  )
}
