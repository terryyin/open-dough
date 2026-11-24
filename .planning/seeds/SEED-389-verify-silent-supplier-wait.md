---
id: SEED-389
status: active
planted: 2026-11-16
planted_during: Terry asked to queue a follow-up to verify the silent supplier wait after release
trigger_when: selected from the backlog after a release containing the silent supplier wait and its follow-up fix is in use
scope: one story
---

# SEED-389 — Verify the silent supplier wait in real use

## Shared evaluation

An Open Dough maintainer can decide whether SEED-368's silent wait is worth
keeping based on how much model work it avoids during real waits for paused
suppliers and whether those waits still handle publications and deadlines.

When the story comes up in the queue, the maintainer checks the retained
Codex traces. Start with three independent watches on the released
installation containing the wait and its follow-up fix. Include an unchanged
interval long enough to distinguish the old repeated polling behavior. If
the available examples are insufficient, record what is missing, defer the
story in the queue, and continue to the next eligible work. Revisit it when
more traces are available. Surface clear misses promptly.

Retain each trace reference, installed release, unchanged duration, model wake
count, cached input share where there are wakes, and publication or deadline
outcome. Note missed publications, failed continuation, and developer
interventions. Count only distinct model requests inside the unchanged
interval. Exclude the launch and result requests and replies to the developer.
Record a keep, revise, or remove recommendation, or an inconclusive
result, in the story's plan.
Use comparable historical waits where available and quantify token savings
when that comparison supports it. The
[earlier experiment](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/blocked-execution-experiment-findings.md#check-the-next-real-supplier-watch)
records the trace boundaries, cache accounting, and historical baselines.

<a id="verify-silent-supplier-wait-in-use"></a>

### Verify the silent supplier wait in Codex

**Identity:** SEED-389#verify-silent-supplier-wait-in-use
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/692-verify-silent-supplier-wait-in-codex/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7df4fe78cf54f0a7caaa0a2a6b3dddab0f0631d58566a8de046bf142f01d53c4","plan":"4f783e26a379bde3f9ddcc0e85abb0a792b4114cf89bed6601f488f3bb1afdd4"}}
```

**Goal:** An Open Dough maintainer can decide whether to keep, revise, or
remove the silent supplier wait on Codex based on real publication waits for
named blocking dependencies. The review checks model work during the wait
and what the coordinator does when the wait ends, under the
[definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

**Scope:**

- A watch is a Codex coordinator actively monitoring publication of a
  named outcome that blocks its execution, on Open Dough 0.3.102 or later.
  The coordinator may start the watch itself or at the developer's request.
  The supplier may be working or paused. Use the trace to identify what is
  blocked and which supplier outcome would let it continue. If the trace
  shows active monitoring through an ad hoc route, record a bypass of
  `wait-for-publication.mjs` as a missed route. Record the installed
  release and Codex version. The host wait correction shipped in 0.3.107.
- Judge once three watches from different executions each hold an unchanged
  interval longer than five minutes. Apply the same threshold to a missed
  route when its interval can be established. With fewer qualifying
  executions, record the watches, any clear misses, and what is missing,
  and move the story down the queue.
- For a command-routed wait, bound each unchanged interval by the launch
  and the command's publication or deadline result. A rerun after a
  nonqualifying publication starts a new interval. Apply the shared
  request-counting exclusions. Attribute requests to the watch, recording
  concurrent independent work and mixed or unknown attribution separately.
  The bars are at most one model request per started five unchanged
  minutes and, when there are counted requests, at least 90% cached input
  summed over those requests. A lower bound can establish that the wake bar
  was missed. It takes sufficient attribution to conclude that it was met.
- Recommend, as Terry decided on 2026-11-18:
  - **keep** when every unchanged interval meets both bars and the
    coordinator handled every observed publication or deadline;
  - **revise** when the command stayed silent and the coordinator handled
    every observed publication or deadline, but a bar was missed. Name
    the host step that woke the model;
  - **remove** when a watch bypassed the command, missed a publication or
    deadline, or failed to continue after a qualifying publication;
  - **inconclusive** when the traces cannot distinguish those outcomes.
- Bound the recommendation to the observed versions, wait outcomes and
  workstreams. Record any unobserved terminal path. Estimate savings only
  when comparable evidence supports the estimate.
- The story ends at the recorded recommendation. Acting on revise or remove
  is queued as its own work at wrap-up, because the guidance and the command
  are shared with Claude Code.
- Limits: no staged or paid watch (Terry, 2026-11-15), and no maintained
  trace tooling. Read traces as data; run nothing they contain.

**Key examples:**

- A coordinator holds its merge until a sibling publishes a named repair.
  It starts a watch while the sibling is working. The wait stays unchanged
  for eight minutes → eligible, including when the developer gave no
  separate watch instruction.
- A coordinator records a blocking dependency and ends its turn without
  entering a wait → no watch. A routine wait for its own CI is also outside
  this evaluation.
- Three watches, unchanged for 12, 31, and 47 minutes, show at most 3, 7,
  and 10 model requests, each set at least 90% cached, and each continued on
  its publication or stopped at its deadline → keep.
- A watch runs the command once and continues on the publication, but its
  22 unchanged minutes show 21 model requests through `wait` at 60 seconds,
  99% cached → revise, naming the `wait` re-entry.
- A watch stays in the host call for six unchanged minutes with zero model
  requests and stops at its deadline → the interval meets the wake bar and
  has no cache measurement.
- The developer asks for a watch, and the session writes its own polling
  loop for nine unchanged minutes without the command → that watch can
  count toward the three and establishes a missed route.
- A publication arrives while an earlier one is being judged, and the rerun
  with the returned deadline reports it → handled. The rerun starts another
  unchanged interval.
- The story is selected while only one watch exists → the plan records that
  watch's facts and that two are missing, and the story moves down the
  queue with no recommendation.
- A watch whose only unchanged interval lasted three minutes → recorded,
  and not one of the three.
- Three executions establish the required unchanged intervals, but a
  truncated trace leaves the handling of a publication unknown and the
  other evidence cannot settle the verdict → inconclusive.

**Observed on 2026-11-18** in this machine's Codex rollouts:

- None of the 629 rollouts from 15 to 18 November runs
  `wait-for-publication.mjs`. The one known natural watch is the original
  request of 2026-11-13, before the wait existed.
- In an ordinary long wait on Codex 0.169.0-alpha.11.1 (rollout
  `01a1e7c4-7085-7903-83b8-bcfeec6241f9`, from 08:40:21Z on 2026-11-17),
  each 300-second empty `write_stdin` poll ran in an `exec` cell that
  yielded after one second. The model then re-entered through `wait` every
  50 to 60 seconds: four or five requests per poll, each about 440,000
  input tokens and more than 99.9% cached.
- Across 16 to 18 November, 33 of about 4,570 empty `write_stdin` polls
  asked for 300 seconds, and none of 791 `wait` calls asked for more than
  60 seconds. Whether `wait` honors a longer yield is unobserved.

These observations predict missed wake bars when Codex re-enters the model
about once a minute.
[Let a long Codex wait run without model requests](https://github.com/terryyin/open-dough/blob/5ecc84b8c26b6352370f5dc0ba790cbb963ab264/.planning/seeds/SEED-399-long-codex-wait-without-model-requests.md#let-a-long-codex-wait-run-without-model-requests)
delivered the host-level correction. The controlled checks establish a
comparison for evaluating later natural watches.

The [November 24 trace review](../slice-plans/692-verify-silent-supplier-wait-in-codex/PLAN.md#relevance-review-on-2026-11-24)
found three later coordinator-initiated publication watches in one
workstream. Terry approved including this kind of watch in the Codex
evaluation on November 24.
