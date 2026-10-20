export interface CriticalAsset {
  id: string
  load: () => Promise<unknown>
}

const font = (spec: string, sample: string): CriticalAsset => ({
  id: `font:${spec}`,
  load: () => document.fonts.load(spec, sample),
})

/**
 * Everything the pre-show waits for. The curtain, board and audience are code-generated, so only fonts for now.
 * TODO(first scene): add the Prologue's critical assets here once they exist.
 */
export const criticalAssets: CriticalAsset[] = [
  font("400 1em 'Yatra One'", 'शो शुरू होने वाला है हाउसफुल The show is about to begin Housefull'),
  font("400 1em 'Tiro Devanagari Hindi'", 'सीटें भर रही हैं पर्दा उठाइए'),
  font("400 1em 'Inter'", 'Seats filling Start the show'),
  font("600 1em 'Inter'", 'Skip to plain version'),
]
