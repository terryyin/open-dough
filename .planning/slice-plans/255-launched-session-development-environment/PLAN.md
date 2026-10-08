# A session the dashboard launches prepares its checkout as a developer shell would

**Identity:** SEED-100#launched-session-development-environment
**Source:** [refined story](../../seeds/SEED-100-project-checks-trustworthy.md#launched-session-development-environment).
**Prepared:** 2026-10-06. Planning only, in the established preparation workspace.

## Goal and boundaries

Every process the dashboard starts for a session, on every host, runs in the
dashboard's own environment with the dashboard's start-up additions removed:
`NODE_ENV`, the `npm_*` variables and `INIT_CWD` that `npm run` exports, and
the `PATH` entries `npm run` prepended (`node_modules/.bin` directories and
npm's `node-gyp-bin`). Everything else passes through unchanged. A session's
`npm ci` then installs the locked dev dependencies and its project commands
resolve to the checkout's own tools.

Scope, deferred promises, boundary assumptions, and key examples are those of
the source story. Material exclusions: the published readiness guidance
(ODF-087); the dashboard's helper processes (`git`, `gh`, `osascript`, the
start scripts it runs for itself); the deployment's own build; and the other
variables npm also sets (`NODE`, `COLOR`, `EDITOR`), which are harmless to a
session and, for `EDITOR`, may be the developer's own value.

Assumptions: a developer shell has no `NODE_ENV`; the launch cannot tell a
shell's own `NODE_ENV` from Vite's and removes it whatever its value. The
install and tool-resolution outcome in a real session follows from npm's own
rule (`NODE_ENV=production` omits dev dependencies) and from the evidence in
the story; this plan proves the environment at the host boundary with the
fake hosts and runs no paid native session.

## Direction and PFE

No North Star topic governs this choice and none is warranted: the work adds
one rule at an existing boundary. ADR
[0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) applies: the
launch environment is one fact with one owner, a single module every host
spawn reads, not a rule repeated per host. ADR 0008 (dashboard architecture)
is Proposed, not Accepted; its launch-boundary intent is consistent with
keeping native commands private to each host module.

PFE findings and choices:

- **No existing environment rule.** `dashboard/server` has no module that
  shapes a child's environment. `ghRead.ts` spreads `process.env` to add one
  variable for `gh`; `gitRunner.ts` merges caller overrides; the Cursor runner
  spawn passes `env: process.env`; every other host spawn passes no `env` and
  inherits. `productionDeployment.mjs` answers the deployment's own build with
  `npm ci --include=dev` and says nothing about sessions. The published
  execution scripts set `npm_config_*` only in their own test fixtures. So:
  add one pure module beside the host modules, `developerShellEnvironment`
  (name capability-led; file under `dashboard/server/`), that takes an
  environment and returns the copy without the start-up additions, and apply
  it at each host spawn.
- **Where the rule applies.** Claude: `execClaude` and `attachClaude` in
  `hosts/claude/runtime.ts`. Codex: `daemonEndpoint` in `hosts/codex/rpc.ts`
  (the shared daemon the dashboard may be first to start) and the resume PTY
  in `hosts/codex/terminal.ts`. Cursor: the runner spawn in
  `hosts/cursor/runnerProcess.ts`, and the runner's own spawns in
  `hosts/cursor/exec.ts` and `hosts/cursor/terminal.ts`, so a runner that an
  earlier deployment started (the runner outlives the preview by design,
  `production-cursor-runner.spec.ts`) launches a clean `cursor-agent` after an
  update without a restart. Applying the rule twice is a no-op.
- **Observation.** The fake hosts already receive the server's environment:
  `fake-claude` exits without `FAKE_CLAUDE_DIR`, `fake-codex` without
  `FAKE_CODEX_SOCKET`, `fake-cursor` logs to `FAKE_CURSOR_LOG`. Each gains a
  record of the environment it was started with. `fake-claude` adds an `env`
  field to its `calls.jsonl` and `attaches.jsonl` lines (consumers read
  `argv`/`cwd` and `pid`/`id`, so the field is additive). `fake-cursor` adds
  `env` to its log line (consumers map `args` or count). `fake-codex` writes a
  separate per-invocation environment log, because four specs compare its
  daemon-start log whole (`toEqual([{ cwd }])`). Record only what the proof
  reads: `NODE_ENV`, `PATH`, every `npm_*` key, `INIT_CWD`, and the
  pass-through markers, to keep logs small.
- **Deployment-like server in a spec.** `startDashboardServer` composes the
  server's environment from `process.env` plus the fake wiring; `pathPrefix`
  places directories first on `PATH` and `extraEnv` adds variables. A spec
  therefore gives its server a `pathPrefix` of a created
  `<temp>/node_modules/.bin` directory and `extraEnv` of
  `npm_lifecycle_event=preview:dashboard`, `npm_config_local_prefix`,
  `INIT_CWD`, and one pass-through marker. `NODE_ENV` needs no arrangement:
  Vite sets it inside the server (`production` under preview, `development`
  under the dev server).

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| Vite sets `NODE_ENV` inside a preview server that had none (slice 1 proof needs no arrangement) | `env -u NODE_ENV node` calling `preview({configFile: 'dashboard/vite.config.mts', …})` printed `before: undefined` then `inside preview server: production`. `node_modules/vite/dist/node/chunks/node.js` 35008 calls `resolveConfig(…, "serve", "production", "production", true)`; 36897 sets `process.env.NODE_ENV = defaultNodeEnv` when unset. |
| The deployment's host processes inherit the dashboard's environment (the defect) | This session: `NODE_ENV=production`, `npm_lifecycle_event=preview:dashboard`, `INIT_CWD`, two `node_modules/.bin` chains and two `node-gyp-bin` entries first on `PATH`, `node_modules` empty before `env -u NODE_ENV npm ci`. `ps`: `npm run watch:dashboard` → `scripts/watch-dashboard.mjs` (spawns with `env: process.env`) → `npm run preview:dashboard` → `vite preview`. |
| Every host spawn site and its environment handling (slices 1–3) | `grep -rn 'execFile(\|spawn(\|spawnPty('` under `dashboard/server`: `hosts/claude/runtime.ts` 35 (`execFile("claude")`, no env) and 89 (`spawnPty("claude", ["attach"])`, no env); `hosts/codex/rpc.ts` 33 (`execute("codex", ["app-server","daemon","start"])`, no env); `hosts/codex/terminal.ts` 21 (`spawnPty("codex", ["resume"…])`, no env); `hosts/cursor/runnerProcess.ts` 100–107 (`env: process.env`); `hosts/cursor/exec.ts` 19 (`execFile(cursorAgent)`, no env); `hosts/cursor/terminal.ts` 34 (`spawnPty(command)`, no env). No other `process.env` use shapes a child. |
| A PTY spawned without `env` inherits the server's environment (slices 1–3 attach proof) | `fake-claude` exits with "FAKE_CLAUDE_DIR is not set" without that variable, which only the server's environment supplies; `npx playwright test agent-terminal.spec.ts agent-launch-ad-hoc-cursor.spec.ts` → 4 passed, so today's attaches inherit it. |
| The spec server's environment can carry the deployment's markers and fake hosts see them (slices 1–3) | `support/dashboardServer.ts` 118–131: `env = {...process.env, ...ghEnv, ...claude.env, ...codex.env, PATH: [...pathPrefix, codex.binDir, claude PATH], ...extraEnv}`; `fakeGhEnv` appends `process.env.PATH`. Fake bins live in `<temp>/bin`, `claude-bin`, `osascript-bin`, `node-bin`: none is a `node_modules/.bin`, so the rule keeps them. |
| Fixture record shapes and their readers (slices 1–3) | `support/fakeClaude.ts` `ClaudeCall = {argv, cwd}`, `claudeAttaches` maps `pid`/`id`; `support/fakeCursor.ts` readers use `.map((call) => call.args)` and `toHaveLength`; `support/codexObservation.ts` `daemonStarts` parses the whole log and `agent-launch-codex-options/startup/observation.spec.ts` compare it with `toEqual([{ cwd }])`. |
| The launch journeys for all three hosts run in this workspace | After `env -u NODE_ENV npm ci --include=dev`: `npx playwright test agent-launch-boundary.spec.ts agent-launch-codex-startup.spec.ts agent-launch-start-cursor.spec.ts` → 23 passed (10.2s); `agent-launch-boundary.spec.ts` runs each test in dev and preview modes. |
| The Cursor runner receives the server's environment and its spawns inherit the runner's | `runnerProcess.ts` 106 `env: process.env`; `runnerMain.ts` 131 `execCursor(body.args, body.cwd, …)` and 159 `spawnCursorPty(body.command, …)` pass no env; `fake-cursor` reads `FAKE_CURSOR_LOG` from its own environment and the ad hoc Cursor journey passes. |
| Next free plan number | `origin/main` and this workspace end at 253; another workspace holds `254-dashboard-specs-deterministic`. Allocated 255. |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Claude launch gets no `NODE_ENV`, `npm_*`, `INIT_CWD`, or npm `PATH` entries; the rest passes through (examples 1, 4) | 1 | Launch boundary journey, preview mode |
| The dev server's sessions get the same (example 5) | 1 | Launch boundary journey, dev mode |
| `claude attach` gets the same (example 3) | 1 | Terminal journey |
| Codex daemon start and resume get the same (example 2) | 2 | Codex startup journey and a Codex terminal journey |
| Cursor runner, `create-chat`, and kept client get the same (example 2) | 3 | Ad hoc Cursor journey; runner survival journey stays green |
| Spec observation without a native run (example 6) | 1–3 | The same journeys: fake hosts only |
| Documentation of the launch environment | 1 | `dashboard/AGENT-LAUNCH-HOSTS.md` and `dashboard/tests/README.md` |

## Ordered slices

### 1. Claude sessions and terminals start in the developer's shell environment
Type: Behavior
Status: done
Accepted proof: `env -u NODE_ENV ./node_modules/.bin/playwright test --config
dashboard/playwright.config.ts agent-launch-boundary.spec.ts
agent-launch-environment.spec.ts agent-terminal.spec.ts` → 19 passed; the
fake-claude record readers' specs (`agent-launch-done*`,
`session-workspace-retirement-claude`, `session-instruction-voice`,
`agent-terminal-boundary`, `agent-launch-card-problems`,
`agent-launch-host-identity`) → 56 passed; dashboard typecheck passes. The
deployment-like start lives in `support/launchEnvironment.ts`
(`deploymentLikeStart`, `expectDeveloperShellEnvironment`), and the new
boundary test sits in its own `agent-launch-environment.spec.ts` to keep the
boundary spec within the file-size limit; slices 2 and 3 reuse both.
Proof: `npx playwright test agent-launch-boundary.spec.ts agent-terminal.spec.ts`.
A new boundary test in both modes starts its server with a
`<temp>/node_modules/.bin` `pathPrefix` and `extraEnv` of
`npm_lifecycle_event`, `npm_config_local_prefix`, `INIT_CWD`, and a
pass-through marker, launches a story session, and reads the fake `claude`'s
recorded environment: no `NODE_ENV`, no `npm_*`, no `INIT_CWD`, a `PATH`
without the prefixed `.bin` directory and without any `node-gyp-bin` entry,
the fake's own directory still on it, and the marker and `FAKE_CLAUDE_DIR`
present. The terminal journey asserts the same on the attach record. Existing
tests in both specs stay green. `npm run typecheck:dashboard` and the commit
hook's lint.

Behavior: The dashboard's process carries npm's and Vite's additions → a
developer starts a Claude session, or opens its terminal → `claude --bg` and
`claude attach` run with those additions removed and everything else intact.

Deliver together: the pure environment module with the rule above; its use
in `execClaude` and `attachClaude`; `fake-claude` recording `env` on launch
and attach lines; the two journey additions; a paragraph in
`dashboard/AGENT-LAUNCH-HOSTS.md` stating the launch environment rule for
every host, and the fixture's recording in `dashboard/tests/README.md`.

### 2. Codex daemon start and resume get the same environment
Type: Behavior
Status: done
Accepted proof: `env -u NODE_ENV ./node_modules/.bin/playwright test --config
dashboard/playwright.config.ts agent-launch-codex-startup.spec.ts
agent-terminal-codex.spec.ts agent-launch-environment.spec.ts
agent-terminal.spec.ts agent-launch-boundary.spec.ts` → 31 passed (without
the rule, the 4 new Codex assertions failed on the `npm_*` check); the Codex
and Cursor consumer specs → 144 passed; typecheck passes. `fake-codex` logs
`{args, env}` to `FAKE_CODEX_ENV_LOG`, read by `codexEnvironments`; both fakes
choose recorded keys through `fixtures/fake-host-environment.cjs`, which slice
3's fake `cursor-agent` reuses. CI on slice 1 (run 37708289068) failed the
four limit-recovery and read-resumption tests that already failed on `main` at
b5b7de82, an ancestor of this branch's base; `main` repaired them in 65b4fe05
and ddc2072c, so this branch merges `main` rather than repairing them.
Proof: `npx playwright test agent-launch-codex-startup.spec.ts
agent-terminal-codex.spec.ts`. The startup journey gives its server the same
markers as slice 1 and reads the fake `codex`'s separate environment log for
the daemon start; the terminal journey, whose `codexAttaches` record is read
with `toMatchObject`, reads it for `codex resume`. The existing daemon-start
log comparisons stay unchanged and green.

Behavior: The dashboard is first to start the shared Codex daemon, or opens
a Codex terminal → `codex app-server daemon start` and `codex resume` run
with the additions removed.

Deliver together: the rule applied in `daemonEndpoint` and the resume PTY;
`fake-codex` writing a per-invocation environment log named by a new
`FAKE_CODEX_*` variable that `support/fakeCodex.ts` supplies and a reader
beside `daemonStarts`.

### 3. The Cursor runner and the cursor-agent it starts get the same environment
Type: Behavior
Status: planned
Proof: `npx playwright test agent-launch-ad-hoc-cursor.spec.ts
production-cursor-runner.spec.ts`. The ad hoc journey gives its server the
same markers and reads the fake `cursor-agent`'s recorded environment for
`create-chat` and for the kept client; the runner survival journey stays
green.

Behavior: The dashboard starts its Cursor runner and a session's
`create-chat` and kept client → the runner and both `cursor-agent` processes
run with the additions removed; a runner an earlier deployment started also
starts clean clients, since the runner applies the rule at its own spawns.

Deliver together: the rule applied at the runner spawn (`env` argument), in
`execCursor`, and in `spawnCursorPty`; `fake-cursor` recording `env`; the
journey addition.

## Current decisions

- The rule removes exactly: `NODE_ENV`; keys starting `npm_`; `INIT_CWD`;
  `PATH` entries whose last segment is `node_modules/.bin` or that end in
  `@npmcli/run-script/lib/node-gyp-bin`. Nothing else, no clean environment.
- Fixtures record environment additively where readers tolerate it, and in a
  separate log where a reader compares the whole record (`fake-codex`).
- Local proof is the focused journeys named per slice plus the dashboard
  typecheck; the commit hook runs lint. Hosted CI runs the full dashboard
  suite after publication.
