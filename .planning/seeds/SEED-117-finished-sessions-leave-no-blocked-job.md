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

Three things combine, and each is unchanged today:

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
Claude Code shows the symptom; the wording rule in story 1 is host-neutral.

## Alternatives and Decision

Recommended: two small changes that each stand alone.

- After retirement has removed the session's own checkout, the closing
  response reports the work as finished and states every decision or next
  action as a reminder the developer takes elsewhere, never as a question or
  request this session will act on. One text still serves both the dashboard
  attention message and the native response.
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

<a id="finished-after-retirement"></a>

### A session that retired its own checkout closes as finished

**Identity:** SEED-117#finished-after-retirement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**For / why:** A developer reading Claude Code's agents view, or a dashboard
card's attention message, wants a wrapped-up session to read as finished, with
anything left for them stated as a reminder they act on elsewhere, because the
session can no longer act: its checkout is gone.

**Goal:** When Story Wrap Up or Dough Land has retired the session's own
checkout, the closing response, in the dashboard and natively, reports the
work as finished and leaves no request that would make the session appear to
be waiting for input.

**Scope:**

Required behavior:

- After retirement removed the checkout the session ran in, the settled closing
  text states that the work is finished and where it landed, then lists
  reminders. Each reminder states the fact, its consequence, and the next
  action with its owner, as a statement for the developer to take up in the
  dashboard, a new session, or by hand. It never asks the reader a question,
  requests a decision from this session, or gives a command for this session
  to run next.
- A record the wrap-up deleted so Git can recover it is reported as a fact
  ("… stays recoverable at `<sha>`"), never as an instruction to recover it.
- The same text is what the dashboard receives as the attention message and
  what the session gives as its native response; the one-text rule in
  [dashboard completion](../../src/skills/dough-land/references/dashboard-completion.md)
  stays.
- While the checkout survives, because retirement was held, an unfinished step
  remains, or the work is local-only, the closing response may still ask for
  the input the session needs to continue, exactly as today.
- The rule lives once, in the shared
  [completion attention](../../src/skills/dough-land/references/completion-attention.md)
  reference that Story Wrap Up and Dough Land already apply, and passes the
  maintainer behavior review in `AGENTS.md`.

Rejection constraints:

- No new completion marker, dashboard field, or report outcome.
- No change to when retirement happens or who performs it.
- Nothing in the rule names the dashboard, a "client project", or Claude
  Code's classifier as required runtime vocabulary; it is written for the agent
  finishing its work.

Deferred promises, not commitments of this delivery:

- Teaching the dashboard to show a retired session as unresumable in its own
  session access text (it already says the saved workspace is missing).

**Key examples:**

1. A dashboard-launched Claude Code wrap-up merges SEED-094 to `main`, retires
   its worktree, and must remind the developer that two paid native runs have
   not happened. The closing text says the story is on `main`, that the runs
   remain undone, and that authorizing them is the developer's step from the
   dashboard. The dashboard shows that attention message; `claude agents --json
   --all` lists the job as done, not blocked.
2. A wrap-up deletes the spent story section, plan and a North Star topic
   after a before-cleanup commit. The closing text says they stay recoverable
   at that commit. No sentence tells anyone to recover them.
3. Retirement is held because the default checkout holds pending local work,
   so the worktree still exists. The closing text names the unfinished
   retirement and what it needs; the job may show as needing input, and
   reopening it works.
4. A developer runs `/dough-land` directly in a foreground terminal with no
   dashboard context, and the worktree is retired. The same wording rule
   applies and no dashboard is contacted.

- **Value / learning:** Removes the source of new blocked jobs without any
  product code, and confirms that one closing text can serve both audiences
  once it is written as a finished report.
- **Effort hypothesis:** S — high confidence; a wording rule in one shared
  reference plus the behavior review of one wrap-up and one landing.
- **Depends on:** none
- **Safe stopping point:** Valuable alone: every later wrap-up with attention
  closes as done in Claude Code's agents view. Existing exited jobs still need
  story 2 or a manual `claude rm`.

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
  including the ones story 1 has not yet prevented, leaves Claude Code's list
  on Done.

## Ordering and Scope Reduction

Story 1 first: it is guidance only and stops new blocked jobs from appearing.
Story 2 second: it clears the ones a developer marks done. Either can be
dropped and the other keeps its value; dropping both leaves manual `claude rm`.

## Open Decisions

None.

## When to Surface

Now: every wrap-up with an attention message produces a blocked job.

## Breadcrumbs

- Closing text rule: `src/skills/dough-land/references/completion-attention.md`
  and `src/skills/dough-land/references/dashboard-completion.md` ("with
  attention, give exactly the response submitted").
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
  story 2 handles; [SEED-052](SEED-052-start-agent-work-from-dashboard.md) is
  the original Mark as done story.
- Claude Code's own message after the fact: "Workspace not trusted. `<path>`
  could not be resolved on disk." comes from the `claude` binary when a job's
  saved working directory no longer resolves.
