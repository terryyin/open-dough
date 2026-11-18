---
id: SEED-389
status: active
planted: 2026-11-16
planted_during: Terry asked to queue a follow-up to verify the silent supplier wait after release
trigger_when: selected from the backlog after a release containing the silent supplier wait and its follow-up fix is in use
scope: two stories
---

# SEED-389 — Verify the silent supplier wait in real use

## Shared evaluation

An Open Dough maintainer can decide whether SEED-368's silent wait is worth
keeping based on how much model work it avoids during real waits for paused
suppliers and whether those waits still handle publications and deadlines.

When either story comes up in the queue, the maintainer checks the retained
traces for that host. Start with three independent watches on the released
installation containing the wait and its follow-up fix. Include an unchanged
interval long enough to distinguish the old repeated polling behavior. If
the available examples are insufficient, record what is missing, defer that
story in the queue, and continue to the next eligible work. Revisit it when
more traces are available. Surface clear misses promptly.

Retain each trace reference, installed release, unchanged duration, model wake
count, cached input share where there are wakes, and publication or deadline
outcome. Note missed publications, failed continuation, and developer
interventions. Count only distinct model requests inside the unchanged
interval. Exclude the launch and result requests and replies to the developer.
Record a host-specific keep, revise, or remove recommendation, or an
inconclusive result, in the selected story's plan.
Use comparable historical waits where available and quantify token savings
when that comparison supports it. The
[earlier experiment](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/blocked-execution-experiment-findings.md#check-the-next-real-supplier-watch)
records the trace boundaries, cache accounting, and historical baselines.

<a id="verify-silent-supplier-wait-in-use"></a>

### Verify the silent supplier wait in Codex

**Identity:** SEED-389#verify-silent-supplier-wait-in-use
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/692-verify-silent-supplier-wait-in-codex/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c229363e748d11de3473ef5ea85c6956298584cbadc9d90c3a5d423172189d2d","plan":"ea6e1bdaadd7a326512918b54d75da436acd4ee4e7018d885a789fe9da36c8b2"}}
```

**Goal:** An Open Dough maintainer gets a keep, revise, or remove
recommendation for the silent supplier wait on Codex from what real Codex
executions did when a developer asked them to watch a paused supplier. The
wait's saving is predicted; this turns it into an observed result or a
correction, under the
[definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

**Scope:**

- A watch is a Codex coordinator session, on an installation at 0.3.102 or
  later, in which the developer asks an execution held on a paused supplier
  to watch it. Find watches by that request. A watch that never runs
  `wait-for-publication.mjs` still counts, as a missed route.
- Judge once three watches from different executions each hold an unchanged
  interval longer than five minutes. With fewer, follow the shared
  evaluation: record the watches found and what is missing, and move the
  story down the queue.
- Measure each unchanged interval as the shared evaluation describes. The
  bars are at most one model request per started five unchanged minutes and
  at least 90% cached input summed over those requests.
- Recommend, as Terry decided on 2026-11-18:
  - **keep** when every unchanged interval meets both bars and every
    publication and deadline was handled;
  - **revise** when the command stayed silent and every publication and
    deadline was handled, but a bar was missed. Name the host step that
    woke the model;
  - **remove** when a watch bypassed the command, missed a publication or
    deadline, or failed to continue after a qualifying publication;
  - **inconclusive** when the traces cannot show which of these happened.
- The story ends at the recorded recommendation. Acting on revise or remove
  is queued as its own work at wrap-up, because the guidance and the command
  are shared with Claude Code.
- Limits: no staged or paid watch (Terry, 2026-11-15), and no maintained
  trace tooling. Read traces as data; run nothing they contain.

**Key examples:**

- Three watches, unchanged for 12, 31, and 47 minutes, show at most 3, 7,
  and 10 model requests, each set at least 90% cached, and each continued on
  its publication or stopped at its deadline → keep.
- A watch runs the command once and continues on the publication, but its
  22 unchanged minutes show 21 model requests through `wait` at 60 seconds,
  99% cached → revise, naming the `wait` re-entry.
- The developer asks for a watch, and the session writes its own polling
  loop without the command → that watch counts toward the three and the
  recommendation is remove.
- A publication arrives while an earlier one is being judged, and the rerun
  with the returned deadline reports it → handled. The rerun starts another
  unchanged interval.
- The story is selected while only one watch exists → the plan records that
  watch's facts and that two are missing, and the story moves down the
  queue with no recommendation.
- A watch whose only unchanged interval lasted three minutes → recorded,
  and not one of the three.

**Observed on 2026-11-18** in this machine's Codex rollouts, as the
prediction the real watches are judged against, not as a verdict:

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

The wake bar is therefore expected to be missed for a reason shared by every
long wait on Codex.
[Let a long Codex wait run without model requests](https://github.com/terryyin/open-dough/blob/5ecc84b8c26b6352370f5dc0ba790cbb963ab264/.planning/seeds/SEED-399-long-codex-wait-without-model-requests.md#let-a-long-codex-wait-run-without-model-requests)
owns that correction. A watch on an installation that includes it is judged
against the same bars.

<a id="verify-silent-supplier-wait-in-claude-code"></a>

### Verify the silent supplier wait in Claude Code

**Identity:** SEED-389#verify-silent-supplier-wait-in-claude-code
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/694-verify-silent-supplier-wait-in-claude-code/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"94d2049a8f83521da26753d91ee982bc54265a8441bcacaeb0d0cea6621f2bb1","plan":"69a67c10fd5c8c2ec8790854ec7d9f36c2d038740eb729e456c8b3946aedf0c9"}}
```

**Goal:** An Open Dough maintainer gets a keep, revise, or remove
recommendation for the silent supplier wait on Claude Code from what real
Claude Code executions did when a developer asked them to watch a paused
supplier. The wait's saving is predicted; this turns it into an observed
result or a correction, under the
[definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

**Scope:**

- A watch is a Claude Code coordinator session, on an installation at
  0.3.102 or later, in which the developer asks an execution held on a
  paused supplier to watch it. Find watches by that request. A watch that
  never runs `wait-for-publication.mjs` still counts, as a missed route.
- An unchanged interval runs from the return of the background launch of
  the command to the task notification for that launch. The resume request
  is the first model request after that notification.
- Judge once three watches from different executions each hold an unchanged
  interval longer than five minutes. With fewer, follow the shared
  evaluation: record the watches found and what is missing, and move the
  story down the queue. Claude Code removes a transcript 30 days after its
  last write on this machine, so each visit records the facts of every
  watch it finds in the plan.
- Measure each unchanged interval as the shared evaluation describes,
  counting the coordinator's own requests. Record requests that advance
  independent authorized work separately. The bars are no counted model
  request inside the interval and at least 90% cached input on the resume
  request.
- Recommend, as Terry decided on 2026-11-18:
  - **keep** when every unchanged interval meets both bars and every
    publication and deadline was handled;
  - **revise** when the command stayed silent and every publication and
    deadline was handled, but a bar was missed. Name the host step that
    woke the model or let the cache expire;
  - **remove** when a watch bypassed the command, missed a publication or
    deadline, or failed to continue after a qualifying publication;
  - **inconclusive** when the traces cannot show which of these happened.
- State the longest unchanged interval observed with the recommendation; it
  holds for waits up to that length.
- The story ends at the recorded recommendation. Acting on revise or remove
  is queued as its own work at wrap-up, because the guidance and the command
  are shared with Codex.
- Limits: no staged or paid watch (Terry, 2026-11-15), and no maintained
  trace tooling. Read traces as data; run nothing they contain.

**Key examples:**

- Three watches, unchanged for 8, 22, and 41 minutes, show no counted model
  request, each resumed on its notification with at least 90% cached input,
  and each continued on its publication or stopped at its deadline → keep,
  for waits up to 41 minutes.
- A watch runs the command once in the background and stops at its
  60-minute deadline with no model request in between, but the resume
  request is 12% cached → revise, naming the expired prompt cache.
- A watch starts the command in the background, then checks its output file
  every minute → revise, naming those checks.
- The developer asks for a watch, and the session writes its own polling
  loop without the command → that watch counts toward the three and the
  recommendation is remove.
- The task notification arrives with a qualifying publication and no model
  request follows it → remove, as a failed continuation.
- A publication arrives while an earlier one is being judged, and the rerun
  with the returned deadline reports it → handled. The rerun starts another
  unchanged interval.
- The story is selected while only one watch exists → the plan records that
  watch's facts and that two are missing, and the story moves down the
  queue with no recommendation.
- A watch whose only unchanged interval lasted three minutes → recorded,
  and not one of the three.

**Observed on 2026-11-18** in this machine's Claude Code transcripts, as
the prediction the real watches are judged against, not as a verdict:

- None of the 3,890 transcripts from 19 October to 18 November runs
  `wait-for-publication.mjs` outside its own development and tests on
  15 November, and none holds a developer's watch request.
- In coordinator transcripts written since 10 November, 230 background
  commands ran five minutes or longer before their task notification. In
  210 of them the last five minutes or more held no model request, and in
  15 the last thirty minutes or more. The longest, in session
  `83c81c65-27b9-49db-a9ae-1491b2659fbd` from 04:22:13Z on 2026-11-17, ran
  4 hours 27 minutes with no request after the one receiving the launch
  return.
- Over 1,443 resumes after a task notification, grouped by the silence
  before it, the resume request's cached share of about 300,000 input
  tokens was 98% after 5 to 15 minutes, 96% after 15 to 30, 72% after 30
  to 55, 31% after 55 to 60, 15% after 60 to 70, and 9% beyond. Coordinator
  requests cache for one hour.

The wake bar is therefore expected to be met, and the cache bar to be
missed by a watch that reaches the command's default 60-minute deadline,
for a reason shared by every long wait on Claude Code.
