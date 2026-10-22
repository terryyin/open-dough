---
name: collect-client-feedback
description: >-
  Collects shared Open Dough feedback from maintained projects, reconciles and
  adopts finding names, compacts source logs, selects up to two supported leading
  responses, and commits and synchronizes the maintenance result in every changed
  repository including Open Dough. Use on explicit invocation to collect client
  feedback or run shared retrospective-findings maintenance, including an explicit
  composing invocation's supplied shared-phase handoff; reading or authoring the
  skill does not run it. Does not select project-local improvements or execute the
  queued responses.
---

# Collect shared Open Dough feedback

You are the maintainer agent in the Open Dough source repository. This internal
skill stays here, outside `src/skills/` and the installer payload. Follow
[maintainer guidance](../../../AGENTS.md) when changing or reviewing it.

An explicit invocation authorizes the complete finite maintenance cycle below:
collect the selected logs, retain evidence, reconcile and adopt verified names,
compact and prune under the retention rules, select up to two supported responses,
then commit, integrate and synchronize the owned result in every changed repository,
including Open Dough. Carry narrower current instructions through the cycle.
Reading, discussing or editing this skill is not an invocation. Do not implement
responses, release or install guidance, change direction, schedule future work,
or choose the owning projects' local improvements.

An explicitly invoked composing workflow may pass this shared phase its selected
inventory, Open Dough destinations, retained progress and the same finite
maintenance/publication authority. Carry that instruction without another approval
question; a bare mention or an unspecified caller grants no authority. This skill
does not perform the caller's local-maintenance phase or invent its orchestration.

## Resolve the maintained set and destinations

Use an explicitly supplied isolated inventory when present. Otherwise read the
machine's production dashboard configuration, currently
`~/.open-dough/dashboard/projects-production.json`; resolve a changed location
through [projectConfiguration.ts](../../../dashboard/server/projectConfiguration.ts)
and [machineHome.ts](../../../dashboard/server/machineHome.ts). Do not substitute
the development list or remembered paths, or create missing configuration.

For each project resolve its identity, expanded absolute `localPath`, configured
`ref`, origin and canonical `DearDough.md`. Include Open Dough's integration
checkout even if absent from the inventory, deduplicate repositories, and resolve
conflicting paths/targets before their writes. Verify the actual Git root and
origin against the configured identity. Confirm the configured trunk, including
`master` when applicable; do not guess `main`, rename a branch or alter dashboard
configuration. A missing configuration prevents claiming complete coverage.

Resolve each project's process-retrospective setting from its `open-dough.json`
by the stored-setting rule in
[dough-execution-retrospective](../../../src/skills/dough-execution-retrospective/SKILL.md#select-reviews);
do not create or edit that file. A project with it off records no process
findings, so it leaves this cycle's collection and source set; report it as
skipped because process retrospective is off, not as a missing log. An unresolved
setting keeps that project in the source set as a coverage gap.

Resolve Open Dough's catalog index, linked finding records, watch list, direction,
canonical seed directory and backlog from its repository guidance or explicit
supplied paths. An isolated catalog and its supplied destinations replace the
maintained records for that invocation. Follow relative links from their document.
Read each project's applicable instructions, setup, delivery conventions and
hooks. Record initial branch, HEAD, status/index and relevant file checksums;
inspect existing edits and local-only commits. In the source set, a missing or unreadable log is a
coverage gap, never an empty successful review; continue independent supported
projects. Do not manufacture a log or claim a missing project passed a watch.
Check a cited evidence locator at its resolved project/document path before
reporting absence; an incomplete search or listing does not establish a missing file.

Before a decision needing complete source coverage and again before the final
report, reread the supplied inventory or configuration and account for additions,
removals and changed paths/targets against the initial set. Resolve newly found
projects through the same checks. A missing discovery input, unresolved inventory
change or target, or unreviewed source keeps coverage incomplete; do not silently substitute
the old list, omit unfinished delivery to a removed project, or pass its watch.

## Collect, reconcile and adopt

1. Read the catalog index and its authoritative linked findings, watch entries and
   selected source logs. Separate shared Open Dough mechanisms from local-only
   findings. Leave local-only findings with their owning project. For mixed
   findings retain the shared facet with a locator to the preserved local facet;
   uncertain attribution remains qualified and is not evidence of a shared cause.
2. Supply each project identity, source path/snapshot, relevant evidence and the
   explicit catalog destination to
   [reconcile-retrospective-findings](../reconcile-retrospective-findings/SKILL.md).
   It owns matching, continuity, uncertainty and allocation. Reconciliation itself
   leaves source bytes unchanged. Retain source timestamps, execution release or
   modified revision, tool, observations and qualified inference before shortening
   a source; today's installation version is not an old execution's release.
3. Use project plus execution as occurrence identity, with locators to distinguish
   genuinely different executions. Old and adopted names, repeated reports and
   rereading one transcript add no occurrence. Preserve distinct observed effects
   in a compact occurrence, and count a shared execution once across findings
   when ranking a synthesized problem. Follow previously allocated codes in Git
   history; never recycle a pruned code or invent current recurrence from old
   feedback or an unknown release.
4. This invocation approves unambiguous reconciled mappings for adoption. Pass
   the project, canonical source path, mappings and that explicit approval to
   [dough-maintain-findings](../dough-maintain-findings/SKILL.md). Retain one
   `Former local code: DD-NNN.` alias and the finding's meaning/evidence. A
   revision-qualified mapping must not rename an entire historical entry. Keep
   ambiguous mappings separate and name the gap; proceed with clear siblings.
5. Once evidence is retained, collapse exact duplicate reports/aliases of the same
   project/execution into concise source text with original locators. Do not erase
   distinct occurrences, local facets or meaningful differences. Recheck source
   contents before saving; concurrent or unowned changes are not yours to absorb.

The wrapper supplies collection and adoption authority; the child skills retain
their standalone triggers. Merely encountering a finding invokes none of them.

## Assess the response still needed

Use [retention and watch](references/retention-and-watch.md) for cleanup. In an
initial cycle retain uncertain candidates conservatively; missing provenance or
unexercised guidance cannot pass a watch. Before proposing implementation, inspect
existing responses and relevant actual changes. Distinguish implementation still
needed from release, adoption or outcome proof still needed. An implemented
correction does not warrant another implementation story. Record its actual
response and remaining release/adoption/proof gap at the finding owner.

Then connect each distinct execution reconciliation identified this run —
collected or cited, with no scan of executions the cycle did not encounter —
to the catalog's open response-observation requests. An open request is a
finding or watch entry naming pending later observation of a delivered or
released response and checkable conditions: project, release or adoption, and
the event to observe, including an unknown watch start whose entry names the
qualifying use. For each execution, select only requests whose stated project
and release/adoption conditions it can meet, then verify the request's event
conditions from the collected evidence and targeted reads of that execution's
recoverable records. Verify project, execution identity, and the execution's
guidance release or adoption relative to the response: evidence from a release
or adoption not containing the response cannot demonstrate its effect, and a
prior report on older guidance is not post-fix recurrence.

Write the supported outcome at the existing finding owner (or its watch entry)
with the existing occurrence and observation conventions and step 3's project
plus execution identity, following [retention and watch](references/retention-and-watch.md)
for watch outcomes: a qualifying observation with its locators and a bounded
assessment under the request's criteria, counterevidence, or the precise
remaining gap. Recording that outcome at a finding owner changes no watch
state by itself — it starts, passes, or retires no watch — unless the open
request or watch entry itself, under those watch rules, calls for that watch
outcome; the request's own criteria and disposition govern any watch effect.
Counterevidence does not pass a watch and enters the response
assessment and triage below as actionable evidence. If provenance, release or
adoption, or a needed recoverable record is unknown or ambiguous, record only
a qualified candidate naming the missing fact and leave the request open. If
that execution's outcome is already recorded, add no occurrence or observation
and report it as already recorded. No match, no eligible exposure, or
unexamined projects never become success or a passed watch; when nothing is
eligible, write no observation, leave pending requests' dispositions unchanged,
and state that no request met eligible use. A request naming no checkable
conditions is reported as such, not matched by guess, and is not rewritten
here. Report the connections made, the requests not met, and the added review
effort this checking took.

Supply the authoritative evidence paths and current direction/backlog to
[triage-retrospective-findings](../triage-retrospective-findings/SKILL.md). Rank
remaining actionable problems by demonstrated impact, distinct executions,
current relevance, confidence and response effort. Challenge the leading choices:
compare the strongest alternative; an easy repair or vivid hypothetical harm
must not outrank demonstrated consequence merely because it is convenient. A
severe one-off can lead. State the reasons, evidence limits and actual response
needed; do not turn uncertain attribution into proven recurrence.

This explicit wrapper invocation delegates selection of up to two supported
leading backlog responses. Pass that selection and explicit writable finding,
seed and backlog destinations to triage; no repeated selection approval is
needed. Reuse suitable seeds, keep execution evidence at the finding owner, and
create evaluable stories with beneficiary, outcome, bounded scope and evaluation.
Require completion to record the actual response and containing release at each
addressed finding. Queueing means queued, not resolved; do not refine, plan or
execute the stories.

Use [dough-product-backlog](../dough-product-backlog/SKILL.md) for canonical links
and placement. Reuse a covering queued story and place the selected responses
first/second. The wrapper's priority instruction permits moving existing covering
queued work; direct triage rereview alone does not. Show Taken responses as
ongoing and choose the next supported response for the available backlog slots.
Retain reciprocal story/finding links. Preserve direction, Taken work and relative
order of all unselected items. Fewer supported problems yields fewer selections;
never fill slots with imagined work. Resolve a conflicting real prerequisite
before changing only that affected order.

## Deliver every changed repository

Evidence retention in Open Dough must precede shortening a source. Before any
publication make that retained evidence recoverable in an owned local Git commit;
if that is blocked, leave dependent source compaction unpublished. Keep Git facts
and the run's concise report as recovery context; do not add a permanent cycle
ledger or second evidence store.

For each changed repository, independently verify saved findings, aliases,
qualified occurrences, live reciprocal links, actual queue order and focused diff/
whitespace checks. Use its ordinary safe delivery path and hooks. Record-only
maintenance does not require unrelated application suites.

Where Dough Land applies, this explicit invocation supplies a validated
maintenance instruction to the maintained Open Dough source
[Dough Land](../../../src/skills/dough-land/SKILL.md), with no extra
keep/commit/sync question. This internal workflow uses that source handoff now;
it does not require updating installed managed guidance. Follow its source
references, resolving command placeholders for installed helpers to the target
project's installed runtime. Before that handoff establish the landing checkout,
starting revision, target remote/trunk, owned paths and owned unpublished suffix,
and confirm the whole checkout contains only this cycle's reviewed result.
Use a separate owned worktree for the result when existing dirty files or local
commits are unrelated; transfer only owned edits after checking their baselines.
Do not blanket-stash, reset, include unrelated commits or copy Dough Land's Git
algorithm. Reconcile through the maintained publisher, never force a push. Other
projects' established ordinary delivery retains its own conventions.

Verify each candidate's acceptance on its intended origin target, independently
of a push attempt or exit status. Record accepted SHA, target and any separate
local refresh/retirement result. Preserve unfinished candidates and safe
independent completed results on refusal, races or unavailable origins. A rerun
reads retained evidence and real Git/remote facts, reuses existing occurrences,
stories and accepted commits, and resumes the first unfinished boundary; unchanged
inputs create no edits, duplicate stories, empty commits or repeated publication.

Report initial/final coverage and changes or missing inputs, projects skipped with their reason, qualified mappings, compaction/pruning reasons,
watch and response gaps, response-observation connections, unmet requests and
their added review effort, selected priorities and rationale, ongoing Taken work,
and per-repository changed paths, accepted SHA/target or unfinished boundary.
Client-only publication with Open Dough unpublished is an incomplete cycle.
Keep remote acceptance and deferred checkout refresh distinct. Never call the
full cycle complete while a required write or publication remains unfinished.
