// Pre-show timing and tuning. Everything to revisit before launch is marked TODO.

// TODO(timing): 30s is a TEST value so the whole pre-show can be reviewed. Pick the real length before launch.
export const LOADER_MIN_MS = 30000
// TODO(timing): minimum for returning visitors. Not active yet: nothing sets the returning flag (see markReturningVisitor).
export const LOADER_RETURN_MIN_MS = 4000
// If real assets are still loading at this point, show the Start button anyway with a small note.
export const LOADER_HARD_TIMEOUT_MS = 45000

// TODO(tuning): audience size; keep roughly 150 to 250 for performance on mid-range phones.
export const AUDIENCE_SIZE = 200

export const RETURNING_KEY = 'bkk:returning'

// Reduced motion fills the crowd in discrete steps of this many percent.
export const REDUCED_STEP_PERCENT = 10
