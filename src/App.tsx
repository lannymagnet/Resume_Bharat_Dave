import { useCallback, useState } from 'react'
import { PlainStub } from './plain/PlainStub.tsx'
import { PreShow } from './show/preshow/PreShow.tsx'

type Stage = 'preshow' | 'plain'

// TODO(next page): there is no page after the pre-show yet; "Start the show" does nothing.
export default function App() {
  const [stage, setStage] = useState<Stage>('preshow')
  const toPlain = useCallback(() => setStage('plain'), [])

  if (stage === 'plain') return <PlainStub />
  return <PreShow onSkipToPlain={toPlain} />
}
