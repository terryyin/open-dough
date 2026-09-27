---
id: SEED-028
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: Authorized product work would start outside the product backlog
scope: unknown
---

# SEED-028: Make ad hoc work visible in the product backlog

## Why This Matters

Developers cannot coordinate product work they cannot see. Bug fixing and test
optimization can start from a direct request without appearing alongside queued
stories. The problem is the missing admission into shared work tracking, rather
than a distinct kind of execution or completion.

## Alternatives and Direction

For developers coordinating concurrent product work, independently accepted work
that currently bypasses the queue should become visible with ordinary story
ownership and closure, while an explicit `--one-shot` option keeps genuinely
trivial work proportionate.

Doing nothing retains the visibility gap. Manually assembling a seed, claim and
profile with existing tools is the strongest smaller alternative, but leaves
each entry workflow responsible for remembering and publishing a consistent
claim. A rule to "remember the backlog" alone does not establish that boundary.
Use shared admission and the ordinary lifecycle, with one explicit exception for
one-shot work. These alternatives are the decomposition's rationale, not claims
that a manual experiment has already been performed.

The first story tests whether minimal story admission makes real emergent work
visible without forcing a plan. The second tests whether the trivial-work
exception can remain cheap without hiding work that grows. Research and necessary
cross-layer changes belong within these outcomes, not in separate infrastructure,
dashboard or research stories.

## Story Decomposition

<a id="one-shot-work"></a>

### 2. Complete trivial work with --one-shot and track it if it grows

**Identity:** SEED-028#one-shot-work
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/112-one-shot-work/PLAN.md","assessment":"not-ready","reasons":["Shared admission is still Taken; inspect its delivered retained-work continuation interface and bind the escalation proof before execution."],"basis":{"document":"ce36d6d44c965d602d1479d6b3a251eb381a26521a087deb082b1691dd0433de","plan":"59863aaa03a9ac8413cd14e3804953ddb5b6beb6d2ea652fdb075e8891b57d5f"}}
```

**Goal:** Developers can explicitly request a genuinely trivial change without
publishing a Taken claim, while work that grows becomes visible through ordinary
story admission before further execution.

**Scope:** Provide `--one-shot` as an explicit option at the applicable work-entry
workflows, using one shared meaning. Attempt one coherent, verifiable result and
publish that result to remote main with ordinary reconciliation and verification.
Successful one-shot work leaves no Taken claim history or temporary seed, plan
or assignment for that attempt. For a queued story, its result commit also removes
the entry and spent source/plan while preserving unfinished siblings. Its result
commit and enduring product changes remain. This is distinct from planless execution and is not another
branching mode.

When the attempt proves too large or uncertain to finish coherently in one go,
preserve attributable edits and proof, create or reuse its canonical story, and
publish ordinary Taken admission before continuing. Use the first story's
publication, refresh, ownership and closure behavior. Do not first publish an
incomplete result merely to maintain the one-shot label. No forced reset or
reversion of unrelated work is allowed.

Delivering to main does not require modifying the shared default checkout.
Use the ordinary safe workspace and remote-publication contract; attempt safe
local refresh after successful publication. The option does not bypass tests,
required review, publication authority or unresolved architectural decisions.

**Evaluation / key examples:**

- An explicit `--one-shot` request yields one complete, verified small change:
  remote main contains the result and no Taken announcement or spent planning
  artifact was published for the attempt.
- Investigation reveals a larger change or additional coordinated steps:
  publish the ordinary story and Taken claim before continuing, keeping valid
  work and evidence rather than restarting or creating duplicate identities.
- An ordinary Taken story is planless: it stays tracked. `--one-shot` does not
  erase existing claims or their history, and completing quickly alone does not
  silently select the option.

**Depends on:** delivered [shared admission](../../src/skills/dough-execute-plan/references/admit-accepted-work.md)
for safe escalation into ordinary admission. Existing workspace/publication
contracts apply; exclusive access to the default checkout is not required when
an owned workspace can publish safely.

**Safe stopping point:** Trivial requests can finish without tracking ceremony,
and every oversized attempt has an honest tracked continuation. No further
story or completed-work archive is needed.

**Effort hypothesis:** Smaller than shared admission, but with meaningful recovery
and escalation risk; low confidence until eligibility and applicable entry
workflows are refined. S/M/L remains unset because project bands are undefined.

#### One coherent attempt

Use `--one-shot` explicitly for an independently requested outcome that the agent
can reasonably complete and verify in one bounded attempt. Keep its meaning shared
across direct contextual work and the mission entry workflows covered by admission
(bug work, optimization, observation and reviews), rather than adding a per-skill
meaning. The option selects tracking behavior; ordinary task authority, validation,
workspace ownership and remote publication still apply.

Eligibility rule: understood outcome and expected result, no known need
for a multi-slice plan or unresolved product/architecture choice, and a credible
focused verification path. No universal time, file-count or lines-changed threshold
is proposed. Brief diagnosis and a normal test/fix loop can belong to one coherent
attempt. Repeated failure to converge, discovery of separate outcomes or need for
substantial investigation is evidence to leave the one-shot path. Existing
project-specific limits still apply.

A supported no-change finding can complete the request without manufacturing an
empty commit. Successful changed work publishes its complete result and performs
normal verification/CI and resource-cleanup obligations. No plan, completion note,
assignment or claim is manufactured solely to satisfy a workflow. A transport
failure or delayed CI verdict alone is publication/verification recovery, not
proof the product task has become larger. Preserve the owned result and recover
publication without duplicating it; report completion only on actual evidence.

Existing Taken work retains its identity, owner and lifecycle. The flag must not
remove another agent's claim or rewrite published history. A branch flag cannot
silently redirect a successful one-shot result away from the authorized trunk;
contradictory explicit delivery instructions need resolution before work starts.
Default to the existing safe owned-workspace mechanism; do not add a direct-main
editing prerequisite or a new workspace manager.

#### Existing solutions and the remaining gap

`dough-execute-plan` already supports contextual planless execution, focused proof,
ordinary publication, completion/CI handling and wrap-up. Its oversized-slice
procedure preserves compatible work and proof, but currently treats replanning
permission independently and can continue without a canonical story. One-shot
escalation must converge on the admission story's ordinary canonical home and
claim instead of creating another continuation mechanism.

The current shared admission work is Taken, not delivered. Its published plan
owns atomic story/claim publication and ordinary continuation; this story owns
the transition from an already-started unclaimed attempt, including preserved
edits and proof. Inspect the delivered admission boundary before implementation;
do not invent its API or duplicate it while it is still being built.

The current contextual path creates a workspace without a claim and the common
publication helpers already handle remote reconciliation and safe local refresh.
Reuse these responsibilities. One-shot success must leave no published temporary
tracking, so validate the result plus cleanup before the result is published.
Keep any necessary interrupted-attempt recovery with existing workspace/conversation
state rather than adding a one-shot registry or dashboard state.

#### Agreed boundaries

- Both unlisted requests and queued stories may use `--one-shot`. A queued
  story finishes with its result and ordinary spent-record cleanup in the same
  commit, without an intermediate Taken claim. Already-Taken work keeps its
  current owner and lifecycle; do not remove or conceal its history.
- Escalation automatically admits the work and continues within the original
  authorization, including ordinary planning when needed. Ask only when the
  scope, authority, disputed constraint or ownership requires a human decision.
  An explicit stop or `--no-replan` instruction still limits continuation; it
  cannot authorize silently continuing oversized untracked work.
- Recheck queued ownership against freshly fetched trunk before publishing or
  escalating. Another agent's intervening claim or preparation assignment is
  competing ownership; preserve local work and stop that publication rather
  than deleting the other's record. This supplies safe optimistic coordination
  without inventing a hidden one-shot claim.
- Eligibility is judged from an understood, coherent outcome and credible
  verification path. An agent that already knows the work is larger enters
  normal admission before starting. A short diagnosis/test/fix loop can remain
  one attempt; failure to converge or discovery of multiple outcomes triggers
  escalation. Verification and delivery recovery alone do not establish growth.
- Use the common option at independently invoked mission entry workflows, with
  shared semantics. It grants no additional action permission. Preparation-only
  requests keep their existing publication/disposition contract; the flag does
  not automatically land a draft or implement a recommendation.

**Additional key examples:** A queued tiny change publishes its result and
removes only its own spent story; a concurrent Taken claim stops that cleanup;
an oversized unlisted attempt publishes a new minimal story and claim while
preserving local edits, then plans/continues within scope; a delayed CI verdict
retains ordinary verification ownership without fabricating a backlog entry.

**Plan:** [Complete one-shot work or admit its continuation](../slice-plans/112-one-shot-work/PLAN.md).

No product question remains from this refinement. The first story's published
implementation remains an execution dependency; reconcile the admission
interface and retained-work continuation against that delivered version before
execution. Planning does not assume it has already landed.

<a id="plan-link-readers"></a>

### Correction: Read every plan link by its file

**Identity:** SEED-028#plan-link-readers
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/118-plan-link-readers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a3edb95f4c3c36a4009d63c720300bf6a3a991c318e16d326b225a235d033737","plan":"407aa996bac004cfee425a91358aed087828d8c8314e4681cdb99a3723e302a8"}}
```

**Goal:** Developers whose backlog links a section of a plan get the same
answer from the backlog's own readers as from take, record-state and startup:
the listing checks again refuse a plan link that duplicates another entry's
home, and `adopt` accepts a backlog `take` wrote, so the product's own commands
never refuse or silently permit what another command wrote.

**Scope:** A bounded retrospective correction of the delivered plan-link rule
correction (`SEED-028#plan-link-rule`, commits `c97afbb..6b3f02b`), limited to
backlog scripts:

- The listing checks (`take --plan`, `add`, and parsing a backlog) again refuse
  a plan link that exactly equals another entry's anchored home (F1, a
  regression of the duplicate-listing guard).
- `adopt` opens a section-linked plan by its file (F2).
- A lasting test keeps the backlog modules the dashboard bundles free of
  Node-only imports (F4).

Deferred (2026-09-27, maintainer): the dashboard reading a recorded
story-state plan with a `#section` by its file (F3). No record in this
repository writes a section plan link and no skill instructs one, so the
dashboard misreport has no current input; its Playwright proof is the most
expensive of the four. Also deferred: a plan link naming another story's seed
file without an anchor (for example `seeds/X.md` while another entry is homed
at `seeds/X.md#first-story`), which neither the old nor the restored rule
refuses. Excluded as before: refresh repoint semantics, merge comparison in
`product-backlog-version.mjs`, test consolidation, and unifying the declared-plan
resolvers. Refusing `#section` in plan links altogether was considered and not
chosen: it would change take, record-state and startup, more work than the
readers' fixes.

**Key examples:**

- `SEED-021#first-story` is queued; `take --plan
  seeds/SEED-021-two-stories.md#first-story` for another story is refused
  ("already lists the same work twice") and the backlog is unchanged; the same
  holds for `add` of that home while another entry links it as its plan, and
  for parsing a backlog that lists both.
- A Taken entry linking `slice-plans/N/PLAN.md#ordered-slices` is adopted like
  one linking the bare `slice-plans/N/PLAN.md`, the plan's identity recorded
  once.
- A plan link `slice-plans/N/PLAN.md#ordered-slices` for its own entry is still
  accepted by take, record-state and startup (plan 116's promises unchanged).

**Execution note:** run with `--skip-retro`. This is the third correction in
the admission-coherence → plan-link-rule → plan-link-readers chain; a further
automatic retrospective would likely queue another correction for a link shape
no one writes. Report incidental findings once instead.

**Plan:** [Read every plan link by its file](../slice-plans/118-plan-link-readers/PLAN.md).

## Ordering and Scope Reduction

Queue these two stories in this order at the original story's current position:
shared admission first, then one-shot execution with escalation. Preserve unrelated
queue order and existing Taken assignments. Admission directly advances the
backlog's shared-progress visibility direction and supplies the second story's
fallback. Drop or defer one-shot first if scope must shrink; admission remains a
complete useful outcome on its own.

The original story keeps its identity and its ordinary-lifecycle outcome. Only
one new story is introduced. Completed-story retention, historical dashboards,
new lifecycle categories and separate per-process tracking implementations remain
outside both stories. Research into qualifying processes is part of refining
the first story, not an additional queued research deliverable.

The agreed name is `--one-shot` (2026-09-26). Architecture direction is recorded
in [Proposed ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md).
Decomposition and backlog placement authorize neither executable planning nor
implementation. Surface the first story when accepted work would bypass shared
tracking; surface the second when tracking overhead overwhelms a trivial request.

## Breadcrumbs

- Maintainer capture on 2026-09-24; refinement decisions on 2026-09-26.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing test optimization continuation](SEED-004-extract-and-adopt-project-guidance.md#continue-test-optimization-plans).
