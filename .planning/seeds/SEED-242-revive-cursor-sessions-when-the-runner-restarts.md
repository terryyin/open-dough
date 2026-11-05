---
id: SEED-242
status: active
planted: 2026-11-05
planted_during: Terry Yin's report that a Cursor runner restart left previously running sessions stopped, and his request that a restart revive them
trigger_when: The Cursor runner that holds dashboard-launched sessions restarts or is replaced
scope: story
---

# SEED-242: Revive previous Cursor sessions when the runner restarts

For a developer with unfinished Cursor sessions the dashboard launched, a
runner restart that stops those sessions should leave them running again in
the new runner, without a separate recovery for each one.

<a id="revive-cursor-sessions-when-the-runner-restarts"></a>

### Revive previous Cursor sessions when the runner restarts

**Identity:** SEED-242#revive-cursor-sessions-when-the-runner-restarts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/479-revive-cursor-sessions-on-runner-restart/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fad8a4bd022e457e9468b193dd378048af38fb9b9046a8c3b23c4593fb53d5bc","plan":"68aca0cfdde4720718fba8aa392b3446ff1d10c493b7b7821e94b49cfa36537b"}}
```

**Goal:** A developer whose unfinished Cursor sessions were running under the
dashboard's Cursor runner still has those sessions running after that runner
restarts or is replaced. Each one continues its recorded chat in the new
runner. The developer does not recover them one by one.

**Evidence.** On 2026-11-05 the production dashboard moved to a new build and
the Cursor runner was replaced. The new runner held only the session whose
launch was the new work. Five unfinished sessions that had been running read
"The agent is not running." and had no `cursor-agent` process: Show CI status
and timing on the Intent homepage, Show lost freshness across repeated
revision-stream failures, Stop revision checks when a page leaves during
stream setup, Remove local proof from Donut, and Process FabioMalpezzi's open
PRs. Recovering each one resumed the chat and placed a continuation in the
composer, but the dashboard reported that Cursor had not taken that
continuation in time. The sessions were kept, and the continuation had to be
submitted before they read Working again.

Doing nothing leaves the next runner replacement in the same state. Recovering
each session by hand is the available workaround, and tonight it did not by
itself leave the continuation accepted.

SEED-052#cursor-runner-restart-resume (plan 334) already made those sessions
resumable records after replacement and required Recover for each one. This
story removes that per-session Recover step for sessions the previous runner
was holding.

**Selected approach (refinement 2026-11-05): revive held unfinished sessions
at the runner-replacement boundary.** When the dashboard is about to stop a
stale runner for new work, it snapshots the unfinished sessions that runner
still holds, completes the replacement and the new work as today, then resumes
each snapshotted session onto the new runner through the existing Recover keep
path (resume the recorded command and scope; type a continuation only when
first input is already confirmed). Observation and listing still never replace
or revive. Machine-restart / dead-runner shapes revive the same set once a
current runner exists for new work and those sessions remain unfinished and
not held.

**Scope.**

- *Required behavior.* When the Cursor runner restarts or is replaced, every
  unfinished session that runner was holding is running again under the new
  runner and continues its recorded chat: the new runner holds a live agent for
  that launch record, and the dashboard no longer says the agent is not running
  for it.
- *Required behavior.* The developer can see those sessions as running in the
  dashboard, including in Running Cursor sessions, without using Recover on
  each one.
- *Required behavior.* Revival uses the existing Recover keep path for each
  previously held unfinished session (recorded conversation, workspace, and
  configuration scope). A continuation is attempted exactly as Recover does
  today when first input is confirmed. Meeting the story does not require a
  stronger Working-within-launch-wait guarantee than Recover already provides;
  a kept session whose continuation was not taken in time still counts as
  running when the runner holds it.
- *Required behavior.* A session that fails to revive remains its unfinished
  launch record with Recover still offered; other sessions' revival is not
  abandoned because one failed.
- *Kept behavior.* A session the previous runner was not holding stays as it
  was. A finished or marked-done session is not started again. Work that
  caused the new runner to start remains running. Dashboard restart against a
  still-current runner still reattaches held clients without resume. Reads,
  listing, and attach to a still-held client still neither replace the runner
  nor revive sessions. Claude and Codex restart behavior is unchanged.
- *Scope limits.* No dual live runner generations. No draining held sessions
  before replacement. No preserving a live in-flight turn's partial output
  across the process boundary. No revival of sessions the dashboard did not
  launch. No new developer ceremony or control for "runner was replaced."
- *Deferred promises (neither delivered nor prevented).* Guaranteeing that
  every revived session reaches Working with an accepted continuation inside
  the shared launch wait under concurrent revival; auto-reviving unfinished
  not-running sessions that were never held by the replaced runner; changing
  when replacement itself is triggered.
- *Rejection constraints.* Observation never starts, replaces, or revives.
  Replacement remains a new-work boundary concern, as plan 334 established.
- *Evaluation.* After a runner restart or replacement, each previously held
  unfinished session has a live agent in the new runner and the dashboard no
  longer says the agent is not running for that session.

**Key examples.**

1. A stale runner holds five unfinished Cursor sessions → the developer
   launches new work that requires the current runner → the stale runner is
   replaced, the new launch runs, and each of the five is held again on the
   new runner continuing its recorded chat, without Recover. Running Cursor
   sessions shows them; none still reads that the agent is not running.
2. A stale runner holds an unfinished session and a finished or marked-done
   session → replacement for new work → only the unfinished held session is
   revived; the finished one is not started again.
3. An unfinished Cursor launch record exists that the previous runner was not
   holding (already stopped, never attached) → replacement for other work →
   that record stays as it was; no agent is started for it.
4. The runner process is gone (machine-restart / dead-pid shape) while five
   unfinished sessions that it had held remain recorded → the next new-work
   path starts a current runner and those five are held again there without
   Recover.
5. The dashboard restarts but the runner survives on current code with held
   clients → those clients are reattached; no resume and no revival pass run
   (preserved).
6. Revival of one previously held session fails (missing workspace, unreadable
   scope, or keep failure) → that session stays unfinished with Recover
   offered; the others that can revive are held on the new runner.
7. Recover today times out with "Cursor did not show it took the instruction
   in time" while keeping the session → the same kept outcome after automatic
   revival still satisfies this story when the runner holds the session.
8. The developer only lists or opens held sessions on a stale runner → no
   replacement and no revival occur until new work asks for a current runner
   (preserved observation rule).

**Exploration (2026-11-05).** Three materially different ways to reach the
goal were compared against the same constraints (one machine-local Cursor
runner, replacement only at new work, observation never resumes, plan 334's
resumable records):

- **Revive at replacement (selected).** Snapshot unfinished held sessions
  before stopping the stale runner; after the new runner accepts (and the
  triggering new work is underway as today), resume each through the Recover
  keep path. Matches the incident: the sessions that were running come back
  without per-session Recover. Reuses launch records, Recover, and the
  current-runner boundary. Limit: revival is best-effort per session under
  the same keep/timeout rules as Recover.
- **Periodic auto-Recover of every unfinished not-running Cursor record.**
  Broader than "sessions the previous runner was holding"; would start agents
  the developer had deliberately left stopped. Rejected for this story; the
  kept-behavior line already excludes it.
- **Drain or dual-runner before replace.** Prior story deferred both: idle
  held sessions can wait indefinitely, and a second live generation breaks
  the one-runner read/attach/stop model. Still rejected; revival after
  single-runner replacement preserves that model.

Simpler existing solution considered: leave plan 334's Recover-only path.
It meets resumability but fails tonight's goal that the developer not recover
each session by hand.

**Borrow (2026-11-05).** Chrome session restore after a browser restart:
tabs that were open are restored, not every bookmark. Mapped roles: the
Cursor runner is the browser process; held unfinished sessions are the open
tabs; launch records are the restore list; replacement is the restart;
Recover keep is reopening one tab. Adapted here as snapshot-held-then-resume
at the replacement boundary. Limit: browser restore does not re-submit the
page's in-flight form; likewise this story resumes the recorded chat and
attempts Recover's continuation, and does not claim a stronger live-turn
preserve across the process kill.

**Challenge (2026-11-05).** The purpose is sessions keep running so the
developer need not Recover each one. Assumption: "running" means a live agent
held by the new runner (dashboard no longer says the agent is not running),
not that every continuation is accepted as Working inside the launch wait.
Strongest doubt: automatic revival could leave held sessions with an
unsubmitted continuation, as tonight's manual Recover did — looking running
yet not progressing. That outcome still beats five "agent is not running"
records, matches this story's evaluation line, and matches Recover's existing
kept-on-timeout contract. Hardening Working-within-wait under concurrent
revival is deferred, not claimed. No goal rewrite.

**Investigation (2026-11-05).**

Facts (with source):

- Stopping the runner SIGTERMs it; shutdown hangs up every held client
  (`dashboard/server/hosts/cursor/runnerProcess.ts`, `runnerMain.ts`).
- Held membership lives only in the runner process; launch records survive on
  disk (`heldSessions.ts` joins runner clients to kept records).
- Replacement for new work is owned by `ensureCurrentCursorRunner`
  (`runnerCurrent.ts`); observation never replaces (`runnerCurrent.ts` header;
  plan 334 rejection constraint).
- Recover resumes through `keepCursorClient`, types a continuation only when
  first input is confirmed, and on launch-wait timeout answers failed while
  keeping the session when keep already held it (`recover.ts`,
  `instructionDelivery.ts`; default wait 30s via `DOUGH_LAUNCH_TIMEOUT_MS`).
- Plan 334 deliberately left replaced held sessions as not-running resumable
  records requiring Recover (SEED-052#cursor-runner-restart-resume key
  example 4).

Hypotheses left for planning/execution, not settled by unpaid observation
here: whether concurrent revival of many sessions needs serialization to stay
within keep behavior; exact hook placement relative to the triggering new
work's keep. Neither changes the selected approach or the promised
evaluation.

**Architecture.**

Consequential system shape only; not an ADR proposal.

- **Responsibility.** Extend the Cursor runner replacement boundary (current
  new-work path in `runnerCurrent.ts` / stop-then-spawn) so that unfinished
  sessions the outgoing runner held are resumed onto the replacement through
  the existing Recover keep path (`recover.ts` / `keepCursorClient`). Do not
  add a second session authority, database, or dual runner.
- **Reuse.** Launch records remain identity; held evidence remains
  machine-local and rebuildable; Recover remains the resume mechanism,
  invoked automatically for the snapshotted set instead of only on
  developer Recover.
- **Accepted decisions.** [ADR 0008 — Project dashboard domain and
  architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  runner and held-session state stay machine-local operational evidence;
  published project records are not the home of live agent presence.
  [ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md):
  deterministic fake-Cursor proof delivers this story; native
  `cursor-agent` revival across a real runner replacement remains pending
  verification and is claimed nowhere here. [ADR 0001 — Ubiquitous
  language](../../docs/adrs/0001-ubiquitous-language-accepted.md) dashboard
  product concepts: Session entry and Running Cursor sessions keep their
  meanings. No conflict with Accepted ADRs. Proposed ADR 0007 / 0009 bind
  nothing here.
- **Quality.** Preserve the one-accepting-runner invariant and the rule that
  observation never starts, replaces, or revives.
