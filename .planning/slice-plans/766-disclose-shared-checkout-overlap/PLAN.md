# Disclose shared-checkout overlap in published session records

**Identity:** SEED-418#disclose-shared-checkout-overlap
**Source:** [Disclose shared-checkout overlap in published session records](../../seeds/SEED-418-review-published-session-changes.md#disclose-shared-checkout-overlap)
**Source review:** [Independent source review](source-review.md)
**Split from:** SEED-418#attribute-every-workflow-session-record (plan 747) at delivered slice 7 on 2026-11-22

## Goal and scope

A developer reviewing a published session from another machine sees when one
of its comparisons may include another session's work from the same checkout.
Agents can resume an interrupted Land close from per-session local state and
follow concise publication and recovery instructions.

Included: the Dashboard's shared-checkout note beside each affected open
session's landing context, the publisher's per-range
`uncertainty: "shared-checkout"` mark, and the published-session review's
warning. Excluded, as the story records: closes without a Dashboard landing
context, older installations, and per-session attribution inside a shared
checkout. Pulled-only and unpublished edits already stay outside a published
range (its base is the trunk the Land built on), so no slice adds machinery
for them; slice 1's proof keeps them observed.

## Key examples and outside-in proof

| Promise | Owner | Observable signal |
| --- | --- | --- |
| A close whose landing context has a shared-checkout note publishes its range marked, and a commit received only by pull before the work stays outside it | Slice 1 | Distribution close test reads the published record from trunk |
| A close without a note publishes an unmarked range; a resumed close keeps the mark | Slice 1 | Same test file, unmarked control and resume case |
| From another clone, a marked range shows the Done shared-checkout warning; an unmarked one shows none | Slice 2 | E2E published-session review from a machine with no launch here |
| Two launched sessions open in one checkout, including one that opens after the other launched, each get the note; an isolated worktree launch or a session done before the other opened gets none | Slice 3 | Dashboard backend spec reads each launch's reporting directory |
| Two closes in one checkout resume independently, preserving the accepted range and sealed record | Slice 4 | Distribution close test reads the published records from trunk |
| Publication guidance tells the agent what to supply, do, and report | Slice 5 | Walk normal and interrupted closes using the edited references |

## Current decisions

- **Note contract.** One shared module beside
  [`session-record.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs)
  owns the note's file name (beside `landing-context.json` in the launch's
  reporting directory) and shape `{ "since": <ISO time> }`; the Dashboard
  imports it as it already imports the record contract
  ([`publishedSessionRecord.ts`](../../../dashboard/src/publishedSessionRecord.ts)).
  The note keeps its earliest `since`.
- **Marking rule.** The publisher marks each range of the sealed close whose
  acceptance is at or after `since`. A close seals its ranges at one
  acceptance, so with a note present that range is marked.
  [`sessionRecord`](../../../Distribution/src/skills/dough-execute-plan/scripts/sealed-session-record.mjs)
  currently rebuilds ranges as `{ base, candidate }`; it must keep an optional
  `uncertainty` so a resumed close republishes identical bytes.
- **Overlap rule.** Reuse
  [`checkoutSharedMeanwhile`](../../../dashboard/server/sessionCheckoutShared.ts)'s
  same-checkout test; do not fork it. The Dashboard writes notes when a launch
  is kept ([`keepRecord`](../../../dashboard/server/launchRecordBinding.ts),
  which sees the project's kept records): for the new launch and for every
  other open launch in the same checkout, each located by its own
  `request.reporting.landingContext`. A launch without one gets no note.
- **Wording.** The published review reuses the Done text from
  [`StoryReviewSessionCommitsContext.tsx`](../../../dashboard/src/StoryReviewSessionCommitsContext.tsx):
  "Another session was open in the same checkout during that time, so the
  comparison may include that session's work." Share the sentence rather than
  copy it.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
  launch records and notes stay local; only the range mark is published.

## Decisive premises

| Consuming operation | Observation (form, profile, when) | Result | Remainder |
| --- | --- | --- | --- |
| Slice 3 writes the note beside a kept launch's `request.reporting.landingContext` | `ls ~/.open-dough/dashboard/reporting/a65edecc-ef32-425e-82ea-319e7c8db620/` on this machine's production Dashboard, 2026-11-22, for this launch | Holds `landing-context.json` (keys host, identity, origin, reference, remote, source, target) beside the installed scripts; a note there is in the same directory the publisher's `landingContext` path names | None |
| Slice 2 reads a marked record through the Dashboard reader | Scratch esbuild bundle of the real [`publishedSessionRecord.ts`](../../../dashboard/src/publishedSessionRecord.ts) under Node 24.21.0 (`.node-version`), parsing a range with `uncertainty`, at `1b35ca1b0` | Parses successfully and strips the field: older readers stay compatible, and slice 2 must add the optional field to show the warning | None |
| Slices 2 and 3 extend the overlap rule and published review | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- review/published-session-review review/published-session-listing review/done-kept-session-shared-checkout` at `1b35ca1b0` | 4 files, 35 tests passed: Done capture distinguishes shared, isolated and nonoverlapping checkouts with the existing warning; published review and listing green | None |
| Slice 1 closes through a Dashboard landing context | Delivered proof of SEED-418#attribute-every-workflow-session-record at `3dbaff36c` (`Distribution/tests/skills/dough-land/session-record-publication.test.mjs`, `session-close-resume.test.mjs`) | `publishSessionClose` reads `reference` from the landing context and seals one range `{ suffixBase, sha }` | None |
| Slice 4 keeps the exact resume inputs | `4d66988a1` and the Land resume tests | The publisher supplies `candidate` and `suffixBase` to `beforePush` for each attempt. Trunk closure already keeps sealed evidence. Reconstructing the base after rebase can include another writer's commit. | Keep state per session in Land, including the sealed record once available. |

## Slices

### 1. Publish a shared-checkout mark on a closed range

Type: Behavior
Status: done
Proof: Extend `Distribution/tests/skills/dough-land/session-record-publication.test.mjs`
and `session-close-resume.test.mjs` through their MakeMe builders: a landing
context with a note, a pulled trunk commit before the work, and a control
without a note; read the record from the published trunk.

**Behavior.** A Land close whose landing context has a shared-checkout note
publishes its range with `uncertainty: "shared-checkout"`; the pulled commit
stays below the range's base. Without a note the range is unmarked. A resumed
close republishes identical bytes with the mark.

**Accepted proof.** `bash scripts/test.sh Distribution/tests/skills/dough-land/session-record-publication.test.mjs Distribution/tests/skills/dough-land/session-close-resume.test.mjs`
passes after refactoring; the wrap-up, Story Branch and refinement
session-record suites and `install-all-tools.sh` passed on the same publish
path. The note module is
[`shared-checkout-note.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/shared-checkout-note.mjs)
(file `shared-checkout.json`); it holds only what the publisher reads.
Push and commit faults for the close tests live in
`Distribution/tests/skills/dough-land/session-close-faults.mjs`.
A new execution script must be listed in
`src/install/open-dough-execution-payload.sh`; CI run 44983901805 failed the
payload and evidence-identity tests until it was.

### 2. Show the shared-checkout warning in the published-session review

Type: Behavior
Status: done
Proof: Add a marked and an unmarked published close to
`e2e/sessions/recently-done-published-sessions.spec.ts` (published through
`publishSessionClose` with a note, as slice 1 delivers) and assert through
[`reviewChangesPage.ts`](../../../dashboard/test-support/reviewChangesPage.ts);
extend `dashboard/backend-tests/review/published-session-review.spec.ts` for
the `shared` flag per selected range.

**Behavior.** From a machine with no launch history, opening a published
session's marked range shows the shared Done warning; an unmarked range, or
another unmarked range of the same record, shows none.

**Accepted proof.** `npm run --silent test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts`
(run with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`;
`scripts/test.sh` does not route e2e specs), the backend
`review/published-session-review`, `review/published-session-ranges` and
`review/done-kept-session-shared-checkout` specs, and `typecheck:dashboard`
pass. The sentence's one owner is `sharedCheckoutWarning` in
`StoryReviewSessionCommitsContext.tsx`. A close through a landing context
needs a reachable landing receiver; tests write the note through
`noteSharedCheckout` in
`Distribution/tests/skills/dough-execute-plan/dashboard-landing-test-fixtures.mjs`.
CI run 44985422719 on this slice timed out the unrelated refinement touch
spec; its diagnosis is
[diagnosis-touch-refinement-timeout.md](diagnosis-touch-refinement-timeout.md),
with the touch tap bounded so the next hosted failure names its wait.

### 3. Note shared-checkout overlap when launches share a checkout

Type: Behavior
Status: done
Proof: Extend `dashboard/backend-tests/review/done-kept-session-shared-checkout.spec.ts`
or a sibling launch spec through the Dashboard launch entry: two established
Default main launches, a later second launch, an isolated worktree launch,
and one done before the other opened; read each reporting directory's note.

Slice 3 adds the note writer and the keep-earliest `since` rule to
`shared-checkout-note.mjs` with their Dashboard caller; the test helper
`noteSharedCheckout` then writes through that writer.

**Accepted proof.** `dashboard/backend-tests/review/shared-checkout-note.spec.ts`
keeps launches through `keepRecord` and reads each reporting directory's note;
with `review/done-kept-session-shared-checkout`, `typecheck:dashboard`, the
landing-fixture Distribution tests and the `e2e/launches` specs reaching
`keepRecord`, it passes. `keepRecord` notes after binding; a failed note write
still starts an early-reported Done and propagates its error, which callers
report as a launch-record failure.
The backend `review/ad-hoc-branch-entry-attribution` cases timed out under
load in this slice's runs; their repair is recorded in
[diagnosis-attribution-spec-timeout.md](diagnosis-attribution-spec-timeout.md).

**Behavior.** When a launch is recorded in a checkout where another launch
with a landing context is open, both reporting directories hold a note whose
`since` is the overlap's start, kept earliest. An isolated launch, or one done
before the other opened, gets no note. With slices 1 and 2 this completes the
overlap examples.

### 4. Resume Land closes from per-session state

Type: Behavior
Status: done

Save the candidate and suffix base before each push, and save the sealed
record before publishing it. Keep the state local and keyed by session. Resume
with the session identity and landing context already available to the caller.
Preserve explicit-input recovery when saved state is absent.

**Accepted proof.** `Distribution/tests/skills/dough-land/session-close-shared-checkout-resume.test.mjs`
interrupts a Dashboard close and a native close in one workspace and resumes
each from `session-close-state.mjs` (Git path
`open-dough/session-close/<sessionId>.json`); with every `dough-land` test,
the publication-resume, wrap-up and refinement session-record tests and the
payload installation tests, it passes on the branch merged with trunk's
record expiry (`0b1578c55`). Explicit inputs still take precedence. Saved
state is not deleted after publication.

**Proof.** Extend `session-close-resume.test.mjs` through the Land close API.
Interrupt two closes in one checkout and resume each in a fresh invocation.
Cover an unanswered push accepted after rebase and a stopped record publish.
Read both records from trunk and verify exact ranges, unchanged sealed bytes,
any overlap mark, and no second push of accepted work.

### 5. Shorten publication and recovery instructions

Type: Behavior
Status: done

Review the full affected references, including older passages, in
`publish-reviewed-checkout.md`, `wrap-up-closure-publication.md`, and
`story-branch-integration.md`. Use direct commands and short branches keyed to
the returned status or reason. Keep required inputs, next actions, and what
to report. Let script recovery carry the details it returns. Shorten the Land
resume paragraph using slice 4 and trim the `observation` row to the actions
its reasons require.

**Proof.** Walk a Story Branch close, an interrupted Land close, and a Trunk
observation stop from the revised references. At each stop, follow the
reported recovery, supply the required inputs, and report the result.

**Accepted proof.** The three references are shorter and match the scripts'
returned statuses and reasons; the walkthrough of a Story Branch record stop,
an interrupted Land close and a Trunk observation stop cites
`story-branch-session-record.test.mjs`,
`session-close-shared-checkout-resume.test.mjs`, `session-close-resume.test.mjs`
and `trunk-closure-owner-gaps.test.mjs`, which pass with the payload and
declaration-link checks.

## Concern evidence

Refinement keeps the three overlap proof loops in place and adds one loop for
Land recovery and one for its guidance. Slice 5 uses the recovery entry point
from slice 4. Slice 3's note and slice 1's reader share the note module. A real
native launch remains outside the plan's E2E proof.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md) when
  their test selection applies. Keep default timeouts and omit `test.slow()`.
- Run focused proof with `bash scripts/test.sh <paths>`; use `caffeinate -s -i`
  on AC power for long local runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
