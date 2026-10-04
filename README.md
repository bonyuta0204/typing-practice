# typing-practice

A browser-only typing game built with Vue 3 and Vite. Results stay in the browser's local storage.

## Development

Use Node.js 24 LTS and npm 11 (the version is recorded in `package.json`).

```sh
npm ci
npm start
```

The development server binds to localhost. Use `npm run build` to create a production build in `dist/`, and `npm run preview` to inspect it locally. The build uses relative asset URLs so it can be hosted under a subdirectory. There is no deployment workflow.

## Checks

```sh
npm run check
npm audit
```

The checks run ESLint, the Vue component/local-storage tests, and the production build. CI repeats them on pull requests and master. Tests cover typing, mistakes/newlines, retry, repeated starts, customizing/canceling, persistence, and cleanup without external services.

## Dependency updates

`package.json` and `package-lock.json` are the single dependency definition/lock pair. Run `npm install <package>@latest` (or `npm install -D <package>@latest` for tools), then rerun the checks and commit both files. The former Yarn/webpack/Vue 2/node-sass toolchain has been removed; do not regenerate the old lockfile.

CI also runs a Chromium smoke test against the production build. To run it locally:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```
