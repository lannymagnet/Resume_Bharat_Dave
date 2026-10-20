import { useEffect, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../lib/index.ts'
import { criticalAssets } from './criticalAssets.ts'
import { curtainTextureUrl } from './curtainTexture.ts'
import { useAssetPreload } from './useAssetPreload.ts'
import './loader.css'

const MIN_DISPLAY_MS = 1200
const TIMEOUT_MS = 8000
const EXIT_MS = 450
const EXIT_MS_REDUCED = 200

interface LoaderProps {
  onDone: () => void
  onSkipToPlain: () => void
}

export function Loader({ onDone, onSkipToPlain }: LoaderProps) {
  const reduced = useReducedMotion()
  const { progress, done, timedOut } = useAssetPreload(criticalAssets, {
    minMs: MIN_DISPLAY_MS,
    timeoutMs: TIMEOUT_MS,
  })
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!done) return
    const enter = setTimeout(() => setLeaving(true), 0)
    const exit = setTimeout(onDone, reduced ? EXIT_MS_REDUCED : EXIT_MS)
    return () => {
      clearTimeout(enter)
      clearTimeout(exit)
    }
  }, [done, reduced, onDone])

  const status = !done
    ? 'Loading the show'
    : timedOut
      ? 'Loading is slow, continuing anyway'
      : 'Ready'
  const percent = Math.round(progress * 100)

  return (
    <div
      className={`loader${leaving ? ' loader--leaving' : ''}${reduced ? ' loader--reduced' : ''}`}
      style={{ '--curtain-texture': `url("${curtainTextureUrl}")` } as CSSProperties}
    >
      <a
        className="loader__skip"
        href="#plain"
        onClick={(e) => {
          e.preventDefault()
          onSkipToPlain()
        }}
      >
        Skip to plain version
      </a>

      <div className="loader__curtain" aria-hidden="true" />
      <div className="loader__footlight" aria-hidden="true" />

      <main className="loader__content">
        <h1 className="loader__title" lang="hi">
          भारत की कहानी
        </h1>
        {/* TODO(real content): Bharat will rewrite this Sutradhar line in his own voice */}
        <p className="loader__line" lang="hi">
          पर्दा उठने वाला है…
        </p>
        <p className="loader__subtitle" lang="en">
          The curtain is about to rise…
        </p>
        <div
          className="loader__bar"
          role="progressbar"
          aria-label="Loading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="loader__bar-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
        <p className="visually-hidden" role="status" aria-live="polite">
          {status}
        </p>
      </main>
    </div>
  )
}
