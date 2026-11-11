# Execution context

- Established execution: `SEED-310#show-trunk-test-scope-timing-history`, publisher
  `dashboard-territory.local-open-dough`, agent `terry-chan`; story-branch mode,
  owned checkout `/Users/terryyin/git/open-dough/.worktrees/show-trunk-test-scope-timing-history`,
  branch `codex/show-trunk-test-scope-timing-history`; remote `origin`, trunk `main`.
  Starting revision `acb7756fb8a31a3cbc3c6e6347aab569e94cb08c`; published Take/base
  `4f52bca1dbaac29a5d3d479975c50106774ee5fd`, confirmed on the remote execution
  branch. The startup claim's trunk CI is unobserved by this coordinator.
- Checkout preparation: `node scripts/setup-native.mjs npm` and
  `node scripts/setup-native.mjs check` passed with locked Node 24.21.0 and
  Chromium 153.0.8010.12. No dependency metadata changed. Check-only staged lint
  and dashboard typecheck hook understood; `npm run format` selects the changed
  and new files from Git (its script does not use positional path arguments).
- CI: GitHub Actions, verified `ci.yml` / `CI` (workflow 351271804); target
  `terryyin/open-dough`, `codex/show-trunk-test-scope-timing-history`.
  Codex coordinator `seed310-codex`, yielded cell `g118:13`, session `58648`,
  observer `/tmp/dough-ci-501/watch-gagzqr`, PID `99027`, bound to this checkout.
- Expensive-proof decision: this macOS host is awake on AC/100%; startup load
  23.16/18.26/13.87, memory free 43%, with unrelated Node and Python work active.
  Run focused browser proof sequentially at one worker under `caffeinate -s -i`;
  no full suite locally. Implementation owns named proof to terminal result,
  rechecking load/memory and competing work immediately before launch or repeat.
- Replanning permission: retain ordinary active-plan refinement authority; no
  explicit replan prohibition. No numeric slice limit; one proof loop per slice.
