# Native auto-land observations

Source: [plan 301](PLAN.md), slices 1–3; the [preflight](PREFLIGHT.md) records
shared project, deployment, installation and execution setup. Each observation
below retains its original judged outcome.

## 1. Claude Code

Observed 2026-10-13, one attempt, fresh evidence. Terry authorized the agent
to operate the paid session; the agent drove the running dashboard with
headless Chromium and typed into its embedded terminal. Claude Code 2.1.296,
Opus 5.5 (dashboard default model), dashboard deployment `e40d6854c99b`,
installed release `0.3.60`, Lizard at `0128281`, launch
`68dc053f-1d37-4dc6-a018-e42c63a301dc`, native session
`8ced2fa3-4c01-41d3-89e4-1fcbc4e3a824`, fixture `SEED-001#exit-code-wording`.

| Expectation | Observed | Result |
| --- | --- | --- |
| Line beside Start names the push | “Isolated workspace · Automatically land — The session runs in a new workspace under .worktrees/; verified results land on origin without another review. Pressing Start authorizes that push.” | pass |
| One worktree on the host branch, session opens there, sidebar names it | `git worktree list` gained only `.worktrees/session` on `claude/session` at `0128281`; transcript `cwd` and the Claude banner show that path; the session entry reads “Workspace ~/git/lizard/.worktrees/session” | pass |
| First input is the block, then reporting context with `--landing-context` | `workspace role: isolated`, `landing: auto-land`, `startingRevision: 0128281…`, no `fetched`; reporting context names the launch's `landing-context.json` | pass |
| No initial publication or claim | `origin/master` still `0128281`, no remote `claude/*` branch, backlog unchanged; the session answered that nothing was claimed, changed or landed | pass |
| A question is answered only | “Which file holds the Python language reader?” → answer naming `lizard_languages/python.py`; worktree clean at `0128281`, remote unchanged | pass |
| One-shot start reuses the workspace | Input `/dough-execute-plan SEED-001#exit-code-wording --one-shot`. The agent's start call added `--auto-land --push-authorized` from the block and answered `{"ok":true,"status":"prepared","startingRevision":"0128281…","created":false,"maintenance":{"result":"deferred","reason":"pending-edit"},"landing":"auto-land"}`; no second worktree | pass |
| Verified result lands with no landing request; story closes in it | Full suite 1545 passed; `deliver … --tracking one-shot --one-shot-identity` accepted `8cf5eed` on `refs/heads/master`; that commit removes the backlog entry and seed section and adds the done record; GitHub run 38392706985 succeeded | pass |
| Original launch captures the landing with no identity | Launch record `landing`: base `0128281`, revision `8cf5eed`, reference `68dc053f…`, no identity field | pass |
| Worktree retires | `worktree-retirement.mjs retire … --identity 'SEED-001#exit-code-wording'` answered `ok: false`, “reused, host-owned, or unrecorded workspace, not created for this work”. `.worktrees/session` and `claude/session` remain at `8cf5eed` | **fail** |

Discrepancy: the dashboard's identity-free start writes no creation record for
the session worktree, the invoked start reports `created: false`, and the
retirement reference allows `--created-for-work` only from a `created: true`
record or a caller statement. Released `established-session.md` calls the
isolated workspace “an owned worktree, retired once trunk contains its work”
but does not connect that to the retirement command's ownership fact, so the
agent followed the retirement reference and kept the worktree. The cause is in
shared guidance and scripts, not Claude Code, so slices 2–4 would meet the same
refusal; slice 5 retires nothing. A bounded correction and a release carrying
it must precede re-observing retirement.

Incidental observations outside this story's promises, recorded for triage:

- Lizard does not ignore `.worktrees/`, so its default checkout shows
  `?? .worktrees/` after an isolated Start; the start deferred default-checkout
  refresh as `pending-edit`, leaving `master` one commit behind. In slice 5 a
  one-shot `git add -A` in that checkout would stage the leftover worktree.
- The agent's first start call used `--trunk master` and was refused with
  `missing target`; it found `--target` in the usage text and retried.
- The CI observer looked for `ci.yml`; Lizard's workflow is `python-app.yml`,
  so the completion receipt was `observation_unavailable` and the agent read
  the run with `gh` instead.

## 2. Codex

Observed 2026-10-13, one attempt, fresh evidence, operated by the agent on Terry's authorization as in slice 1; same dashboard deployment and installed release. codex-cli
0.162.1, `gpt-6.1-sol` (dashboard default), launch
`3226e1cf-15aa-4d2d-ac30-0c039fd12bb8`, native session
`01a13526-32e3-7f53-9f59-d542e165ec49`, fixture
`SEED-001#python3-module-example`. Lizard trunk was `e9897f8` (Terry's
`.worktrees/` ignore).

- Workspace and block: `.worktrees/session` was still held by slice 1, so the
  one new worktree was `.worktrees/session-2` on `codex/session-2`; rollout
  `cwd` and the Codex status line show it; first input is the block
  (`isolated`, `auto-land`, `startingRevision: e9897f8…`, no `fetched`) with the
  reporting context. Origin unchanged. Pass.
- Question: answered with `lizard_languages/python.py`; worktree clean, origin
  unchanged. Pass.
- `$dough-execute-plan SEED-001#python3-module-example --one-shot`: start
  answered `prepared`, `created: false`, `maintenance: already current`,
  `landing: auto-land`; `deliver` accepted `5298a22` on `refs/heads/master`
  with the story closure in the same commit; launch record `landing` holds
  base `e9897f8`, revision `5298a22`, no identity. Pass.
- Retirement: Codex called `worktree-retirement.mjs retire … --identity …
  --created-for-work --contained 5298a22…`; worktree and `codex/session-2`
  are gone. Pass, by reading the block as the created-for-work fact, the
  opposite of Claude Code's reading in slice 1.
- Completion reported `completed` with an empty message.

## 3. Cursor

Observed 2026-10-13, one attempt, fresh evidence, operated by the agent on Terry's authorization as in slice 1; same dashboard deployment and installed release. Cursor agent
2026.10.01-e373342, model Auto (dashboard default), launch
`2d5ab090-e36e-4f52-afd9-24363e66c8c7`, chat
`2787e58b-228e-4e60-96e2-b7ccfcf51cee`, fixture `SEED-001#dead-travis-badge`.

- Workspace: one new worktree `.worktrees/session-2` on `cursor/session-2` at
  `5298a22` (the name Codex had retired). Pass.
- First input: **fail at launch.** The launch settled `uncertain`,
  `timed-out`: “Cursor did not show it took the instruction in time”, with
  Startup recovery offering Recheck and Continue session start and the entry
  reading “First input acceptance uncertain”. The embedded terminal joined
  with only a readiness frame and a blank screen. Opening the same chat in a
  private pty showed Cursor's “Workspace Trust Required” prompt for the new
  worktree path. After the agent pressed `a` in the dashboard terminal, the
  runner wrote the block, the record's first input became `confirmed`, and the
  transcript's first query is the block (`isolated`, `auto-land`,
  `startingRevision: 5298a22…`, no `fetched`) with the reporting context.
- Question: answered with `lizard_languages/python.py`; nothing changed. Pass.
- `/dough-execute-plan SEED-001#dead-travis-badge --one-shot`: start called
  with `--one-shot --auto-land --push-authorized` for the established
  workspace; `deliver` accepted `3bb9105` on `refs/heads/master` with the
  closure; launch record `landing` holds base `5298a22`, revision `3bb9105`,
  no identity. Pass.
- Retirement: **fail.** Called with `--identity` and `--contained` but without
  `--created-for-work`; Cursor reported “Worktree: preserved (`created: false`
  / host-owned established session workspace)”. `.worktrees/session-2` and
  `cursor/session-2` remain at `3bb9105`.
- Cursor sent no dashboard completion report; the launch record has no
  `completion`.

Discrepancies: the retirement one is slice 1's. The trust one is new: every
isolated Start gives Cursor a directory it has not trusted, the dashboard
passes no trust flag by design, and neither its answer nor its terminal showed
the developer the prompt that blocked delivery.

## Cursor trust correction re-observation

Correction re-observation, 2026-10-14: plan 305's native trust journey passed.
Dashboard candidate `0c6e4066f1e5d48c3675b0d50ef428eca62520c6`, isolated loopback
preview/runner; Lizard clean at `34c50f0d`, tagged `0.3.61` fully compared
(251 files per installed root, zero mismatches), Cursor `2026.10.12-d47ca18`,
Auto. One authorized initial Start session · Isolated workspace · Automatically
land, instruction “Tell me the current working directory. Make no changes.”
Launch `f6c25d01-b137-4c6b-94bc-c1634c6f7425`, chat
`d1264523-ee3c-4600-ab6e-58ef4add70f6`, workspace
`/Users/terryyin/git/lizard/.worktrees/tell-me-the-current-working-directory-make-no-ch`.
CUA observed trust-specific wording in the launch answer, Startup recovery and
entry; the first terminal join showed the actual trust prompt/path and choices
before an answer. Terminal `a` delivered the retained input: confirmed record,
entry “First input accepted”, native one-query prompt_history/pasted_text exactly
matched the 2,485-character Established session block/reporting context/question.
Native `pwd` returned that workspace; one chat/client, clean unchanged worktree.
Trust discrepancy resolved by this fresh evidence. Judged proof and owned
cleanup are recoverable at `4bd36244a6eb0d9227500b488d19dd58aec202b6:.planning/slice-plans/305-cursor-trust-prompt-at-session-start/PLAN.md`. This question-only journey does not re-prove execution,
landing, retirement, or Cursor's missing completion report; their ownership and
this slice's unfinished status remain as above.
