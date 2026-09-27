# Izračun materijala

Jednostavna web stranica za okvirni izračun građevinskog materijala:

- **Zidanje blokovima** – odabir standardnih blokova (Porotherm, plinobeton, betonski blok) ili vlastitih dimenzija. Unos samo dimenzija objekta (duljina, širina, visina) ili detaljno po zidovima i otvorima (prozori, vrata). Izračun broja blokova, paleta i veziva (mort / ljepilo).
- **Krov** – jednostrešni, dvostrešni ili četverostrešni krov s nagibom i prepustima. Izračun površine krova, crijepa i sljemenjaka, te po želji drvene konstrukcije (rogovi, grede, letve, kontraletve, krovna folija).
- **Cijene** – unos jediničnih cijena ili potpuno skrivanje cijena (prekidač u zaglavlju).
- **Ispis** – gumb *Ispiši* daje uredan A4 pregled izračuna (moguće i spremanje u PDF), uvijek u svijetloj verziji.
- **Tema** – tamna (zadano) ili svijetla, prekidač u zaglavlju.

Unosi se automatski pamte u pregledniku (localStorage).

Sve potrošnje (kom/m², kg/m², razmak letava…) su okvirne i mogu se mijenjati u odjeljku *Parametri*.

## Lokalno pokretanje

Nema build koraka – dovoljno je otvoriti `index.html` ili pokrenuti statički server:

```bash
python3 -m http.server 8000
```

## Objava na GitHub Pages

```bash
git remote add origin git@github.com:KORISNIK/izracun-materijala.git
git push -u origin main
```

Zatim na GitHubu: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`**.
