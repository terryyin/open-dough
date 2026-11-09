# Decide cohesive reorganization before editing an oversized file

**Identity:** SEED-010#plan-cohesive-reorganization-of-oversized-files

**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#plan-cohesive-reorganization-of-oversized-files)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

For a developer whose slice touches an already-oversized file, settle its
cohesive reorganization before implementation and carry that decision through
delegation and independent refactoring. Include comment-only edits. Preserve
the 250-line check, stable external behavior and human ownership of exceptions
and architectural conflicts. A missed decision still stops the affected path.

One guidance behavior and proof loop. No repository-wide cleanup, size scanner,
new/near-limit-file policy, executable-plan size policy (ODF-362), release or
rollout. Record a verified containing release when known; otherwise retain that
field as pending. Representative review establishes delivered guidance, not
native adherence or measured improvement.

## Story obligations

### E1. No repository-wide cleanup
Reported: slice 1 — "No repository-wide cleanup"
Story clause: "No repository-wide cleanup"
Disposition: excluded "No repository-wide cleanup"
Commitment: 19

### E2. No new size scanner
Reported: slice 1 — "No new size scanner"
Story clause: "new size scanner"
Disposition: excluded "new size scanner"
Commitment: 20

### E3. No relaxed limit
Reported: slice 1 — "No relaxed limit"
Story clause: "relaxed limit"
Disposition: excluded "relaxed limit"
Commitment: 21

### E4. No executable-plan size policy
Reported: slice 1 — "No executable-plan size policy (ODF-362)"
Story clause: "executable-plan size policy (ODF-362)"
Disposition: excluded "executable-plan size policy (ODF-362)"
Commitment: 22

### E5. No general policy for new/near-limit files
Reported: slice 1 — "No general policy for new/near-limit files"
Story clause: "or general policy for new/near-limit files"
Disposition: excluded "or general policy for new/near-limit files"
Commitment: 23

### E6. Release and rollout remain separate
Reported: slice 1 — "Release and rollout remain separate work"
Story clause: "Release and rollout remain separate work."
Disposition: excluded "Release and rollout remain separate work."
Commitment: 24

## Existing solutions and architecture

PFE: change existing owners rather than add a parallel size policy:

- `src/skills/dough-post-change-refactor/references/refactor-checks.md#file-size`
  owns the 250-line check and cohesive seams. Keep that numerical rule here.
- `src/skills/dough-slice-planning/references/architectural-thinking.md` owns
  PFE and necessary current Structure. Its existing mandatory routing from
  slice planning can carry the early decision; no new planning stage is needed.
- `src/skills/dough-execute-plan/references/delegation.md` owns the fresh-agent
  brief, including current premises and project constraints. Carry the decision
  here, including an authorized quick task's brief without fabricating a plan.
- `src/skills/dough-post-change-refactor/SKILL.md` owns candidate discovery,
  cross-subsystem authority and the decision-stop return. Reuse those paths for
  missing or contradicted decisions; planning does not waive the final check.

The existing ODF-074/150 earlier-evidence companions separate current finding
and response from retained history. Reuse that layout for this story's own
oversized edit, rather than compressing evidence or splitting arbitrary lines:

| Expected oversized edit | Current state and cohesive decision | Owner / preservation proof |
| --- | --- | --- |
| `docs/maintainer/findings/ODF-152.md` | 252 lines. Keep finding identity, current response and latest 2026-11-10 cause at the existing home. Move complete earlier retained source evidence to `ODF-152-earlier-evidence.md`, linked from that home, before adding the response. | Slice 1. Preserve all evidence, provenance, former codes, links and incoming anchors, including `odf-189` at the original path. Reconstruct moved evidence byte-for-byte and check relative destinations. Scratch layout yielded 35/221 lines before forwarding anchors. |

The size-check reference is 133 lines, architectural thinking 114, delegation
230, refactor entry 143 and source slice-planning entry 217. Check proposed edits before
delegation and return new evidence rather than assuming this inventory is closed.
The native acceptance seed is 245 lines: add a short link to a focused companion
in its existing `SEED-053-native-guidance-acceptance/` directory rather than
appending a new case matrix to its root.

Relevant Accepted decisions, checked against [the ADR index](../../../docs/adrs/README.md):
[0002 — Lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one conceptual representation, PFE, cohesive current work),
[0003 — Release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(edit `src/skills/`; installed copies change only through released updates),
[0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(representative behavior review, separate native acceptance),
[0006 — Executing-agent guidance](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one authoritative rule and project-resolved context), and
[0010 — Improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(delivery differs from observed benefit). No conflict found.
[NORTH-STAR.md](../../NORTH-STAR.md) covers dashboard concerns; existing direction
supports this guidance change without a new topic or ADR.

## Outside-in proof ownership

| Source promise | Owner | Observable proof |
| --- | --- | --- |
| Plan 552's comment-only case is decided before implementation (example 1) | 1 | Walk revised guidance with plan 552's historical inputs, using retained ODF-152 evidence and `625936070`'s reorganization: the resulting plan and brief identify affected files, cohesive responsibilities, owning work and preserved behavior before comments are edited. The original handoff did not make this early decision. A generic instruction to stay under 250 or an exception request after implementation fails the review. Do not rerun historical dashboard suites. |
| A small oversized edit has a complete decision and no surprise size stop (example 2) | 1 | Use ODF-152's response update in this slice: inspect the pre-edit decision above, implementation brief, current/history separation, preserved evidence and final refactor return. The brief names the existing rule, current size and owning slice. Check an authorized quick-brief variant needs no fabricated plan. |
| Human-owned decisions remain scoped (example 3) | 1 | Walk an unapproved cross-subsystem/ADR conflict and a scoped human exception: affected implementation waits, the stop cites conflict and required decision, and unrelated work is preserved. A plan mention or historical allowance alone cannot pass. |
| New evidence or incomplete work still stops (example 4) | 1 | Walk a newly discovered oversized file and an undelivered planned reorganization: identify file, current size, missing/contradicted decision, affected work and existing reassessment route; withhold refactor-complete. Contrast with fulfilled planned reorganization, which completes without another exception question. |
| Shared rule stays reachable and retains current contracts | 1 | AGENTS.md invocation/context/useful-result review plus the focused routing/read-budget/payload checks below. These prove navigation and contracts, not host behavior. |
| Response, release state and evaluation basis are retained | 1 | ODF-152 records the delivered response and verified containing release or explicitly pending release; ODF-189/195/207 link its relevance without duplicate occurrence counts or resolving the findings. Native acceptance requirements remain pending in their linked home. |

## Slices

### 1. Carry the reorganization decision from planning through refactoring

Type: Behavior
Status: done
Proof: all ownership rows above and the focused checks below; record the
representative review's observations and limits in Learnings.

Precondition: expected implementation edits include a file already over the
existing size limit, even for a small or comment-only change.
Trigger: planning selects the work and the coordinator prepares its brief.
Result: the file's current size, cohesive responsibilities/seams, owning slice,
affected callers and preserved proof, or the developer's precisely scoped
decision, reach the implementer before editing. Refactoring checks the result;
new evidence or an unmet decision uses the existing stop rather than silently
waiving the check or presenting a mechanical split as the design.

Extend architectural thinking with the early assessment and decision, linking
the existing size check. Assign necessary reorganization within the enabled
Behavior or immediately preceding Structure; use existing sizing/replanning and
human conflict paths when it cannot fit. Keep the expected-edit scope rather
than introducing a repository-wide inventory. Pass that decision in delegation,
requiring newly discovered oversized edits to return before dependent work.
Align the refactor entry/check and stop handoff with that same decision; do not
duplicate its numerical rule or grant new exception authority.

Implement the ODF-152 current/history separation above as part of recording
this response. Preserve evidence without dropping proof or compressing prose
solely to meet a threshold. Trace moved references and consumers, including
unchanged Markdown readers and delegation/premise assertions. Keep the runtime
audience in the executing project; ODF numbers, this replay and maintainer cost
analysis belong in records, not published runtime instructions.

Walk positive and stopped examples against the actual revised entry points.
Do not build new prose-matching tests that merely repeat the new instructions.
Update existing navigation assertions only if their actual contracts change.
Any automated domain setup uses the shared MakeMe API under AGENTS.md.

Record the response at [ODF-152](../../../docs/maintainer/findings/ODF-152.md)
and its relevance at [ODF-189](../../../docs/maintainer/findings/ODF-189.md),
[ODF-195](../../../docs/maintainer/findings/ODF-195.md) and
[ODF-207](../../../docs/maintainer/findings/ODF-207.md).
For the next ordinary small edit on a verified containing release, retain host,
release, pre-edit size, the plan/brief decision time and seams, implementation
and refactor outcomes, extra redesign/proof and human interruptions. Compare
with plan 552's late discovery and reported rework. Keep the response when the
decision precedes implementation, the design preserves behavior and refactoring
introduces no surprise size decision for that file; disclose extra preparation
costs. Missing exposure leaves improvement unknown; promise no token saving.

Add the changed planning/delegation/refactor requirements and representative
cases to a focused companion under
`../../seeds/SEED-053-native-guidance-acceptance/`, linked from the
[local-preparation acceptance home](../../seeds/SEED-053-native-guidance-acceptance.md#guarded-local-delivery-prerequisites).
Keep Codex, Cursor and Claude Code evidence individually pending. Reuse only
matching unaffected integration proof; static walks do not establish native
adherence. Native runs remain explicitly invoked work before an affected release
or under an explicit human-owned release exception. This slice runs none.

## Verification and delivery

Follow [AGENTS.md behavior review](../../../AGENTS.md#behavior-review) and
[runtime audience](../../../AGENTS.md#runtime-audience): invocation context,
required project context, and useful result through the examples above. After
edits and independent refactoring, run with Homebrew Bash 5 first on PATH:

```sh
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh \
  src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs \
  src/skills/dough-slice-planning/scripts/settle-decisive-premises-guidance.test.mjs \
  tests/payload-declaration-links.sh
```

The checks observe host read ceilings and navigation, the existing premise
handoff contract in the changed brief, and declared runtime link dependencies.
Use the execution workflow's consumer-trace record to add any affected proof
the actual edit exposes. Preserve moved historical evidence and link destinations
as above. No executable API, installer behavior or dashboard change is planned,
so no local full repository/dashboard suite is required for this guidance/record
change. Required CI remains owned through its applicable final result.

Local gate: start fully awake; on AC guard long runs with `caffeinate -s -i`;
on battery use `caffeinate -i` with the lid open and read the sleep log, under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation brief and repair handoff. Use selective
formatting, check-only lint at commit, independent post-change refactoring and
the execution workflow's existing delivery/CI gates.

## Decisive premises

Observed 2026-11-10 in this owned preparation checkout at
`4ecb1df8b0728181692edafb05d2dad6ef9ab47d`. Scratch edits were restored before
record writes; `git diff --exit-code -- docs/maintainer/findings src/skills`
confirmed no product/evidence changes remained.

| Premise and consuming operation | Observation and result | Unverified remainder |
| --- | --- | --- |
| The reported surprise is a real unresolved decision in the current journey | `git show 220026a4e1b8409ffa81f50cd8e3130945ff8472:DearDough.md` (DD-478) and `git show --stat 625936070` record comment-only edits, the stop, Terry's rejection and later design-led changes, retained in ODF-152. Read-through of current planning → brief → refactor reaches the unconditional size check without an earlier file decision. ODF-189/195/207 retain related, distinct causes. | A new walkthrough proves useful instructions, not future host adherence or lower cost. Native/ordinary-use observation is separately owned above. |
| A compact decision handoff fits the actual navigation/profile | Scratch added a linked size/decision bullet in the real delegation list and a planning subsection linking the existing check, in this checkout. The literal focused command above exited 0 for all three checks, including real boundary read budgets and payload links; original bytes then restored. Existing assertions were inspected for their routing/premise scope, not credited as semantic proof of the new behavior. | Final wording must pass the same checks and representative review. |
| This slice's oversized response record has a lossless cohesive seam | Owned-checkout `python3 -` replay over `docs/maintainer/findings/ODF-152.md`: split at its first retained-evidence heading and latest 2026-11-10 heading, write the complete intervening history to an earlier-evidence companion, and assert recombination equals original bytes. Result passed, yielding 35/221 lines before forwarding anchors. Existing ODF-074/150 companions supply the same current/history ownership. Originals restored. | Final response text, moved relative links and original-path subsection anchors require final preservation review. |

## Current decisions and concern review

- One Behavior slice owns the complete decision journey, its representative proof
  and response records. Separating planning from handoff/refactor leaves the
  reported surprise unresolved; no independent preparatory Structure is needed.
- No supplied numeric slice time target or hard limit is invented. Sizing is
  bounded by one guidance outcome and proof loop; use existing escalation if
  execution exposes greater work. ODF-152's reorganization is included now.
- Default Story Branch execution is sufficient; no trunk-only release step or
  human checkpoint is part of this correction. No Take or execution is granted.
- Slice-plan refinement was not needed: cumulative design reuses one decision,
  one size rule and existing stop paths; no fragmented or independent outcomes.
- No remaining slice-specific blocking concern identified. Pending native and
  ordinary-use observations bound later claims and release, not this guidance
  implementation's functional completion.

## Learnings

- ODF-152 itself was the ordinary oversized edit; current/history split belongs
  in this slice, not a surprise post-implementation refactor.
- Representative walk of revised planning/delegation/refactor entry points
  covers examples 1–4; native host adherence and ordinary-use cost remain
  pending (SEED-053 companion; ODF-152 release field).
- Focused proof passed (`read-budget-guidance`, `settle-decisive-premises`,
  `payload-declaration-links`). Consumer-trace: those three run; entry/finding
  readers reused; installed copies and incidental matches excluded.
- Refactor: `## REFACTOR COMPLETE` — already clean; ODF-152 decision fulfilled;
  all changed files ≤250.

## Execution complete

Product advice: no change. Delivered guidance matches the selected story;
pending native acceptance and ordinary-use observation remain separately owned
and do not create a new product recommendation here. Process review found no
supported new finding to record.
