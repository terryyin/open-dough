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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A coordinator finishing a closure is not retired on an ended
observer's receipt while a live observer of its own still runs toward its
budget. Decided by the developer on 2026-10-10 as a later correction of the
closure selection, to be planned once a journey shows the retirement
consequence.

**Scope:**

- When one ended observer covers the final closure beside a live one of the
  same coordinator that does not, `finish` prefers the live observer, as it
  already does beside several ended ones.
- What one ended observer that alone covers the closure may settle when its
  record holds no CI verdict, only a cancelled attempt: today `finish`
  completes on it and may retire. Decide it with the preference above.
- Kept as they are, by the same decision: an observer armed before mailboxes
  recorded their identity is not reached after its worktree is removed; an
  ambient `finish` rerun after retirement uses the caller's one live observer
  of the target; ended observers whose recorded verdicts differ leave the
  `ended` gap.
- When the next paid native run is authorized, the closure assessor gains a
  signal for an absent `--session-json` and one for `notifies`.

**Key examples:**

- A coordinator holds an ended observer that registered the final closure and
  a live one that did not → `finish` → it registers the closure on the live
  observer and completes there, and the worktree is not retired on the ended
  observer's receipt.

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
