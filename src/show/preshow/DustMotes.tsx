import { useEffect, useRef } from 'react'
import { createRng } from './random.ts'

const COUNT = 36

interface Mote {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  a: number
  phase: number
}

/** Slow dust motes drifting in the footlight. Canvas, mounted only when motion is allowed. */
export function DustMotes() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rng = createRng(11)
    // positions are 0..1 of the canvas; motes live mostly in the lower, lit half
    const motes: Mote[] = Array.from({ length: COUNT }, () => ({
      x: rng(),
      y: 0.3 + rng() * 0.7,
      r: 0.8 + rng() * 2,
      vx: (rng() - 0.5) * 0.008,
      vy: -(0.004 + rng() * 0.01),
      a: 0.25 + rng() * 0.45,
      phase: rng() * Math.PI * 2,
    }))

    let w = 0
    let h = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      ctx.clearRect(0, 0, w, h)
      for (const m of motes) {
        m.x += m.vx * dt
        m.y += m.vy * dt
        if (m.y < 0.15) {
          m.y = 1.02
          m.x = rng()
        }
        if (m.x < -0.02) m.x = 1.02
        if (m.x > 1.02) m.x = -0.02
        const lit = Math.min(1, Math.max(0, (m.y - 0.15) / 0.6)) // brighter nearer the footlight
        const twinkle = 0.6 + 0.4 * Math.sin(now / 1400 + m.phase)
        ctx.globalAlpha = m.a * lit * twinkle
        ctx.fillStyle = '#ffd98a'
        ctx.beginPath()
        ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="dust" aria-hidden="true" />
}
