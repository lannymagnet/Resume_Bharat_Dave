import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../lib/index.ts'
import { criticalAssets } from '../criticalAssets.ts'
import { Audience } from './Audience.tsx'
import {
  LOADER_HARD_TIMEOUT_MS,
  LOADER_MIN_MS,
  LOADER_RETURN_MIN_MS,
  REDUCED_STEP_PERCENT,
} from './constants.ts'
import { Curtain, TieBacks, Valance } from './Curtain.tsx'
import { DustMotes } from './DustMotes.tsx'
import { NoticeBoard } from './NoticeBoard.tsx'
import { isReturningVisitor } from './returning.ts'
import { usePreShowProgress } from './usePreShowProgress.ts'
import './preshow.css'

interface PreShowProps {
  onSkipToPlain: () => void
}

/**
 * Pre-show: loader and Gate in one. Closed curtain, notice board, audience filling as loading progresses.
 * At 100% the board reads "Housefull" and the Start button appears (the future audio-unlock gesture).
 */
export function PreShow({ onSkipToPlain }: PreShowProps) {
  const reduced = useReducedMotion()
  const [minMs] = useState(() => (isReturningVisitor() ? LOADER_RETURN_MIN_MS : LOADER_MIN_MS))
  const { percent, ready, timedOut } = usePreShowProgress(criticalAssets, minMs, LOADER_HARD_TIMEOUT_MS)
  const [pressed, setPressed] = useState(false)
  const startRef = useRef<HTMLButtonElement>(null)

  // Reduced motion: the crowd and the bar move in discrete steps
  const shown = ready ? 100 : reduced ? Math.floor(percent / REDUCED_STEP_PERCENT) * REDUCED_STEP_PERCENT : percent

  // Announce in 10% steps only, not every percent
  const step = ready ? 100 : Math.floor(percent / 10) * 10
  const status = ready
    ? timedOut
      ? 'Housefull. Some assets are still loading. You can start the show anyway.'
      : 'Housefull. Press the button to start the show.'
    : `Seats filling, ${step} percent.`

  useEffect(() => {
    if (ready) startRef.current?.focus()
  }, [ready])

  return (
    <div className={`preshow${reduced ? ' preshow--reduced' : ''}${ready ? ' preshow--ready' : ''}`}>
      <div className="preshow__skips">
        {/* TODO(skip to show): disabled for now. When enabled, jump straight to the ready (Housefull) state. */}
        <button type="button" className="preshow__skip" disabled title="Coming soon">
          Skip to the show
        </button>
        <a
          className="preshow__skip"
          href="#plain"
          onClick={(e) => {
            e.preventDefault()
            onSkipToPlain()
          }}
        >
          Skip to plain version
        </a>
      </div>

      <Curtain />
      <TieBacks />
      <div className="preshow__footlight" aria-hidden="true" />
      {!reduced && <DustMotes />}
      <NoticeBoard housefull={ready} />
      <Valance />
      <Audience percent={shown} settled={ready} />

      <div className="preshow__panel">
        {ready ? (
          <>
            <button
              ref={startRef}
              type="button"
              className={`start${pressed ? ' start--pressed' : ''}`}
              onClick={() => setPressed(true)}
              onAnimationEnd={() => setPressed(false)}
              // TODO(start the show): currently a micro-animation only. Later this unlocks audio and starts the show.
            >
              <span className="start__hi" lang="hi">
                पर्दा उठाइए
              </span>
              <span className="start__en" lang="en">
                Start the show
              </span>
            </button>
            {timedOut && <p className="preshow__note">Some assets are still loading, so the show may take a moment.</p>}
          </>
        ) : (
          <>
            <p className="preshow__label">
              {/* TODO(real content): placeholder wording */}
              <span lang="hi">सीटें भर रही हैं…</span> <span lang="en">Seats filling…</span>
            </p>
            <div className="preshow__bar-row">
              <div
                className="preshow__bar"
                role="progressbar"
                aria-label="Seats filling"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={shown}
              >
                <div className="preshow__bar-fill" style={{ transform: `scaleX(${shown / 100})` }} />
              </div>
              <span className="preshow__percent">{shown}%</span>
            </div>
          </>
        )}
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
