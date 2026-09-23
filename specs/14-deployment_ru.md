# 14. Деплой на GitHub Pages

> Часть технического задания — оглавление в [SPEC_ru.md](../SPEC_ru.md).
> Английская версия — [14-deployment.md](14-deployment.md), обе должны оставаться синхронными.

`vite.config.ts`:

```ts
export default defineConfig({
  base: '/swedish/',        // имя репозитория — `swedish`, зафиксировано, см. раздел 0
  plugins: [react()],
});
```

- Адрес сайта: `https://<user>.github.io/swedish/`. В `index.html` стоит `<title>Swedish</title>`,
  в `manifest.webmanifest` — `"name": "Swedish"`, `"short_name": "Swedish"`,
  `"start_url": "/swedish/"`, `"scope": "/swedish/"`.
- Используем `HashRouter` — костыль с 404.html не нужен.
- Файл `public/.nojekyll` обязателен, иначе Pages не отдаст папки, начинающиеся с `_`.
- Workflow `.github/workflows/deploy.yml`: на push в `main` → `actions/checkout`,
  `actions/setup-node@v4` (node 20, кеш npm), `npm ci`, `npm run validate && npm run build`,
  `actions/upload-pages-artifact@v3` с `path: dist`, `actions/deploy-pages@v4`.
  Права: `contents: read`, `pages: write`, `id-token: write`.
- Workflow `validate.yml` на пул-реквестах: typecheck, lint, тесты, валидация контента.
