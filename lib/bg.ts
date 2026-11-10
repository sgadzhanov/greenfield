// Bulgarian wording helpers. Pure, shared with the future mobile app.
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
export const days = (n: number) => plural(n, 'ден', 'дни')

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('bg-BG', { timeZone: 'UTC', ...opts })
const at = (day: string) => new Date(day + 'T00:00:00Z')
export const monthTitle = (month: string) => fmt({ month: 'long', year: 'numeric' }).format(at(month + '-01'))
export const dayTitle = (day: string) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(at(day))
