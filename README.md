# TopTick Trading Notes

A mobile-first progressive web app for recording daily MNQ trading stats.

## Features
- Add daily P&L, number of trades, optional win rate, and short notes
- Entries are stored in local storage
- Export data to JSON for backup
- Optimized for mobile with dark theme

## Usage
The repository already contains a built copy of the app under `app/docs/` so you
can host it directly with GitHub Pages:

1. In your repository settings on GitHub, open the **Pages** section.
2. Select the **`main`** branch and `app/docs` folder as the source and save.
3. After a minute your app will be available at
   `https://<your_username>.github.io/tt-notes-on-phone-/`.

If you make code changes and want to rebuild the app locally, run:

```bash
cd app
npm install
npm run build
```

The rebuilt files will appear in `app/docs/`. Commit them and push to update the
hosted site.
