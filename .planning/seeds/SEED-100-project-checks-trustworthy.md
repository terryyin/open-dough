---
id: SEED-100
status: active
planted: 2026-10-05
planted_during: Maintainer request to separate project findings from DearDough.md, prune resolved ones, and queue the two highest priorities
trigger_when: This repository's own checks give a verdict that depends on load, timing, or how the session was started
scope: unknown
---

# SEED-100: This repository's checks stay trustworthy

## Why This Matters

Executing agents and maintainers publish Open Dough work on the strength of
this repository's checks. The
[project findings](../../ProjectFindings.md#priority-assessment) show a
recurring way those checks fail them: sessions the dashboard launches prepare
their checkout without the locked dev tools while the readiness check still
passes. The cause and its fix live in this repository's dashboard and its
tests, not in the published skills.

## Stories

<a id="launched-session-development-environment"></a>

### A session the dashboard launches prepares its checkout as a developer shell would

**Identity:** SEED-100#launched-session-development-environment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/255-launched-session-development-environment/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"65ae21865ebc797d62de2d0d7db94650773c3c035b6a96f696d630a5d63543fb","plan":"bb578a8ea3c18c2281334884b42f9acd158d76feacb609ecbff992de1dcfe7df"}}
```

**Beneficiary:** An agent the dashboard launched to work in a project, and the
maintainer who trusts the checks that agent publishes on.

**Goal:** A session the dashboard launches, on any host, runs in the
environment of the shell the developer started the dashboard from, without
what the dashboard's own start-up added on the way. Its `npm ci` then installs
the checkout's locked dev dependencies and its project commands resolve to the
checkout's own tools, so a passing readiness check means those tools ran.

**Findings:**
[checks whose result depends on where or how they are run](../../ProjectFindings.md#checks-whose-result-depends-on-where-or-how-they-are-run-second-priority-queued)
(DD-220).

**How the deployment's environment reaches a session today:** the developer
starts the dashboard with `npm run watch:dashboard`, which runs the deployment
under `npm run preview:dashboard`; each `npm run` prepends its package's
`node_modules/.bin` chain and npm's `node-gyp-bin` to `PATH` and exports
`npm_*` and `INIT_CWD`. Vite's preview then sets `NODE_ENV=production` inside
the dashboard process, because nothing had set it. The dashboard's host
processes (`claude --bg`, `claude attach`, the Codex launch and `codex resume`,
the Cursor runner it starts and the `cursor-agent` that runner launches) are
spawned with no environment of their own, or with `process.env`, so they
inherit all of it. With `NODE_ENV=production`, `npm ci` omits dev dependencies
("audited 1 package"), and a project command such as `tsc` resolves to the
deployment's copy or a parent checkout's. The session this refinement ran in
showed exactly that: `NODE_ENV=production`, two deployment `.bin` chains first
on `PATH`, and an empty `node_modules` in its worktree.

**Scope:**

- Every process the dashboard starts for a session, on every host, gets the
  dashboard's own environment with the dashboard's start-up additions removed:
  `NODE_ENV`, the `npm_*` variables and `INIT_CWD` that `npm run` exports, and
  the `PATH` entries `npm run` prepended (`node_modules/.bin` directories and
  npm's `node-gyp-bin`). This covers the launch itself, a terminal attach, and
  the Cursor runner together with what it launches: one rule, applied once,
  wherever the dashboard spawns a host.
- `NODE_ENV` is removed whatever its value. Vite sets it in the dashboard
  process (`production` under preview, `development` under the dev server),
  so its value never tells whether the developer's shell had set it. A
  developer shell normally has none, and one that exports `production` would
  skip dev dependencies in the developer's own `npm ci` too.
- Everything else passes through unchanged: the developer's own `PATH`
  entries, `HOME`, credentials, and the variables the dashboard's own
  configuration or a test put there. The launch environment is the developer's
  shell minus the additions above, not a clean environment. (The dashboard's
  specs steer their fake hosts through such pass-through variables, and a
  developer's tools and credentials reach sessions the same way.)
- Both ways of running the dashboard behave the same: the production
  deployment under `npm run watch:dashboard` and the development server under
  `npm run dev:dashboard`.
- The dashboard's specs prove this without a paid native run. A spec's own
  server already runs under `vite preview`, so it has `NODE_ENV=production`
  the way the deployment does; the spec also gives that server a `PATH` that
  starts with a `node_modules/.bin` directory and `npm run`'s variables. The
  fake host records the environment it was started with, and the spec reads
  that record.

**Deferred:** the published readiness guidance and the gate's own substitute
check (ODF-087 in DearDough.md keeps that facet); the dashboard's other
helper processes (`git`, `gh`, `osascript`, the start scripts it runs for
itself), which keep their environment; and the deployment's own build, which
already installs with `--include=dev`.

**Key examples:**

- The dashboard runs as the production deployment, so its process has
  `NODE_ENV=production`, `npm_lifecycle_event=preview:dashboard`, `INIT_CWD`,
  and two `node_modules/.bin` chains first on `PATH` → the developer starts a
  Claude session for a story → the `claude --bg` process has no `NODE_ENV`,
  no `npm_*` or `INIT_CWD`, a `PATH` without those entries, and otherwise the
  same variables. In that session `npm ci` installs the locked dev
  dependencies and `npx tsc` resolves to the worktree's own
  `node_modules/.bin/tsc`.
- The same dashboard → the developer starts a Codex session, or a Cursor
  session, whose runner the dashboard starts → the Codex process, and the
  `cursor-agent` the runner launches, get that same environment.
- A Claude session is running → the developer opens its terminal on the
  dashboard → the `claude attach` process gets that same environment.
- The developer's shell exported `GH_TOKEN` and a `PATH` entry for a private
  tools directory before starting the dashboard → a session it launches has
  both, unchanged.
- The dashboard runs as the development server (`npm run dev:dashboard`, so
  its process has `NODE_ENV=development` and the dev checkout's `.bin` first
  on `PATH`) → a session it launches has no `NODE_ENV` and no such `PATH`
  entry.
- A dashboard spec starts its server with `NODE_ENV=production`,
  `npm_lifecycle_event=preview:dashboard`, `INIT_CWD`, and a `PATH` that
  holds a `node_modules/.bin` directory ahead of the fake `claude`'s own
  directory → the spec launches a story session → the fake `claude` recorded
  an environment with none of those, with the rest of the server's variables
  present and its own directory still on the recorded `PATH`. No real host
  runs.
