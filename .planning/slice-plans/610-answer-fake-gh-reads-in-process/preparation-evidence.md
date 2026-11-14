# Preparation premises and baseline evidence

## Decisive premises and preparation observations

All local observations: this owned checkout at `94ebb9180`, 2026-11-13,
macOS arm64, Node 24.21.0, AC power. Scratch support under
`node_modules/.seed332-observation` was removed before recording preparation;
no implementation is retained. These are feasibility observations, not final
acceptance of the unimplemented candidate.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| The current CLI still has avoidable per-call transport cost | 21 sequential `execFile('./dashboard/tests/fixtures/fake-gh', ['api','--include','repos/test/repo/commits/main'])` calls against `startFakeGitHub`: 1658.8 ms before answerer arrival plus 463.5 ms from arrival through process completion. Same argv and answer via 21 sequential `fetch` POSTs: 14.7 + 8.5 ms. All 42 calls returned the expected body. Natural load was in the 30s; no burners. | Diagnostic on a small answer; not the complete comparison journey or hosted timing. |
| A native owner can run the fake API in process without a production seam | Scratch `node .../observe.mjs` called real `GitHubRequests.request(['api','repos/test/repo/commits/main'], signal)` with an isolated owner and a CLI that answers auth but exits 99 for every API call: failure, zero fake calls. Same command with `NODE_OPTIONS=--import=<owned scratch>/gh-preload.mjs`: body `from-fake`, one fake call. The preload explicitly added `--import` to the owner spawn and intercepted only owner API execution. | Full transport contracts belong to slice 1; no fabricated child PID was needed. |
| The real preview journey reaches and can use that transport | `npm run test:dashboard -- tests/intent/intent-project-scope-timing-refresh.spec.ts --workers=2 --reporter=list`, with the scoped scratch preload: 2 passed, 27.6 s total; case durations 9.0 and 10.8 s. Real server, request owner and page ran. | Not a controlled end-to-end speedup comparison; other work and baseline work overlapped. Boundary/dev and custom-owner consumers remain slice 2 rollout proof, not assumed equivalent. |
| Native process proof remains available independently | `npm run test:dashboard -- backend-tests/runtime/fake-gh-client.spec.ts backend-tests/runtime/fake-gh-client-lifecycle.spec.ts tests/intent/intent-project-scope-timing-refresh.spec.ts --workers=2 --reporter=list`: 13 passed in 47.0 s, including real SIGTERM/SIGINT, auth hold, binary argv/body and orphan cleanup; refresh cases 17.2 and 20.5 s. | Retain this CLI path; rerun its observations after selecting it explicitly. |
| Existing hosted profile runs the same fixture and keeps timing evidence | Read `ci.yml`, `playwright.config.ts`, `tests/shards.md`; queried [successful main run 43336803436](https://github.com/terryyin/open-dough/actions/runs/43336803436), revision `15377f89304821fdb8bc29c71b45e1d30926e0a7`, created 2026-11-13 00:24:22 UTC. All 13 dashboard jobs, lint, three repository shares and CI proof succeeded; all 13 `dashboard-times-*` artifacts were listed unexpired. | Candidate Linux behavior and timing are final hosted proof, not established by this baseline. |

The first overly broad scratch preload broke promisified `execFile` during
origin preparation (`stdout.trim` on undefined). Scoping interception to the
owner and adding its preload explicitly fixed both refresh cases. Preserve that
lesson in the implementation boundary; the failed experiment is not a product
failure left for another owner.

Hosted baseline browser-step seconds, shards 1–13 respectively:
209, 235, 243, 205, 196, 276, 225, 199, 160, 189, 263, 238, 174.
Whole job seconds: 237, 256, 264, 235, 220, 300, 247, 221, 180, 208,
293, 273, 198. Source command:
`gh run view 43336803436 --repo terryyin/open-dough --json jobs`;
differences of each browser step's and job's start/end timestamps. These are
observed durations, not spare CPU capacity. Retrieve retained artifacts before
their 2026-11-20 expiry, or select a newer comparable successful baseline.


## Current decisions and plan review

Both slices have one capability outcome and its proof loop; the opt-in increment
contains the mechanics it needs and the default increment owns all consumer
selection and load/hosted proof. No separate Structure slice, new North Star,
numeric slice target, hard limit, trunk-only step or human checkpoint is needed.
Slice-plan refinement was not needed: no unresolved boundary, cumulative design,
sizing or proof-ownership concern was identified. Final candidate contracts,
other startup profiles and performance are implementation acceptance work with
explicit owners above, not claimed complete by the scratch preview experiment.
