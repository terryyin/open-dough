---
id: SEED-020
status: active
planted: 2026-09-19
planted_during: Execution retrospective of correction 058
trigger_when: Before relying on installed story dependency checks locally
scope: small
---

# SEED-020: Detect missing installed story dependencies locally

## Why This Matters

An Open Dough maintainer saw `tests/story-payload-update.sh` pass locally while
Linux CI caught a missing installed guidance dependency during correction 058.
The bare file-existence assertion relied on `set -e`; macOS's bundled Bash
3.2.57 can continue after a failed `[[ ... ]]` and eventually exit successfully.
The CI failure also omitted the referring file and missing target.

A local reproduction on 2026-09-19 confirmed false `[[ ... ]]` checks followed
by successful commands continue at top level and inside a loop on Bash 3.2.57.
An explicit failure branch exits nonzero. This does not invalidate every local
test: other assertions still enforce their checks, and a final failed command
can itself determine a nonzero exit status. The original suite-wide count was
not a validated scope estimate and is not this story's acceptance inventory.
See DD-059 in `DearDough.md` for the historical incident.

## Alternatives and Decision

On 2026-09-19 Terry confirmed that tests must work with macOS's bundled Bash
3.2 without requiring installation of a newer Bash, and selected a small repair
first. Requiring modern Bash is therefore excluded as the solution. Relying on
CI alone would continue the demonstrated delayed and poorly explained feedback.

Keep this repair first because upcoming scripted-backlog delivery depends on
complete installed guidance. Its bounded feedback improvement justifies a short
interruption before returning to parallel agents and trunk integration; this is
not a prerequisite to all other work and does not authorize a suite overhaul.

## Story Decomposition

<a id="shell-assertions-enforce-and-report"></a>

### 1. Detect and explain missing installed story dependencies on macOS

**Goal:** An Open Dough maintainer detects a missing installed story dependency
before pushing and can identify the referring file and unresolved target from
the failure output.

**Scope:** Repair the existing link-target check in
`tests/story-payload-update.sh`, including only shared behavior necessary for
that check. A failed check must explicitly exit nonzero under Bash 3.2 and
Linux CI's Bash 5, print the referring installed file and missing target, and
propagate failure through the ordinary shell-suite runner. Preserve existing
installation/update checks and their valid-case behavior.

**Constraint:** macOS's bundled Bash 3.2 remains supported; upgrading the
maintainer's Bash is not a prerequisite for this outcome.

**Deferred promises:** Suite-wide assertion conversion or auditing, a general
assertion framework, test-performance changes, installer-manifest redesign, and
native-agent validation. Other assertions retain their current behavior; this
repair does not certify them. No other backlog item or near-future direction
changes as part of this work.

**Key examples:**

1. Installed story guidance references a missing dependency → the existing
   link check exits nonzero and names the referring file and missing target.
2. The same defect is exercised through the ordinary suite runner → the runner
   reports the failed script and exits nonzero, preserving the useful diagnostic.
3. All required links resolve → the existing installation/update scenarios
   still pass on the supported Bash environments.

**Evaluation:** Use a deliberately broken dependency in a disposable fixture to
observe the actual checker and suite-runner result; an isolated helper failure
or a substitute script that simply exits nonzero is insufficient. Retain a
passing valid-payload case. Distinguish local Bash 3.2 proof from Bash 5 proof;
CI setup alone does not establish a passing CI result.

**Sizing:** One coherent behavior and focused proof loop. No suite-wide file
count or formal effort band is needed to justify the user-authorized quick path.

**Depends on:** none.

**Safe stopping point:** The demonstrated installed-link defect is detected
locally with actionable output, even if broader assertion work is never taken.

## Open Decisions

None for this bounded story. Terry authorized direct execution if it fits one
small story; otherwise write a slice plan. No separate execution plan is needed
for the selected single behavior.
