import { useEffect, useState } from 'react'
import type { CriticalAsset } from '../criticalAssets.ts'

export interface PreShowProgress {
  /** 0..100, integer, never decreases. Reaches 100 only when real assets are done and the paced minimum has elapsed. */
  percent: number
  ready: boolean
  /** Hard timeout hit while real loading was still unfinished */
  timedOut: boolean
}

// TODO(tuning): linear pacing for now; an eased curve may feel better once the real length is chosen.
const pace = (t: number) => t

/**
 * Displayed progress = min(paced curve over minMs, real asset fraction), kept monotonic.
 * A failed asset counts as finished so one 404 cannot hang the screen.
 */
export function usePreShowProgress(assets: CriticalAsset[], minMs: number, hardTimeoutMs: number): PreShowProgress {
  const [state, setState] = useState<PreShowProgress>({ percent: 0, ready: false, timedOut: false })

  useEffect(() => {
    const start = performance.now()
    let finished = 0
    let raf = 0
    let stopped = false

    assets.forEach((a) => {
      a.load()
        .catch(() => undefined)
        .then(() => {
          finished += 1
        })
    })

    const tick = () => {
      if (stopped) return
      const elapsed = performance.now() - start
      const real = assets.length === 0 ? 1 : finished / assets.length
      const timedOut = elapsed >= hardTimeoutMs && real < 1
      const progress = timedOut ? 1 : Math.min(real, pace(Math.min(1, elapsed / minMs)))
      const percent = progress >= 1 ? 100 : Math.floor(progress * 100)
      const ready = percent >= 100
      setState((prev) =>
        percent > prev.percent || ready !== prev.ready ? { percent: Math.max(percent, prev.percent), ready, timedOut } : prev,
      )
      if (!ready) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
    }
  }, [assets, minMs, hardTimeoutMs])

  return state
}
