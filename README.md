# To-Do

A simple, fast, urgency-based to-do app — built as a PWA so it installs on any device and works offline.

## Features

- **Today view** — a focused list of at most 5 tasks a day (overdue first, then by urgency). Repeating tasks live in their own "Routines" strip and don't count toward the 5. Anything beyond the cap waits under "More due today"; each task can be pushed to tomorrow
- **Repeating tasks** — daily, weekly, monthly or every N days. Checking one off rolls it to its next due date (counted from the old due date)
- **Chains** — mark a task "blocked by" another; only the current step of a chain shows on Today ("⛓ Step 1 of 3 · next: Review")
- **Later** — tasks due more than 7 days out fold into a collapsed "Later" section on All tasks
- **Someday** — tasks with no due date and Low urgency are parked on their own tab, off the main list
- **Stale-task nudge** — after a task is pushed to tomorrow 3 times you're asked to do it, break it down, park it or delete it
- **Checklists in notes** — start a line with `- [ ]` and it becomes a tappable checkbox; cards show progress like `☑ 2/4`
- Tag tasks with one or more tags to organize and filter them
- Urgency levels: Critical, High, Medium, Low (auto-set from due date, or set manually)
- Due dates with overdue alerts
- Works offline via Service Worker caching
- Installable on iOS, Android, and desktop
- Dark mode support (follows system preference)
- All data stored locally in the browser

## Usage

Open `index.html` directly in a browser, or serve it from any static host (GitHub Pages, Netlify, etc.).

To install as an app, open it in Chrome or Safari and use the browser's "Add to Home Screen" / "Install" option.

## Deployment (GitHub Pages)

1. Go to **Settings → Pages** in this repo
2. Set source to `main` branch, root folder
3. The app will be live at `https://asx2000.github.io/to-do/`

## Files

- `index.html` — the entire app (HTML + CSS + JS, single file)
- `manifest.json` — PWA manifest (name, icons, display mode)
- `sw.js` — Service Worker for offline caching
- `icon.svg` — app icon
- `PLAN.md` — the v2.0 simplification plan (single task entity, tags, dependencies)
