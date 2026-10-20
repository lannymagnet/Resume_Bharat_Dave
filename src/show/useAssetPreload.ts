import { useEffect, useState } from 'react'
import type { CriticalAsset } from './criticalAssets.ts'

interface Options {
  minMs: number
  timeoutMs: number
}

export interface PreloadState {
  /** 0..1, never decreases, reaches 1 only once assets are done and minMs has passed */
  progress: number
  done: boolean
  timedOut: boolean
}

/**
 * Loads assets with real progress. A failed asset counts as finished so one 404 cannot hang the screen.
 * Displayed progress is capped by elapsed/minMs so the screen never flashes; at timeoutMs we give up waiting.
 */
export function useAssetPreload(assets: CriticalAsset[], { minMs, timeoutMs }: Options): PreloadState {
  const [state, setState] = useState<PreloadState>({ progress: 0, done: false, timedOut: false })

  useEffect(() => {
    const start = performance.now()
    let finished = 0
    let raf = 0
    let stopped = false

    const settle = () => {
      finished += 1
    }
    assets.forEach((a) => {
      a.load().catch(() => undefined).then(settle)
    })

    const tick = () => {
      if (stopped) return
      const elapsed = performance.now() - start
      const real = assets.length === 0 ? 1 : finished / assets.length
      const timedOut = elapsed >= timeoutMs && real < 1
      const progress = timedOut ? 1 : Math.min(real, elapsed / minMs)
      const done = progress >= 1
      setState((prev) =>
        progress > prev.progress || done !== prev.done ? { progress: Math.max(progress, prev.progress), done, timedOut } : prev,
      )
      if (!done) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
    }
  }, [assets, minMs, timeoutMs])

  return state
}
