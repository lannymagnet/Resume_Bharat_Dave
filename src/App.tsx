import { useCallback, useState } from 'react'
import { PlainStub } from './plain/PlainStub.tsx'
import { Gate } from './show/Gate.tsx'
import { Loader } from './show/Loader.tsx'

type Stage = 'loading' | 'gate' | 'plain'

export default function App() {
  const [stage, setStage] = useState<Stage>('loading')
  const toGate = useCallback(() => setStage('gate'), [])
  const toPlain = useCallback(() => setStage('plain'), [])

  if (stage === 'plain') return <PlainStub />
  return (
    <>
      {stage === 'gate' && <Gate />}
      {stage === 'loading' && <Loader onDone={toGate} onSkipToPlain={toPlain} />}
    </>
  )
}
