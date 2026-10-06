---
id: SEED-117
status: active
planted: 2026-10-07
planted_during: Terry's report of finished dashboard sessions listed under Needs input with their worktrees gone
trigger_when: Claude Code's agents view lists a finished dashboard session as needing input, or opening one fails because its workspace was removed
scope: S
---

# SEED-117: A finished dashboard session leaves no blocked, unresumable Claude Code job

## Why This Matters

A developer scanning Claude Code's own agents view expects a session whose
story is wrapped up and merged to be listed as finished. On 2026-10-07 four
finished dashboard-launched sessions sat under **Needs input** instead, and
opening any of them failed with "Workspace not trusted. `<worktree>` could not
be resolved on disk." Their work was complete and on `main`; the jobs were only
noise, and the developer had to remove them by hand with `claude rm`.

The evidence (Claude Code job files under `~/.claude/jobs/<short id>/`, now
removed; the dashboard launch store keeps the matching records):

| Job | Work | Closing sentence the job kept as its need |
| --- | --- | --- |
| `aed36ef0` | Open Dough SEED-113#share-repeated-observer-reads | "Recover the deleted story section, plan 261 and North Star topic from `655ecc42`." |
| `6fff9847` | Open Dough SEED-094#observe-ci-on-codex-and-cursor | "Needs your decision: … authorize paid native Codex + Cursor evaluation runs or decline" |
| `4e0f8645` | Doughnut SEED-067#stacks-survive-other-builds | "Tell me whether to keep watching DD-159 or drop it" |
| `aa248e44` | Pygardon SEED-085#story-ci-capacity-holders-correction | "Next step: `/dough-execute-plan SEED-085#…`" |

Three things combined:

1. **The session retires its own checkout.** Story Wrap Up and Dough Land run
   `worktree-retirement.mjs` from inside the story worktree, by design; the
   guidance already tells the agent to keep a surviving directory for the final
   dashboard report. Every job's timeline shows "retiring worktree/branch/remote"
   immediately followed by the blocked state.
2. **The closing message asks the developer for something.** Claude Code
   classifies a background session from its last message. A message that asks a
   question, names a decision, or gives the developer a next command is kept
   as *blocked* with that sentence as what it needs. The completion-attention
   rule requires the native closing response to be exactly the attention
   message sent to the dashboard, and those messages carry decisions. In the
   first row the sentence was not even a decision: the wrap-up deletes spent
   records so Git can recover them, and the pointer was phrased as an order.
3. **Mark as done cannot clear it.** The dashboard's Done operation runs
   `claude stop <short id>`, which only acts on a running session. These
   sessions had exited, so the stop failed and each record kept "Claude Code
   stop failed: The native operation could not be confirmed." `claude rm
   <short id>` works on exited sessions ("Unlike `stop`, works on
   already-exited sessions"), and the dashboard never uses it. Removing a job
   this way keeps its transcript under `~/.claude/projects/`; only the job
   record and any job-owned worktree go.

A fifth job (Pygardon's CI-deferral correction) retired its worktree the same
way but closed with a plain completion; Claude Code lists it as done and it
caused no complaint. That is the behavior to make ordinary.

Codex and Cursor sessions do not appear in Claude Code's agents view, so only
Claude Code shows the symptom.

## Alternatives and Decision

Recommended: two small changes that each stand alone.

- After retirement has removed the session's own checkout, the closing
  response reports the work as finished and states every decision or next
  action as a reminder the developer takes elsewhere, never as a question or
  request this session will act on. One text still serves both the dashboard
  attention message and the native response. This is now the closing-text
  rule in `src/skills/dough-land/references/completion-attention.md`.
- Mark as done on a Claude Code session whose process has exited removes its
  native job with `claude rm`, while a running session keeps today's stop and
  the rename SEED-116 is delivering.

Rejected alternatives:

- The dashboard retires the worktree instead of the session. It moves
  retirement ownership out of Story Wrap Up and Dough Land, which also run
  without a dashboard, for a symptom two wording and Done changes remove.
- Leave blocked jobs for the developer to remove by hand. That is today.
- Rewrite Claude Code's job state file to mark the job done. Undocumented
  storage, and the dashboard already avoids writing Claude Code's own files
  (SEED-116).
- Keep asking in the closing message but have the dashboard stop the sender
  after reporting. Reporting deliberately never stops or renames its own
  sender, and the job would still be unresumable.

## Story Decomposition

<a id="remove-exited-claude-job"></a>

### Mark as done removes an exited Claude Code session's job

**Identity:** SEED-117#remove-exited-claude-job
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**For / why:** A developer who marks a finished Claude Code session done from
its card or Recently done expects Claude Code's agents view to stop listing
it, whether or not its process is still running and whether or not its saved
workspace still exists.

**Goal:** Mark as done on a Claude Code session whose process has exited
removes that session's job from Claude Code, keeps the local Done mark and the
record's completion message, and shows a problem only when the removal truly
failed.

**Scope:**

Required behavior:

- When Claude Code's listing shows the session without a running status, Mark
  as done ends the dashboard's attachments as today and then runs `claude rm
  <short id>` from the project folder, the same folder today's stop uses. The
  listing no longer includes the session, and the record carries no done
  problem.
- When the listing shows the session still running, today's path is unchanged:
  `claude stop`, and the rename SEED-116 delivers.
- A removal that fails, because Claude Code is missing, refuses, or does not
  answer within the wait, keeps the local Done mark with a problem naming that
  cause; a later Mark as done retries the removal.
- A record already marked done that carries today's "Claude Code stop failed"
  problem is cleared by Mark as done when its session has exited.
- After removal, Recently done still shows the record with its completion
  message and Done; its session state reads as unavailable, and the terminal
  path refuses with the session named as removed, as it does today for a
  session Claude Code no longer lists.
- `dashboard/AGENT-LAUNCH-TERMINALS.md` describes the removal in its Mark as
  done section.

Rejection constraints:

- `claude rm` is never run on a session the listing shows as running.
- Reporting still never stops, renames, or removes its own sender; automatic
  Done after quiet completion is unchanged.
- No writes to Claude Code's job or transcript files.
- Codex and Cursor done behavior is unchanged.

Deferred promises, not commitments of this delivery:

- Removing a blocked job automatically when its workspace disappears without a
  Done. Done stays the developer's intent.

**Key examples:**

1. Recently done shows the SEED-094 wrap-up record: an attention message, a
   retired worktree, a process that exited. The developer clicks Mark as done.
   `claude agents --json --all` no longer lists `6fff9847`; the card shows Done
   with no red problem.
2. The developer clicks Mark as done on a card whose session is still working.
   The session is stopped as today and its job stays listed, renamed once
   SEED-116 lands.
3. `claude rm` exits with an error. The card reads "Local done mark retained.
   Claude Code removal failed: …" with the cause, and a later Mark as done
   removes the job.
4. A record marked done yesterday still shows "Claude Code stop failed". Mark
   as done again removes the exited job and the problem disappears.

- **Value / learning:** Lets Done mean the same thing in the dashboard and in
  Claude Code's own list for every finished session, and settles whether
  `claude rm` from the project folder is a reliable channel for exited jobs.
- **Effort hypothesis:** S — medium confidence; the Done operation already
  branches on host and session state, and the fake Claude fixture needs an `rm`
  command. `claude rm` on an exited job with a removed worktree was observed
  working by hand on 2026-10-07 (Claude Code 2.1.292).
- **Depends on:** none. It changes the same Done operation SEED-116 changes
  (`finishNativeDone`), so whichever lands second rebases on the other.
- **Safe stopping point:** Valuable alone: every exited Claude Code session,
  including ones closed before the closing-text rule, leaves Claude Code's
  list on Done.

## Ordering and Scope Reduction

The closing-text rule in completion attention already stops new blocked jobs
from appearing. The remaining story clears the ones a developer marks done;
dropping it leaves manual `claude rm`.

## Open Decisions

None.

## When to Surface

Now: every wrap-up with an attention message produces a blocked job.

## Breadcrumbs

- Closing text rule: `src/skills/dough-land/references/completion-attention.md`
  and `src/skills/dough-land/references/dashboard-completion.md` ("with
  attention, give exactly the response submitted").
- Guidance tests that read the closing text rule and must keep passing:
  `src/skills/dough-land/scripts/completion-attention-guidance.test.mjs`,
  `src/skills/dough-land/scripts/process-retrospective-guidance.test.mjs` and
  `src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs`.
- Retirement from inside the session: `src/skills/dough-story-wrap-up/SKILL.md`
  (Story Branch retirement), `src/skills/dough-land/SKILL.md` ("Retire the
  worktree"), `src/skills/dough-land/scripts/worktree-retirement.mjs`.
- Done operation: `dashboard/server/doneMarks.ts` (`finishNativeDone` attempts
  stop when the session state is not unavailable), `dashboard/server/hosts/claude/runtime.ts`
  (`stopClaude`, listing with `claude agents --json --all`; a missing `status`
  means the process exited).
- Fake host for tests: `dashboard/tests/fixtures/fake-claude`.
- Docs: `dashboard/AGENT-LAUNCH-TERMINALS.md` (Mark as done),
  `dashboard/AGENT-LAUNCH-COMPLETION.md`.
- Related: [SEED-116](SEED-116-claude-done-rename.md) renames a done session
  through a private attachment and defers the exited-session case this seed's
  remaining story handles; [SEED-052](SEED-052-start-agent-work-from-dashboard.md) is
  the original Mark as done story.
- Claude Code's own message after the fact: "Workspace not trusted. `<path>`
  could not be resolved on disk." comes from the `claude` binary when a job's
  saved working directory no longer resolves.
