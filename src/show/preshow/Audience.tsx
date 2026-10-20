import { useMemo } from 'react'
import { AUDIENCE_SIZE } from './constants.ts'
import { createRng } from './random.ts'

type Kind = 'bare' | 'turban' | 'cap' | 'dupatta' | 'child' | 'wave'

interface Figure {
  kind: Kind
  x: number
  y: number
  w: number
  h: number
  row: number
  rank: number
  wiggleDelay: number
}

const VB_W = 1200
const VB_TOP = 60
const VB_H = 180
const ROW_COUNTS = [34, 38, 40, 44, 44] // back to front, sums to 200 (AUDIENCE_SIZE)
const ROW_COLORS = ['#1c100d', '#150b09', '#0f0706', '#090403', '#040202']

function pickKind(r: number): Kind {
  if (r < 0.3) return 'bare'
  if (r < 0.5) return 'turban'
  if (r < 0.65) return 'cap'
  if (r < 0.8) return 'dupatta'
  if (r < 0.9) return 'child'
  return 'wave'
}

function buildAudience(): Figure[] {
  const rng = createRng(1950)
  const figures: Figure[] = []
  ROW_COUNTS.forEach((count, row) => {
    const scale = 0.55 + row * 0.12 // nearer rows are bigger
    const w = 84 * scale
    const h = 100.8 * scale
    const baseline = 130 + row * 28
    for (let i = 0; i < count; i++) {
      const sz = 0.9 + rng() * 0.2
      figures.push({
        kind: pickKind(rng()),
        x: ((i + 0.25 + rng() * 0.5) / count) * (VB_W + w) - w / 2,
        y: baseline - h * sz + (rng() - 0.5) * 8,
        w: w * sz,
        h: h * sz,
        row,
        rank: 0,
        wiggleDelay: -rng() * 3,
      })
    }
  })
  // seats fill in a scattered order across all rows (seeded Fisher-Yates)
  const order = figures.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  order.forEach((figIndex, rank) => {
    figures[figIndex].rank = rank
  })
  return figures
}

interface AudienceProps {
  /** 0..100 */
  percent: number
  settled: boolean
}

/** Silhouette crowd built from a handful of reusable <symbol>s. Only transform and opacity animate. */
export function Audience({ percent, settled }: AudienceProps) {
  const figures = useMemo(() => buildAudience(), [])
  const visibleCount = Math.round((percent / 100) * AUDIENCE_SIZE)

  return (
    <svg
      className={`audience${settled ? ' audience--settled' : ''}`}
      viewBox={`0 ${VB_TOP} ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        {/* Generic heads-and-shoulders silhouettes, seen from behind. 100 x 120 each. */}
        <symbol id="seat-base" viewBox="0 0 100 120">
          <path d="M8 120 C8 88 28 74 50 74 C72 74 92 88 92 120 Z" />
          <rect x="43" y="58" width="14" height="22" />
        </symbol>
        <symbol id="seat-bare" viewBox="0 0 100 120">
          <use href="#seat-base" />
          <circle cx="50" cy="44" r="19" />
        </symbol>
        <symbol id="seat-turban" viewBox="0 0 100 120">
          <use href="#seat-base" />
          <circle cx="50" cy="46" r="18" />
          <ellipse cx="50" cy="32" rx="25" ry="15" />
          <circle cx="62" cy="22" r="7" />
        </symbol>
        <symbol id="seat-cap" viewBox="0 0 100 120">
          <use href="#seat-base" />
          <circle cx="50" cy="46" r="18" />
          <path d="M29 38 Q50 6 71 38 L71 42 L29 42 Z" />
        </symbol>
        <symbol id="seat-dupatta" viewBox="0 0 100 120">
          <use href="#seat-base" />
          <path d="M26 52 Q24 20 50 20 Q76 20 74 52 L84 92 Q50 80 16 92 Z" />
        </symbol>
        <symbol id="seat-child" viewBox="0 0 100 120">
          <use href="#seat-base" />
          <circle cx="42" cy="46" r="18" />
          <circle cx="76" cy="52" r="11" />
          <path d="M65 78 Q76 60 87 78 Z" />
        </symbol>
        <symbol id="seat-wave" viewBox="0 0 100 120">
          <use href="#seat-base" />
          <circle cx="46" cy="46" r="18" />
          <path d="M72 92 L88 52" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="89" cy="46" r="7" />
        </symbol>
      </defs>

      {ROW_COUNTS.map((_, row) => (
        <g key={row} className={`audience__row audience__row--${row}`} style={{ color: ROW_COLORS[row] }} fill="currentColor">
          {figures
            .filter((f) => f.row === row)
            .map((f) => (
              <g key={f.rank} className={`audience__fig${f.rank < visibleCount ? ' audience__fig--in' : ''}`}>
                <g className={f.kind === 'wave' ? 'audience__wave' : undefined} style={{ animationDelay: `${f.wiggleDelay}s` }}>
                  <use href={`#seat-${f.kind}`} x={f.x} y={f.y} width={f.w} height={f.h} />
                </g>
              </g>
            ))}
        </g>
      ))}
    </svg>
  )
}
