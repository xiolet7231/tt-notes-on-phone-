# TopTick Trading Notes

Mobilna aplikacja PWA do zapisywania dziennych wyników z handlu MNQ.
Teraz korzysta z Tailwind CSS, ma opcję dodawania screenshotów i działa offline
dzięki prostemu Service Workerowi.

## Funkcje
- Dodawanie P&L, liczby transakcji oraz wygranych (na podstawie czego liczony jest winrate)
- Krótkie notatki i możliwość dodania zrzutów ekranu do każdego dnia
- Zapisy w przeglądarce (localStorage) i eksport danych do JSON
- Kolorowe oznaczenia dni z profitem i stratą
- Nowoczesny wygląd z gradientem i lekkim efektem szkła
- Po dodaniu do ekranu startowego wyświetla się jako aplikacja **TopTick**
- Działa offline dzięki wbudowanemu Service Workerowi

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
