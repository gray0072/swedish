# 14. Deployment to GitHub Pages

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [14-deployment_ru.md](14-deployment_ru.md) and must be kept in sync.

`vite.config.ts`:

```ts
export default defineConfig({
  base: '/swedish/',        // repository name is `swedish` — locked, see section 0
  plugins: [react()],
});
```

- Site URL: `https://<user>.github.io/swedish/`. `index.html` sets `<title>Swedish</title>` and
  `manifest.webmanifest` uses `"name": "Swedish"`, `"short_name": "Swedish"`,
  `"start_url": "/swedish/"`, `"scope": "/swedish/"`.
- Use `HashRouter` — no 404.html rewrite hack needed.
- `public/.nojekyll` must exist so asset folders starting with `_` are served.
- Workflow `.github/workflows/deploy.yml`: on push to `main` → `actions/checkout`,
  `actions/setup-node@v4` (node 20, npm cache), `npm ci`, `npm run validate && npm run build`,
  `actions/upload-pages-artifact@v3` with `path: dist`, `actions/deploy-pages@v4`.
  Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Workflow `validate.yml` runs on pull requests: typecheck, lint, tests, content validation.
