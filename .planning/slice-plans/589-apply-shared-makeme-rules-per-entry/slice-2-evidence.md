# Slice 2 acceptance evidence

## Outcome and source comparison

The installed public selector owns strict per-entry opt-in and existing Intent
membership. Dashboard adapters re-export the same parser, membership/syntax and
safe-path APIs; the unchanged path predicate serves authorization consumers.
Node and local files suffice. The locked generated matcher has no imports and
carries regeneration provenance plus all three upstream notices.

Source commitments for selection are observed by the nine public command cases
in `tests/makeme-selection.test.mjs` and
`tests/makeme-selection-configuration.test.mjs`, through a complete copied runtime
in isolated MakeMe repositories without npm dependencies. Exact invalid flags,
malformed bytes and unsafe paths remain at the call site as inputs under proof.
`tests/support/makeme-selection-project.mjs` supplies only installed files and
configuration preconditions, not the selector's answer. Cases cover new/absent
source paths, strict flags, overlapping opt-out, kind/includes/extensions,
sources precedence/custom syntax, POSIX case/folder boundaries, brace/extglob
semantics and distinct absent/malformed/unreadable diagnostics.

Convention commitments are observed in the unchanged
`src/skills/dough-makeme/references/convention.md` and the inspected walkthrough
`/tmp/makeme-slice2-convention-review.md`: reader/note/tracker relationships,
fresh mutable values, meaningful facts and defaults; independent parser bytes
and answers; deletion relationships; isolation-preserving optimization with
surviving observations and measured saving; local language/persistence/lifecycle.
This is guidance review, not a claim that all examples ran natively.

Execution and refactor workflow hookups remain legitimately owned by slice 4
(G3/G4), because managed Markdown cannot link an undeclared dependency. The
coordinator inspected `tests/payload-declaration-links.sh` and its negative
controls; `env PATH=/opt/homebrew/bin:$PATH npm test -- tests/payload-declaration-links.sh`
passed. No link evasion or weakened check was introduced.

## Terminal focused proof

```sh
env PATH=/opt/homebrew/bin:$PATH npm test -- tests/makeme-selection.test.mjs tests/makeme-selection-configuration.test.mjs tests/makeme-native-use.sh tests/support/dashboard-ci-scope-history-read.test.mjs
npm run typecheck:dashboard
node scripts/build-intent-matcher.mjs
python3 /Users/terryyin/.codex/skills/.system/skill-creator/scripts/quick_validate.py src/skills/dough-makeme
git diff --check
```

All passed. The scoped-history test observes safe scope and traversal refusal.
Typechecking covers public JSDoc/type compatibility and unchanged adapters.

```sh
caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- backend-tests/intent/authenticated-read-intent-selection.spec.ts backend-tests/intent/authenticated-read-intent-locations.spec.ts backend-tests/intent/authenticated-read-intent-locations-problems.spec.ts backend-tests/intent/intent-location-syntax.spec.ts backend-tests/intent/intent-story-overlay.spec.ts tests/intent/intent-code-browse-sources.spec.ts tests/intent/intent-code-browse-projects.spec.ts tests/intent/intent-story-changes-moves.spec.ts backend-tests/observation/authenticated-read-profile-addition-refusal.spec.ts backend-tests/observation/authenticated-read-committed-last.spec.ts --workers=1
```

29 tests in 10 complete files passed. Exact selection:
`/tmp/makeme-slice2-dashboard-selection.txt`. Inspected consumers/observations:
listing/settings problems and selected admission without sibling fetches;
first-match syntax and unknown/unhinted plain text; mounted kind/source browse;
rename/deletion overlay and counts; encoded profile traversal refused before
provider calls; canonical record reachability, commit-time answer and caching.
The existing inventory/builder regression from slice 1 remains compatible;
this slice changes only its builder's JSDoc to the new canonical type.

## Refreshed native correspondence

```sh
caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH bash tests/makeme-native-use.sh codex mixed /tmp/makeme-native-seed307-selector-codex-mixed
caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH bash tests/makeme-native-use.sh codex opted-out /tmp/makeme-native-seed307-selector-codex-opted-out
caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH bash tests/makeme-native-use.sh claude mixed /tmp/makeme-native-seed307-selector-claude-mixed
caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH bash tests/makeme-native-use.sh claude opted-out /tmp/makeme-native-seed307-selector-claude-opted-out
```

All four terminal assessments pass (Codex 0.167.1; Claude Code 2.1.322).
The coordinator inspected assessments and the public-call observer. Actual
resolver output identifies each fixture's configuration and the expected files
and entries. Mixed runs load the convention, use fresh explicit reader/note
builders and independent true/false assertions, keep frontend practice local,
and catch wrong-owner/deny-all/truncation faults. Fresh opted-out runs resolve
empty selection, never load the convention, preserve backend/production, and
catch the truncation fault. The source rule's gate is now deterministic.

The initial mixed Codex assessment missed the actual shell-wrapped Node call.
The owner retained that assessment, added a cheap control for `/bin/zsh -lc`,
and reassessed the unchanged transcript successfully without inference repeat.
No guidance/runtime/discovery change resulted. Cursor remains unverified under
Terry's explicit one-execution waiver; no authentication operation occurred.

## Trace and acceptance boundary

`/tmp/makeme-slice2-consumer-trace.md` has all 1,050 rows disposed: 999 generic,
historical or untouched-payload exclusions; 37 run selections; 14 reused type
or observation checks. The coordinator inspected actual parser/validator/adaptor
changes and real consumer dispositions against the selected suites and setup.
Formatter/hook observations remain coordinator-owned delivery gates, not CI
exclusions. No current slice-2 implementation gap remains; G2 is proved here.
Source freshness is unchanged at `c6d2645eea2fe0a440a21d6015da12212117761c`;
the named page-object sibling remains queued at that same pinned trunk.

Resource decision: awake macOS on AC, browser consumers used one worker and no
native concurrency; later native basis load 2.72/3.43/4.18, 42% free/reclaimable
memory, no other active tests. Every owned command reached a terminal result;
no native process or supervisor remains. Reconsider before changed heavy work.

Independent `/root/refactor_slice2` returned `## REFACTOR COMPLETE`,
`none — already clean`, with no edits or repeated tests. Shared owner, adapters,
generator/notices, test setup and observers were reviewed; all files are below
250 lines. The root corrected only the stale workflow-routing plan mapping.
All accepted proof and the existing consumer trace remain applicable.

## Default-runner registration correction

Coordinator inspection found that `tests/node-test-files` omitted root-level
Node tests. The implementation owner added `tests/*.test.mjs`; no runtime,
selector or native code changed. Actual maintained default and each 1/3, 2/3,
3/3 inventory command terminated zero before its NUL records were parsed.
`/tmp/makeme-slice2-default-discovery-proof.json` records 605 unique jobs,
shares 200/204/201 partitioning exactly once, and each new selector file as one
node job in default discovery and once across shares (membership share 3,
configuration share 2). Raw inventories are `/tmp/makeme-slice2-{default,share1,share2,share3}-jobs.nul`.

```sh
env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_DIR=tests bash scripts/test-jobs.sh > /tmp/makeme-slice2-default-jobs.nul
env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_DIR=tests OPEN_DOUGH_TEST_SPLIT=1/3 bash scripts/test-jobs.sh > /tmp/makeme-slice2-share1-jobs.nul
env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_DIR=tests OPEN_DOUGH_TEST_SPLIT=2/3 bash scripts/test-jobs.sh > /tmp/makeme-slice2-share2-jobs.nul
env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_DIR=tests OPEN_DOUGH_TEST_SPLIT=3/3 bash scripts/test-jobs.sh > /tmp/makeme-slice2-share3-jobs.nul
env PATH=/opt/homebrew/bin:$PATH npm test -- tests/test-runner-selection.sh tests/support/test-shares.test.mjs
env PATH=/opt/homebrew/bin:$PATH node scripts/test-shares.mjs preview --split-count 3
git diff --check
```

All passed. Preview retains positive predicted headroom; it is not a measured
speedup. Trace: `/tmp/makeme-slice2-discovery-consumer-trace.md`, from manifest
through actual scheduler/share consumers, excluding unchanged substitute-list
reporting fixtures. Original functional proof remains accepted; G5 closes only
with this registration evidence and the narrow independent review.

Independent narrow follow-up `/root/refactor_slice2` inspected the manifest,
real default/share inventories and relevant trace, returned `## REFACTOR COMPLETE`
with no edits, tests, uncovered consumer or running writer. G5 is proved.

Final freshness is unchanged at trunk `9df18c4eb740a8663da1c32e63be9c52c35e29d9`.
The page-object sibling is now Taken. Pinned-trunk inspection since our Take
finds no changes to the shared parser, selector, validator, MakeMe runtime or
workflow callers; only its refinement/plan preparation is present. No accepted
sibling product behavior requires reconciliation at this boundary.
