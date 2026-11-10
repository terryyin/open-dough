# Slice 2 acceptance

Freshness unchanged at trunk `09b455646f66ef273375965c55523fa610dfd834`;
named incoming CI Proof changes remain planning-only. C09/J10–J15 were inspected
against the source and actual setup, builder and independent observing assertions.

The builder owns native host handler wrapping and manual fragment registration,
using the authoritative host inventory without invoking the production merger.
Call sites retain case-driving host/event/matcher/command/timeout/version values.
Malformed, edited, duplicate, suffix, narrower-matcher and filesystem inputs and
all installer actions/assertions remain explicit and unchanged.

Passed terminal commands:

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- tests/install-ci-host-hooks.sh tests/install-ci-background-hook.sh tests/install-all-tools.sh tests/execution-payload-update.sh tests/update-skip-verified.sh tests/install-preserves-open-dough-json.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- tests/native-evidence-identity.sh tests/git-publication-fixture-identity.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- tests/install-ci-host-hooks.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- /tmp/dough-slice2-settings-equivalence.mjs
```

The last command compares all nine emitted empty/mergeable/exact native JSON
documents against pre-change captures at their consuming parsed boundary.
`host-hook-assertions.mjs::managed` observes exactly one matching managed handler
per event; `unrelated` observes unrelated settings/handlers for all three hosts.
`install-ci-host-hooks.sh` observes adoption/no-write hashes and unchanged snapshot
refusals for edited handlers under ordinary and forced installation.
The new builder and authoritative host inventory enter native dependency closure;
identity/changed-input checks passed. No fresh native-agent pass is claimed.

Consumer records inspected: `/tmp/dough-slice2-consumer-trace.md` and
`/tmp/dough-slice2-settings-consumers.md`; six runtime writer callers exercised.
Existing accessors' facts are unchanged; the newly reached import closure has
current availability proof. No affected unproved consumer or remaining gap.
Focused proof used one job under the retained AC/high-load machine decision.

Independent `/root/refactor2` returned `REFACTOR COMPLETE`, none — already clean.
No edits or duplicate tests; accepted setup, observations and consumer proof held.

Subsequent coordinator inspection found valid native guard settings outside this
writer family. G2 and C09 now belong to slice 3; the six callers' proof above holds.
