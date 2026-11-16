# Mój System

Polskojęzyczna symulacja systemu operacyjnego działająca w przeglądarce. Projekt powstał z pomocą Claude’a na potrzeby kanału **Kod, AI i reszta**.

## Pierwsze uruchomienie

Otwórz `index.html` w przeglądarce i włącz wirtualny komputer na ekranie startowym. Po wejściu na pulpit otwórz menu Start. W Terminalu wpisz `help`, aby zobaczyć dostępne polecenia.

## Co jest w środku

- Pulpit z ikonami, oknami, paskiem zadań i kalendarzem.
- Notatnik, Pliki, Terminal, Kalkulator, Ustawienia i Menedżer zadań.
- Rysowanie, Lista zadań, Zegar, Pianino i gra Wąż.
- Iskra, lokalny asystent reagujący na wbudowane polecenia. Potrafi m.in. otworzyć aplikację i zapisać notatkę.

Projekt wykorzystuje HTML, CSS i JavaScript. Przeglądarka przechowuje dane w `localStorage`. Wirtualne pliki i ustawienia zapisane pod jednym adresem są dostępne w tym samym profilu przeglądarki pod tym adresem. Opcjonalne fonty Inter i JetBrains Mono są pobierane z Google Fonts.

## Publikacja na GitHub Pages

1. Utwórz publiczne repozytorium, np. `moj-system`.
2. Rozpakuj ZIP i wgraj jego zawartość do katalogu głównego repozytorium. Plik `index.html` ma być widoczny obok tego README.
3. W **Settings → Pages** wybierz **Deploy from a branch**, gałąź z plikami (zwykle `main`) i katalog **/(root)**. Zapisz ustawienia.
4. Po zakończeniu publikacji otwórz adres podany w sekcji **Pages**.

## Pliki

| Plik | Zawartość |
| --- | --- |
| `index.html` | Struktura pulpitu i ekranów systemu |
| `style.css` | Wygląd pulpitu, okien i aplikacji |
| `app.js` | Obsługa okien, aplikacje, zapis danych i asystent Iskra |

