# Dashboard commands

Run these from the repository root after the [native setup](../tests/native-setup.md).

| Command                       | Purpose                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev:dashboard`       | Launch the dashboard locally at `http://127.0.0.1:43127/`.                                 |
| `npm run typecheck:dashboard` | Strict TypeScript check of the application, the browser tests, and the tool configuration. |
| `npm run test:dashboard`      | Build the production app, serve it, and run the Playwright suite against it in Chromium.   |
| `npm run build:dashboard`     | Write production assets to `dashboard/dist/`.                                              |
| `npm run preview:dashboard`   | Serve the production assets that `build:dashboard` wrote.                                  |

Before browser checks, `node scripts/setup-native.mjs check` validates the
selected Node, installed Playwright and its headless Chromium. A changed
lockfile requires npm and browser setup again; ordinary test runs acquire nothing.

