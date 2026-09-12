# pok8.me

Personal portfolio site for **Samuel Joe D'Souza** — hosted on GitHub Pages at [pok8.me](https://pok8.me).

## Deploy

This repo powers `Pok8TheCoder.github.io` with custom domain `pok8.me`.

```bash
git add .
git commit -m "Update portfolio site"
git push origin main
```

GitHub Pages will rebuild automatically. Cloudflare DNS should already point to GitHub.

## Local preview

Open `index.html` in a browser, or serve locally:

```bash
python -m http.server 8080
# visit http://localhost:8080
```

## Structure

```
index.html
assets/css/style.css
assets/js/main.js
CNAME
.nojekyll
```
