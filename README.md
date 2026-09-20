# Chroma

A local-first tool for mapping how you make sense of your own experiences.

**Live:** https://oceanyx.github.io/Chroma/

## What it is

Chroma treats each thing you noticed, did, intended, or wondered about as
a small planet — an Observation, an Action, an Intention, or a
Hypothetical. Each type has its own color, so you can tell them apart at
a glance regardless of what you've reflected on. You reflect on a planet
from different angles, shown as moons that orbit it:

| Dimension | What it asks | Unlocks |
|---|---|---|
| **Inner Experience** | What did you feel, think, or sense — the part no one outside could see? | From the start |
| **External** | What was observably true of the situation as a whole — independent of what you, specifically, did? | From the start |
| **Behavioral** | What did you yourself do or say — the observable, outside-facing part of it? | After 5 reflections |
| **Framing** | What conceptual model or framework illuminates what was happening here? | After 15 reflections |

Don't want to pick a dimension yet? Write it as **unfiled** instead — a
short list on the left side of Reflection Space holds it until you sort
it later, or never.

![Screenshot / demo — placeholder](PLACEHOLDER)

The progressive unlock is deliberate pacing for new users, not a limit —
it can be turned off entirely (Legend → Preferences → "Show all 4
dimensions from the start").

Planets can be linked to each other (followed / caused / triggered /
enabled / contradicts / resolved), grouped into named constellations, and
individual moons can be marked in tension, in support, or in echo with
one another — three relationship weights, from "this conflicts with
that" down to "this just reminded me of that." Clicking any of those
connector lines opens both moons side by side for comparison, rather than
forcing you to hold two things in memory at once.

The goal is to make it easier to notice the gap between how something felt
and what was actually observable, and to see patterns surface across many
small reflections over time. The four dimensions aren't a claim that
they're the "correct" or complete way to carve up experience — they're a
starting structure, meant to be held loosely.

## Status

Live and working. Core loop (create an experience, reflect on it from
multiple angles, connect it to others, group related ones into
constellations) is solid and has been through several rounds of bug fixes
and UX passes. Actively developed — see the in-app Legend (bottom-left "?"
button) for the current feature set, since this README won't always be
perfectly in sync with the latest build.

## Features

- Infinite pan/zoom canvas with an explicit tool mode for each action:
  Select, Pan, Connect, Group — no modifier-key gestures, no hidden
  interactions
- Recenter (frames everything currently on the map back into view) and
  dedicated zoom in/out controls, both anchored to your current viewport
  center; Reflection Space has its own independent zoom that auto-fits
  whichever dimensions you've unlocked
- Four planet types (Observation, Action, Intention, Hypothetical), each
  with a permanent, distinct color that never changes based on what
  you've reflected on
- Reflections ("moons") across four dimensions, with progressive unlock
  and an opt-out toggle — or leave a reflection unfiled and sort it
  whenever you like
- Tension, support, and echo relationships between moons, with visible,
  clickable connector lines that open a side-by-side comparison view
- Typed connections between planets
- Constellations — named, archetyped groupings of related planets
- Custom lenses for framing a reflection, shareable across your whole
  map, with an optional custom prompt
- Version history per reflection ("Update" for a quick fix with no
  history kept, "Mark as Evolved" for a deliberate change that archives
  the previous version)
- First-run onboarding (five short animated steps, skippable at every
  step, replayable anytime from Legend) and a full mechanics reference in
  Legend
- Export/Import to JSON, including custom lenses (merged on import, not
  overwritten)
- Zero network requests. Everything lives in your browser's local storage
  (IndexedDB for your map data, localStorage for custom lenses). Nothing
  you write is ever sent anywhere.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL it prints. To build a static production version:

```bash
npm run build
```

The output in `dist/` is a fully static site — no backend required.

## Tech stack

- React 18 + Vite
- Dexie (IndexedDB) for local storage
- lucide-react for icons
- Pure CSS/SVG for all animation — no animation library

## Deployment

Deployed to GitHub Pages via GitHub Actions
(`.github/workflows/deploy.yml`), which builds and redeploys automatically
on every push to `main`. One thing worth knowing if you fork this: Vite's
`base` path in `vite.config.js` is set to `/Chroma/` to match this repo's
Pages URL — if you rename the repo or deploy elsewhere, update that too,
or your built assets will 404.

## Data & privacy

Chroma makes no network requests of any kind. Everything you create lives
in your browser's local storage — map data in IndexedDB, custom lenses in
localStorage — and never leaves your device. Clearing your browser's site
data will delete both, so use Export regularly if you want a backup (it
includes your custom lenses too). There's no account system and no server.

## License

No formal license file yet. The source is public on GitHub as-is.

## Contributing

Not currently seeking contributions, but issues and feedback are welcome.

## Credits

Built by [Brian Chan](https://oceanyx.github.io) ([@Oceanyx](https://github.com/Oceanyx)).
