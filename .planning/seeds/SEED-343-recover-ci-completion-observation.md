---
id: SEED-343
status: active
planted: 2026-11-13
planted_during: Combined retrospective maintenance and Terry's priority for Pygardon DD-501
trigger_when: An execution observer expires before the final accepted revision has a completion receipt
scope: story
---

# SEED-343: Recover the CI verdict after execution observation expires

## Why This Matters

A coordinator closing an accepted story needs the effective CI verdict and
confirmed observer shutdown before retiring its worktree. An expired observer
left Pygardon waiting for a run that could never start. The same eight-hour
observer has expired on GitHub Actions executions. The Open Dough lifecycle
owns the budget and recovery. The configured provider supplies CI evidence.

## Stories

<a id="recover-ci-completion-observation"></a>

### 1. Recover CI completion after the observer expires

**Identity:** SEED-343#recover-ci-completion-observation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/615-recover-ci-completion-observation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cc5f7ae99e016ce318d9ed94b951b46f26f1a65ab7b2ca8f25e10554cd1f3db0","plan":"7b28779859a6cb104c8f49a127f61ffa3f23e51bef83d969f8a66958bef80f97"}}
```

#### Goal

A coordinator whose execution observer ended, by its eight-hour budget or
otherwise, before the final accepted SHA has a completion receipt runs one
managed recovery that the expiry notice and the execution and wrap-up guidance
name. The recovery re-establishes this coordinator's observation of that SHA
on its authorized target and ends in the ordinary completion receipt that
wrap-up's retirement gate checks: effective evidence and confirmed shutdown on
success, retained resources otherwise. Nobody polls an exact SHA by hand, so an
ignored-only closure such as Pygardon's merge landing `a5ceb3881` reaches its
applicable basis instead of waiting for a run that never starts. This removes
the closure stall behind [ODF-259](../../docs/maintainer/findings/ODF-259.md),
[ODF-298](../../docs/maintainer/findings/ODF-298.md) and
[ODF-334](../../docs/maintainer/findings/ODF-334.md).

#### Scope

**Required behavior**

- **Named recovery.** A budget-expiry `CI_MONITOR_UNAVAILABLE` says that the
  budget expired, distinct from a transport loss such as Doughnut's HTTP 502
  or TLS handshake timeout ([ODF-121](../../docs/maintainer/findings/ODF-121.md)),
  and the guidance at every completion point (execution/review handoff,
  Trunk Mode `finish`, Story Branch integration) names the one managed
  recovery for an ended observer. Receipts and reports keep the two causes
  distinguishable.
- **Recovery to the ordinary receipt.** The recovery covers the already
  accepted SHA on its authorized target only. It finishes through the existing
  completion operation and its `CI_OBSERVER` receipt, with no second receipt
  format. Success carries the effective evidence and `shutdown: confirmed`. A
  failure, pending evidence, or unresolved evidence keeps the observer,
  worktree and branch for diagnosis, repair or a later bounded resume.
- **Preserved history.** The ended observer's records, its expiry event,
  unread failure evidence and the original publication receipts stay readable
  and unchanged. A failure the ended observer delivered is still owned and
  still needs repair; a later green does not settle it.
- **Bounded and idempotent.** The recovery keeps the completion operation's
  foreground bound and the sixty-minute overall deadline, recorded at the
  first completion start for the accepted SHA on its target and carried into
  the recovered observation, never renewed by recovery, resume or repetition. Repeating the recovery, or rerunning it after
  an interruption, leaves one owned live observation and one receipt for the
  accepted SHA.
- **Applicability across merges.** Reuse the exact-attempt and `not_required`
  rules. With no exact attempt, the effective evidence is the nearest attempted
  ancestor reachable through either parent whose tree difference to the
  accepted SHA is ignored-only, never the first parent or the target's newest
  attempt by default. An applicable failed or pending attempt keeps its actual
  state. Missing or ambiguous evidence stays unresolved. Integrated-state
  completion and actionable-failure rules keep their current meaning.
- **Both providers.** The same recovery and receipt semantics hold for GitHub
  Actions with a matching path filter and for a configured command adapter.
  The command adapter supplies the applicable ancestor's attempt, including a
  story-side ancestor outside the target branch's own attempts, through its
  existing adapter boundary.

**Required restrictions**

- Recovery never registers or completes a newer tip, another writer's
  revision, an unpublished candidate or another target, and never uses another
  coordinator's observer. Completion evidence must describe this execution's
  accepted publication ([await the applicable revision at completion](../../src/skills/dough-execute-plan/references/ci-completion-wait.md#await-the-applicable-revision-at-completion)).
- An unresolved receipt never grants retirement; wrap-up's existing gate
  requires success with confirmed shutdown.

**Scope limits**

- No change to the eight-hour budget or renewal of observation at each slice
  publication. Mid-story expiry already reattaches at the next delivery, and
  the completion recovery closes the remaining gap.
- No retry policy for transient transport errors (ODF-121). An observer that
  ended by transport loss may use the same recovery at completion, but this
  story verifies the budget-expiry path.
- `completion_expired` stays closed as it is today.
- No new read-only effective-verdict command unless the recovery design needs
  another caller to read the verdict; any such entry point exposes the same
  calculation. Pygardon's production release admission stays in its own owner.
- No paid native host runs; fixtures substitute both providers.

#### Key examples

1. **Story Branch handoff on GitHub Actions.** The observer for
   `claude/story` registered final slice SHA `S`, then its budget expired
   before completion. `S`'s run later finished green. The coordinator runs the
   recovery the expiry notice named → one new observation of `claude/story`
   owned by the same coordinator; the receipt reads `verdict: success`,
   effective evidence `S`'s run, `shutdown: confirmed`. The ended mailbox and
   its expiry event are unchanged.
2. **Pygardon-shaped merge landing on a command adapter.** Trunk landing `L`
   merges trunk `T` and closure `C`. The CI service reports `L` as
   `path_excluded` with no attempt. Story-side ancestor `B` passed; its
   difference to `L` touches only `.planning/` and `docs/`. Main's newest
   attempt `M` is older and unrelated. After the observer ended, recovery on `L`
   → `not_required` with basis `B`, `verdict: success`, confirmed shutdown,
   never `M` and never a wait for an attempt on `L`.
3. **Same shape on GitHub Actions** with a `paths-ignore` filter matching
   `.planning/` and `docs/` → the same receipt semantics as example 2.
4. **Applicable failure or pending.** As example 2, but `B` failed → `verdict:
   failure`, shutdown retained, worktree and branch kept for ordinary repair.
   `B` still running → `unresolvedReason: pending` with its handoff; resuming
   keeps the first completion start's deadline.
5. **Unresolved evidence.** No attempted ancestor exists, or the adapter cannot
   list history → an unresolved receipt naming why, resources retained, no
   success.
6. **Repeat and interruption.** Running the recovery twice, or again after
   SIGINT → still one live observation and one receipt for `L`; the overall
   deadline is the one recorded first.
7. **Cause stays visible.** An observer that ended on a TLS handshake timeout
   reports transport loss, and one that ran out of budget reports budget
   expiry, in the event and in the recovery's receipt.

#### Architecture

One recovery and effective-evidence owner. Start from the existing `deliver` /
`finish` continuation, the CI mailbox completion operation and the shared
applicability classifier; execution handoff, Trunk Mode closure and Story
Branch integration all reach that same owner. Provider-specific acquisition
stays at the existing GitHub Actions and command adapter boundary
([ADR 0006, one authoritative home per rule](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).

#### Completion evidence

Record the delivered recovery, its containing release, and this story's
GitHub Actions and command-adapter proof outcomes at
[ODF-259](../../docs/maintainer/findings/ODF-259.md). Link the relevant outcome
from [ODF-298](../../docs/maintainer/findings/ODF-298.md) (closure
continuation) and [ODF-334](../../docs/maintainer/findings/ODF-334.md)
(exact-SHA polling).
