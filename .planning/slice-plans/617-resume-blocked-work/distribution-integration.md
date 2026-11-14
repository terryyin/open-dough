# Distribution integration

Pinned merge: accepted branch `071122f6bd04602427934d3d526e317062b15ef4`
with main `91f32d39061d16793a190c5d9d9f2a6b26534fc7`, on 2026-11-14.
The merge remains uncommitted for coordinator review/delivery.

## Authority and preserved execution

Terry authored `951f66a76` (Group Open Dough Distribution source and tests).
Its AGENTS.md establishes `Distribution/src/skills/` and `Distribution/tests/`
as source/test homes. This is an existing human path decision, not a changed
story goal, scope, example, proof promise or execution authorization.

All 24 conflicts were resolved: the completed PLAN and 23 relocated new files.
Before adaptation, every relocated file was byte-identical to its accepted HEAD
source. The PLAN retained the completed execution record rather than main's spent
preparation record. Slices 1–3 remain done; slice 4 remains planned. G1/G2/G4/G5
remain proved, G3/G6 receiving slice 4. Source-review is byte-identical to HEAD.
The seed differs from HEAD only by canonical Distribution reference paths.
Historical commands, native records and artifact hashes remain historical.

Only the explicitly unmerged 24 paths were staged to clear the conflict index.
Published upstream staging was preserved. Additional dashboard import/evidence
edits remain unstaged. No duplicate indexed old `src/` or `tests/` runtime copies
remain. No installed `.agents/` or `.claude/` copy was hand-synchronized.

Root subsequently restored original gate-paragraph context around the new
resource link and corrected stale completed-refactor prose without changing
promises/statuses. Root's source-freshness result is terminal `unchanged` at
`e54f803182bae5a46fec0ace569562fac1e50686`; story/plan recognize Terry's
`951f66a76` amendment. The pinned integration proof did not chase later main.
PLAN and source-review remain within 250 lines.

## Path adaptations

| Seam | Result |
| --- | --- |
| New held execution/RPC modules and reference | `src/skills/dough-execute-plan/…` → `Distribution/src/skills/dough-execute-plan/…` |
| Native entry and helpers/builders | `tests/…` → `Distribution/tests/…` |
| Dashboard `server/hosts/codex/rpc.ts` | imports/exports `../../../../Distribution/src/skills/dough-execute-plan/scripts/codex-rpc.mjs` |
| Held test fixture → fakeCodex | `../../../../../dashboard/tests/support/fakeCodex.ts` |
| Native helper repository root | `../../..` from `Distribution/tests/support/` |
| Native dependency reader and module prefix | `Distribution/tests/support/native-import-closure.mjs`; `Distribution/src/skills/dough-execute-plan/scripts/` |
| Installed destination | unchanged `.agents/skills/dough-execute-plan/scripts/` |

The merged canonical MakeMe retains `HeldExecutionBuilder` and upstream members.
The 11-module runtime closure is byte-identical to accepted HEAD at its old paths,
and imports only standard-library or relative runtime modules. No native behavior,
model, policy, permission, observer or canonical ownership changed.

## Admission and selection

Root supplied fresh locked `npm ci` here; lockfile unchanged across the merge.
Our `npm run typecheck:dashboard` completed exit 0 (terminal 48523).
Before proof: load 4.65/6.34/8.65, 16 KiB pages, about 16.6 GB inactive and
2.8 GB speculative memory; AC power, battery charged 100%. Runs used Node jobs 2,
browser workers 1 and `caffeinate -s -i`. Later natural load was 11.10/9.30/9.38.
No full group/suite or paid native/quota probe was launched.

Installed `test-entry-rules.mjs --project . --source …` resolved all six moved
held suites plus codex-rpc under the current Distribution entry: MakeMe true,
PageObjects false. Installed MakeMe selection and convention were read before
the fixture import adaptation; helpers inherit consuming-test selection.
No browser test/helper source was edited.
The [failure policy](../../../AGENTS.md#failing-and-flaky-tests) applies as written.

## Focused proof

All runner commands below use `PATH=/opt/homebrew/bin:$PATH`. The initial share
preview correctly refused the default `/bin/bash` 3.2; the maintained Bash 5 PATH
resolved that setup issue, with no product change or repeated failing test.

`OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test --` selected these 16 jobs,
terminal 79589, exit 0:

```text
Distribution/src/skills/dough-execute-plan/scripts/blocked-execution.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/blocked-execution-races.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/blocked-execution-observation.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/blocked-execution-attention.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/blocked-execution-loss.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/blocked-execution-usage.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/codex-rpc.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/execution-completion-recovery.test.mjs
Distribution/src/skills/dough-execute-plan/scripts/execution-completion-recovery-guidance.test.mjs
Distribution/tests/payload-declaration-links.sh
Distribution/tests/install-public-payload.sh
Distribution/tests/install-all-tools.sh
Distribution/tests/execution-payload-update.sh
Distribution/tests/support/native-import-closure.test.mjs
Distribution/tests/native-evidence-identity.sh
```

Observed retained assertions include zero unchanged-state model requests, one
qualified continuation, insufficient-evidence rearm, enrollment-window changes,
lost acknowledgment/history reconciliation without resend, failed-rearm terminal
retention, settled recovery without duplicate submission, controlled deadline and
signal/CI-loss attention, missing reset evidence and unchanged authority/settings.
RPC proof covers large history, fragmented Unicode, refusal codes, malformed
messages and abort ownership. Payload/install checks prove the relocated source
still installs and updates its runtime/reference closure across tool roots.

`node Distribution/tests/support/native-import-closure.mjs .
Distribution/src/skills/dough-execute-plan/scripts/blocked-execution.mjs`
resolved 11 modules. A disposable, non-paid `prepareHeldNativeProject` check
copied that closure into `.agents`, imported the worker, verified 11 payload
hash entries and accepted local proof, and constructed the native held input.
Its first scratch assertion read the wrong nesting (`input.identity`); correcting
that inspection to `input.execution.identity` passed without maintained edits.
The temporary project was removed. This proves preparation, not native execution.

## Browser consumer inventory

The changed fakeCodex history/input contracts and dashboard RPC reach these
direct spec consumers. The [current trace](distribution-integration-trace.md.gz)
separates our four content adaptations from published upstream moves and names
each direct consumer. Existing transitive generic/type-only callers retain the
earlier [consumer dispositions](slice2-consumer-trace.md.gz). Production RPC consumers remain Codex options,
launch/conversation, sessions, recovery, done/blank and final-report owners.

| Group command | Selected sources | Result |
| --- | --- | --- |
| `npm run test:dashboard:backend -- … --workers=1` | 14 specs below | exit 0, terminal 47395 |
| `npm run test:dashboard:integrated -- dashboard/tests/launches/agent-launch-codex-model.spec.ts --workers=1` | discovered model selection/preparation/native creation | exit 0, terminal 42310 |
| `npm run test:e2e -- e2e/intent/intent-story-changes-landed-run.spec.ts e2e/launches/agent-launch-codex-creation.spec.ts e2e/sessions/project-restored-session.spec.ts --workers=1` | landed review/Intent round trip; lost creation identity/reconciliation; retained passive service | exit 0, terminal 96096; 5/5 passed, zero retries |
| `npm run test:dashboard:frontend` | no changed contract consumer; no frontend source edit | not selected |

The backend invocation named each of these paths under `dashboard/backend-tests/`:

```text
launches/agent-launch-codex-creation-boundary.spec.ts
launches/agent-launch-follow-up-codex.spec.ts
launches/agent-launch-start-session-identity.spec.ts
launches/agent-launch-duplicate.spec.ts
launches/agent-launch-codex-startup.spec.ts
sessions/agent-launch-codex-observation-status.spec.ts
sessions/agent-launch-session-options.spec.ts
sessions/final-report-codex.spec.ts
sessions/agent-launch-sessions-listing.spec.ts
sessions/agent-launch-codex-observation-sharing.spec.ts
sessions/sessions-replay.spec.ts
sessions/agent-launch-codex-observation-wait.spec.ts
terminals/agent-terminal-codex.spec.ts
terminals/agent-terminal-codex-close.spec.ts
```

These assert identity persistence before first input, follow-up/retry context,
overlap suppression, startup recovery, provenance/missing-target and cancellation
behavior, shared observations, final-report identity, listing/history, replay,
native terminal resume/detach and owned socket teardown. Quiet successful browser
runs remove their output directory; terminal exit status is retained above.
The E2E run also wrote `/tmp/seed345-distribution-e2e-proof.json`; its completed
five-test observations are retained in the compressed current trace.

## CI share preview and remaining gates

`node scripts/test-shares.mjs preview --split-count 4` exits 0: 651 jobs,
644 recorded and 7 new/unrecorded jobs at the recorded 1.2-second median.
Shares predict 502.3 / 502.3 / 501.1 / 502.2 job-seconds, headroom
191.7 / 191.7 / 192.9 / 191.8 against the unchanged 694 ceiling.
New jobs: held main/loss (share 1), observation/RPC (share 2), races (share 3),
attention/usage (share 4). No budget or timing-list change was made.

Slice 4 full invocation/comparison and native attention observation remain open;
prior actual native evidence is reused only for its unchanged observed boundary.
Root owns source freshness, independent refactoring/disposition, formatting,
final staging/commit/publication and sanctioned stash restoration. The original
`seed345-resume` CI observer and CI configuration were not altered.

Independent `distribution_refactor` returned **none — already clean** with
`## REFACTOR COMPLETE`: no edits or test reruns, all adapted files <=250 lines,
whitespace checks passed and accepted proof unchanged. Reviewed four adaptations
and all 23 relocated files against accepted HEAD; no runtime duplication or gap.
