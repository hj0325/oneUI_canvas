# 그라디언트 template

A self-contained bundle for tweaking the theme tokens of Samsung One UI GenUI.

## Preview (Next.js, Pages Router)

- **`yarn dev`** — starts Next on `http://127.0.0.1:3000`. `/` redirects to **`/theme-preview`**.
- **`yarn build`** / **`yarn start`** — production build and server.
- **`yarn extract-preview`** — assembles [`theme-preview.html`](theme-preview.html) (inlined preview CSS + `theme.css` link), [`lib/preview-body.js`](lib/preview-body.js), and copies [`theme.json`](theme.json) → [`public/theme.json`](public/theme.json) from sources in [`preview-src/`](preview-src/) and [`styles/preview/*.css`](styles/preview/). Runs automatically before `dev` and `build` (`predev` / `prebuild`).
- **`yarn legacy:dev`** — previous static [`serve`](https://www.npmjs.com/package/serve) preview (optional).

Edited tokens load after preview chrome CSS ([`pages/_app.js`](pages/_app.js) import order). If [`styles/preview/genui.css`](styles/preview/genui.css) contains a `../wallpapers/` `url()`, `yarn extract-preview` rewrites it to a gradient so webpack can compile.

### Public URLs (after `yarn dev`)

- Theme JSON mirror: **`/theme.json`** (same content as root `theme.json` after extract).

Some preview SVGs under `/assets/figma/...` may **404** if those files are not in [`public/assets/`](public/assets/); add assets or ignore broken icons.

## Files

- `theme.css` — the editable variables. Open in any code editor.
- `theme.json` — machine-readable mirror (the tool reads this on import). Copied to `public/theme.json` when you run extract or `yarn dev` / `yarn build`.
- `preview-src/` — **source** HTML fragments for the gallery shell, cards grid, screens grid, and One UI components block (see numbered `*.html` and `fragments/`).
- `styles/preview/*.css` — **source** preview chrome CSS (`genui`, grid, components, gallery page layout). Edit these, then run `yarn extract-preview`.
- `theme-preview.html` — **generated** offline bundle (do not edit by hand; comment banner at top). Open in a browser after `yarn extract-preview` for a self-contained check (inlined preview CSS + linked `theme.css`).
- `lib/preview-body.js` — **generated** markup string for `/theme-preview` (do not edit by hand).

## Edit

Open `theme.css`, change any `--variable` value, save, refresh the **`/theme-preview`** page (or reload `theme-preview.html` after `yarn extract-preview`).

To change gallery layout or card/screen/component markup, edit files under **`preview-src/`** (and preview CSS under **`styles/preview/`**), then run **`yarn extract-preview`** so `theme-preview.html`, `lib/preview-body.js`, and the dev server stay in sync.

Optional metadata at the top of `theme.css`:

```css
/*! oneui-theme: { "name": "Sunset Glow", "author": "you" } */
```

## Apply

Send the updated `theme.css` (or all three files) to whoever runs
the One UI GenUI site — they import via `/customize → Import theme`
and click Save to register your work as a new theme preset.
