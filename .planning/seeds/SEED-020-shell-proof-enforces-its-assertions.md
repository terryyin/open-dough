---
id: SEED-020
status: active
planted: 2026-09-19
planted_during: Execution retrospective of correction 058
trigger_when: Before relying on a local shell-suite run as evidence
scope: small
---

# SEED-020: Shell proof that enforces its assertions on every maintainer's shell

## Why This Matters

Open Dough maintainers run `npm test` locally before pushing, and this
repository's proof is mostly shell: 48 test scripts under `tests/`, all using
`set -e` so that a failed check stops the script.

On bash 3.2.57, the system bash that ships with macOS, a failing `[[ ... ]]`
does not trigger `set -e` at all. This was verified directly during the
retrospective of correction 058: `false`, `[ ]`, `test`, and `grep -q` each
abort the script as expected in that shell, while `[[ ]]` alone continues, in a
`while` body, in a `for` body, in an `if` body, and at top level. The same
assertions abort correctly on the Linux runner's bash 5.

A survey of this repository found **128 bare `[[ ... ]]` assertion lines across
27 shell test files**. Every one of them is therefore inert for a maintainer on
macOS and enforcing only in CI. A local green run of the shell suite is not
evidence that those assertions hold.

These assertions are not redundant and must not be removed: they are
load-bearing in CI. One of them — the link-resolution check in
`tests/story-payload-update.sh` — is what caught a real defect during correction
058, where a new payload file was linked from installed guidance without being
declared in the installer manifest. That defect reached CI precisely because the
assertion that owns it said nothing locally.

A second, compounding problem: because the failing command is a bare test, the
script aborts with no message. CI run 35357372158 reported only
`FAIL: tests/story-payload-update.sh` with no indication of which link, which
file, or which expectation failed. Classifying it needed the branch's run
history and a manual manifest inspection rather than the log.

Recorded as DD-059 in `DearDough.md`, with its first occurrence and the
corrected, broader characterization.

## Alternatives and Decision

**Recommended direction:** make each assertion report and fail on its own, so it
enforces identically under bash 3.2 and bash 5 and names what it observed. The
smallest shape that achieves both is an explicit failure branch, for example
`[[ -f "${path}" ]] || { printf 'FAIL: %s\n' "${detail}" >&2; exit 1; }`, or a
shared assertion helper in `tests/helpers/` that the scripts call.

**Strongest simpler alternative:** require a modern bash and re-exec the suite
under it, leaving the assertions as they are. This is one change rather than
many, but it makes the proof depend on an environment precondition rather than
on the tests being correct, leaves every assertion still silent about what it
checked, and gives a maintainer whose shell is older no signal at all. Prefer it
only if the enforcement change proves impractical at this scale.

**Assumptions:** macOS with system bash remains a supported maintainer
environment; CI continues to run Linux bash 5; no test currently relies on a
failing `[[ ]]` being ignored.

## Story Decomposition

<a id="shell-assertions-enforce-and-report"></a>

### 1. Shell assertions enforce and report on every supported shell

- **For / why:** For an Open Dough maintainer, so a green local shell-suite run
  is real evidence and a red one says what failed.
- **Evaluation:** With the change in place on macOS's bash 3.2, deliberately
  falsifying a representative assertion in each affected file makes that script
  exit nonzero and print what it expected — today it exits 0 and prints nothing.
  The unmodified suite still passes on both bash 3.2 and CI's bash 5, with no
  assertion removed and no coverage lost. `tests/story-payload-update.sh`, whose
  inert assertion let the correction-058 payload defect through, is the
  representative case.
- **Value / learning:** Restores local proof for 128 assertions and reveals
  whether any of them has been silently false while only CI enforced it.
- **Effort hypothesis:** M — 27 files, mechanical per site, but the count is
  large and each file needs its failure message to say something useful.
  Confidence moderate; the survey is exact, the per-file message work is not.
- **Depends on:** none.
- **Safe stopping point:** Converting the assertions in a subset of files is
  independently valuable — each converted file gains real local enforcement, and
  the rest keep their current CI-only behavior. Nothing regresses part-way.

## Ordering and Scope Reduction

One story. If it is reduced, convert `tests/story-payload-update.sh` and the
other installer-payload tests first: those are the ones that guard the
completeness of the released payload under
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md), and
the one demonstrated escape came from that group.

## Open Decisions

Whether to fix the assertions in place or introduce a shared assertion helper in
`tests/helpers/` is an implementation choice for refinement, not a story
selection question.

## When to Surface

Now. Until this is resolved, no local run of this repository's shell suite is
evidence for any work, including work already in flight.
