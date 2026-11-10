import { ImageResponse } from 'next/og'
import { days } from '@/lib/bg'
import { fetchState } from '@/lib/data'

// The signed-in user's own streak card. Nothing here is public.
export async function GET() {
  const { profile, stats } = await fetchState()
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #2c7a4b, #14432a)', color: '#fff' }}>
        <div style={{ display: 'flex', fontSize: 56, opacity: 0.85 }}>{profile.display_name}</div>
        <div style={{ display: 'flex', fontSize: 380, fontWeight: 700, lineHeight: 1, color: '#ffb347' }}>{stats.streak}</div>
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 700 }}>{`${days(stats.streak).split(' ')[1]} подред`}</div>
        <div style={{ display: 'flex', fontSize: 44, marginTop: 40, opacity: 0.85 }}>
          {`Общо ${days(stats.activeDays)} с разходка · ${stats.level.name}`}
        </div>
        <div style={{ display: 'flex', fontSize: 40, marginTop: 70, opacity: 0.6 }}>Разходки</div>
      </div>
    ),
    { width: 1080, height: 1080, headers: { 'Cache-Control': 'no-store' } },
  )
}
