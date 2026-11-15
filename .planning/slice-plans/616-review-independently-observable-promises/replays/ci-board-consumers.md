# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/tests/navigation/board-paging-side-panel.spec.ts` | changed path |
| `board-paging-side-panel.spec.ts` | basename of `dashboard/tests/navigation/board-paging-side-panel.spec.ts` |
| `untilPageRequestsAnswered` | supplied |
| `Recently done 0 entries` | supplied |
| `native launch` | supplied |
| `dashboard/tests/navigation/board-paging-side-panel.spec` | import path of `dashboard/tests/navigation/board-paging-side-panel.spec.ts` |
| `board-paging-side-panel.spec` | import path of `dashboard/tests/navigation/board-paging-side-panel.spec.ts` |

## Scope

Whole checkout at `c6eabcac7f63`, including uncommitted and untracked files: 6851 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/tests/navigation/board-paging-side-panel.spec.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/done/SEED-373_swipe-between-story-board-columns.json` | `Recently done 0 entries` | 11: `"report": "**Verdict: Caught.** The maintained phone indicator journey catches removal of accessible neighboring-column names after the observed Backlog → Take…` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/integrated.longest-first-project` | `board-paging-side-panel.spec.ts`, `board-paging-side-panel.spec` | 75: `9.6	tests/navigation/board-paging-side-panel.spec.ts` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/hosts/claude/runtime.ts` | `native launch` | 171: `// absence. Native launch and rename confirmation reuse the private listing.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/knownLaunchWorkspace.ts` | `native launch` | 2: `// before further publication or native launch effects.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/launchRecord.ts` | `native launch` | 1: `// The start context and record shared by native launch and verification.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/launchRecordBinding.ts` | `native launch` | 61: `// A settled native launch cannot be recreated by a late writer after deletion.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/launchRecordDeletion.ts` | `native launch` | 1: `// Deletion records launch-local intent even before native launch settlement.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/launchReportingPreparation.ts` | `native launch` | 2: `// workspace: refuse incomplete installed support before native launch, and` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/launchRun.ts` | `native launch` | 2: `// start, then the common native launch/recovery lifetime, which preserves the` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/reportingInstruction.ts` | `native launch` | 4: `// All host grammars carry the same explicit channel; blank native launches stay blank.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/retainedUsageTasks.ts` | `native launch` | 1: `// Import only retained launch facts. Do not fabricate native launch requests or` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/server/sessionStartStore.ts` | `native launch` | 11: `// failed native launch or formatter keeps its established session for retry.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/src/launchAttemptSelection.ts` | `native launch` | 5: `// any native launch. Continue retries its recording checkpoint.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/src/launchRecord.ts` | `native launch` | 1: `// Durable native launch evidence and current session observations.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/src/unattachedSession.ts` | `native launch` | 42: `// that sends none stays a blank native launch.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/backend-tests/launches/agent-launch-ad-hoc-cursor-established.spec.ts` | `native launch` | 181: `// keeps the native launch unconfirmed without opening a client.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/backend-tests/launches/agent-launch-incomplete-reporting-settlement.spec.ts` | `native launch` | 2: `// support before native launch and preserves the kept start.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/backend-tests/sessions/agent-completion-quiet-closure.spec.ts` | `native launch` | 90: `if (previous === undefined) throw new Error("No accepted native launch");` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/frontend-tests/board-indicators.spec.ts` | `Recently done 0 entries` | 27: `["Backlog 2 entries", "Recently done 0 entries"],` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/frontend-tests/board-swipe.spec.ts` | `Recently done 0 entries` | 50: `await at(page, "Taken", ["Backlog 2 entries", "Recently done 0 entries"]);` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts` | `untilPageRequestsAnswered` | 13: `import { untilPageRequestsAnswered } from "../tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/frontend-tests/intent-candidates-read-recovery.spec.ts` | `untilPageRequestsAnswered` | 16: `import { untilPageRequestsAnswered } from "../tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/frontend-tests/launches/responsive-session-access-unattached.spec.ts` | `untilPageRequestsAnswered` | 17: `import { untilPageRequestsAnswered } from "../../tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/frontend-tests/sessions/recently-done-sessions-review-cue.spec.ts` | `untilPageRequestsAnswered` | 20: `import { untilPageRequestsAnswered } from "../../tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/autoRefreshJourney.ts` | `untilPageRequestsAnswered` | 26: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/intent-ci-comparison-proof.md` | `native launch` | 103: `Measure native launch/capture preservation separately with` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/intent/intent-ci-comparison-drilldown-relative.spec.ts` | `untilPageRequestsAnswered` | 20: `import { untilPageRequestsAnswered } from "../pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/intent/intent-read-recovery.spec.ts` | `untilPageRequestsAnswered` | 28: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/intent/intent-test-optimization-candidates-states.spec.ts` | `untilPageRequestsAnswered` | 19: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/intentReadRecoveryPage.ts` | `untilPageRequestsAnswered` | 22: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/keptStartJourney.ts` | `untilPageRequestsAnswered` | 37: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/navigation/accessible-board-touch.spec.ts` | `Recently done 0 entries` | 178: `` [`Backlog ${queuedCount} entries`, "Recently done 0 entries"], `` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/navigation/board-clamp.spec.ts` | `Recently done 0 entries` | 63: `await expectView(page, ["Backlog", "Taken"], ["Recently done 0 entries"]);` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/navigation/board-kept.spec.ts` | `Recently done 0 entries` | 29: `expectView(page, ["Backlog", "Taken"], ["Recently done 0 entries"]);` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/navigation/board-paging.spec.ts` | `board-paging-side-panel.spec.ts`, `Recently done 0 entries`, `board-paging-side-panel.spec` | 9: `// ./board-paging-side-panel.spec.ts; that three columns show side` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/navigation/story-reference-done.spec.ts` | `untilPageRequestsAnswered` | 7: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/nextActionReads.ts` | `untilPageRequestsAnswered` | 13: `import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/pageRequestNotes.ts` | `untilPageRequestsAnswered` | 49: `export async function untilPageRequestsAnswered(page: Page): Promise<void> {` |run: unchanged synchronization owner exercised by the repaired Board journey |
| `dashboard/tests/storyColumnsPage.ts` | `untilPageRequestsAnswered` | 22: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/storyReadinessAccessible.ts` | `untilPageRequestsAnswered` | 27: `import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/storyReviewPages.ts` | `untilPageRequestsAnswered` | 16: `import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `Distribution/tests/adr-awareness/native-adr-awareness-wrappers.md` | `native launch` | 12: `` \| `--results-dir DIR` \| Temporary result directory for judging the current attempt. Listing may read `DIR/<host>/<case>/<attempt-id>/` as **unreviewed** eviden… `` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `Distribution/tests/delivery-evidence/proof-scheduling-native.sh` | `native launch` | 39: `Credential-free by default. --native launches one paid host session per` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/storedReviewChoices.ts` | `native launch` | 2: `// Every test has a private origin/store; no native launch arranges these records.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/tests/support/watcherNativeCodex.ts` | `native launch` | 1: `// The watcher drains an actual native launch. A blank Codex conversation` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `Distribution/tests/support/execution-worktree-prep-native-run.sh` | `native launch` | 2: `# Prompt, payload install, native launch, retain, and live assess helpers.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `Distribution/tests/support/execution-worktree-prep-native.sh` | `native launch` | 47: `'Selected native launch with --results-dir requires a writable directory; without it the native path still retains a disposable attempt directory.'` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `Distribution/tests/support/makeme-common-selection-observe.mjs` | `native launch` | 4: `// The native launcher fixes the project cwd. An absolute project argument must` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `Distribution/tests/support/native-cases.sh` | `native launch` | 45: `'Selected native launch with --results-dir requires a writable directory; without it the native path still uses disposable scratch.'` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `Distribution/tests/support/page-object-native-run.sh` | `native launch` | 2: `# Manually invoked paid probe. Reuse writable native launch profiles, owned` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |

### Journey or feature

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `e2e/launches/agent-launch-base-ci.spec.ts` | `native launch` | 1: `// Installed execution starts judge published target CI before native launch.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-options-kept.spec.ts` | `untilPageRequestsAnswered` | 20: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-preparation-codex-recovery.spec.ts` | `native launch` | 69: `// local preparation evidence must not cause a replacement native launch.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-preparation-codex-retry.spec.ts` | `untilPageRequestsAnswered` | 19: `import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-preparation-kept.spec.ts` | `untilPageRequestsAnswered` | 30: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-publication-receipt-failure.spec.ts` | `untilPageRequestsAnswered`, `native launch` | 37: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-session-choices.spec.ts` | `untilPageRequestsAnswered` | 21: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-start-codex.spec.ts` | `untilPageRequestsAnswered` | 31: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-start-dependencies.spec.ts` | `untilPageRequestsAnswered`, `native launch` | 2: `// Synthetic Claude observes native launch; it supplies no start refusal.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/agent-launch-start-taken.spec.ts` | `untilPageRequestsAnswered` | 25: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/responsive-session-reconciliation-refusals.spec.ts` | `untilPageRequestsAnswered` | 21: `import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/launches/responsive-session-start.spec.ts` | `native launch` | 6: `` // assignment, with the synthetic `claude` holding the native launch `` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/observation/auto-refresh-rate-limit.spec.ts` | `untilPageRequestsAnswered` | 40: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/observation/auto-refresh-visibility.spec.ts` | `untilPageRequestsAnswered` | 37: `import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/observation/auto-refresh.spec.ts` | `untilPageRequestsAnswered` | 46: `import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/observation/limited-reading-check.spec.ts` | `untilPageRequestsAnswered` | 13: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/observation/limited-reading-detail.spec.ts` | `untilPageRequestsAnswered` | 34: `import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/observation/revision-check-return.spec.ts` | `untilPageRequestsAnswered` | 26: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/observation/shared-observer-check-reuse.spec.ts` | `untilPageRequestsAnswered` | 32: `import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/review/story-review-one-shot-choice-races.spec.ts` | `native launch` | 31: `// private origin and its real native launches begin.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/runtime/productionHeldUpdate.ts` | `native launch` | 65: `// writer lock so the native launch stays pending while admission closes.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/sessions/agent-completion-attention.spec.ts` | `untilPageRequestsAnswered` | 38: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/sessions/cursor-runner-sessions-quiet-rate.spec.ts` | `untilPageRequestsAnswered` | 13: `import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/sessions/session-workspace-retirement-claude-done.spec.ts` | `untilPageRequestsAnswered` | 22: `import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `e2e/stories/story-dependencies.spec.ts` | `untilPageRequestsAnswered` | 23: `untilPageRequestsAnswered,` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/evidence/SEED-303-early-handoff/coverage-map.md` | `native launch` | 22: `\| 12 \| a commit held in its build is served exactly at the same URL while the next commit reaches main, completing an accepted start and keeping shared records…` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `.planning/seeds/SEED-053-native-guidance-acceptance.md` | `native launch` | 40: `dashboard's existing native launch mode and input builder, a private installed` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `.planning/slice-plans/638-distribution-evaluation-tool/PLAN.md` | `native launch` | 137: `or the original recovered record/baseline provenance without a native launch.` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/AGENT-LAUNCH-HOSTS.md` | `native launch` | 125: `admits Claude to native launch. This does not guarantee that its result can be` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/AGENT-LAUNCH-OPTIONS.md` | `native launch` | 32: `options. Selected flags are checked again before any native launch. Unknown` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/AGENT-LAUNCH-STARTUP.md` | `native launch` | 30: `` `launch` for the server performing the native launch), and when it was noted. `` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/COMMANDS.md` | `native launch` | 50: `publishing their assignments, receive their native launch outcome, and keep that` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `dashboard/LAUNCH-START.md` | `native launch` | 212: `will consume before further publication or native launch. Compatibility is` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
| `docs/maintainer/dashboard-test-value-review.md` | `native launch` | 104: `Preparing versus native launching, cross-page observation/reload, and Backlog` |excluded: only the changed spec adds a call; no production, shared helper, expected value or other caller changed |
