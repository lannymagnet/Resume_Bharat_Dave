# Project: "Bharat ki Kahani" — Puppet Show Portfolio

> LIVING DOCUMENT. This file will change as the project evolves. Always read it fully at the start of a session. If the code and this file disagree, tell Bharat and propose an update rather than silently picking one. See "Maintaining this file" at the bottom.

## 1. What this is
A portfolio site for Bharat Dave, Senior Software Engineer (5+ years, Mumbai). Previously TCS (enterprise), then Atrina Technologies (startup, full-stack, left Oct 2026). The site is a Rajasthani-style kathputli (puppet) show narrated by the **Sutradhar** (narrator) in Hindi with English subtitles. The narrator voice is Bharat's own recording.

Goal: a distinctive, memorable portfolio that also works as a serious professional site (experience, projects, skills, contact, visitor notes). No generic dark-mode-with-floating-cubes. No hand-made 3D models: everything is code-generated (SVG, canvas, shaders) or free-licensed assets.

Repo: https://github.com/lannymagnet/Resume_Bharat_Dave

## 2. Stack (final unless changed in the Changelog)
- Vite + React + TypeScript (strict). React only; no Next.js.
- GSAP (ScrollTrigger, Timeline) for choreography; Lenis optional
- SVG paper-cut puppets with string rigs (GSAP + light rope physics); optional GLSL for curtain fabric, footlight glow, paper grain
- Howler.js for narration audio
- Supabase (Postgres + RLS) for the guestbook. Turnstile verification and rate limiting run in a Supabase Edge Function, never only in the browser.
- Deploy: Vercel or Cloudflare Pages (decide at Phase 6)

## 3. Show structure (scroll advances scenes; audio plays on its own timeline)
-1. Loader: closed-curtain loading screen with real progress (fonts and first-scene assets), min display ~1.2s, ~8s timeout fallback, then hands off to the Gate. Never plays audio.
0. Gate: "Take your seat" / curtain-pull button. This is the user gesture that unlocks audio. Also a visible "Skip the show" button.
1. Prologue: Sutradhar introduces the hero puppet (Bharat) in one line.
2. Act 1, The Fort (TCS): rigid symmetric set, puppets move in rehearsed steps. Enterprise experience.
3. Madhyantar (Interval): skills as props the hero carries; Sutradhar pitches them street-performer style.
4. Act 2, The Open Road (Atrina): looser set, faster, improvised motion. Startup experience.
5. Act 3, The Tales: each project is a short scene (villain puppet = bug/outage/deadline, twist, outcome). 3-4 case studies.
6. Audience Chits (guestbook): last 20 visitor notes pinned on the side wall in painted style; submitting animates a chit flying into the pile.
7. Finale: curtain call and contact card.

Plain mode ("Skip the show"): a fast, text-only rendering of the same content for recruiters. Content lives in one data source (`src/content/`) feeding both modes. Plain mode must work without any animation.

The act list above is the current plan. Acts can be added, renamed or reordered; when that happens, update this section and the Changelog.

## 4. Narration + subtitles
- Per-act cue files: `src/content/cues/<act>.json`
  `{ "id": "p-01", "start": 0.0, "end": 3.4, "hi": "...", "hinglish": "...", "en": "...", "action": "bow" }`
- `action` fires puppet animations in sync with audio.
- Subtitles: English by default; toggle for Devanagari (hi) and Hinglish. Subtitles must work with audio muted (assume muted by default).
- Audio: one compressed mono file per act (Opus/AAC), lazy-loaded when the act is reached. Pause when the tab is hidden; mute and replay controls; remember mute preference.
- Placeholder narration: build first with silent timer-based cues so everything works before recordings exist. Later: run Whisper on recordings to generate timestamps.
- Autoplay policy: no audio before the Gate interaction.
- Hindi lines are written to be spoken: short sentences, English tech terms kept as-is (deployment, outage, API).
- Every cue must have `hi`, `hinglish` and `en`; add a build/lint check that fails on missing translations.

## 5. Guestbook (Audience Chits)
- Table `chits`: id, name (<=40 chars), message (<=200 chars), role_or_company (optional, <=40), created_at, status (`pending` | `approved`).
- Public read: only the newest 20 where status = approved, ordered by created_at desc. Older rows stay in the DB, not rendered.
- Public insert: status forced to `pending` via RLS/default; no email field.
- Spam: honeypot field, per-IP rate limit (Edge Function), Turnstile, profanity blocklist.
- Moderation: small private admin page or the Supabase dashboard. Seed with a few pre-written chits (with permission) so the wall never looks empty.
- Dev mode: localStorage mock behind an adapter interface so it works without Supabase; swap in the Supabase adapter at Phase 5.
- The "last 20" count is configurable in one constant.

## 6. Visual direction
- Palette: turmeric, indigo, vermilion, peacock green, aged paper. Not neon-on-black.
- Type: Devanagari display face (Tiro Devanagari Hindi / Yatra One / Rozha One) + clean Latin sans. Self-host fonts.
- Patterns (jaali, paisley, borders): generated SVG, not stock clip art.
- Puppets: layered paper-cut SVG parts (head, torso, arms, legs, ornaments) with visible strings from a control bar.
- Stage: painted cloth curtain with subtle fabric shader, warm footlight glow, light camera sway, paper grain.
- Avoid religious icons as decoration; keep humor affectionate, not stereotyped.
- Design tokens (colors, spacing, type scale, z-index layers) live as CSS variables in one file.

## 7. Repo layout
- `src/content/`    all copy, cues, experience, projects (the only place Bharat edits text)
- `src/show/`       stage, curtain, puppets, scenes, subtitle engine
- `src/plain/`      Plain mode renderer (reads the same content)
- `src/guestbook/`  chit wall, form, storage adapters (local + Supabase)
- `src/lib/`        shared utilities (audio, language toggle, motion prefs)
- `public/audio/`   narration files; `public/fonts/` self-hosted fonts
- `DECISIONS.md`    one line per decision, with date

## 8. Commands
- `npm run dev` / `npm run build` / `npm run lint` / `npm run typecheck`
- Before every commit: typecheck, lint and build must pass.

## 9. Conventions
- Function components and hooks only; no `any` without a comment explaining why.
- GSAP timelines are created in effects/`useGSAP` and cleaned up on unmount (kill timelines and ScrollTriggers).
- Each scene is a self-contained component that receives its cues and a timeline; scenes do not reach into each other.
- No runtime CDN dependencies except Turnstile and Supabase.
- Keep components small; extract puppet parts into reusable pieces.

## 10. Content rules
- Never invent employment facts, metrics, dates, testimonials or project outcomes. Unknown = `// TODO(real content)`.
- All current script text is PLACEHOLDER until Bharat replaces it.
- Real facts about Bharat live in `src/content/about.ts` once provided. Do not duplicate them elsewhere.

## 11. Non-functional requirements
- First paint under ~2s on a mid-range mobile; initial JS under ~200 KB gzipped (show code and audio lazy-loaded); LCP under 2.5s.
- `prefers-reduced-motion`: replace choreography with simple fades; Plain mode always available.
- Mobile portrait stage layout; touch interactions (tap puppet, drag string).
- Accessibility: full transcripts, keyboard navigation, subtitle contrast over the stage, focus states, aria labels on controls.
- Basic SEO for the shell: title, description, Open Graph image, and the Plain content available as real HTML where practical.

## 12. Build phases and status
Mark each phase `[ ]` not started, `[~]` in progress, `[x]` done. Update when a phase finishes.
- [~] 1. Scaffold project, content data model (acts, cues, experience, projects, skills), Plain mode rendering
  - Done: scaffold, folder layout, design tokens, self-hosted fonts, reset, reduced-motion hook, Loader (with placeholder Gate and Plain stub)
  - Remaining: content data model, real Plain mode rendering
- [ ] 2. Gate + curtain + stage + Sutradhar caption system with language toggle and placeholder timing
- [ ] 3. Puppet rig (one puppet, string animation, action cues), then Prologue and Act 1
- [ ] 4. Interval, Act 2, Act 3 scenes
- [ ] 5. Guestbook (localStorage adapter first, then Supabase + Turnstile + moderation)
- [ ] 6. Audio integration, Whisper timing script, polish, performance and accessibility pass, deploy

Definition of done for every phase: runs in the browser with no console errors; works on a mobile viewport; Plain mode shows the same content; reduced-motion and keyboard navigation work; typecheck, lint and build pass; commit message says what changed and why.

## 13. Git workflow
- Short feature branches (`phase-2-gate`, `phase-3-puppet`), merge to `main` when the phase's definition of done is met.
- Small, descriptive commits. Never commit `.env`, keys or `node_modules`. Keep a `.env.example` with variable names only.

## 14. Out of scope (for now)
- Hand-made 3D models, user accounts or logins, a CMS, threaded replies on chits, heavy analytics (privacy-friendly page views only, if any).

## 15. Open questions
Add items here when a decision is pending; move them to the Changelog when resolved.
- Hosting: Vercel vs Cloudflare Pages
- Final list of projects for Act 3 (candidates: Bazaar-of-Wonders and others; Bharat to confirm)
- Whether to use Bharat's own voice for all acts or a TTS draft first

## 16. Maintaining this file
- Bharat or Claude Code may propose edits. Claude Code must tell Bharat what it changed in this file and why, in the commit message.
- Keep section numbers and headings stable so other tools and notes can refer to them.
- Update in place; do not append contradicting rules. If a rule changes, edit it and log it below.
- When something here is wrong or outdated, fix it in the same commit as the code that exposed it.
- Never delete the Changelog.

## 17. Changelog
- 2026-10-20: Phase 1 setup on branch `phase-1-setup`. Added Loader (section 3, step -1) with `criticalAssets` list in `src/show/`; added `typecheck` script; enabled TS `strict` (section 2 required it, template lacked it); fonts fixed as Yatra One (display), Tiro Devanagari Hindi (Sutradhar/Hindi text), Inter (Latin UI), self-hosted (see DECISIONS.md); `.env`/`.env.*` gitignored with `.env.example` kept. Loader's "Skip to plain version" currently opens a stub until Plain mode exists. Phase 1 marked in progress.
- 2026-10-20: Initial brief. Concept: kathputli puppet show with Hindi narration and English subtitles; stack Vite + React + TypeScript; guestbook of last 20 approved chits; Plain mode for recruiters.
