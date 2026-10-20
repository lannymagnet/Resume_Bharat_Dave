import { curtainTextureUrl } from './curtainTexture.ts'

export interface CriticalAsset {
  id: string
  load: () => Promise<unknown>
}

const font = (spec: string, sample: string): CriticalAsset => ({
  id: `font:${spec}`,
  load: () => document.fonts.load(spec, sample),
})

const image = (id: string, src: string): CriticalAsset => ({
  id: `image:${id}`,
  load: () =>
    new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load ${id}`))
      img.src = src
    }),
})

/** Everything the Loader waits for. Later scenes extend this list with their own first-view assets. */
export const criticalAssets: CriticalAsset[] = [
  font("400 1em 'Yatra One'", 'भारत की कहानी Bharat'),
  font("400 1em 'Tiro Devanagari Hindi'", 'पर्दा उठने वाला है'),
  font("400 1em 'Inter'", 'The curtain is about to rise'),
  font("600 1em 'Inter'", 'Take your seat'),
  image('curtain-texture', curtainTextureUrl),
]
