---
id: SEED-210
status: active
planted: 2026-11-01
---

# Confirm a broken base before starting execution

<a id="confirm-broken-base-before-start"></a>

### Confirm a broken base before starting plan execution

**Identity:** SEED-210#confirm-broken-base-before-start
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/435-confirm-broken-base-before-start/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5eaa8e55f598762612aa13e32a09eb13f2032a6b5e1342b75a89a4c5d799977b","plan":"1dcb4d05328f06021bf3fd46a302c3c3573401f8563b464b7281d28f1de52ad9"}}
```

**Beneficiary:** A developer starting a story's execution from the Open Dough
dashboard.

**Goal:** Do not silently start new work on a broken build. Before the
dashboard runs the execution start (which publishes the Take and creates the
workspace and branch), it judges the CI state of the origin target the work
will start from. When that state is not a pass, the developer sees what was
found and confirms whether to start anyway; Back starts nothing. This keeps a
red trunk from quietly accumulating new work on top of it, while still letting
the developer start the work that fixes it.

**Scope:**

- Every dashboard story execution start that runs the start script: Standard
  and One-shot, Isolated workspace and Default main. Refinement starts, the
  project row's Start session, and resuming a kept or established start
  (Continue, Startup recovery, kept-start Start) are not asked.
- The base's CI state is the newest result of the project's selected CI check
  in the origin target's history: the target's head revision when it has a
  result of its own, otherwise its nearest ancestor that has one. Trunk heads
  are usually planning-only commits that CI never runs (observed below), so the
  head's own result alone would almost never exist. The check is the one
  execution's CI observer selects from `.planning/open-dough.json`: GitHub
  Actions (`ciWorkflow`, default `ci.yml`, push runs) or the project's
  `ciAdapter` command's `discover` attempts. Of that revision's attempts the
  newest decides.
- A pass starts exactly as today, with no extra step. Every other state asks
  first, named truthfully: failed (including cancelled or timed out), still
  running or queued, or could not be read (no result in the readable history,
  provider or adapter failure, rate limit, or the read's time bound). Nothing
  waits for a running check to finish.
- The question names the target branch, the judged revision (short SHA and
  subject), how many later commits have no result of their own when it is not
  the head, the state, and the run or attempt reference when the provider gives
  one. Back returns to the dialog's choices with text and images as they were
  and starts nothing: no Take, assignment, workspace, branch, or start record.
  Continuing sends the same start naming the judged revision and state it
  confirmed; when the boundary now judges a different revision or state, it
  asks again instead of starting, and a pass starts without asking.
- Customized CI is in scope: assessment during refinement showed the existing
  adapter `discover` operation already answers attempts by revision and outcome
  (see Investigation), so Pygardon's base is judged the same way and no
  follow-up story is needed.

**Scope limits:**

- No waiting for, retrying, or diagnosing CI from the dashboard; no persistent
  trunk-CI badge on the board; no kept record of a confirmation.
- No check in the start script itself, so agent-invoked starts outside the
  dashboard are unchanged.
- Trunk moving between the confirmed judgment and the start script's own fetch
  is not re-checked beyond the boundary's comparison at Continue.

**Key examples:**

- Open Dough, origin `main` at a planning-only head whose nearest result is a
  push run of `ci.yml` that succeeded four commits earlier → Start proceeds
  straight to the execution start, with no question.
- Pygardon, origin `main` at a Take commit with no attempt of its own, nearest
  `pygardon-ci` attempt failed → nothing starts; the dialog asks "Base CI
  failed" naming `main`, that revision and attempt, and that one later commit
  has no result. Back leaves no Take, workspace, or branch; Continue on failing
  base starts normally.
- Nearest result still running → the dialog says the base's CI is still
  running and asks the same way; it does not wait.
- Adapter service unreachable, or GitHub rate-limited → the dialog says the
  base's CI could not be read and why, and asks; it never shows a pass.
- Developer confirmed a failure at revision X; before Continue a fix landed
  and its run passed → Continue starts without asking. Had a new failure at Y
  appeared instead, it asks again naming Y.
- A kept start resumed from Startup recovery → no CI question; its Take is
  already published.

**UI:** The question follows the dialog's Existing changes pattern: it replaces
the choices, its heading takes the keyboard, Back (or Escape) returns to the
choices as they were, and the continue action names what it does ("Continue on
failing base", "Continue while CI runs", "Continue without CI result"). While
the boundary judges the base, Start shows that it is checking the base's CI.

**Architecture:** The dashboard boundary gains a pre-start judgment of trunk CI.
It observes CI evidence without owning it, as
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
directs, and keeps nothing beyond the request (no server database). Provider
selection, GitHub run reading, and adapter discovery reuse the `dough-execute-plan` CI
observer's source modules (CI selection, `askGitHub` through this
user's shared GitHub request owner, command-adapter discovery) rather than a
dashboard copy, as the dashboard already imports the shared session policy from
source.
An adapter project's command runs from the project folder the start already
uses as its integration checkout, so its availability and service access stay
project-owned; a failure is "could not be read".

**Investigation (2026-11-01):**

- Fact (`gh run list -R terryyin/open-dough -b main -w ci.yml`): origin `main`
  `3d189f2` has no run; the newest, `62defee`, succeeded four planning-only
  commits earlier. `ci.yml` ignores `.planning/**` and `docs/**` pushes.
- Fact (Pygardon adapter `discover` for `main`, 108 attempts): origin `main`
  `e72b32b` (a Take) has no attempt; its parent `83a41a1` failed, as did the two
  previous checked revisions. Attempts carry `sha`, `outcome`, `time`, and
  `branch`.
- Hypothesis left to planning: a bounded history walk finds the nearest checked
  ancestor within the provider's readable listing for ordinary trunks.
