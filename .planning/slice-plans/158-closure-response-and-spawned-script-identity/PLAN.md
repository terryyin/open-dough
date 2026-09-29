# Judge closure responses by trunk CI and hash the scripts journeys spawn

## Source and authority

- **Identity:** SEED-008#closure-response-and-spawned-script-identity.
- **Source:** [correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#closure-response-and-spawned-script-identity),
  from the execution retrospective of plan 154 (recoverable at
  `14cd2de3:.planning/slice-plans/154-closure-proof-and-harness-correction/PLAN.md`)
  (SEED-008#closure-proof-and-harness-correction) on 2026-09-29.
- **Provenance:** reviewed commits on `claude/closure-proof-and-harness-correction`:
  `d1204cd7`, `0166f178`, `1e3880ed`, `ea306a5e`, `14cd2de3`. Findings below
  were re-observed at `14cd2de3`.
- **Authority:** planning only, delegated by the executing agent of plan 154's
  retrospective. It grants no Take, queue change, implementation, or
  publication. The correction is not queued.
- **Preparation workspace:** the owned execution checkout
  `.worktrees/closure-proof-and-harness-correction` (branch
  `claude/closure-proof-and-harness-correction`, HEAD `14cd2de3`), supplied by
  the invoking execution, whose coordinator commits this plan.

## Outcome and boundaries

Maintainers can trust that the Story Branch native response check rejects any
response reporting trunk CI, its checks, observer, or watcher as failed or
unavailable while still accepting an unrelated step's failure beside a trunk
success, and that each closure evidence identity also changes when a script a
journey's command spawns changes.

Key examples:

1. Cursor's accepted response, "The push failed due to zsh colon modifiers, so
   I pushed from bash; trunk CI passed on the merged commit and the trunk
   observer stopped after its completion receipt." → judged a trunk success
   (`true`), as today.
2. "Trunk CI, however, failed after the merge; trunk passed earlier." → `false`.
3. "Trunk CI passed, but the trunk observer was unavailable so completion is
   undiscovered." → `false`.
4. "Merged into trunk successfully. The trunk checks failed." → `false`.
5. "Trunk CI passed. The watcher failed to start." → `false`.
6. `ci-host-hook.mjs`, which `ci-host-bridge.mjs` spawns inside the
   trunk-closure journey, changes → the trunk-closure evidence identity
   changes; likewise `product-backlog-git-driver.mjs`, which the backlog merge
   adapter registers as a Git merge driver, for the Story Branch identity.

Preserved promises and constraints:

- Every plan 154 and plan 146 promise and its accepted proof stays, including
  plan 154 example 4's first half (Cursor's response accepted) and example 5
  (an imported module change stales the identity). Every existing response
  counterexample keeps its verdict.
- No new feature promise; only `tests/` support changes, plus one comment and
  one parameter name in `src/skills/` test fixtures.
- Edit sources only in `src/skills/` and `tests/`; never installed copies
  ([AGENTS.md](../../../AGENTS.md)). Any guidance touched addresses the
  executing agent
  ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md))
  and adds no "no longer" wording.
- Recorded native evidence is invalidated, never renewed, by changed inputs
  ([ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
  "Revalidate requirements whose evidence is invalidated"). No paid native run
  belongs to this correction; paid native modes are manual-only.
- Files stay at most 250 lines.

Excluded:

- Consolidating optional rev-parse helpers (`commitOf` in
  `trunk-closure-settlement.mjs` and `preparation-assignment-ownership.mjs`,
  `refSha`, `verifies`) and the remaining execute-plan `isAncestor` copies:
  cross-subsystem, belongs with D3 in `SEED-008#installed-story-branch-integration`.
- Native acceptance renewal of the identities this correction stales belongs to
  whoever next needs that evidence.
- The trunk-closure assessor's `response-completion-result` check
  (`trunk-closure-native-assess.sh:78`) is not in the findings and is left as
  it is.

## Current findings

1. **F1: the response check accepts trunk-CI failures.**
   `story_closure_response_trunk_result`
   (`tests/support/story-branch-closure-native-assess.sh:33-43`) splits clauses
   on `[.;,!?]` plus whitespace and rejects only a clause holding a CI,
   coverage, receipt, or verdict word with a failure phrase. Splitting on the
   comma detaches "failed" from "Trunk CI" in example 2, and dropping `trunk`,
   `observer`, and `watcher` from the rejection words (plan 154 slice 3) lets
   examples 3–5 through. This breaks plan 154 example 4's second half. The file
   is at the 250-line limit.
2. **F2: identities miss scripts a module spawns.**
   `tests/support/native-import-closure.mjs:11` follows static and literal
   dynamic relative imports only, not `.mjs` scripts a module locates through
   `new URL("./x.mjs", import.meta.url)` and runs as a child process or Git
   driver. `tests/native-evidence-identity.sh:139-153` uses the same helper, so
   its closure check shares the blind spot.
3. **F3: naming residue in the same area.**
   `publication-clean-trunk-fixtures.mjs:8` says the fixture is "used by
   publication.test.mjs" although about fifteen tests use it through
   `publication-test-fixtures.mjs`; `git_publication_land_input_hash_lines`
   (`tests/support/git-publication-native-shared.sh:105`) also hashes the
   trunk-closure, Story Branch, and owned-context commands, not only Land's;
   `remoteCommitCount(origin, ref)` (`closure-git-fixtures.mjs:41`) receives a
   remote URL from `closure-story-integration.test.mjs:88,170,177`.

## Existing solutions (PFE)

- **Response judgment:** plan 154's clause approach in
  `story_closure_response_trunk_result` stays; the correction changes its
  boundary (sentence and semicolon, not comma) and restores the trunk,
  observer, watcher, and check words. No other Story Branch response check
  exists; the trunk-closure assessor's check is separate and out of scope.
- **Import closure:** `native-import-closure.mjs` is the one closure helper,
  shared by the identity writers (through `native-import-closure.sh` and
  `git_publication_land_input_hash_lines`) and by the identity check. Slice 2
  extends that helper rather than adding a second walker, so writers and check
  stay in step.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| F1: the four sentences pass the check now and failed at `a51510d2` | Sourced the assessor under `/opt/homebrew/bin/bash` 5.3 and ran `story_closure_response_trunk_result` on each; ran `a51510d2`'s version on the same files | HEAD `true` for examples 2–5; `a51510d2` `false` for all four and `false` for Cursor's line |
| A sentence-and-semicolon split with the restored words gives every verdict | Scratch function: `awk '{ gsub(/[.;!?][[:space:]]/, "\n"); print }'` then words `trunk\|(^\|[^[:alpha:]])CI([^[:alpha:]]\|$)\|coverage\|receipt\|verdict\|observer\|watcher\|checks?([^[:alpha:]]\|$)` with the unchanged failure phrases, over the nine existing counterexamples plus examples 2–5 | All thirteen match their expected verdict, including Cursor's `true` and "…delete the branch failed once…" `true` |
| The response check has one consumer and its counterexamples run in credential-free default mode | `grep -rn "response_trunk\|story-branch-closure-native-assess" tests`; `tests/git-publication-native.sh:125-145` read | Used only at `story-branch-closure-native-assess.sh:126,235`; `run_story_closure_assessor_counterexamples` runs in default mode; the assessor is sourced only by `story-branch-closure-native-run.sh:11` and hashed in its identity (`:71,76`) |
| Size headroom | `wc -l` | assessor 250, `story-branch-closure-native-run.sh` 186, `native-import-closure.mjs` 33, `native-evidence-identity.sh` 176, `git-publication-native-shared.sh` 112, `closure-git-fixtures.mjs` 43 |
| F2: production `new URL` spawn sites | `grep -rnE 'new URL\(' src/skills --include='*.mjs'`, excluding tests and fixtures, then each site read | `.mjs` targets: `ci-host-bridge.mjs:9` → `ci-host-hook.mjs`; `product-backlog-git-repository.mjs:19` → `product-backlog-git-driver.mjs`; `ci-mailbox-worker-process.mjs:15` → `ci-mailbox.mjs`; multi-line `workspace-publication-push.mjs:27` and `owned-suffix-reconciliation.mjs:13` → `../../dough-product-backlog/scripts/product-backlog-git-rebase.mjs`; `history-preserving-publication.mjs:23` → `product-backlog-git-merge.mjs`. Non-module targets: `ci-mailbox-location.mjs:13` (`"../../../../"`, a directory) and fixtures' `.json`/`.md` assets |
| The spawned scripts run: bridge spawns its hook; the repository registers its driver | `ci-host-bridge.mjs:62,91,137,163` (`hookPath = defaultHook`); `product-backlog-git-repository.mjs:157` (`${process.execPath} ${driverScript} %O %A %B %P`) | Both are executed, so their content affects the journey |
| F2 scope per identity | Scratch walker also following `new URL\(\s*["'](\.{1,2}\/[^"']+\.mjs)["']\s*,\s*import\.meta\.url` (multi-line), diffed against the current helper for each writer's module set | trunk closure 52 modules, adds 14 (`ci-host-hook.mjs`, `product-backlog-git-rebase.mjs`, `-git-driver.mjs`, `-git-cli.mjs`, and their imports); Story Branch 36, adds 5 (`product-backlog-git-driver.mjs` and imports); owned-context 25, adds 8; execution-worktree-prep 7, adds none |
| Writers and check share the helper, so extending it keeps the suite green | Scratch copy of `tests` and `src` with the extended walker as `native-import-closure.mjs`, then `bash tests/native-evidence-identity.sh` from it | exit 0 |
| `native-import-closure.mjs` is no identity input | `grep -rn native-import-closure tests/support/*run*.sh tests/support/*evidence*.sh tests/support/native-result-*.sh` | Only sourced/invoked; identities change through the newly listed modules and, for the rename, `git-publication-native-shared.sh` (hashed by `trunk-closure-native-run.sh:31` and `git-publication-native-evidence.sh:19`) |
| F3: residue as described | `publication-clean-trunk-fixtures.mjs:1-12`; `grep -rln createCleanTrunkFixture src tests`; `grep -rn git_publication_land_input_hash_lines tests`; `grep -rn remoteCommitCount src tests` | Comment names one test, 15 other files use the fixture; the Land-named function has 4 occurrences (definition plus trunk-closure, Story Branch, owned-context callers); `remoteCommitCount` receives `remoteUrl` in three calls |
| Proof commands run credential-free and green now | `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh` and `bash tests/native-evidence-identity.sh` at `14cd2de3`, 2026-09-29 | Both exit 0 (57 s and 5 s) |

## Slices

### 1. The Story Branch response check rejects any trunk CI, check, observer, or watcher failure
Type: Structure
Status: done
Proof: credential-free `tests/git-publication-native.sh` default mode green, with examples 2–5 as `false` counterexamples, which fail against `14cd2de3`'s check, and Cursor's line still `true`.

Correction: F1. Move `story_closure_response_trunk_result` and
`story_closure_response_counterexamples` from
`story-branch-closure-native-assess.sh` into a new sourced
`tests/support/story-branch-closure-native-response.sh`, which makes room under
the 250-line limit. Split the response only at sentence ends and semicolons
(`[.;!?]` plus whitespace, and line ends) and reject a sentence naming trunk,
CI, its checks, coverage, receipt, verdict, observer, or watcher with a failure
phrase; a failure sentence naming none of these, such as a failed push or
branch delete, stays accepted. Update the function comment to that rule. Add
examples 2–5 as `false` counterexamples; every existing counterexample keeps
its verdict. Add the new file to the Story Branch identity's hashed inputs in
`story_closure_write_evidence_identity`.

Proof: `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh`
default mode (about 60 s) exit 0; running the new counterexamples against
`14cd2de3`'s function fails on examples 2–5; `bash tests/native-evidence-identity.sh`
exit 0 with the new file listed in the Story Branch identity. The Story Branch
identity changes, so its recorded native evidence goes stale.

Accepted proof (2026-09-29): the response rule and its counterexamples moved to
`tests/support/story-branch-closure-native-response.sh`, sourced by the
assessor (215 lines) and hashed in the Story Branch identity
(`story-branch-closure-native-run.sh:77`). `tests/git-publication-native.sh`
default mode exit 0, observed through `run_story_closure_assessor_counterexamples`
→ `story_closure_response_counterexamples`; all 13 rows pass, and a scratch
harness running them against `14cd2de3`'s function returns `true` for
examples 2–5. `tests/native-evidence-identity.sh` exit 0; the Story Branch
identity lists the new file, so its recorded native evidence is stale.

### 2. Closure evidence identities follow the scripts a journey's modules spawn
Type: Structure
Status: done
Proof: `tests/native-evidence-identity.sh` asserts the trunk-closure identity lists `ci-host-hook.mjs` and `product-backlog-git-rebase.mjs` and the Story Branch identity lists `product-backlog-git-driver.mjs`, fails at `14cd2de3`, and passes after; its per-input change check then covers them (example 6).

Correction: F2 and the hash-function naming in F3. `native-import-closure.mjs`
also follows a literal relative `.mjs` path given to
`new URL(…, import.meta.url)`, including the multi-line form; directory and
non-`.mjs` URLs stay out. Update its header comment. Because writers and the
identity check share the helper, every closure writer and the closure check
gain the spawned scripts together. Rename `git_publication_land_input_hash_lines`
to a name for what it hashes, Land's guidance plus the command closure of the
closing journey (for example `git_publication_closing_input_hash_lines`), with
its comment and three callers.

Add to `tests/native-evidence-identity.sh` one explicit example check: the
trunk-closure identity lists `ci-host-hook.mjs` and
`src/skills/dough-product-backlog/scripts/product-backlog-git-rebase.mjs`, and
the Story Branch identity lists `product-backlog-git-driver.mjs`. Keep the file
at most 250 lines.

Proof: the new example check fails against `14cd2de3`'s helper and passes
after; `PATH=/opt/homebrew/bin:$PATH bash tests/native-evidence-identity.sh`,
`tests/git-publication-native.sh` default mode,
`tests/git-publication-native-owned-context.sh`, and
`tests/execution-worktree-preparation-native.sh` default mode exit 0. Record in
accepted proof which identities changed (expected: trunk-closure, Story Branch,
owned-context through new modules; those hashing
`git-publication-native-shared.sh` through the rename); their recorded
evidence is stale.

Accepted proof (2026-09-29): `native-import-closure.mjs` also follows literal
relative `.mjs` paths given to `new URL(…, import.meta.url)`; the hash function
is `git_publication_closing_input_hash_lines`. Example 6's check extends the
existing `closure_journey_inputs` list in `tests/native-evidence-identity.sh`
rather than adding a second loop; with `14cd2de3`'s helper it fails with three
omissions (`ci-host-hook.mjs`, `product-backlog-git-rebase.mjs`,
`product-backlog-git-driver.mjs`) and now exits 0. `tests/git-publication-native.sh`
default mode, `tests/git-publication-native-owned-context.sh` (substitute host),
and `tests/execution-worktree-preparation-native.sh` default mode exit 0.
Changed identities: trunk-closure (+14 inputs), Story Branch (+5), owned-context
(+8), and publication and execution-review through the rename's file hashes;
execution-worktree-prep, delivery-evidence, and native-result identities are
unchanged. The changed identities' recorded native evidence is stale.

### 3. Closure test fixtures name what they serve
Type: Structure
Status: done
Proof: the suites importing both fixtures stay green.

Correction: the fixture residue in F3. The `createCleanTrunkFixture` comment in
`publication-clean-trunk-fixtures.mjs` describes the fixture without naming a
single consumer; `remoteCommitCount`'s first parameter is named for a remote
repository path or URL, not `origin`. No behavior changes.

Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` on
`src/skills/dough-story-wrap-up/scripts/closure-story-integration*.test.mjs`,
`closure-story-branch-cleanup.test.mjs`,
`src/skills/dough-execute-plan/scripts/publication*.test.mjs`, and
`src/skills/dough-land/scripts/worktree-retirement.test.mjs` exit 0.

Accepted proof (2026-09-29): the `createCleanTrunkFixture` comment describes a
clean-trunk publication fixture; `remoteCommitCount(remote, ref = trunkTarget)`
reuses the module's `trunkTarget`. The listed suites (12 files) exit 0.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Example 1: Cursor's line stays accepted | 1: existing `true` counterexample in `story_closure_response_counterexamples` |
| Examples 2–5: trunk CI, check, observer, or watcher failure rejected | 1: four new `false` counterexamples, failing against `14cd2de3` |
| Every existing counterexample keeps its verdict | 1: default-mode run green |
| Example 6: a spawned script's change stales the identity | 2: explicit listing check plus the existing per-input change check in `tests/native-evidence-identity.sh` |
| Plan 154 example 5: an imported module's change stales the identity | 2: existing closure check stays green |
| Residue names match what they describe | 2 (hash function) and 3 (fixtures): read after edit; suites green |
| Plan 154 and plan 146 promises unchanged | every slice: default native mode and the closure suites stay green |

## Delivery checks

Run each slice's focused checks at its boundary with a modern bash
(`PATH=/opt/homebrew/bin:$PATH`), since macOS system bash masks `set -e`
failures. Slices 1 and 2 run `tests/git-publication-native.sh` default mode
(about 60 s) and `tests/native-evidence-identity.sh` (about 5 s). No slice
changes the payload declaration or an `install.sh`-declared file, so payload
checks are not needed. Never run a paid native mode. Use independent
post-change refactoring and ordinary managed delivery.

## Concern review

- **Slice 1 boundary.** Sentence splitting still rejects a sentence that names
  trunk and an unrelated failure together (for example "The push to trunk
  failed once, so I retried"); such a response is judged `false` and needs
  transcript judgment. This errs toward rejection, which is the direction the
  check must keep; the observed example set covers today's host shapes.
- **Slice 2 spawn pattern.** The helper follows literal `new URL` `.mjs` paths
  only. A future spawn through a computed path would be missed again; the
  survey found none in production modules.
- **Stale native evidence.** Slices 1 and 2 change the Story Branch,
  trunk-closure, owned-context, and shared-helper-hashing identities by design;
  renewing them is left to whoever next needs that evidence.
- **Plan 154 wrap-up.** Plan 154's closure deletes its plan; this plan's
  provenance cites it at `14cd2de3` so it stays recoverable through Git.

No blocking slice-specific concern remains in this review.
