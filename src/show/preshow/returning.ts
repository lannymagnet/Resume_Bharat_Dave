import { RETURNING_KEY } from './constants.ts'

export function isReturningVisitor(): boolean {
  try {
    return localStorage.getItem(RETURNING_KEY) === '1'
  } catch {
    return false
  }
}

// TODO(returning visitors): call this when the real show starts, so abandoned visits do not count.
// Not called anywhere yet because "Start the show" is a micro-animation only, so every visit gets the full test length.
export function markReturningVisitor(): void {
  try {
    localStorage.setItem(RETURNING_KEY, '1')
  } catch {
    // storage unavailable (private window etc.): treat as a first visit
  }
}
