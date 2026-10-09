---
id: SEED-125
status: active
planted: 2026-10-09
planted_during: Authorized retrospective-findings runbook
trigger_when: Reported gaps or provisional behavior survive acceptance and later slices contradict the story
scope: story
---

# SEED-125: Reported gaps remain owned until the whole story accepts them

## Why This Matters

Developers expect a delivered story to satisfy its goal across all slices.
Coordinators currently accept a reported gap against a narrower plan, file it
as a learning, or lose its promised later check. The released acceptance
response has not prevented delivered omissions and wrong-result behavior.

## Story

<a id="keep-reported-gaps-owned"></a>

### Keep reported gaps owned through the story's remaining slices

**Identity:** SEED-125#keep-reported-gaps-owned
**Slice plan:** [Keep reported gaps owned through the story's remaining slices](../slice-plans/283-keep-reported-gaps-owned/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/283-keep-reported-gaps-owned/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8107c1a053d26465b6bd286d47ed1afda4704debf920a9a6e1703b3fa786eaa9","plan":"051c22b80adf141c23ad00ba9f9a2b01d7bf9b8ea7608487eb8e84c465aa3d4e"}}
```


**Beneficiary:** A developer receiving a complete story, and the coordinator
accepting work across its slices.

**Goal:** In planned execution, every gap, loss, or interim behavior an
implementation return names stays an owned story obligation until sufficient
proof accepts it, the story's own text excludes it, the developer changes the
promise, or the slice that receives it implements and proves it. The plan
holds these obligations as structured entries that an installed script checks
against the story and the slices. A narrower plan, a free-text learning, or an
out-of-scope remark can no longer close one. Business goal: a delivered story
satisfies its goal across all slices without a retrospective correction story
for gaps the implementer already reported.

**Scope:**

- **Response mechanism.** The released acceptance rule
  ([wrap-up Accept proof](../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof),
  since `b7930baf`) already states the right judgment and did not hold. This
  story replaces wording reliance with a structured record and a
  deterministic check. Rewording that rule or adding a reminder beside it is
  not the remedy. The rule's text changes only where the record replaces it.
- **Story obligations in the plan.** The coordinator records each gap, loss,
  limitation, or interim behavior a return names as one entry in the active
  plan: the reported text, the story clause it touches (goal, key example, or
  scope item), and exactly one disposition:
  - *return* — back to implementation in the current slice;
  - *receiving slice* — a named later planned slice implements and proves it;
  - *interim* — provisional behavior that names the later slices that depend
    on it, and stays open until the final behavior is proved against the
    story;
  - *excluded* — quoting the story's own exclusion or deferral;
  - *owner changed* — citing the developer's recorded change to the story;
  - *no user cost* — quoting the goal clause it was judged against and why
    the user loses nothing;
  - *proved* — naming the accepted proof and the slice that accepted it.
  A plan learning or a "plan-scoped" or "outside the slice's ask" remark is
  not a disposition. Learnings remain for what changes remaining work only.
- **Installed check script** (in the execution skill, used by the
  coordinator):
  - For a slice about to be delegated, it lists the obligations that slice
    receives and the open interims that depend on it. The delegation carries
    that list as slice promises with their required observations.
  - Before a slice is committed or marked done, it refuses:
    - an entry without a disposition;
    - an *excluded* quote that does not appear verbatim in the story's section
      of its seed;
    - a *receiving slice* that names no remaining planned slice;
    - a done slice that still has an open *return* or *receiving slice*
      obligation;
    - an *owner changed* entry whose cited story text is absent.
  - Before the execution-complete record is written, it refuses while any
    *return*, *receiving slice*, or *interim* entry is open.
  - The script reports in one machine-readable result; a refusal names the
    entry and the reason. It never judges whether a gap contradicts the
    goal. That reading stays with the coordinator, who records it where the
    script and the retrospective can see it.
- **Interim consequences.** When a later slice touches behavior an open
  interim describes, its acceptance re-reads the interim against the story's
  examples. If the later slice makes the interim produce a wrong result, that
  becomes a *return* in that slice.
- **Replanning.** Plan refinement or overrun replanning that removes or
  renumbers a receiving slice must move its obligations; the check refuses
  dangling ones. A quick attempt that continues as planned execution carries
  its reported gaps into the new plan's entries.
- **Preserved behavior.** Explicitly excluded gaps stay excluded with no
  rework. Independently accepted proof of earlier slices stays accepted when
  a later obligation returns. Plans without an obligations section read as
  having none; no migration of existing plans. Single-slice quick execution
  keeps the same-slice return rule without a plan.
- **Evaluation.** Script behavior is proved by free automated tests over
  replay fixtures of the three supporting cases. The executing-host replay
  of those cases, observing the coordinator record and act on each
  obligation, is a manual, developer-run check because host runs cost money.
  Phrase presence in guidance is not evidence.
- **Excluded:** a dashboard view of obligations, a general history system,
  automated judgment of whether a gap contradicts the goal, and unrelated
  planning or refactor changes.

**Key examples:**

1. *False plan scope (ODF-139, Pygardon plan 303).* The story says each signal
   and exit row names its source. Slice 4's return reports that
   `HoldingsExitSettingsResults.tsx` omits the source because "the slice only
   asked for the Auto Trading Holdings section." Recording it as *excluded*
   with that sentence fails the check: the quote is not in the story. No story
   text excludes the Holdings panel, so the coordinator records *return*.
   Slice 4 is not committed until the panel shows the source and its proof is
   inspected.
2. *Lost receiving-slice check (ODF-156, Pygardon plan 296).* Slice 6 accepts
   that non-Sharadar faults propagate and leave the run `running`, recorded as
   *receiving slice 8*. The listing for slice 8 includes the obligation, so its
   delegation carries "a live fault ends the run and the next daily
   occurrence runs normally." Slice 8 cannot be marked done while the entry is
   open. If replanning had dropped slice 8, the check would refuse the
   dangling entry.
3. *Interim made unsafe later (ODF-185, Doughnut plan 008).* Slice 1 records
   "while Stop is still finishing, the main action already shows Record
   again" as *interim*, dependent on the result-status slices. At slice 3's
   acceptance the listing shows the open interim. Re-reading it against the
   result status shows that Record during Stop can report "No speech was
   turned into text." for added text. The interim becomes a *return* in
   slice 3, and execution cannot complete while it is open.
4. *Dropped preserved parameter (ODF-185, Pygardon plan 280).* Slice 1's return
   says the `benchmark_weight` gene is not carried into the live strategy. The
   story promises to preserve searched parameters. A learning entry is no
   disposition, so the check refuses the commit until the coordinator
   records *return*.
5. *Genuine exclusion stays excluded.* The story's scope says it excludes the
   release cache budget remedy. A return names "release cache budget not
   enforced"; *excluded* quoting that story sentence passes. No rework
   happens, and completion is not blocked.
6. *Owner changes the promise.* The developer decides mid-execution to drop
   the Holdings page from the story. The seed records the change, and the
   entry's *owner changed* disposition cites it. Earlier slices' accepted
   proof stays accepted.

**Supporting findings:** [ODF-139](../../docs/maintainer/finding-names.md#odf-139),
[ODF-156](../../docs/maintainer/finding-names.md#odf-156), and
[ODF-185](../../docs/maintainer/finding-names.md#odf-185). Execution evidence
stays in those records. `b7930baf` first shipped in 0.3.48; exact false-scope
and learning-only omissions are reported on 0.3.56 after it.

**Completion criterion:** Delivery demonstrates the bounded outcome and records
the actual response commits and verified first containing release on every
addressed finding in the catalog. Queueing is not resolution; a new watch starts
only from verified relevant use of that later response.

**Depends on:** None. The unreleased planning-premise response addresses a
separate preparation boundary.

**Safe stopping point:** Named gaps and interim obligations have truthful
ownership through story acceptance even if other process work is deferred.
