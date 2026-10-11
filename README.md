# SvelteKit: browsers can block stylesheets from a cross-origin `paths.assets` after client-side navigation

SvelteKit renders `<link rel="stylesheet">` without `crossorigin`, and Vite's preload helper inserts links to the same stylesheets with `crossorigin` on client-side navigation. The browser fetches each stylesheet once in no-cors mode and once in CORS mode.

`cdn.mjs` serves the built assets from another origin. Like some CDN setups, it sends `Access-Control-Allow-Origin` and `Vary: Origin` only when the request has an `Origin` header.

You need Node 22.17 or later. The bug needs a production build: in dev, SvelteKit inlines styles.

## Steps

```sh
npm install
npm run build
npm run cdn     # terminal 1: assets on http://127.0.0.1:4174
npm start       # terminal 2: app on http://127.0.0.1:3000
```

In Chrome, with "Disable cache" unchecked in DevTools:

1. Open http://127.0.0.1:3000/b. The text is red.
2. Type http://127.0.0.1:3000/ in the address bar (a full page load).
3. Click "go to /b".

Step 2 needs a full page load, because the preload helper skips stylesheets that the current document already links.

## Expected

The text on `/b` stays red.

## Actual

The text turns black, and the console shows:

```
Access to CSS stylesheet at 'http://127.0.0.1:4174/_app/immutable/assets/….css' from origin 'http://127.0.0.1:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

In step 1, the browser fetched the stylesheet without `crossorigin`, so the cached response has neither `Access-Control-Allow-Origin` nor `Vary`. In step 3, Chrome reuses that response for the request with `crossorigin` and blocks it.

Chrome 154 and Safari on iOS 26.4 (Simulator) reproduce it. Safari 26.4 on macOS reproduces it when it reads the stylesheet from step 1 from the disk cache, e.g. after you restart Safari between steps 1 and 2.

## With the proposed fix

`FIX=1 npm start` adds `crossorigin` to the SSR stylesheet links in `src/hooks.server.js`, the same output as the proposed fix. Close all incognito windows, open a new one and repeat the steps: the text stays red.

If your browser already cached the stylesheet in the steps above, `/b` stays black after a full page load: the browser reuses the cached response without `Access-Control-Allow-Origin` for the SSR link with `crossorigin`.
