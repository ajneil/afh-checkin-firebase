export const DEFAULT_TIME_ZONE = 'Europe/London'

export function isValidTimeZone(zone: string): boolean {
  if (!zone || zone.length > 64) return false
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

/** Calendar day (YYYY-MM-DD) and hour for `now` in the person's own zone. */
export function localTime(now: Date, timeZone: string): { day: string; hour: number } {
  const zone = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) }
}
