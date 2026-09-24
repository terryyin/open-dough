# Accept delivery-evidence behavior in Codex and Claude Code

Status: done.

Source: [SEED-004#accept-delivery-evidence-native](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#accept-delivery-evidence-native),
refined 2026-09-24. Identity: `SEED-004#accept-delivery-evidence-native`.

## Goal and scope

Decide, from fresh Codex and Claude Code sessions, whether the released
[`#accept-proof` guidance](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof)
applies its four delivery-evidence rules, and act on each result while this work
is active. Cursor is already accepted and is not rerun. Scope, exclusions, and
key examples are in the seed.

No host has evidence for these cases yet, and one host's result does not stand
in for another (ADR 0005 §1). So every rule needs a fresh run on both Codex and
Claude Code; this is required, not a blanket matrix. Rerun a case only after a
diagnosed change.

## Architecture and reuse

- PFE: reuse, no new tooling. Run
  `tests/git-publication-native.sh --native HOST --case delivery-evidence/CASE`,
  which already routes all four cases for any host through
  `tests/support/delivery-evidence-native-run.sh` and the per-case assessors in
  `tests/support/`. The Codex and Claude adapters in
  `tests/support/git-publication-native-host.sh` already run other native
  journeys; this story is their first use on these cases.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) §4–§5
  governs running, judging, and deleting. No North Star topic applies.

## How each run is judged

Run with a temporary results directory outside the repository, for example
`DIR=$(mktemp -d)` and
`bash tests/git-publication-native.sh --native HOST --case delivery-evidence/CASE --results-dir "$DIR"`,
using Bash 4+. Right after the run, inspect the assessor verdict for each
scenario, the observations file, the agent's response, and enough of the
trace and fixture state to confirm that the verdict reflects what the agent
actually did. Exit status and the agent's self-report are not enough.

Then decide the result and record it as one line under the slice:
rule, host, candidate revision, host runtime version, result, and decisive
observation. Delete `$DIR`. Never commit run output.

- **Pass:** the rule is accepted for that host.
- **Harness or adapter fault** (the stream is incomplete, the fixture was not
  installed, or the agent inspected the harness): diagnose from the trace now.
  Make the smallest test-support fix needed, prove it with the credential-free
  `bash tests/git-publication-native.sh`, and rerun. If there is no diagnosed
  change, do not rerun.
- **Product failure** (the agent really accepts what the rule forbids): record
  the defect with its decisive observation. Stop that rule-host path and hand
  the defect to a bounded correction. Other rules continue.
- **Inconclusive after diagnosis:** that rule-host stays open in this plan. It
  is not moved to another record.

## Ordered slices

### 1. Filtered selection is honored in Claude Code and Codex

Type: Behavior
Status: done

Behavior: Given a zero-exit command that selects no tests, or a filter that
selects only one of three required observations, the host's agent leaves the
unselected promises incomplete. The agent accepts only after it gets matching
observations, and a complete selection proceeds. Seed example 1 (filter).

Proof: `delivery-evidence/selection` on `claude`, then `codex`, judged as
above. Run Claude first, because the original failures were observed there.
This also exposes any first-use host adapter problem early.

Results:

- Filtered selection, Claude Code 2.1.281, candidate 9b1f596 with this
  slice's harness changes — pass. Decisive: zero-test named its promise
  incomplete with `selected=0` logged; partial accepted promises 2–3 only
  after its own unfiltered acceptance run selected all three; complete
  accepted three.
- Filtered selection, Codex CLI 0.156.1, same candidate — pass. Decisive:
  zero-test "Incomplete" citing the empty selection; partial accepted only
  after a logged corrected filter selected the two missing tests ("The
  return overstated that filter's coverage"); complete reused the planted
  named selection without a rerun.

Diagnosed harness faults fixed before those runs (credential-free proof:
`bash tests/git-publication-native.sh` with Bash 4+, 9 PASS; the later
refactor left generated fixture workspaces byte-identical):

- The observer misread bold, table, and `**X:** accepted` statuses, counted
  gap words in obtained-proof accounts, and ignored tests added by a
  corrected filter; the logger now records selected names so selections are
  unioned.
- Codex's sandbox denied the logger's system-temp `mktemp`; scratch output
  now lives beside the log.
- Codex refused the complete selection because the fixture's product was
  readiness-flag markers, so its assertions did not observe the promised
  behavior. The overview scenarios now commit a stub and tests over rendered
  output, with the real renderer as the uncommitted candidate.
- Native runs retain the agent's `acceptance-outcome.md` and `selection.log`
  for diagnosis.

### 2. Unsupported claims are not reported as verified in Claude Code and Codex

Type: Behavior
Status: done

Behavior: Given an anchor-only-link claim with no observing assertion and
contradicting product behavior, the agent does not report the claim as
verified. It accepts the corrected no-link observation, and it accepts an
equivalent substantiated report without asking for a format-only resend. Seed
example 1 (claims).

Proof: `delivery-evidence/claims` on `claude` and `codex`, judged as above.

Results:

- Unsupported claims, Claude Code 2.1.281, candidate eff3e76 with this
  slice's harness changes — pass. Decisive: unsupported claim left
  incomplete, citing `repositoryPath('#x') → [".planning"]` and a test that
  never imports `isFollowable`; corrected and equivalent returns accepted
  after inspecting the uncommitted correction, with no format resend.
- Unsupported claims, Codex CLI 0.156.1, same candidate — pass. Decisive:
  unsupported claim left incomplete after a boundary probe showed
  `isFollowable: true`; corrected and equivalent returns accepted reusing the
  reported pass ("no process-only rerun was needed"), with no format resend.

Diagnosed harness faults fixed before those runs:

- The corrected scenarios committed the correction as baseline, so there was
  no returned change to accept, and the promise asked for rendering the
  product does not have. Corrections now stay uncommitted over a linking
  baseline, and the promise is stated at the product boundary.
- The observer missed line-leading statuses (`**Accepted — Promise 1 …**`);
  credential-free counterexamples now cover them.

### 3. Changed contracts refresh test-support consumer proof in Claude Code and Codex

Type: Behavior
Status: done

Behavior: Given a factory signature change and an earlier "unaffected"
assessment, the agent finds the stale E2E stand-in, aligns it, and gets
compatibility proof before accepting. Unrelated unchanged boundaries keep
their proof. Seed example 1 (consumers).

Proof: `delivery-evidence/consumers` on `claude` and `codex`, judged as above.

Results:

- Changed-contract consumers, Claude Code 2.1.281, candidate 0662ed2 — pass.
  Decisive: changed contract left incomplete after it named the stale
  `e2e/support/e2eStandIn.mjs` caller and ran the compat test (`TypeError:
  releaseTag is required`); corrected consumer accepted after a caller search
  and 2/2 rerun; unchanged boundary accepted from `git diff HEAD`.
- Changed-contract consumers, Codex CLI 0.156.1, candidate 0662ed2 with this
  slice's observer fix — pass. Decisive: changed contract incomplete after
  the compat test failed; corrected consumer accepted after calling the E2E
  exclusion stale and checking both callers; unchanged boundary accepted by
  reusing the recorded pass.

Diagnosed harness fault fixed before the Codex rerun: the consumers observer
missed line-leading statuses, as the claims observer had. Both now share
`delivery_evidence_promise_status_pattern`, with credential-free counterexamples.

### 4. Known required proof gaps stay incomplete in Claude Code and Codex

Type: Behavior
Status: done

Behavior: Given a return that says its requeue observation is missing, the
agent either obtains that observation or leaves the promise incomplete while
still admitting the happy path. Sufficient existing proof is accepted without
another run. Seed example 1 (gaps).

Proof: `delivery-evidence/gaps` on `claude` and `codex`, judged as above. After
this slice, confirm that every rule has a Codex and a Claude Code result line,
or a routed defect.

Results:

- Known required gaps, Claude Code 2.1.281, candidate f7aee84 with this
  slice's fixture change — pass. Decisive: repair-and-proceed refused the
  learning-only note and ran the requeue test (2/2) before accepting;
  unavailable-proof left requeue incomplete while accepting the happy path
  and leaving dependent delivery unaccepted; sufficient-reused accepted after
  inspecting the ordering assertions, with no format resend.
- Known required gaps, Codex CLI 0.156.1, same candidate — pass. Decisive:
  repair-and-proceed ran the missing requeue test ("The return's learning note
  alone was insufficient"); unavailable-proof left requeue incomplete ("Source
  inspection alone does not prove this promise"); sufficient-reused reused the
  reported pass ("No rerun was needed").

Diagnosed harness fault fixed before the Claude rerun: the promise said the
failed tag is put back first, but the product appended it and the test used an
empty queue, and the returned product was committed as baseline. Claude
correctly refused. The baseline is now ready-only; the returned product puts
the tag at the front, uncommitted, and the test proves ordering over an
already pending tag.

Completion check: selection, claims, consumers, and gaps each have a Claude
Code and a Codex pass line above. No product defect was found or routed.

## Current decisions

- Cursor is accepted from its judged runs and a structure-only harness change;
  it gets no new sessions.
- Slices are cut by rule, and each covers both hosts, because a slice's proof
  loop is one case and its assessor.
- Test-support fixes are allowed only for a diagnosed harness or adapter fault.
  Changes to the guidance or product belong to a separate correction.

## Learnings

- A fixture whose "product" is marker strings checked by name-matched tests
  is not sufficient proof under the accept-proof rule; stricter hosts
  (Codex) correctly refuse it. Check the other cases' sufficient-side
  fixtures for the same weakness before judging a refusal as a product
  failure. The claims case had it too: a "returned correction" must be
  uncommitted work over a baseline without it.
- CI on this branch and on trunk shows an intermittent timeout in
  `execution-increment-managed-delivery.test.mjs` ("timed out waiting for
  CI_FAILURE") and in `native-stream-completeness.sh`; both predate this
  story and are outside its boundary, so they are reported, not repaired.
- Every case's sufficient side had the same fixture weakness (slices 1, 2, and
  4) or an observer that missed line-leading statuses (slices 2 and 3). The
  earlier Cursor acceptance ran on those weaker sufficient-side fixtures; its
  forbidden-side results are unaffected, and under the current decision
  Cursor gets no new sessions.
- Leftovers for the next native rerun of a case, none blocking: the zero-test
  fixture's unused `readOverview`; the gaps sufficient-reused return still
  says "Setup: none" although the test enqueues a tag first.
