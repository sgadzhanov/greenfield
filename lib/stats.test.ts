import test from 'node:test'
import assert from 'node:assert/strict'
import { addDays, computeStats, todayIn, weekStart } from './stats.ts'

// 2026-11-02 is a Monday.
const run = (from: string, n: number) => Array.from({ length: n }, (_, i) => addDays(from, i))

test('date helpers', () => {
  assert.equal(addDays('2026-02-28', 1), '2026-03-01')
  assert.equal(addDays('2026-01-01', -1), '2025-12-31')
  assert.equal(weekStart('2026-11-08'), '2026-11-02') // Sunday belongs to the week that started Monday
  assert.equal(weekStart('2026-11-02'), '2026-11-02')
  assert.equal(todayIn('Europe/Sofia', new Date('2026-11-10T22:30:00Z')), '2026-11-11')
  assert.equal(todayIn('America/New_York', new Date('2026-11-10T03:00:00Z')), '2026-11-09')
})

test('no walks', () => {
  const s = computeStats([], '2026-11-10')
  assert.deepEqual([s.streak, s.longest, s.activeDays, s.freezes, s.points], [0, 0, 0, 0, 0])
  assert.equal(s.walkedToday, false)
  assert.equal(s.badges.filter((b) => b.earned).length, 0)
})

test('today without a walk does not break the streak', () => {
  const s = computeStats(run('2026-11-07', 3), '2026-11-10')
  assert.equal(s.streak, 3)
  assert.equal(s.walkedToday, false)
  assert.equal(computeStats(run('2026-11-07', 4), '2026-11-10').streak, 4)
})

test('duplicate dates count once', () => {
  const s = computeStats(['2026-11-10', '2026-11-10'], '2026-11-10')
  assert.deepEqual([s.streak, s.activeDays, s.points], [1, 1, 10])
})

test('missed day without a freeze resets, longest is kept', () => {
  const s = computeStats([...run('2026-11-02', 3), '2026-11-06'], '2026-11-06')
  assert.deepEqual([s.streak, s.longest, s.activeDays], [1, 3, 4])
  assert.deepEqual(s.frozen, [])
})

test('7th streak day earns a freeze; a missed day spends it and the streak survives without growing', () => {
  const days = [...run('2026-11-02', 7), '2026-11-10'] // Mon..Sun, skip Mon 9th, walk Tue 10th
  const s = computeStats(days, '2026-11-10')
  assert.equal(s.streak, 8)
  assert.deepEqual(s.frozen, ['2026-11-09'])
  assert.equal(s.freezes, 0)
  assert.equal(s.activeDays, 8)
  assert.equal(computeStats(run('2026-11-02', 7), '2026-11-08').freezes, 1)
})

test('freeze bank is capped at 2 and a longer gap still breaks the streak', () => {
  const s = computeStats(run('2026-10-01', 21), '2026-10-21')
  assert.equal(s.freezes, 2)
  const broken = computeStats(run('2026-10-01', 21), '2026-10-25') // missed 22, 23, 24
  assert.equal(broken.streak, 0)
  assert.deepEqual(broken.frozen, ['2026-10-22', '2026-10-23'])
  assert.equal(broken.longest, 21)
})

test('points: 10 per day, milestone bonus, weekly challenge bonus', () => {
  // Week of 2026-11-02 → challenge index is fixed by the calendar; 7/7 days completes any challenge.
  const s = computeStats(run('2026-11-02', 7), '2026-11-08')
  assert.equal(s.points, 70 + 50 + 50)
  assert.equal(s.challenge.done, true)
  assert.equal(s.challenge.progress, s.challenge.target)
  assert.equal(s.level.name, 'Новак')
})

test('weekly challenge rotates through all four and tracks progress', () => {
  const titles = new Set([0, 7, 14, 21].map((o) => computeStats([], addDays('2026-11-02', o)).challenge.title))
  assert.equal(titles.size, 4)
  const s = computeStats([], '2026-11-04')
  assert.deepEqual([s.challenge.progress, s.challenge.done], [0, false])
})

test('badges', () => {
  const earned = (days: string[], today: string, km = 0) =>
    computeStats(days, today, km).badges.filter((b) => b.earned).map((b) => b.id)
  assert.deepEqual(earned(['2026-11-10'], '2026-11-10'), ['first'])
  const week = earned(run('2026-11-02', 7), '2026-11-08')
  for (const id of ['first', 'streak3', 'streak7', 'weekend']) assert.ok(week.includes(id), id)
  assert.ok(!week.includes('streak14'))
  assert.ok(earned(['2026-10-01', '2026-10-09'], '2026-10-09').includes('comeback')) // 7 missed days
  assert.ok(!earned(['2026-10-01', '2026-10-08'], '2026-10-08').includes('comeback')) // 6 missed days
  assert.ok(earned(['2026-11-10'], '2026-11-10', 42.2).includes('marathon'))
  assert.ok(earned(run('2026-01-01', 10), '2026-01-10').includes('days10'))
})
