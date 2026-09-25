# Start execution with useful, compact information

## Source

**Identity:** SEED-008#useful-startup-output

[Refined story and bounded evaluation](../../seeds/SEED-008-worktree-branch-trunk-sync.md#useful-startup-output),
[ODF-099](../../../docs/maintainer/finding-names.md#odf-099).
First queued story. This preparation authorizes neither Take nor implementation.

## Goal and scope

The coordinating agent can continue or recover a queued start from a small
immediate result, without filtering routine Git inventories or fetching a
second receipt just to discover its accepted claim revision. Retain truthful
publication/ownership and independently report checkout maintenance. Use
existing Git inspection for diagnostics when they become useful.

Cover successful and resumed starts in both existing execution modes, actionable
refusal/uncertainty, dirty/default-checkout preservation, and the guidance and
current consumers of the changed response. Do not introduce a receipt archive,
new diagnostics command, generalized output framework, telemetry, new host
adapter, dashboard work, or redesign of unrelated command receipts. Release
versioning and installation into this repository remain separate work.

## Decisions and evidence

Survey base: `5f9ed8734563e94ec3245226e24e6beb2ee15a2d`.
The seed's three actual success receipts were 227,148–236,119 bytes. All three
agents filtered them once and later used the exact published SHA as the first
delivery base. Index-only removal projected 1,070–1,144 bytes; a smaller
illustrative subset projected 195–197 bytes. These are retained-data projections,
not measured new behavior, host token usage, or a promised maximum response size.
The refusal sample supports an immediate error reason. Recovery necessity is
supported by source and existing deterministic cases, not a measured frequency.

**PFE decision: change the existing owners.** Startup already has one orchestration
owner (`execution-start-operation.mjs`), accepted receipt assembly
(`execution-start-receipt.mjs`), recovery context (`execution-start-recovery.mjs`),
and CLI/exit-status boundary (`execution-start.mjs`). Reuse them. The shared
`refreshDefaultCheckout` owns local safety decisions; `publication-git.mjs`
collects its state. Its inspected runtime users consume head/status plus Git
ancestry/operation checks, not full index or patch strings. Reduce unnecessary
production capture at that owner, accounting for its callers. Keep full
preservation snapshots in `publication-test-fixtures.mjs`: that independent test
helper serves a different purpose and must not be weakened with production output.

Managed increment delivery already accepts `previouslyPublishedBase`, and
closure publication already uses maintenance outcomes. Neither owns a reusable
startup-receipt archive or retrieval service. Use their existing contracts;
adding a second store just to save a few recovery identifiers is unjustified.

**Information contract:**

- Keep `ok` and existing outcome meanings (`published`, `resumed`, and refusal
  statuses), the accepted `publishedSha`, exact `startingRevision` and
  `candidateSha`, and assigned agent when one exists. Preserve the two SHA field
  names used by `resumeArgs` and the taught resume flags even when candidate and
  published SHAs match: that small duplication avoids an unnecessary recovery
  translation rule. A legacy claim with no agent does not invent one.
- Report compact maintenance result/reason independently of publication. Preserve
  any distinct still-actionable earlier maintenance issue; do not dump before/after
  inventories. Include the affected checkout or resolved location when the caller
  cannot unambiguously identify it from the invocation. Authorship not configured
  remains an explicit exception; ordinary configured success need not be echoed.
- Reuse unchanged mode, identity, publisher, workspace, branch, remote, and supplied
  plan from invocation context. Return actually resolved differences, including a
  discovered plan when not supplied. Teach setup once instead of using constant
  receipt flags. Removing a setup flag must not remove setup-before-implementation.
- Refusal and uncertainty keep their exit status, actionable reason, and exact
  available recovery coordinates/resources. Preserve the existing recovery input
  contract and accept retained fields from older receipts; do not rerun startup to
  obtain diagnostics or infer acceptance from an advanced remote tip.
- Omit routine `index`, `staged`, and `unstaged` contents and full status listings
  from agent output. Derive decisions before projection. No broad recursive
  truncation of recovery/error facts and no new log-store lifecycle. Retain only
  diagnostic detail that explains an action; existing inspection is current state,
  not a reconstruction of discarded historical snapshots.

Retain the existing programmatic meanings callers need; update repository-owned
assertions/harnesses when presentation fields change. No external arbitrary JSON
field compatibility promise was found; do not keep obsolete output solely for a
fixture. Recheck callers at implementation time before removing fields.

**Architecture and guidance:** The ADR index and record statuses agree: 0000–0006
are Accepted and 0007–0009 remain Proposed. Relevant constraints are
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one coherent responsibility and low coordination cost),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source/release ownership),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(behavior proof versus native acceptance/reuse), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one runtime-facing instruction home). Follow [AGENTS.md](../../../AGENTS.md).
The [North Star](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership)
keeps publication, ownership, refresh, and CI evidence separate. This work fits
that structure; no new direction topic or ADR exception is needed.

## Slice 1 — Continue and recover from a compact startup result

**Type:** Behavior
**Status:** planned

**Behavior:** Given a prepared queued item and an authorized start, the command
returns only the information required by the selected contract. The coordinator
can set up its known workspace and deliver its first increment using the returned
accepted revision, or stop/recover correctly from an exceptional result. Receipt
size does not grow with unrelated tracked-file inventory or dirty patch contents;
owned/remote Git state and local edits remain correct.

**Implementation and proof:**

1. Extend the existing real startup CLI/local bare-remote fixtures. Before changing
   output, record a controlled small-versus-large tracked-inventory baseline and a
   dirty checkout with substantial staged/unstaged content. Capture stdout bytes
   and commands, not token estimates; do not execute startup against the real
   project for this experiment. Keep the Git state needed for independent assertions.
2. Apply the information contract through the existing startup/maintenance owners.
   Align success, refused, and uncertain paths together so a hidden error path
   cannot leak the same snapshots. If production capture shrinks, check all its
   production callers: startup maintenance, publication/resume inspection,
   current-branch delivery, closure publication, and Dough Land's refresh fixture.
   Preserve useful head/status/result facts those callers actually consume.
3. Extend one outside-in success journey through the first real delivery boundary:
   start via the CLI, perform the existing setup readiness gate, make one valid
   fixture increment, and supply its returned `publishedSha` to managed delivery
   as the base. Observe remote acceptance at the exact revision. Do not let a
   fixture inject the published SHA or let a projection-only test stand in for use.
4. Adapt existing recovery/race and maintenance cases in the same change. Exercise
   retained older receipt inputs as well as the new result, a remote descendant,
   lost response/uncertain acceptance, rewritten candidate after contention, and
   refused source/ownership. Assert no duplicate Take/push and preservation of
   local edits using independent test snapshots. Existing authored-agent and
   no-agent resume cases continue to establish identity truth.
5. Revise `src/skills/dough-execute-plan/SKILL.md` and linked startup/recovery
   guidance where the old exact-receipt rule is taught. Retain the compact outcome,
   publication/recovery coordinates and known invocation context. Explain when to
   inspect diagnostics without teaching agents to print another full dump or repeat
   a mutating command. Author source only; do not edit installed managed copies.
   Walk the representative invocation, continuation, refusal, and missing-context
   behavior under AGENTS.md. Align test assessors with semantics, not exact prose.
6. Compare baseline and candidate across normal start through first delivery and
   refusal/recovery. Count bytes across all relevant tool results and additional
   retrieval calls. Require no receipt-filtering read on ordinary continuation,
   exact necessary facts preserved, and no output growth proportional to file
   inventory or patch volume. Treat the seed's approximately 200-byte projection
   as context only, not a universal ceiling or permission to truncate errors.
7. Apply slice-local post-change refactoring, required formatting/lint and relevant
   automated checks. Record evidence, candidate and remaining native requirements
   before delivery. At wrap-up, update ODF-099 with actual response/implementation
   commit; record the first containing release only when established.

**Proof ownership (all final promises belong to Slice 1):**

| Promise / preserved behavior | Boundary and decisive observation |
| --- | --- |
| Useful success without extra receipt fetch | Extend `workspace-publication.test.mjs` (claim cases) and existing managed-delivery fixture into the CLI → setup → first-delivery journey; returned SHA is actually consumed and accepted remotely |
| Unrelated inventory/patches do not fill context | Same CLI fixture with growing inventory and dirty patches; compare full stdout and necessary follow-up outputs, inspect no snapshot payload, and keep independent before/after preservation assertions |
| Publication accepted despite deferred/stopped refresh | Startup maintenance/source cases; accepted remote claim plus compact reason, unchanged pending edits/index/locks or divergent checkout |
| Recover exact owned claim when trunk moves or response is uncertain | `workspace-publication-startup-recovery.test.mjs` and race/agent-resume cases; retained coordinates drive actual resume, original claim remains contained, no duplicate publication, updated candidate survives replay |
| Refusal and new/resolved identity information remain actionable | Existing source/claim/agent cases through CLI exit status and response, including legacy no-agent and authorship exception; no fabricated accepted result |
| Shared maintenance callers retain their purposes | `publication-checkout-maintenance.test.mjs`, `publication-resume.test.mjs`, `current-branch-publication.test.mjs`, closure refresh tests and Dough Land tests if shared capture changes; head/result semantics and local preservation remain proved |
| Guidance and installed CLI still compose | Shared payload and native-runner checks plus representative behavior review; native evidence selection below accounts for changed receipt consumption per host |

**Focused commands** (repository root; extend the named fixtures rather than
adding a second startup harness):

```sh
node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs
node --test src/skills/dough-execute-plan/scripts/publication-checkout-maintenance.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/current-branch-publication.test.mjs src/skills/dough-story-wrap-up/scripts/closure-publication*.test.mjs src/skills/dough-story-refinement/scripts/dough-land*.test.mjs
bash tests/workspace-publication-callers.sh
bash tests/execution-payload-update.sh
bash tests/git-publication-native.sh
npm run lint
```

Run the second group when production capture/maintenance changes reach those
callers; it is expected for the selected solution. The credential-free native
command validates runner/assessor behavior, not native host acceptance. Run the
normal CI-required `npm test` with Bash 4+ when delivering; no dashboard-specific
redesign or extra dashboard benchmark is needed. Add any new focused journey
file to the maintained test runner if the existing discovery does not include it.

**Native evidence boundary:** Existing installed-startup acceptance in the seed
covers the startup mechanism, not the reduced response. Reuse unaffected install,
ownership, and refusal evidence only after assessing equivalence. For each host,
review whether its consumer still receives and uses the required facts. Reuse
`tests/git-publication-native.sh --native HOST --case publication/startup-story-branch`
for any needed fresh continuation check, and `publication/startup-resume` for
invalidated resume evidence. The current assessor checks Git/setup facts but not
receipt size or a first delivery; extend its missing observation before claiming
that proof, and keep size/first-delivery assertions at the deterministic CLI journey
when that is sufficient. Select a fresh Claude observation of compact output and
continuation because the empirical problem was host spilling; record each other
host's fresh result or justified reuse, never infer success from Claude alone.
Do not run every scenario on every tool or repeat discovery/installation without
an invalidated requirement. Under ADR 0005, missing native proof stays a linked
acceptance obligation before release; functional implementation may finish with
that obligation explicit, not with a fabricated pass. Do not silently create or
queue another story without the corresponding authority.

**Sizing and safe stop:** One cohesive startup information contract, with success
and exceptional paths as its variations. No numeric target or hard limit was
supplied. The code already has receipt and recovery owners and real process
fixtures; no preparatory Structure slice is justified. Keep contract, consumers,
and proof green together. A standalone snapshot-removal slice would be useful
but would repeat the same contract/caller review before the remaining scalar
reduction; a documentation-only or recovery-only split would leave incomplete
consumption semantics. Prefer one slice. If execution exposes a separate claim
ownership defect, new persistence need, or unrelated publication redesign, retain
the evidence and reassess the story rather than growing this slice silently.

## Preparation review and learnings

Refinement is complete: no unresolved beneficiary, scope, information-value, or
recovery decision blocks this plan. Exact presentation is an implementation
choice constrained by the information contract; the retained SHA names resolve
the known recovery compatibility question. No production-byte ceiling is invented.

Boundary review: retain one Behavior slice. All final-state promises have proof
owners; success and exception tests are variations of the same contract and can
be green at the first delivery. No remaining slice-specific concern was found
in this review, so no separate plan-refinement rewrite was necessary. This is a
preparation judgment, not a claim that implementation/native checks already pass.
