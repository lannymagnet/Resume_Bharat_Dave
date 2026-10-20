import { useMemo } from 'react'
import { createRng, mixColor } from './random.ts'

const W = 1200
const H = 800
const PLEATS = 16

const SHADOW: [number, number, number] = [38, 8, 6]
const BASE: [number, number, number] = [122, 31, 26]
const LIGHT: [number, number, number] = [196, 72, 50]

interface Pleat {
  x: number
  w: number
  hi: number
  lit: number
  dur: number
  delay: number
}

function buildPleats(): Pleat[] {
  const rng = createRng(1947)
  const weights = Array.from({ length: PLEATS }, () => 0.7 + rng() * 0.7)
  const total = weights.reduce((s, v) => s + v, 0)
  let x = 0
  return weights.map((wt) => {
    const w = (wt / total) * W
    const pleat = {
      x,
      w,
      hi: 0.3 + rng() * 0.35, // highlight position differs per fold
      lit: 0.55 + rng() * 0.45, // so does highlight strength
      dur: 6 + rng() * 5,
      delay: -rng() * 9,
    }
    x += w
    return pleat
  })
}

/** Closed velvet curtain: layered gradient pleats, cloth grain, shading, gathered edges. All generated, no images. */
export function Curtain() {
  const pleats = useMemo(() => buildPleats(), [])

  return (
    <svg className="curtain" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {pleats.map((p, i) => (
          <linearGradient key={i} id={`pleat-${i}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={mixColor(SHADOW, BASE, 0.1)} />
            <stop offset={p.hi * 0.5} stopColor={mixColor(SHADOW, BASE, 0.7)} />
            <stop offset={p.hi} stopColor={mixColor(BASE, LIGHT, p.lit)} />
            <stop offset={p.hi + (1 - p.hi) * 0.5} stopColor={mixColor(SHADOW, BASE, 0.6)} />
            <stop offset="1" stopColor={mixColor(SHADOW, BASE, 0.0)} />
          </linearGradient>
        ))}
        <linearGradient id="curtain-top" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.65" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0" />
          <stop offset="0.72" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="curtain-vignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
        {/* Cloth texture: stretched noise so the grain runs along the folds */}
        <filter id="velvet" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.006" numOctaves="3" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -0.25" />
        </filter>
        <filter id="velvet-fine" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 0.5 -0.18" />
        </filter>
      </defs>

      <rect width={W} height={H} fill="#2a0806" />
      {pleats.map((p, i) => (
        <g key={i} className="curtain__pleat" style={{ animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
          <rect x={p.x} y={-20} width={p.w + 1} height={H + 40} fill={`url(#pleat-${i})`} />
        </g>
      ))}

      <rect width={W} height={H} filter="url(#velvet)" opacity="0.35" style={{ mixBlendMode: 'multiply' }} />
      <rect width={W} height={H} filter="url(#velvet-fine)" opacity="0.25" />
      <rect width={W} height={H} fill="url(#curtain-top)" />
      <rect width={W} height={H} fill="url(#curtain-vignette)" />
    </svg>
  )
}

/* ---------- Valance (pelmet), zari border, fringe, tassels, tie-backs ---------- */

const VW = 1200
const VH = 190
const SCALLOPS = 8
const SW = VW / SCALLOPS
const JOINT_Y = 96
const CTRL_Y = 204 // quad control point: mid of each scallop reaches y = 150

const GOLD = '#e8b84a'
const GOLD_DEEP = '#a8741a'

interface Fringe {
  x1: number
  y1: number
  x2: number
  y2: number
}

function buildValance() {
  const rng = createRng(2026)
  let outline = `M0 0 H${VW} V${JOINT_Y}`
  let trim = ''
  let trimInner = ''
  const fringe: Fringe[] = []
  for (let i = SCALLOPS - 1; i >= 0; i--) {
    const xs = (i + 1) * SW
    const xe = i * SW
    const cx = i * SW + SW / 2
    outline += ` Q${cx} ${CTRL_Y} ${xe} ${JOINT_Y}`
    trim += `M${xs} ${JOINT_Y} Q${cx} ${CTRL_Y} ${xe} ${JOINT_Y} `
    trimInner += `M${xs - 6} ${JOINT_Y - 8} Q${cx} ${CTRL_Y - 20} ${xe + 6} ${JOINT_Y - 8} `
    for (let k = 1; k < 16; k++) {
      const t = k / 16
      const x = (1 - t) ** 2 * xs + 2 * t * (1 - t) * cx + t ** 2 * xe
      const y = (1 - t) ** 2 * JOINT_Y + 2 * t * (1 - t) * CTRL_Y + t ** 2 * JOINT_Y
      const len = 12 + rng() * 6
      fringe.push({ x1: x, y1: y, x2: x + (rng() - 0.5) * 2, y2: y + len })
    }
  }
  outline += ' Z'

  const motifs = Array.from({ length: Math.floor(VW / 44) }, (_, i) => ({
    x: 22 + i * 44,
    flip: i % 2 === 0 ? 1 : -1,
  }))
  const tassels = Array.from({ length: SCALLOPS + 1 }, (_, i) => ({ x: i * SW, len: 22 + rng() * 8 }))
  return { outline, trim, trimInner, fringe, motifs, tassels }
}

export function Valance() {
  const v = useMemo(() => buildValance(), [])

  return (
    <svg className="valance" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id="val-cloth" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5a1612" />
          <stop offset="0.6" stopColor="#7a1f1a" />
          <stop offset="1" stopColor="#4a120f" />
        </linearGradient>
        <linearGradient id="val-gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6d77a" />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_DEEP} />
        </linearGradient>
        {/* Jaali lattice */}
        <pattern id="jaali" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M13 0 L26 13 L13 26 L0 13 Z" fill="none" stroke={GOLD} strokeOpacity="0.28" strokeWidth="1" />
          <circle cx="13" cy="13" r="1.8" fill={GOLD} fillOpacity="0.35" />
        </pattern>
        <radialGradient id="tassel-ball" cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#f6d77a" />
          <stop offset="1" stopColor={GOLD_DEEP} />
        </radialGradient>
        <filter id="drop" x="-5%" y="-5%" width="110%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>

      <g filter="url(#drop)">
        <path d={v.outline} fill="url(#val-cloth)" />
        <path d={v.outline} fill="url(#jaali)" />
      </g>

      {/* Zari band with procedurally drawn paisley and diamond motifs */}
      <rect width={VW} height="38" fill="url(#val-gold)" />
      <rect width={VW} height="3" y="2" fill="#fff3c0" opacity="0.6" />
      <rect width={VW} height="3" y="33" fill={GOLD_DEEP} />
      {v.motifs.map((m, i) => (
        <g key={i} transform={`translate(${m.x} 19)`}>
          <path
            d="M0 11 C-10 9 -11 -7 0 -11 C9 -9 9 0 2 2 C-2 3 -2 -2 1 -3"
            fill="none"
            stroke="#5a1612"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`scale(${m.flip} 1)`}
          />
          <path d="M22 0 L27 5 L22 10 L17 5 Z" transform="translate(0 -5)" fill="#5a1612" opacity="0.85" />
        </g>
      ))}

      {/* Scallop trim */}
      <path d={v.trim} fill="none" stroke="url(#val-gold)" strokeWidth="6" strokeLinecap="round" />
      <path d={v.trimInner} fill="none" stroke={GOLD} strokeWidth="1.6" strokeDasharray="1 7" strokeLinecap="round" />

      {/* Fringe */}
      <g stroke={GOLD} strokeWidth="1.6" strokeLinecap="round">
        {v.fringe.map((f, i) => (
          <line key={i} x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} />
        ))}
      </g>

      {/* Tassels at every joint */}
      {v.tassels.map((t, i) => (
        <g key={i} className="valance__tassel" style={{ animationDelay: `${-i * 0.7}s` }}>
          <line x1={t.x} y1={JOINT_Y} x2={t.x} y2={JOINT_Y + 8} stroke={GOLD} strokeWidth="3" />
          <circle cx={t.x} cy={JOINT_Y + 14} r="7" fill="url(#tassel-ball)" />
          <path
            d={`M${t.x - 7} ${JOINT_Y + 20} L${t.x + 7} ${JOINT_Y + 20} L${t.x + 10} ${JOINT_Y + 20 + t.len} L${t.x - 10} ${JOINT_Y + 20 + t.len} Z`}
            fill="url(#val-gold)"
          />
          {[-6, -2, 2, 6].map((dx) => (
            <line
              key={dx}
              x1={t.x + dx}
              y1={JOINT_Y + 22}
              x2={t.x + dx * 1.3}
              y2={JOINT_Y + 18 + t.len}
              stroke={GOLD_DEEP}
              strokeWidth="1"
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

/** Rope tie-backs that gather the curtain at both sides. */
export function TieBacks() {
  return (
    <svg className="tiebacks" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="rope" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6d77a" />
          <stop offset="1" stopColor="#a8741a" />
        </linearGradient>
        <radialGradient id="gather" cx="0" cy="0.5" r="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[0, 1].map((side) => (
        <g key={side} transform={side ? 'translate(1200 0) scale(-1 1)' : undefined}>
          <rect x="0" y="360" width="190" height="260" fill="url(#gather)" />
          <path d="M0 455 Q70 505 118 585" fill="none" stroke="url(#rope)" strokeWidth="11" strokeLinecap="round" />
          <path d="M0 455 Q70 505 118 585" fill="none" stroke="#7a4e0c" strokeWidth="2" strokeDasharray="3 5" opacity="0.7" />
          <circle cx="118" cy="590" r="11" fill="url(#rope)" />
          <path d="M108 598 L128 598 L133 640 L103 640 Z" fill="url(#rope)" />
          {[-8, -3, 2, 7].map((dx) => (
            <line key={dx} x1={118 + dx} y1="600" x2={118 + dx * 1.4} y2="638" stroke="#7a4e0c" strokeWidth="1" />
          ))}
        </g>
      ))}
    </svg>
  )
}
