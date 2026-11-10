# Slice 4 acceptance

Freshness unchanged at `09b455646f66ef273375965c55523fa610dfd834`; named incoming
CI Proof work remains planning-only. C19/J18–J22 compared with actual fixture,
materializer/encoder contracts, profile assertions and before/after observations.

Initial revisions use `aRepository` and the existing local materializer. CI runs
use `aCiRun`/`apiRun`; admission continuation/correction plans use shared slice
facts/encoders. Generated products, workflow/ignore bytes, worktrees, competing
commits, dirty human files, installation and observers retain harness ownership.
Owned-context helper has only operations and retained evidence/instructions; its
initial facts reach shared materialization through the trunk fixture.

Terminal passing commands:

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 SLICE4_CAPTURE=/tmp/dough-slice4-before npm test -- /tmp/dough-slice4-profile-probe.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 SLICE4_INPUT_CAPTURE=/tmp/dough-slice4-inputs-before npm test -- /tmp/dough-slice4-input-capture.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- /tmp/dough-slice4-compare.mjs tests/git-publication-native.sh tests/git-publication-native-owned-context.sh tests/git-publication-fixture-identity.sh tests/native-evidence-identity.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- tests/git-publication-native-admission.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 SLICE4_CAPTURE=/tmp/dough-slice4-after SLICE4_INPUT_CAPTURE=/tmp/dough-slice4-inputs-after npm test -- /tmp/dough-slice4-profile-probe.sh /tmp/dough-slice4-input-capture.sh /tmp/dough-slice4-compare.mjs
```

Four trunk profiles retain exact tracked trees, candidate ancestry and pending
human edits, with Codex's private observer and Cursor's deferred arming. Story
profile retains divergence and successful branch coverage; real merge conflicts
only on `product.txt`, then abort restores tip and human state. The probe asserts
these facts independently before writing its normalized comparisons. CI response
JSON is equal; admission plans retain every nonblank line. All-host owned-context
substitutes retain publication, completion and retirement observations. Separate
admission substitutes exercise actual continuation/correction and refusal cases.

The final CI-writer correction preserves shell regular-file/nonempty-file
predicates and trailing-newline handling; affected comparisons were renewed.
Identity checks require the new roots and actual transitive imports and mutate
listed bytes to observe hash sensitivity. No fresh native-agent pass is claimed:
matching inputs preserve existing mechanism applicability; substitute limits hold.

Consumer dispositions inspected in `/tmp/dough-slice4-consumer-trace.md` and
`/tmp/dough-slice4-owned-consumers.md`, including actual admission callers.
All fixture observers/watchers stopped before removal; coordinator observer stayed
untouched. No uncovered promise. This Mac: AC, 55% free memory, load7.63/13.19/17.08;
one-job sequential focused proof selected, no full suite or deferred proof.

Independent `/root/refactor4` returned `REFACTOR COMPLETE`, none — already clean.
No edits or repeat tests; all accepted setup, observations and consumer proof hold.
