# Chroma

A local-first tool for mapping how you make sense of your own experiences.

## What it is

Chroma treats each thing you notice or do as a small planet. You can attach
reflections to it along up to four dimensions — what you felt, what you did,
what's externally verifiable, and what pattern or frame it fits — shown as
moons that orbit the planet. Planets can be linked to each other, grouped
into constellations, and marked as being in tension or in support of one
another.

The idea is to make it easier to notice the gap between how something felt
and what was actually observable, and to see patterns surface across many
small reflections over time.

Perception in humans is noticeably fickle, and, as such, the hope of this project
was to encourage people to be able to not just understand themselves better, but
also inquire as to the mechanisms and structure of how we come to conclusions
about our own thoughts and behaviors.

## Status

Early, working prototype. The core loop — create an observation, reflect on
it across dimensions, connect it to others — works. Expect some rough
edges; see **Known Issues** below.

## Features (currently working)

- Create Observation / Action / Intention nodes on an infinite pan-and-zoom
  canvas
- Drag nodes to reposition them
- Add reflections ("moons") across dimensions. Two dimensions are open from
  the start; Behavioral unlocks after 5 total reflections, Framing unlocks
  after 15 — **this pacing is intentional, not a bug**
- Mark tension between two reflections
- Mark support between two reflections
- Group related nodes into constellations
- Connect nodes with typed relationships: followed / caused / triggered /
  enabled / contradicts / resolved
- Export your data to JSON and re-import it later
- Everything is stored locally in your browser (IndexedDB) — nothing is
  ever sent anywhere

## Not built yet (on purpose)

These are deliberately out of scope for now, not missing by accident. The
goal is to test whether the core idea holds up before the surface area
grows:

- Accounts, sign-in, or cross-device sync
- Voice capture / dictation
- Search and filtering
- A settings panel (a couple of flags exist in the database but aren't
  exposed in the UI yet)
- Undo/redo
- Keyboard shortcuts beyond Escape, Enter, and holding Space to pan
- Accessibility support (screen reader labels, full keyboard navigation)

## Data & privacy

Chroma makes no network requests of any kind. Everything you create lives
in your browser's local storage (IndexedDB) and never leaves your device.
Clearing your browser's site data will delete it, so use **Export**
regularly if you want a backup. There's no account system and no server —
nothing to breach, because there's nowhere for data to go.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL it prints. To build a static production version:

```bash
npm run build
```

The output in `dist/` is a fully static site with no backend required. It
can be hosted as-is on Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

## Known issues

A handful of interactions are still buggy. Tracked and being fixed
incrementally — see the project's test checklist for the current list.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

## Contributing
