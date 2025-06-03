# TopTick Trading Notes

A mobile-first progressive web app for recording daily MNQ trading stats.

## Features
- Add daily P&L, number of trades, optional win rate, and short notes
- Entries are stored in local storage
- Export data to JSON for backup
- Optimized for mobile with dark theme
- Icons inlined as base64 to avoid binary assets

## Development
1. Install dependencies
   ```bash
   cd app
   npm install
   ```
2. Start the dev server
   ```bash
   npm run dev -- --host
   ```
   Then open the shown local network URL on your phone.

## Deployment
To deploy to GitHub Pages:
```bash
npm run deploy
```
GitHub Pages will serve the site from the `gh-pages` branch.
After enabling Pages in your repository settings, open
`https://<your_username>.github.io/tt-notes-on-phone-/` in your browser to use
the app on any device.
