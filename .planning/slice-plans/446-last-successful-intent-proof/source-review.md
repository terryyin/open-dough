# Source commitments

Fresh reviewer: `/root/proof_source_review`, launched with `fork_turns: none`.
The input supplied only Terry's complete 2026-11-02 instruction and its
immediate conversational context, with no plan, product files or implementation
return. The reviewer was instructed to read no files and change nothing.

Original instruction: “Yes, let's change Intent proof to that: record only
passing scenarios, preserve retry counts, and show it as the last successful
proof. clean up earlier proof when a scenario fails, if any.” Context supplied
per-scenario committed proof, mixed-result runs, successful-after-retry labels,
time and revision, and the explicit replacement of retaining an old success
after failure.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Record proof only for scenarios that pass. | slice 3 | observed: both producer stores write only pass inputs; both real runner suites assert retained successes |
| C2 | A passing scenario can produce proof even when another scenario fails and the overall run fails. | slice 3 | observed: Pygardon outcomes/recorder real Cucumber cases and Doughnut real Cypress mixed-run proof assertions |
| C3 | Preserve retry/attempt counts for recorded passing proof. | slice 3 | observed: both real retry fixtures retain two attempts; both actual outputs accepted by Intent parser/reducer |
| C4 | Retain the “Passed after retry” distinction when applicable. | slice 1 | observed: intent-cucumber-proof.spec.ts expectedRows asserts Passed after retry (2 attempts) through published proof |
| C5 | Present proof as the scenario’s last successful demonstration. | slice 1 | observed: IntentProof.tsx header and proofScenarioCountLine.ts; published file/location/folder journey assertions |
| C6 | Show when that successful demonstration occurred. | slice 1 | observed: intent-cucumber-proof.spec.ts fixed clock and expectedRows time cells |
| C7 | Show the revision associated with that successful demonstration. | slice 1 | observed: intent-cucumber-proof.spec.ts expectedRows commit and feature-version cells |
| C8 | When a scenario fails, remove its earlier proof, if any. | slice 3 | observed: Pygardon real lifecycle and Doughnut real Cypress pass/failure/recovery; recursive/outline/concurrent identity cleanup assertions |

## Qualifications and examples

The source concerns Intent's existing per-scenario committed proof. In a mixed
run, A's pass can be retained while B's failure clears only B's earlier proof.
A retry-assisted success keeps its attempt count and label. Pass then failure
clears the earlier success; failure without earlier proof writes nothing.
Proof does not assert current health. The source does not authorize clearing
other scenarios merely because the overall run fails.

The reviewer identified intermediate retry timing as unspecified. The plan
uses the existing final-attempt boundary: intermediate failures wait for the
final outcome, preserving successful-after-retry proof.

## Acceptance observations

Slice 1 compares published legacy proof through the real reader and response
schema: later failure and equal-time conflicting failure yield no success;
later success restores its own timestamp/revision; one failed outline row
does not clear its sibling. File/location/folder assertions agree. Absence,
malformed proof and read failure remain distinct. Focused commands and terminal
results are retained in PLAN.md. Parent aligned seed 192 and plan 442's current
expectations with Terry's amendment, preserving dated baseline provenance.

Producer commitments span both recorders: slice 2
proves Pygardon and slice 3 proves Doughnut; slice 3's acceptance must retain
and compare both observations before closing those whole-product commitments.

### Pygardon producer acceptance

Inspected `cucumberProof.mts`'s actual final-attempt entry, `cucumberProofStore.mts`
passing-only write and recursive identity cleanup, disk-read updates, atomic
replacement and PID-symlink lock/recovery. Real fixture setup supplies scenarios
and earlier proof; assertions read actual recorder files after the triggered
runs. `cucumber-proof-lifecycle.test.mjs` observes pass → failure → recovery,
unrelated/newer success retained, overlapping-run cleanup and interrupted owner
recovery. `cucumber-proof-outcomes.test.mjs` observes retry counts/duration,
mixed outcomes and independent outline rows; selection/source tests retain their
prior boundaries. Four failed packaged proof files were removed latest-first;
all six successful observations retain their original bytes and metadata.

- `nix develop -c scripts/check-worktree.sh node --test tests/cucumber-proof-lifecycle.test.mjs tests/cucumber-proof-outcomes.test.mjs tests/cucumber-proof-source.test.mjs tests/cucumber-proof-selection.test.mjs tests/cucumber-proof-recorder.test.mjs` — 28 passed (4.53s).
- `nix develop -c scripts/check-worktree.sh pytest tests/test_packaged_homepage.py` — 3 passed (4.54s), real packaged profile and unsuccessful-command output.
- Independent refactor removed only dead expected-status tuple data. `nix develop -c scripts/check-worktree.sh node --test tests/cucumber-proof-outcomes.test.mjs` — 6 passed (3.09s). Remaining accepted boundaries stayed unchanged.
- Consumer traces: `/tmp/pygardon-success-consumer-trace.md` (112 complete dispositions) and `/tmp/pygardon-success-refactor-consumer-trace.md` (test discovery inspected; no gap). A redundant trace regeneration was interrupted at exit 130 after its evidence artifact was completed; no verification command remains pending and no test failed.

Parent interoperability command, run from the owned Open Dough workspace:

```sh
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parseProofFile, latestSuccessfulObservations } from './dashboard/src/cucumberProof.ts';
const fresh=parseProofFile(readFileSync('/tmp/pygardon-success-new-output.json','utf8'));
assert.ok(fresh);const successful=latestSuccessfulObservations(fresh);
assert.equal(successful.length,1);assert.equal(successful[0].attempts,2);
const root='/Users/terryyin/git/pygardon-last-successful-proof';let count=0;
for(const dir of ['e2e_test/proof','e2e_test/packaged/proof'])for(const name of readdirSync(`${root}/${dir}`,{recursive:true}).filter(name=>name.endsWith('.json'))){const rows=parseProofFile(readFileSync(`${root}/${dir}/${name}`,'utf8'));assert.ok(rows);assert.ok(rows.every(row=>row.outcome==='passed'));count+=rows.length;}
console.log(JSON.stringify({freshSuccesses:successful.length,attempts:successful[0].attempts,retainedPassingObservations:count}));
JS
```

Result: one new recorder success with two attempts; six retained passing
observations parse. This proves C1–C3/C8 for Pygardon; Doughnut remains owned
by slice 3 before those whole-product commitments close.

### Doughnut producer acceptance

Inspected `cucumberProofRecorder.mjs`'s final task-transport result and new
`cucumberProofStore.mjs` pass write/recursive cleanup, atomic replacement,
current-file updates and interrupted-owner recovery. The real Cypress fixture
keeps its normal exit and diagnostics, retains three passing rows in a mixed
run (including a two-attempt retry), and observes pass → failure with empty
proof → recovery for the selected scenario. Six task-boundary lifecycle cases
observe independent outline rows, recursive/newer success, overlapping writer
cleanup, preserved non-runs and a killed lock owner. Existing nine passing
observations remain unchanged.

- `CURSOR_DEV=true nix develop -c pnpm test:cucumber-proof` — 21 passed (53.07s), including the isolated real Cypress runner.
- Independent refactor removed one unused duration datum. `CURSOR_DEV=true nix develop -c node --test e2e_test/config/cucumberProofRecorder.test.mjs` — 13 passed (0.87s), including two attempts and 110ms; other accepted boundaries unchanged.
- Consumer traces `/tmp/doughnut-success-consumer-trace.md` (46 complete dispositions) and `/tmp/doughnut-success-refactor-consumer-trace.md` (seven complete dispositions), with no uncovered consumer. All final project formatting/type/lint commit gates passed.
- A one-off artifact write was removed from permanent tests after capturing actual output; no shared global temporary output remains in the test suite. This does not alter product code or behavioral assertions.

Parent interoperability command from the owned Open Dough workspace:

```sh
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parseProofFile, latestSuccessfulObservations } from './dashboard/src/cucumberProof.ts';
const fresh=parseProofFile(readFileSync('/tmp/doughnut-success-new-output.json','utf8'));
assert.ok(fresh);const successful=latestSuccessfulObservations(fresh);
assert.equal(successful.length,3);assert.equal(successful.find(row=>row.scenario==='Retry succeeds').attempts,2);
const directory='/Users/terryyin/git/doughnut-last-successful-proof/e2e_test/proof';let count=0;
for(const name of readdirSync(directory,{recursive:true}).filter(name=>name.endsWith('.json'))){const rows=parseProofFile(readFileSync(`${directory}/${name}`,'utf8'));assert.ok(rows);assert.ok(rows.every(row=>row.outcome==='passed'));count+=rows.length;}
console.log(JSON.stringify({freshSuccesses:successful.length,retryAttempts:2,retainedPassingObservations:count}));
JS
```

Result: three actual new Cypress successes, two attempts for the retry; nine
retained passing observations parse. With the retained Pygardon observations,
C1–C3/C8 are now observed for both producer boundaries. No remaining source
commitment, implementation gap or required local proof remains open.
