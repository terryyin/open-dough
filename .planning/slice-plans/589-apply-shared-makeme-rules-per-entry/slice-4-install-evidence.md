# Slice 4 installer evidence

Identity: SEED-307#apply-shared-makeme-rules-per-entry; workspace
/Users/terryyin/git/open-dough/.worktrees/apply-shared-makeme-rules-per-entry;
branch codex/apply-shared-makeme-rules-per-entry; implementation base
3940c9d798a60bfd047456b31b4243a07730c768. No commits, publication, formatting,
hook-owned lint or installed-managed-copy edits by this agent.

## Outcome

- install.sh assembles its one managed_files inventory from prefix initialization,
  one data-only execution append fragment, and suffix append. Same order is
  retained; all nine MakeMe skill/convention/runtime/license files are declared.
- read_managed_files_declaration remains the read-only public API through
  open-dough-release-version.sh, with the cohesive parser extracted into
  open-dough-payload-declaration.sh. It statically reads bounded array/append/data
  includes, validates completion and the core entry over the assembled result,
  and refuses missing/incomplete/command-bearing fragments without evaluation.
  Legacy grouped and one-entry-per-line arrays remain readable.
- Historical release recovery batches installer/data blobs and materializes each
  tag's fragments beside its own installer. It never substitutes current data.
  Unreadable historical declarations still contribute nothing; ordinary edited
  leftovers refuse without writes and explicit force keeps its prior boundary.
- Release fixtures use that same static reader, flattening the full assembled
  declaration when applying withheld/added release facts. A composed historical
  fixture deliberately declares a dropped file that current fragments do not.
- The CI GitHub acquisition test was an actual additional declaration consumer:
  its former main-file-only regex lost the extracted execution files. It now
  uses canonical declaredPayload(), preserving its full installed-file scan.
- The pinned-inspection guide and executable helper list include both new files.

## Owned paths

install.sh
src/install/open-dough-execution-payload.sh (new)
src/install/open-dough-payload-declaration.sh (new)
src/install/open-dough-release-version.sh
src/install/open-dough-release-leftovers.sh
tests/support/releaseTestData.mjs
tests/makeme-payload.test.mjs (new)
tests/payload-declaration-links.sh
tests/update-removes-dropped-files.sh
tests/pin-and-inspect.sh
docs/installation-and-updates.md
src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs

All owned source/guide/test files remain below 250 lines. New data/reader files
carry explicit ShellCheck annotations only for their intended external array use
and literal source-text prefix.

## Focused proof

Command (terminal 0):
`env PATH=/opt/homebrew/bin:$PATH npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/update-adds-new-payload-skill.sh tests/story-payload-update.sh tests/support/repository-release.test.mjs tests/update-removes-dropped-files.sh tests/retrospective-reference-payload.sh tests/compare-payload.sh tests/install-preserves-open-dough-json.sh tests/pin-and-inspect.sh`

Setup: maintained shell fixtures and makeMe.aRelease/makeMe.aRepository release
histories. Observations: complete declared links, ordered native Bash composition,
legacy arrays, no installer evaluation, missing/incomplete fragment refusals,
both-root payload bytes, installation/update preservation, withheld/added release
facts, composed historical dropped-file recovery, edited refusal/no writes,
force removal, baseline comparison and pinned inspection. Final refresh below
adds the command-bearing fragment control and covers the final history reader.

Command (terminal 0):
`env PATH=/opt/homebrew/bin:$PATH npm test -- tests/makeme-payload.test.mjs`

Setup: makeMe.aRepository with a MakeMe-enabled backend and disabled frontend,
project-owned skill/configuration sentinels, and two makeMe.aRelease revisions
before/after MakeMe. Actions perform a real current-source composed installation
and a real tagged-release update from the older installation. Observations in
`installation and update deliver the complete standalone MakeMe rule to both
native roots without changing project opt-ins`: every explicit MakeMe file's
bytes in .agents and .claude match source (including matcher license); opt-ins
and unrelated host guidance remain exact; node_modules is absent; installed
select CLI selects a new backend spec while excluding helper/frontend paths;
installed changed CLI selects only the current backend source, proving its
relative execution companion also ships and loads outside the source project.
This is installed runtime/structure proof, not Cursor native application.

Command (terminal 0, 19 selected jobs all passed):
`caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/seed307-slice4-installer-extra-times OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed307-slice4-installer-extra-outcomes npm test -- tests/install-refuses-unsafe-topology.sh tests/self-installation-baseline.sh tests/dough-update-guidance-payload.sh tests/update-force-restores-latest.sh tests/install-latest-release.sh tests/install-reports-real-copy-failure.sh tests/product-backlog-payload-update.sh tests/install-all-tools.sh tests/execution-payload-update.sh tests/dough-adr-awareness-context.sh tests/update-reports-replacement-failure.sh tests/install-ci-background-hook.sh tests/update-skip-verified.sh tests/install-ci-host-hooks.sh tests/install-omits-internal.sh tests/install.sh tests/dough-update-local-guidance-rejection.sh tests/install-repeat-force-public-payload.sh tests/update-refuses-unverifiable.sh`

Observations: these existing actual installer consumers cover shared host layouts,
unsafe topology refusal, default-root baseline, latest tagged bootstrap, repeated
and force installation, copy/replacement failures, host hooks, update skip/refusal,
new payload additions and complete helper inspection. This was traced additional
consumer proof, not a repeated broad suite. Basis: awake AC90%, load10.25/8.06/9.69,
41% free memory; one shell fixture job at a time. It overlapped an already-running
Codex native journey before root imposed the one-heavy-command coordination;
no sleep invalidation or proof failure occurred. Outcomes/times are retained at
those exact paths; longest were 40.6s baseline and39.2s force update.

Final refresh command (terminal 0; all eight selected checks passed):
`caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/seed307-slice4-installer-final-times OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed307-slice4-installer-final-outcomes npm test -- tests/payload-declaration-links.sh tests/update-removes-dropped-files.sh tests/update-force-restores-latest.sh tests/native-evidence-identity.sh tests/git-publication-fixture-identity.sh tests/support/native-admission-reuse.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs tests/product-backlog-native-take-fixture.sh`

Setup/observations: actual final declaration/history readers plus credential-free
native fixture identity hashing/import closures, missing-input refusal, admission
reuse sensitivity and installed Take fixture use. No native Cursor invocation or
authentication occurs. CI acquisition's three existing tests retain API-source,
rate-limit and full installed-file no-direct-gh assertions. Payload declaration
controls compare exact native order and legacy forms, reject missing/incomplete
append fragments, reject a fragment containing a touch command and assert it
never ran. Historical A exists only in the old tag's composed fragment; both
roots must remove it, making current-fragment substitution observable.

Owned whitespace proof (terminal 0):
`git diff --check -- install.sh src/install/open-dough-execution-payload.sh src/install/open-dough-payload-declaration.sh src/install/open-dough-release-version.sh src/install/open-dough-release-leftovers.sh tests/support/releaseTestData.mjs tests/makeme-payload.test.mjs tests/payload-declaration-links.sh tests/update-removes-dropped-files.sh tests/pin-and-inspect.sh docs/installation-and-updates.md src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs`

## Consumer record and scope

Trace command (terminal 0):
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/apply-shared-makeme-rules-per-entry --base 3940c9d798a60bfd047456b31b4243a07730c768 --term read_managed_files_declaration --term releaseInstaller --term open-dough-execution-payload.sh --term open-dough-payload-declaration.sh`

Raw: /tmp/seed307-slice4-installer-consumer-trace.md.
Working dispositions: /tmp/seed307-slice4-installer-trace-dispositioned.md.
The trace observes concurrent whole-slice writers and includes generic PLAN.md,
SKILL.md and captured-history matches. Installer-specific proof and generic
exclusions are assigned there; workflow/native rows stay explicitly owned by
/root/slice4 for its coordinated final trace and actual proof. The installer
agent claims no useful-native behavior. The parent must settle those rows.

Installation commitments C45/C46/C47 and Q27 are observed at real install/update
boundaries. Q24/Q31 and X01–X07 are preserved scope: no release/tag, real project
update, opt-in alteration, local rule removal, suite conversion or page-object
implementation. Cursor native behavior remains unverified under Terry's one-run
waiver; no default or release-eligibility waiver is claimed. C07/C37/C38/C44/C50,
Q28 and J21–J29 belong to the parent's workflow/native proof.

Final no-more-writes observation: every owned command reached terminal zero; no active verification remains. The final outcomes/times files retain all eight passed labels. Parent may proceed with Claude native proof.
