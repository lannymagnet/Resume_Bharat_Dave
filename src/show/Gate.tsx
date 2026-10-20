import './gate.css'

/** PLACEHOLDER Gate: the real curtain-pull and audio unlock arrive in Phase 2. */
export function Gate() {
  return (
    <main className="gate">
      <h1 className="gate__title">Bharat ki Kahani</h1>
      <p className="gate__note">The show is being set up.</p>
      <button type="button" className="gate__button">
        Take your seat
      </button>
    </main>
  )
}
