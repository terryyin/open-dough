# Slice 3 acceptance

Source freshness unchanged at trunk `09b455646f66ef273375965c55523fa610dfd834`;
incoming named CI Proof sibling changes remain planning-only. C18/J16/J17 and
G2/C09 compared with the source, new writer and actual independent observations.

`product-backlog-native-facts.mjs` builds Take seed/plan/backlog with existing
facts/encoders. The existing seed encoder has an optional document title; its
default expression/output is unchanged for all previous callers. Guard backlogs
use the canonical encoder, and both Codex/Cursor existing settings use MakeMe.
Prompts, tool-call counterexamples, actual installation/preparation/Take and
native transcript assertions remain unchanged.

The retained `tests/product-backlog-native-take-fixture.sh` reads one queued
identity and refined/planned/ready preparation, requires the original native
backlog assertion to fail before claim, then runs the installed Take. The same
assertion observes exactly one Taken entry with the plan; `cmp` observes an
unchanged seed. This test passed on the original fixture before conversion too.

Passed terminal commands:

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- tests/product-backlog-native-take-fixture.sh tests/product-backlog-native.sh tests/support/product-backlog-take.test.mjs tests/native-evidence-identity.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- /tmp/dough-slice3-equivalence.sh /tmp/dough-slice3-guard-install.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- tests/product-backlog-native-take-fixture.sh tests/git-publication-fixture-identity.sh
```

Coordinator inspected both scratch scripts. Original captures:
`/tmp/dough-slice3-baseline.bD0Qjl`. Seed/both backlogs match byte-for-byte;
plan nonblank lines all match (only blank-line spacing differs); guard settings
match parsed JSON. Actual Codex/Cursor installs preserve descriptions/unrelated
handlers; repeated installation leaves exactly one registered guard.

Approved identity reorganization retains all existing assertions in the main
check and writer setup in `native-identity-writers.bash`. Existing supervised
writers retain list propagation and supervision-byte checks. Take directly
invokes Claude and prints hashes, without that supervision/retained-result
lifecycle; it now gets closure, required-input and content-sensitivity checks.
Every listed source, including newly reached test builders, is mutated in the
identity check. No native execution mechanism or fresh native pass is claimed.

Consumer dispositions: `/tmp/dough-slice3-consumer-trace.md` and
`/tmp/dough-slice3-owned-consumers.md`. New optional-title effect is covered by
the actual fixture/claim; unchanged default-title consumers retain their bytes.
One unnecessary standalone Take-unit rerun passed and adds no coverage claim.
One-job focused proof used the retained AC/high-load decision; no proof deferred.

Independent `/root/refactor3` returned `REFACTOR COMPLETE`, none — already clean.
The delivered size reorganization matches the recorded setup/assertion seam;
no edits or duplicate tests, all accepted proof remains applicable.

Guarded formatting reported sourced globals as unassigned in the main identity
check and kept Take test. Coordinator added explicit ShellCheck provenance
comments in those accepted paths; no behavior/proof changed. Other automatic
formatting changed layout only, so no duplicate test run was needed.
