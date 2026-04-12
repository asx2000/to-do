# To-Do

A simple, fast, urgency-based to-do app — built as a PWA so it installs on any device and works offline.

## Features

- Urgency levels: Critical, High, Medium, Low
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
