# TopTick Trading Notes

A mobile-first progressive web app for recording daily MNQ trading stats.

## Features
- Add daily P&L, number of trades, optional win rate, and short notes
- Entries are stored in local storage
- Export data to JSON for backup
- Optimized for mobile with dark theme
- Icons inlined as base64 to avoid binary assets

## Szybki start (GitHub Pages)

Gotowa wersja aplikacji znajduje się w folderze `docs/`. Aby strona
działała od razu po wejściu w link:

1. Sklonuj repozytorium na swój profil GitHub.
2. Wejdź w ustawienia repozytorium i otwórz zakładkę **Pages**.
3. Wybierz gałąź **`main`** oraz katalog **`/docs`** jako źródło i zapisz.
4. Po chwili aplikacja będzie dostępna pod adresem
   `https://<twoj_login>.github.io/tt-notes-on-phone-/`.
5. Otwórz ten link na telefonie i dodaj do ekranu startowego (pokazuje się jako
   **TopTick**).

Jeśli wprowadzisz zmiany w kodzie i chcesz przebudować aplikację lokalnie, użyj:

```bash
cd app
npm install
npm run build
```

Po komendzie `npm run build` nowe pliki pojawią się w katalogu `docs/`. Commituj
i wypychaj je do GitHuba, aby zaktualizować stronę. Możesz też skorzystać z
`npm run deploy`, aby automatycznie wysłać zawartość folderu `docs` na gałąź
`gh-pages`.
