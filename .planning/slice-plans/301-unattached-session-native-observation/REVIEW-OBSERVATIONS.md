# Native review observations

Source: [plan 301](PLAN.md), slices 4–5; the [preflight](PREFLIGHT.md) records
shared setup. Agent operation was authorized as recorded in the
[first auto-land observation](AUTO-LAND-OBSERVATIONS.md#1-claude-code).

## 4. Isolated review and explicit landing

Observed 2026-10-13, one attempt, fresh evidence, operated by the agent on Terry's authorization as in slice 1; same dashboard deployment and installed release. Claude Code
2.1.296, Opus 5.5, launch `9d835c6c-66fd-4025-8d3e-7b0c415682ea`, native
session `d1771efe-162c-481a-8f9e-5c9b07aa4d7f`, fixture
`SEED-001#research-section-wording`.

- Before review: line beside Start “Isolated workspace · Wait for review — …
  nothing is published.”; one new worktree `.worktrees/session-3` on
  `claude/session-3`; block with `landing: review`. Input
  `/dough-execute-plan SEED-001#research-section-wording --one-shot`; start
  called with `--one-shot` and no landing or push flag, answered `prepared`,
  `created: false`. Result `9770c4b` committed locally with the backlog entry
  and seed section removed and the done record added; `origin/master` stayed
  `3bb9105` and still listed the story; no remote `claude/*` branch; worktree
  kept. The session reported the result and how to land it. Pass.
- After `/dough-land` in the same conversation: `deliver … --validated-candidate
  9770c4b… --one-shot-identity … --landing-context <launch 9d835c6c>` accepted
  exactly `9770c4b` on `refs/heads/master`; launch record `landing` holds base
  `3bb9105`, revision `9770c4b`, no identity; retirement answered `removed`
  for worktree and branch; default checkout fast-forwarded. Pass.

## 5. Default-main refinement

Observed 2026-10-13, one attempt, fresh evidence, operated by the agent on Terry's authorization as in slice 1; same dashboard deployment and installed release. Claude Code
2.1.296, Opus 5.5, launch `38bcddaa-42d4-488b-b242-12871b6f62de`, native
session `0d0021eb-d69c-40b9-a4c4-cceb1c9701a7`, fixture
`SEED-001#verified-python-versions`. The agent created the untracked
`observation-scratch-note.txt` in `/Users/terryyin/git/lizard` and typed “I
want to look at the Python version story next.”

- Warning: Start answered `existing-changes` and showed “Existing changes in
  default main … 1 changed path observation-scratch-note.txt … Wait for review
  remains selected.” with Back and Continue with existing changes. Pass.
- Back: the dialog returned with the text intact. Pass.
- Continue: session opened in `~/git/lizard`; first input is the text and the
  reporting context, with no Established session block and no landing context
  claim of a session; the file was untouched and the checkout still at
  `9770c4b`. The session answered the text with questions and wrote nothing.
  Pass.
- `/dough-story-refinement SEED-001#verified-python-versions --one-shot
  --default-main`: start answered `prepared`, `role: default-checkout`,
  `created: false`, `fetched: 9770c4b…`. Commit `ea7fae3` on local `master`
  holds the refined seed and the scratch file together. `origin/master` stayed
  `9770c4b`; no Preparing or Taken entry, no agent profile, no worktree, no
  retirement. Pass.

Retained for Terry's disposition: `ea7fae3` on Lizard's local `master`, one
commit ahead of `origin/master`. The refinement recorded two decisions as open
questions and assessed the story not-ready.

