# Decisions

One line per decision, with date.

- 2026-10-20: Stack is Vite + React + TypeScript (strict), GSAP, Howler; see CLAUDE.md section 2.
- 2026-10-20: Work happens on short feature branches (`phase-1-setup` first); `main` is merged only after Bharat checks the result in the browser.
- 2026-10-20: Enabled TypeScript `strict` in tsconfig (CLAUDE.md section 2 requires it; the Vite template did not set it).
- 2026-10-20: Fonts, all SIL OFL 1.1, self-hosted woff2 in public/fonts/ (licence texts in public/fonts/licenses/), subset to Devanagari + Latin, font-display: swap. Yatra One 400 = display (act titles, Loader heading, big moments); Tiro Devanagari Hindi 400 = Sutradhar Devanagari subtitles and longer Hindi text; Inter 400 + 600 = Latin UI, English subtitles, Plain mode body. Fetched once via Fontsource, then the npm packages were removed (no runtime CDN, no extra dependency).
- 2026-10-20: Only yatra-one-devanagari is preloaded in index.html (the Loader heading is the first thing painted); the Loader loads the rest with document.fonts.load so progress is real.
- 2026-10-20: Design tokens live in src/styles/tokens.css; fonts in fonts.css; global reset in reset.css.
