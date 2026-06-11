# Portofoliu — ghid admin

Secțiunea **Projects** se randează dinamic din `data/projects.json` (Alpine 3 + CSS pur).
Nu depinde de build-ul Tailwind: stilurile sunt în `assets/css/portfolio.css`, linkuit direct.

## 1. Un singur pas de setup (poze) — OBLIGATORIU

Upload-ul de poze folosește Cloudinary **unsigned** (fără secret în cod). Trebuie creat un preset:

1. Intră pe Cloudinary → **Settings → Upload → Upload presets → Add upload preset**.
2. **Signing Mode: Unsigned**.
3. Numele preset-ului: `portfolio_unsigned` (sau alt nume — vezi mai jos).
4. (Opțional) Folder: `portfolio`.
5. Save.

Dacă alegi alt nume, schimbă-l în `assets/js/config.js` → `cloudinary.uploadPreset`.
Cloud name-ul e deja setat (`dofjstvyj`).

> ⚠️ NU pune niciodată `API_SECRET`-ul Cloudinary sau `MONGO_URI` în cod — fișierele JS sunt publice.
> Rotește parola Mongo și secretul Cloudinary (au fost trimise în clar în chat).

## 2. Login

Buton **Admin** (sus, în pagina Projects). Doar `emil19ro@gmail.com` are acces.

- Parolă default: `Emil-Portofoliu-2026`
- Ca s-o schimbi: deschide consola browserului pe site și rulează
  `await PortfolioAuth.hash('parola-noua')`, apoi pune hash-ul în
  `assets/js/config.js` → `ownerPasswordSha256`.

> Login-ul e o **poartă cosmetică** (tot codul e public). Protecția reală e că publicarea
> necesită un commit în repo — vizitatorii nu pot scrie nimic permanent.

## 3. Adăugare / editare proiect

După login: **Adaugă proiect** (sau creionul de pe un card pentru editare).
- Poze: trage cu mouse-ul, dă click, sau **lipește cu Ctrl+V** din clipboard → se urcă pe Cloudinary.
- Reordonezi pozele cu săgețile ‹ ›, ștergi cu ×.
- Modificările se salvează automat **local** (în browserul tău) ca draft.

## 4. Publicare (ca să vadă toți vizitatorii)

Site-ul e static → modificările locale trebuie scrise în repo:

1. Apasă **Export JSON** (descarcă `projects.json`) — sau **Copiază**.
2. Înlocuiește `data/projects.json` din repo cu fișierul nou.
3. `git add data/projects.json && git commit && git push`.

Butonul ⟲ („revino la versiunea publicată") șterge draftul local și revine la ce e în repo.

## Structura unui proiect în `projects.json`

```json
{
  "id": "slug-unic",
  "title": "Titlu",
  "tags": ["React", "Node.js"],
  "description": ["<p-uri ca text, pot conține <strong>bold</strong>>"],
  "features": ["punct din listă", "..."],
  "note": "text opțional (ex: credențiale)",
  "links": [{ "label": "Live Demo", "url": "https://..." }],
  "images": ["https://res.cloudinary.com/...", "/assets/images/website1.png"],
  "video": "/assets/videos/demo.mp4"
}
```
Toate câmpurile în afară de `title` sunt opționale.
