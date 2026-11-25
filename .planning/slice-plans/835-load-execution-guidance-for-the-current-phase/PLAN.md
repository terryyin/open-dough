# Load execution guidance for the current phase

**Identity:** SEED-345#load-execution-guidance-for-the-current-phase

**Source:** [Load execution guidance for the current phase](../../seeds/SEED-345-session-token-efficiency.md#load-execution-guidance-for-the-current-phase)

## Goal and scope

Execute Plan coordinators reach the current decision with less guidance and
tool-discovery output while preserving source and authority checks, proof and CI
ownership. Retire the boundary-read budget and its recovery-document split.
Prove ordinary update from a preceding payload in an isolated installation.
Production release and rollout, host adapters, CI runtime, and Cursor worker
startup are outside this plan.

## Current decisions

- Reuse the Execute Plan entry point and its links to the existing
  [targeted retrieval and disposable research](../../../Distribution/src/skills/dough-execute-plan/references/disposable-research.md)
  guidance. One rule governs when context is needed. Keep the step-specific
  contracts in their current homes and link to the relevant passages where they
  apply. The CI guides already name host tools. Reuse the managed completion
  command and the ordinary updater.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  keeps the entry point concise and shared. The first slice owns the 253-line
  `Distribution/src/skills/dough-execute-plan/SKILL.md` reorganization. Remove
  the duplicated boundary schedule and group startup source and authority,
  phase-scoped retrieval, and workflow entry points around the steps that need
  them. Preserve the coordinator routes used by established and ordinary
  starts, quick and planned execution, and later delivery and completion.
  Prove the reachable paths by walking the installed guidance. Keep the resulting
  entry point within the [file-size check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [ADR 0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  put changes in `Distribution/src/skills/` and retire installed copies through
  a tagged update. Use local fixture tags for proof and keep tracked installed
  copies on their released payload.
- The North Star's [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [test boundary direction](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  apply to the Distribution checks. Use the existing native evidence and shell
  and Node runners at their owning boundaries, with no new test-support wrapper.

## Decisive premises and baseline

| Premise | Observation in the consuming route | Remaining observation |
| --- | --- | --- |
| The preceding guidance's budget check constrains the table. Completion recovery and updater cleanup each have independent proof. | At `e1a942212`, `env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` with `read-budget.test.mjs` and the four files named under verification passed in this worktree on Node 24.21.0 and Bash 5. The budget test reads the table and has no separate assertions once the table is removed. The recovery specs exercise managed completion and the Codex replacement stream. | Compare the installed candidate's guidance, including preserving the required passages formerly reached from the table. |
| Ordinary update can retire the actual recovery path while delivering the successor guide. | On 25 November, installed actual `v0.3.113` payload bytes (`3202dbdc9`) with its installer into both roots. A scratch successor combined the directory-format installer and payload from `e1a942212` with the inline recovery and deletion. Its pinned `open-dough-release.sh apply --target <client> --platform codex --checkout <candidate>` exited 0. Both roots reported the old path removed, recorded the fixture version, and matched the new guide bytes. Reusing the predecessor's grouped installer refused the missing path. Scratch files were removed. | Repeat against the final candidate with both the startup and completion changes applied. |
| A native comparison must reach the named-tool decision and first delegation with an inspectable trace. | In the preparation checkout, `codex --version` and `codex exec --help` reported Codex 0.172.0 and the JSON trace route. `claude --version` and `claude --help` reported Claude Code 2.1.332 and the stream JSON route. The active Codex host exposes the named Code Mode tools. The CLI help establishes available entry points. | The authorized native run is the first slice's early probe. It must verify the actual tool surface, plan input, observer and delegation events in the selected profile. |

## Ordered slices

### 1. Load startup guidance through the first delegation

Type: Behavior
Status: planned
Estimate: 12–15 active minutes, excluding instrumented commands.

**Early probe before edits.** Follow the [native source-phase procedure](../../../Distribution/evaluation/guidance-checks.md#redo-the-source-phase-for-an-uncovered-finding).
Pin the pre-change promoted payload in the skill root that each host reads.
Pin the candidate in its own arm after the edit. Use a short planned-work fixture with its own local bare
Git remote, a controlled CI provider and an owned first-slice delegation
boundary. Start in fresh native sessions with equivalent model, effort, host
version, settings, fixture, prompt, and available tools for each matched pair.
Use a Codex profile with the named observer tools and native trace capture.
Start with the normal startup case and reproduce the required decisions,
observer owner and target coordinates, and first delegation. Inspect the actual
tool calls and returned passages. Qualify the Claude Code Bash path with the
same startup outcome. If the actual profile, authorization or trace is
unavailable, stop dependent changes and record the missing observation and
its owner. CLI help or a substitute trace alone leaves this probe open.

**Behavior.** With the plan and named CI tools available, startup reaches the
first delegation with the required context and one applicable observer. When a
tool is absent, search by the missing capability and inspect likely matches.
When an authoritative input remains unavailable, report it and stop the
dependent step. Use the startup and step links in `SKILL.md` as the route.
Walk initial entry, next slice or resume, return/proof acceptance, delivery,
CI notification and finish against the previous table's required links, including
story obligations and freshness where they apply. Keep conditional and
host-specific references at their use sites. Remove the budget table, separate
read requirements, dedicated `read-budget.test.mjs` and any budget-only support
in this change. Leave the recovery-link consolidation to slice 2.

**Proof.** Assess representative native startup traces with the
[skill behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review),
[ADR 0005 — Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
On Codex compare the matched normal starts. In a bounded Codex fixture hide a
named tool while exposing a plausible replacement, and separately remove a
required passage. Observe narrow discovery and a stop before the dependent
operation when the passage cannot be recovered. On Claude Code compare the
shared startup route through its affected Bash surface. Keep the assessor
criteria outside the task prompt. Judge observer ownership, delegation inputs
and the refusal before effort. The named-tool candidate uses no catalog query,
the missing-tool candidate uses a bounded capability query, and neither
candidate loses required text to truncation or reads later-phase guidance
before its trigger. Compare retrieval requests, returned guidance volume,
truncations and rereads through delegation, then use
`node dashboard/server/compareAgentEffort.ts --comparison <request> --json`
for available like-host coordinator and worker usage. Count any rescue effort.
Record the raw trace locations, payload pins and comparisons. If the paired
runs do not establish a gain at equivalent quality, record the result as
inconclusive or revise the guidance within scope. These traces describe the
selected profiles and case. Also run the payload link check, inspect the
moved anchors and search shipped guidance and active checks for budget-only
references.

### 2. Reach managed recovery after an ordinary update

Type: Behavior
Status: planned
Estimate: 7–10 active minutes, excluding the installer and test commands.

**Behavior.** When the owned observer has ended before a completion receipt,
the completion guide leads directly to the managed recovery procedure in that
guide. It retains the same owner, target, accepted SHA and ordinary receipt
contract, including the fresh Codex stream when required. Remove the old
`ci-completion-recovery.md` path and retarget each incoming link. A project
updated from a preceding payload gets the new guide and loses the old path in
both skill roots.

**Proof.** Follow the completion entry to the relocated heading and walk one
ended-observer case against the installed guide. Run both managed recovery specs
to check the real CLI boundary and Codex stream contract, plus the link and
dropped-file checks below. In a disposable Git source put the preceding tagged
payload and the current full candidate installer and payload under adjacent
numeric fixture tags. Install the predecessor into a disposable client before
creating the higher tag. Confirm the old file and guidance are present in both
roots, then run the candidate's pinned
`open-dough-release.sh apply --target <client> --platform codex --checkout <candidate>`
with the recorded source and the ordinary flags. Observe the removal listing,
new version and guide bytes, no obsolete table or incoming link, and the
still-present recovery command in both roots. Verify the local anchor resolves.
Keep historical findings as evidence. The test of the actual file uses the
current payload inventory, which differs from the prior tag's installer.

## Concern evidence

Slice-plan refinement was unnecessary. Startup decisions and the retirement of
their invalidated budget test form one proof loop. The completion guide and its
installed removal form a second independently verifiable loop. The early native
probe bounds profile and baseline availability. No unbounded slice concern
remains.

## Verification and delivery

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Use the [maintained macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  for long local runs from a fully awake machine. Use `caffeinate -s -i` on AC
  power. On battery use `caffeinate -i` with the lid open and inspect the sleep
  log afterwards. Keep default test timeouts.
- Use `env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` from the
  execution checkout with these paths as applicable. Slice 1 uses
  `Distribution/tests/installation/payload-declaration-links.sh`. Slice 2
  uses the same link check plus
  `Distribution/tests/installation/update-removes-dropped-files.sh`,
  `Distribution/tests/skills/dough-execute-plan/execution-completion-recovery.test.mjs`,
  and
  `Distribution/tests/skills/dough-execute-plan/execution-completion-recovery-codex.test.mjs`.
  Apply [MakeMe selection](../../../.agents/skills/dough-makeme/SKILL.md)
  before any test change. The updater fixture and recovery specs cover changed
  guidance paths and preserved command behavior without a broad local suite.
- Use the existing selective commit checks, independent refactoring and
  delivery gates. Hosted CI retains ownership of its usual checks.
