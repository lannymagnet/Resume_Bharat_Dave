import { useMemo } from 'react'

interface NoticeBoardProps {
  housefull: boolean
}

interface Bulb {
  x: number
  y: number
}

/** Bulbs placed clockwise around the board edge, as percentages. */
function buildBulbs(): Bulb[] {
  const top = 11
  const side = 4
  const bulbs: Bulb[] = []
  for (let i = 0; i < top; i++) bulbs.push({ x: (i / top) * 100, y: 0 })
  for (let i = 0; i < side; i++) bulbs.push({ x: 100, y: (i / side) * 100 })
  for (let i = 0; i < top; i++) bulbs.push({ x: 100 - (i / top) * 100, y: 100 })
  for (let i = 0; i < side; i++) bulbs.push({ x: 0, y: 100 - (i / side) * 100 })
  return bulbs
}

/** Painted wooden signboard hanging from the valance. All text is real HTML. */
export function NoticeBoard({ housefull }: NoticeBoardProps) {
  const bulbs = useMemo(() => buildBulbs(), [])

  return (
    <div className={`board${housefull ? ' board--lit' : ''}`}>
      <div className="board__swing">
        <span className="board__rope board__rope--left" aria-hidden="true" />
        <span className="board__rope board__rope--right" aria-hidden="true" />
        <div className="board__panel">
          <span className="board__bulbs" aria-hidden="true">
            {bulbs.map((b, i) => (
              <span key={i} className="board__bulb" style={{ left: `${b.x}%`, top: `${b.y}%`, ['--i' as string]: i }} />
            ))}
          </span>
          <div className="board__face" key={housefull ? 'housefull' : 'waiting'}>
            {housefull ? (
              <>
                {/* TODO(real content): Bharat's final wording */}
                <h1 className="board__hi" lang="hi">
                  हाउसफुल!
                </h1>
                <p className="board__en" lang="en">
                  Housefull!
                </p>
              </>
            ) : (
              <>
                {/* TODO(real content): placeholder board text, Bharat to rewrite */}
                <h1 className="board__hi" lang="hi">
                  शो शुरू होने वाला है…
                </h1>
                <p className="board__en" lang="en">
                  The show is about to begin…
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
