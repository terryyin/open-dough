# Accept delivery-evidence behavior in Codex and Claude Code

Status: planned.

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
Status: planned

Behavior: Given a zero-exit command that selects no tests, or a filter that
selects only one of three required observations, the host's agent leaves the
unselected promises incomplete. The agent accepts only after it gets matching
observations, and a complete selection proceeds. Seed example 1 (filter).

Proof: `delivery-evidence/selection` on `claude`, then `codex`, judged as
above. Run Claude first, because the original failures were observed there.
This also exposes any first-use host adapter problem early.

### 2. Unsupported claims are not reported as verified in Claude Code and Codex

Type: Behavior
Status: planned

Behavior: Given an anchor-only-link claim with no observing assertion and
contradicting product behavior, the agent does not report the claim as
verified. It accepts the corrected no-link observation, and it accepts an
equivalent substantiated report without asking for a format-only resend. Seed
example 1 (claims).

Proof: `delivery-evidence/claims` on `claude` and `codex`, judged as above.

### 3. Changed contracts refresh test-support consumer proof in Claude Code and Codex

Type: Behavior
Status: planned

Behavior: Given a factory signature change and an earlier "unaffected"
assessment, the agent finds the stale E2E stand-in, aligns it, and gets
compatibility proof before accepting. Unrelated unchanged boundaries keep
their proof. Seed example 1 (consumers).

Proof: `delivery-evidence/consumers` on `claude` and `codex`, judged as above.

### 4. Known required proof gaps stay incomplete in Claude Code and Codex

Type: Behavior
Status: planned

Behavior: Given a return that says its requeue observation is missing, the
agent either obtains that observation or leaves the promise incomplete while
still admitting the happy path. Sufficient existing proof is accepted without
another run. Seed example 1 (gaps).

Proof: `delivery-evidence/gaps` on `claude` and `codex`, judged as above. After
this slice, confirm that every rule has a Codex and a Claude Code result line,
or a routed defect.

## Current decisions

- Cursor is accepted from its judged runs and a structure-only harness change;
  it gets no new sessions.
- Slices are cut by rule, and each covers both hosts, because a slice's proof
  loop is one case and its assessor.
- Test-support fixes are allowed only for a diagnosed harness or adapter fault.
  Changes to the guidance or product belong to a separate correction.

## Learnings

None yet.
