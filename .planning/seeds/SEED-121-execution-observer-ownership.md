---
id: SEED-121
status: active
planted: 2026-10-08
planted_during: Terry's report of a trunk repair registering with another worktree's CI observer
trigger_when: Concurrent execution sessions observe the same repository and trunk branch
scope: story
---

# SEED-121: Execution delivery retains its CI observer owner

## Why This Matters

An agent publishing a Trunk Mode increment needs CI coverage and completion
through its own execution observer. Concurrent sessions share the repository
and target branch; attaching a revision to another session can leave the
publisher's completion gate without coverage and send CI events to the wrong
owner.

## Story

<a id="finish-prefers-live-observer"></a>

### Finish prefers its coordinator's live observer over an ended one

**Identity:** SEED-121#finish-prefers-live-observer
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/295-finish-prefers-live-observer/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"35b86d57b5c31085c4afa0821bb9c873c2a47b60c696cad4dc8fb56afbd8c875","plan":"16fdac0874a5b60d422bb190bee0a0962fa4171790c316262fc11f9df738ee33"}}
```

**Goal:** A coordinator whose `finish` holds a live observer of its own
completes the final closure on that observer and stops it before retiring the
worktree, instead of retiring on an ended observer's record while the live
observer runs on to its budget. Decided by the developer on 2026-10-10 as a
correction of the closure selection the recovery-holds correction left, to be
planned once a journey shows the retirement consequence. The developer's
interest is the coverage ADR 0005 promises: the closure is observed by the
observer that is actually running, and retirement leaves no observer of this
coordinator behind.

**Scope:**

Required behavior:

- Whenever the coordinator holds one live observer of the target, `finish`
  registers the accepted final closure on it when it lacks it, completes the
  closure there, and retires only on that receipt, whether or not an ended
  observer of the same coordinator already registered the closure. An ended
  observer's record settles nothing while a live one exists. This is the
  preference `finish` already applies beside several ended observers, now
  applied beside one.
- When none of the coordinator's observers is live, one ended observer that
  registered the closure settles it under the rule several already follow:
  `finish` repeats completion on it only when its record holds a CI verdict for
  the closure. A record that holds only a cancelled attempt identifies no
  observer, alone as among several; `finish` then reports `step: "observation"`
  with `ownership: "ended"` and the existing recovery, the next `deliver` from
  the execution worktree establishing the coordinator's own observer, or lost
  coverage once that worktree is gone. Today `finish` completes on that record
  and may retire. The developer asked on 2026-10-10 that this be decided with
  the preference above, since both ask what a sole ended observer may settle.
- The guidance states the rule as `finish` applies it: the `step: "observation"`
  row and the rerun paragraph of
  [wrap-up closure publication](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md)
  name the live observer first and the ended one only by its recorded verdict.

Kept as they are, by the developer's decisions of 2026-10-10:

- an observer armed before mailboxes recorded their identity is not reached
  after its worktree is removed;
- an ambient `finish` rerun after retirement uses the caller's one live
  observer of the target, as its test pins;
- ended observers whose recorded verdicts differ leave the `ended` gap;
- several live observers of one coordinator stay `ambiguous`; another
  coordinator's observer is never registered on, completed, or stopped; owner
  evidence filters observers before coverage or liveness is read.

Deferred, not committed by this delivery:

- No new record field, owner model, CLI flag, or change to the observer
  `deliver` and `resume` select.
- The closure assessor's signals for an absent `--session-json` and for
  `notifies`: they are observed only by a paid native run, so they stay listed
  under Pending native evidence for the run that is next authorized.

Boundary assumption for planning: before the correction is planned, a journey
through the installed `finish` in the closure owner suites shows today's
consequence, the first key example below as it fails now: the worktree is
retired on the ended observer's record and the coordinator's live observer
stays live. That journey becomes the correction's failing-first test.

**Key examples:**

- The coordinator's observer that registered the final closure ended with a
  recorded `success`; a later `deliver` established a live observer of the same
  coordinator that never registered the closure → `finish` → the closure is
  registered on the live observer, completed there with CI's verdict, and that
  observer's shutdown is confirmed before the worktree is removed; the ended
  observer's record is untouched, and no observer of this coordinator is left
  running.
- The same, with the ended observer's record holding only a cancelled attempt
  → `finish` → the same result: the live observer decides, the ended record is
  not consulted.
- No observer of the coordinator is live, and the one that registered the
  closure recorded `success` before it ended → `finish`, or its rerun from the
  management context after retirement → completion is repeated on that
  observer, as today.
- No observer of the coordinator is live, the one that registered the closure
  holds only a cancelled attempt, and the execution worktree exists → `finish`
  → `step: "observation"`, `ownership: "ended"`, a reason naming that observer
  and the `deliver` step; the worktree, branch, and both closure commits stay.
  After that `deliver` establishes a new observer, the rerun completes on it
  and retires, as the several-ended journey already shows.
- A sibling coordinator's live observer of the same target is present in every
  example → it is never registered on, completed, or stopped.

**Pending native evidence:**

Carried from the delivered ownership story and its corrections under ADR 0005.
No native run exists for any of these; substitute and replay results are not
native acceptance, and each run is paid and needs the developer's
authorization.

- Cursor and Claude Code: concurrent `deliver`, repair, and completion with the
  ambient session identity; `resume` and `finish` with ambient identity or
  `--session-json`.
- Codex: arm the documented cell with `COORDINATOR` set, confirm
  `<directory>/owner` after the first yielded output, run `deliver` with
  `--coordinator` and `--observer-directory`, and expect
  `observation.state: "reused"` on that directory; repeat with a second
  coordinator's stream live on the same target. Then `resume` and `finish` with
  the same inputs.
- Claude Code subagent coordinator: whether its Bash tool carries its parent's
  `CLAUDE_CODE_SESSION_ID` and whether it can state its own `agent_id` are
  unobserved. On the developer's decision of 2026-10-10 the guidance and
  receipt state only that the variable names the session alone and that an
  observer claimed with an `agent_id` is named by `--session-json` with both.
- Trunk-closure harness, every case
  `tests/git-publication-native.sh --native HOST --case trunk-closure/...`
  after its arming change: on Claude Code and Cursor one `finish` without
  `--session-json` whose receipt's `notifies` names the tool's variable; on
  Codex one `finish` carrying the note's coordinator and stream directory with
  `observation.state: "reused"`. `tests/native-publication.md` records the
  commands.
- Retained trunk-closure and git-publication evidence identities changed with
  the hashed modules.
- When that run is authorized, the closure assessor gains a signal for an
  absent `--session-json` and one for `notifies`, as the developer accepted on
  2026-10-10.
- The fixture stop in `tests/support/native-harness-observation.sh` reads the
  recorded identity; that file is hashed into the story-branch-closure
  evidence identity as well as the trunk-closure and git-publication ones.

## Breadcrumbs

- Terry's reported misregistration and explicit request to queue confirmed
  work first, commit on main, and sync with origin, 2026-10-08.
- [Managed observation](../../src/skills/dough-execute-plan/scripts/execution-increment-observation.mjs).
- [Mailbox matching](../../src/skills/dough-execute-plan/scripts/ci-mailbox-match.mjs).
- [Mailbox location and access](../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs).
- [Managed delivery](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs).
- [Resume ownership coverage](../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs).
