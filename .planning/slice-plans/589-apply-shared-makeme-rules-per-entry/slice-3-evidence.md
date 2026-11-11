# Slice 3 acceptance evidence

## Outcome and observations

`repositoryChangePaths` exposes NUL-preserved worktree, staged, untracked and
supplied committed layers in the already-declared execution helper. The lexical
consumer reuses worktree/untracked layers and retains base-to-working-tree hunk
semantics. `changed-makeme.mjs` unions discovery context, validates paths and
Git inputs, filters current source existence, then uses the existing selector.
Old/deleted move paths never impose conversion at an opted-out destination.

The coordinator inspected the public command, collector, shared candidate-file
loader, selector's default-preserving allow-empty option, and actual assertions:

- C39: staged content restored to HEAD leaves an empty HEAD diff, but that
  staged path remains selected by the public changed-scope command.
- C40: an unstaged enabled source participates alongside the staged layer.
- C41: an untracked enabled source with a newline in its filename survives.
- C42: enabled→disabled and disabled→enabled moves expose both paths but only
  the current destination can select; deletion retains context and selects none.
- C43: `HEAD~1..HEAD` and explicit enabled/disabled disposition paths receive
  the same current-entry check.
- X08: opted-out and same-folder non-test paths are excluded; production-only
  changes select nothing; committed/disposition resolution leaves Git clean.

Invalid revisions/options/paths, missing Git and malformed configuration return
unresolved with exit 1. Fixture arrangement uses MakeMe repositories/settings;
Git and FS actions and independent path expectations stay at the call site.
No unrelated suite was converted. Workflow/native application is still slice 4.

## Terminal proof

```sh
env PATH=/opt/homebrew/bin:$PATH npm test -- tests/makeme-changed-scope.test.mjs tests/makeme-changed-moves.test.mjs tests/makeme-selection.test.mjs tests/makeme-selection-configuration.test.mjs tests/makeme-native-use.sh src/skills/dough-execute-plan/scripts/consumer-trace-terms.test.mjs src/skills/dough-execute-plan/scripts/consumer-trace.test.mjs
env PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/consumer-trace-terms.test.mjs src/skills/dough-execute-plan/scripts/consumer-trace.test.mjs
npm run typecheck:dashboard
git diff --check
```

All terminal exit 0. The second command covers newly added compatibility proof:
index-only cancellation must not invent lexical working-tree terms or their
consumers. The initial new-test error compared a Git result object with a
string; the owner corrected `.stdout` assertions and reran the repaired gate.

The coordinator obtained actual maintained inventory with
`env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_DIR=tests bash scripts/test-jobs.sh`:
607 jobs, both new root test files exactly once as node jobs. Command exit was
checked before parsing NUL records. Evidence:
`/tmp/seed307-slice3-default-jobs.nul` and `/tmp/seed307-slice3-default-proof.json`.

## Consumer and continuation boundaries

Trace command:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/apply-shared-makeme-rules-per-entry --base HEAD --term repositoryChangePaths --term selectChangedMakeMe --term makeMeSkillFiles
```

`/tmp/seed307-slice3-consumer-trace-dispositioned.md` disposes all 454 rows:
8 run, 446 concrete exclusions, mostly unchanged plan links. The source lexical
entrypoint and public/fixture/native-control consumers are covered by the
focused commands. Installed released copies remain unchanged; running the
installed trace is a workflow observation, not proof of new installed bytes.
Complete installed-byte/runtime proof remains slice 4.

Prior ordinary native proof remains applicable: source paths, prompt, convention,
configuration and default explicit selector behavior are unchanged. The shared
fixture loader preserves their candidate bytes and adds the already-declared
execution companion. No paid native/Cursor/auth action occurred. Native Cursor
behavior stays unverified under the one-execution waiver.

Freshness is unchanged at trunk `13aca65c35831f4b7d0577a120843006abbf26bb`.
The page-object sibling is Taken; no shared parser/selector/validator/MakeMe,
workflow-caller or collector product delta appears on that pinned trunk since
our Take. No accepted sibling behavior needs reconciliation at this boundary.

Independent `/root/refactor_slice3` returned `## REFACTOR COMPLETE`,
`none — already clean`, with no edits, extra tests or uncovered consumer.
The collector, current-source filter, selector and shared fixture loader were
reviewed as one coherent seam; all accepted proof remains applicable.

Fresh preparation first stopped at `no-param-reassign` in the changed-scope
entrypoint. Replaced parameter reassignment with an equivalent local constant.
`env PATH=/opt/homebrew/bin:$PATH npm test -- tests/makeme-changed-scope.test.mjs tests/makeme-changed-moves.test.mjs`
passed to terminal zero after that repair. No commit or push preceded the stop.
