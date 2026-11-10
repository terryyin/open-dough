# Slice 1 acceptance

Source freshness: unchanged at `09b455646f66ef273375965c55523fa610dfd834`.
Named sibling CI Proof preparation changed only planning; no accepted incoming
product conversion affects this output. Current complete and shared-only
predecessors match source examples 1 and the independent review C04–C16/J01–J09.

`update-adds-new-payload-skill.sh` installs real 0.1.1 into both roots and verifies
old payload, source/version and absent later skills before invoking the updater.
The complete case retains original sentinel placement. Shared-only explicitly
moves unrelated Claude guidance outside its root before removing that root.
Independent assertions then observe both 0.1.2 roots, payload/source/version,
all sentinels and project configuration. The ADR release writer uses the
existing MakeMe release-source path; its actual tags and distinguishable old/new
guidance remain independently asserted. Retired helper searches found no callers.

Passed, with terminal results observed by `/root/slice1`:

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 npm test -- tests/update-adds-new-payload-skill.sh tests/story-payload-update.sh tests/dough-adr-awareness-codex-delivery-to-use.sh tests/dough-adr-awareness-cursor-delivery-to-use.sh tests/dough-adr-awareness-claude-delivery-to-use.sh tests/install.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 npm test -- tests/native-delivery-updated-use.sh tests/native-delivery-updated-use-adapters.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 npm test -- tests/support/native-import-closure.test.mjs tests/native-evidence-identity.sh tests/git-publication-fixture-identity.sh
PATH=/opt/homebrew/bin:$PATH bash /tmp/dough-slice1-release-equivalence.sh
```

The last command compares complete original/converted ADR release file sets and
SHA-256 bytes for old/new releases. Coordinator inspected its source and the
retained original snapshots. No fresh native-agent behavior is claimed; matching
emitted guidance preserves the prior integration mechanism. Substitute journeys
retain that limited meaning. Writer, MakeMe, release/materializer and scanner
dependencies now enter native identity; historical captured streams stay literal.

G1: scanner already skipped comments lexically but left their text visible to
dependency regexes. It now blanks those comments. The exact-input regression
`ignores import and spawned-module examples inside comments` failed first with
ENOENT `commented.mjs`, then observed only `actual.mjs` and `entry.mjs` after repair.
Identity and fixture checks exercised the real writer/scanner continuation.

Consumer trace and every disposition inspected in agent reports retained at
`/tmp/dough-slice1-{consumer-trace,identity-consumers,scanner-consumers}.md`.
Unchanged default sentinel callers still use the same path; only the asymmetric
case supplies the new explicit location. Native identity callers have current
closure/changed-input proof; documentation and historical streams are excluded
from executable effects. No remaining slice promise is unproved.

Machine decision: this Mac was on AC with 54% free memory and load near 24.
Focused checks ran with two jobs; full suites remain coordinator-owned final
gates with fresh headroom assessment and the maintained macOS sleep guard.

Independent `/root/refactor1` returned `REFACTOR COMPLETE`: removed the redundant
JSDoc regex so the lexical pass owns comment handling. Its only edit invalidated
scanner proof, renewed with the same three-check closure/identity selection above
using `OPEN_DOUGH_TEST_JOBS=1`; terminal pass. Direct Take identity closure passed.
Other accepted boundaries were unchanged. Trace/dispositions inspected at
`/tmp/dough-refactor1-scanner-trace.md`. Fresh headroom: AC, 55% free, load near 40;
one-job focused proof selected. All changed files are at most 250 lines.

Guarded formatting initially refused ShellCheck SC2312 in four new comparisons.
Coordinator separated reads from comparisons inside the accepted refactor's
already-traced update-check path; no new helper, contract or dependency. Renewed
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- tests/update-adds-new-payload-skill.sh`
passed. Formatter's other edits were whitespace only; existing proof still matches.
