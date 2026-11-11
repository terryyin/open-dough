# Slice 3 — implicated changed-source refactoring

Base: `e2806cc5e0e2a87eff183cb0305e17cb6b6fd9d0`; Jane-chan's existing owned
execution checkout. Coordinator owns the plan/status, formatting, independent
refactoring, commit and delivery. This implementation return is uncommitted.

## Ownership and behavior

Extracted the existing `changedAgainst`/text/patch collection from
`consumer-trace-terms.mjs` into `git-changes.mjs`, preserving its exports for
consumer tracing. The same Git owner now exposes refactoring discovery: staged
and unstaged diffs independently, non-ignored untracked paths and exactly the
supplied commits. Both move paths participate; current existing source files
and the existing membership matcher determine application. No new matcher or
rule-specific collector was introduced.

The public selector accepts `--changed` with repeatable `--committed <revision>`.
Post Change Refactor loads the common selection reference automatically before
reviewing tests, loads each enabled convention once, preserves caller intent and
independent proof, and rechecks expanded scope without expanding authority.
Missing selected MakeMe guidance retains the existing unresolved/withheld-edit
contract. Actual MakeMe-only/both authored outcomes remain G2, receiving slice4.

The extracted Git runtime is declared immediately in the one assembled payload's
execution fragment. A real installation now verifies changed-source use outside
this source project in both native roots without project npm dependencies.
Installed managed copies in this checkout were not edited.

## Focused executable proof

P1 command (all exit0, terminal session19146):

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/test-entry-rules-changed.test.mjs tests/support/test-entry-rules.test.mjs tests/support/test-entry-rules-standalone.test.mjs tests/support/page-object-native-fixture.test.mjs src/skills/dough-execute-plan/scripts/consumer-trace-terms.test.mjs src/skills/dough-execute-plan/scripts/consumer-trace.test.mjs tests/payload-declaration-links.sh tests/install-public-payload.sh tests/update-adds-new-payload-skill.sh tests/story-payload-update.sh
```

Setup: shared MakeMe intent locations/settings and repository histories; Git
mutations and independent expected results remain at each test call site.
Changed-command cases observe staged edits reversed only in the worktree,
unstaged/untracked sources, staged moves into custom membership, moves out,
unstaged moves, deletion-only, production-only, exact supplied committed scope,
deduplication and current destination membership. Invalid revision exits2;
malformed settings exit1/unresolved rather than off. The first pre-pause run
failed because a test's destination directory had disappeared after its last
file moved; the fixture action creates that directory and the full six-suite
pre-pause rerun passed. P1 renews the later native-fixture additions too.

Standalone test's real installer case commits the installation baseline, stages
a move and adds an untracked test, then invokes each installed command from
outside the project with no node_modules. Both roots select exactly those two
current browser sources and contain the new Git runtime bytes. Copied command,
regeneration/provenance/license contracts, public selection and existing consumer
trace behavior remain green. Actual install/update checks retain byte closure,
configuration and unrelated guidance preservation.

P2: `PATH=/opt/homebrew/bin:$PATH npm run typecheck:dashboard` — exit0,
terminal session40234. Shared JS/TS and existing dashboard consumers typecheck.

P3: `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs tests/pin-and-inspect.sh`
— exit0, terminal session36126. Refactor handoff/trace contracts and pinned
installation inspection/current augmented payload remain green.

`git diff --check` passed. Implementation/test files are below250 lines before
coordinator formatting; no full suite or unaffected watcher/browser suite ran.

## Native mixed-entry refactor

N1 command:

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -i bash tests/support/page-object-native-run.sh codex refactor /tmp/page-object-307-slice3-codex-refactor
```

Exit0, exited/complete, terminal session81171; codex-cli0.167.1. The maintained
native adapter, writable isolation profile, supervision and stream reader were
used unchanged. One session; no retry or changed activation mechanism.

Pre-launch actual host: battery94%, lid open (`AppleClamshellState No`), fully
awake; load8.45/19.29/14.43, free memory55%. Current competing process CPU was
modest outside app server120%/dashboard Vite41%; no active browser/native/test
run. Existing idle MCPs preserved. Chose concurrency1 and maintained480s native
deadline under battery `caffeinate -i`. Post-run sleep log has no sleep/wake
since Nov7; this observation is not invalidated by machine sleep.

Fixture: shared MakeMe library project and settings; enabled browser entry and
opted-out legacy entry. Current source refactor/shared guidance copied into the
native candidate layout and committed as baseline; a new direct-control browser
scenario is staged and a different direct-control legacy scenario is untracked.
Both pass before native use (`before-tests.txt`). This is candidate application
proof; real installer delivery is separately P1.

Actual calls in `/tmp/page-object-307-slice3-codex-refactor/calls.jsonl`:
call1 reads refactor skill; call3 reads common selection reference; call4 invokes
installed `--changed`, gets browser pageObjects true and legacy false, and reads
the one convention. Call6 runs the installed consumer trace. The sole file-change
event updates `project/browser/library.spec.mjs`.

Corrected browser test imports existing LibraryPage and hands off to ItemPanel.
Atlas then Boreal, action order and expected values stay at the caller. It waits
for held.started then showsLoading, asserts ['atlas'] before release and
['atlas','boreal'] after related navigation. The transport hold remains separate
from UI mechanics. The legacy direct Boreal test is byte-unchanged; application,
settings and harness remain unchanged. Calls7/8 execute each resulting test and
both output SCENARIO PASSED. This is actual corrected-test application, not just
selection, self-report or exit0. Candidate/test hashes, events, calls, response,
version and result remain in that directory for current acceptance.

Codex: fresh refactor/changed-command observation above. Claude: reuse accepted
slice1 discovery/skill activation and useful page-object application for the
unchanged native layout, description and convention; shared new command behavior
is deterministic P1 and representative refactor application is N1. No fresh
Claude refactor invocation is claimed. Cursor: Terry's explicit current-execution
native skip remains skipped/unverified; deterministic shared .agents layout and
real delivery are covered by P1. Final delivery correspondence remains slice4.

## Consumer trace and preserved evidence

Command (exit0, terminal session48166):

```sh
PATH=/opt/homebrew/bin:$PATH node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/apply-shared-page-object-rules-per-entry --base e2806cc5e0e2a87eff183cb0305e17cb6b6fd9d0 --path src/skills/dough-execute-plan/scripts/git-changes.mjs --path src/skills/dough-execute-plan/scripts/test-entry-rules.mjs --path src/skills/dough-post-change-refactor/SKILL.md --term changedAgainst --term readText --term changedForRefactoring --term changedTestEntryRules --term page-object-native-run.sh --term page-object-native-fixture.mjs --term open-dough-execution-payload.sh > /tmp/page-object-307-slice3-consumer-trace.md
```

Every located consumer has a disposition in that record. Direct tracing/public
selector/declaration/release fixture consumers run P1/P3. Existing explicit-source
delegation and page-object discovery reuse slice2's authoring proof; the new
reference section is conditional on refactoring. Browser-control proof reuses
slice2 P5: application/harness/settings and generated matcher are unchanged.
Generic basename, unrelated Git-option/readText matches, historical records and
installed managed snapshots do not consume this changed contract. No uncovered
consumer remains. Prior Intent, native on/off and watcher proof is unaffected;
new required Git dependency is covered through real installed execution above.

### Symlink membership correction at acceptance

Acceptance identified an unintended regular-file-only restriction. Existing
`dashboard/server/intentLocationsRead.ts` selects matching blob entries without
a mode restriction; `ghTrees.ts` retains blob/tree type and path, not mode.
`intentLocationSelection.ts` admits by safe path and configured membership, and
the existing Git owner's readText follows source symlinks. There is no domain
evidence for silently excluding a changed in-repository symlink test source.

Added a MakeMe repository case with support/scenario.mjs, then staged the exact
symlink browser/linked.spec.mjs -> ../support/scenario.mjs as the action under
proof. The public explicit-source command selected its browser membership but
the public changed command returned no source. `PATH=/opt/homebrew/bin:$PATH npm
test -- tests/support/test-entry-rules-changed.test.mjs` failed at that independent
expected selection (session77492, exit1). Replaced lstatSync with statSync, keeping
selection on the current alias path while following its existing source target.
The same case deletes the target and then the link; neither invents conversion.
Removed the unsupported regular-file wording. No new path/security policy.

This correction changes only symlink scope and accompanying documentation.
Accepted N1 uses regular files and retains its selection/application boundary;
no native rerun is required. Generated matcher and Git collector are unchanged.
Renewed proof: `PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/test-entry-rules-changed.test.mjs tests/support/test-entry-rules.test.mjs tests/support/test-entry-rules-standalone.test.mjs tests/support/page-object-native-fixture.test.mjs`
— exit0, terminal session30712. This observes corrected symlink scope and missing
targets, unchanged explicit-source behavior, real installed command bytes/use,
and existing native-fixture selection. `git diff --check` passed. Existing
consumer dispositions remain corresponding; these command/fixture boundaries
were renewed, while regular-file native evidence remains reused.

## Supplied slice promises

| Id | Original text | Observation |
| --- | --- | --- |
| 12 | That convention covers refactoring implicated by the change. | Shared refactor link and N1 actual corrected browser result. |
| 13 | Changed-source scope follows MakeMe’s existing scope. | One extracted existing Git owner and unchanged independent selector; actual MakeMe guidance remains G2. |
| 14 | That scope includes staged changes. | P1 reversed-worktree staged case and N1 staged new test. |
| 15 | That scope includes unstaged changes. | P1 public changed-command case. |
| 16 | That scope includes untracked files. | P1 new spec and N1 legacy untracked scenario. |
| 17 | That scope includes moves. | P1 both-path discovery, staged/unstaged destinations and real installed move. |
| 18 | That scope includes supplied committed dispositions. | P1 exact supplied commit, unrelated committed history omitted, duplicate supplied commit deduplicated. |
| 19 | Current file membership determines application. | P1 custom extension, production sibling/current moved paths; acceptance correction also proves existing symlink source membership and absent-target handling. |
| 54 | Deletion alone requires no conversion. | P1 deletion-only returns no current sources. |
| 85 | Mixed changed tests undergo refactoring. | N1 discovers staged enabled/untracked off tests, corrects enabled and preserves off practice; both pass. |
| 86 | Opted-in tests reuse focused objects while preserving intent. | N1 LibraryPage/ItemPanel result retains Atlas/Boreal/order/held-read/request proof. |
| 87 | Moving a test out of selected membership imposes no page-object rule at its destination. | P1 staged destination legacy/out.spec.mjs has pageObjects false; deleted browser source omitted. |

## Independent refactoring acceptance

No edit candidate remained after the read-only pass; no product/test/guidance
changes or proof invalidation. P1/P2/P3, symlink correspondence and actual N1
results were inspected and reused. Installed trace completed exit 0 at
`/tmp/page-object-307-slice3-refactor-consumer-trace.md`: 14 reused and 759
excluded consumers, none blank or uncovered. Whitespace and size passed.
REFACTOR COMPLETE.
