# State Cursor attach in the host guide

**Identity:** SEED-052#cursor-host-guide-attach
**Source:** [correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-host-guide-attach).

## Correction input

- **Source execution:** SEED-052#use-cursor-from-dashboard, plan
  [210](https://github.com/terryyin/open-dough/blob/317d0f1c24fdf3cb7b89960d11c7b259bf862b08/.planning/slice-plans/210-use-cursor-from-dashboard/PLAN.md). Provenance commits, oldest
  first: `0ae15498` (Take, not product behavior), `71764841`, `2f21a7be`,
  `8feab5ef`, `91a79050`, `3e5c10d8`, `4541eda4`.
- **Current finding:** `dashboard/AGENT-LAUNCH-HOSTS.md` says Cursor supplies
  no attach, so those controls stay absent. `cursorHost` supplies `attach`
  and does not supply `stop`. The sessions spec expects Open terminal,
  `{ attach: true, stop: false }`, and no Mark as done.
- **Preserved behavior:** Cursor launch, the stored resume command, the
  ready frame `Add a follow-up`, unknown activity wording, and the absence
  of stop, rename, and borrowed Claude or Codex commands stay as delivered.
  Accepted [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  still keeps an unsupported operation unavailable. No North Star change.
- **Outcome:** The existing host guide is the one description of this
  boundary. Change that paragraph. Do not add a second document or a
  cursor branch in shared code.

## Goal and scope

A maintainer reading `dashboard/AGENT-LAUNCH-HOSTS.md` learns that Cursor
supplies embedded attach and does not supply stop.

Correct only that Cursor paragraph. Leave Claude Code, Codex, launch
behavior, the terminal ready check, and the next story's activity, rename,
and model work unchanged.

## Observed premises

Observed in this checkout on 2026-10-02 at `4541eda4`.

- `dashboard/AGENT-LAUNCH-HOSTS.md` lines 12–15 say Cursor supplies no
  attach or stop, so those controls stay absent. The slice replaces that
  claim.
- `dashboard/server/cursorHost.ts` sets `attach` to `attachCursor` and does
  not define `stop` or `rename`.
- `dashboard/server/hosts/cursor/terminal.ts` admits a visible cursor when
  the screen includes `Add a follow-up`.
- `dashboard/tests/agent-session-cursor.spec.ts` expects
  `hostOperations.cursor` `{ attach: true, stop: false }`, one Open terminal
  button, and no Mark as done button.

## Ordered slices

### 1. State Cursor attach in the host guide
Type: Behavior
Status: done
Proof: The Cursor paragraph in `dashboard/AGENT-LAUNCH-HOSTS.md` says attach
is supplied, names `Add a follow-up` as the text that admits the terminal,
and says stop is absent. Production modules are unchanged, so
`dashboard/tests/agent-session-cursor.spec.ts` is not rerun.

Behavior: A maintainer opens the host guide. The Cursor paragraph still
describes `create-chat`, then `cursor-agent --workspace` and `--resume`,
with the stored id, workspace, and resume command and no alias or endpoint.
It says the embedded terminal runs that stored command and that a visible
cursor plus `Add a follow-up` admits it. It says stop is not supplied, so
Mark as done stays absent. It does not say attach is absent.

Safe stopping point: the guide matches the delivered host.

Accepted proof: `dashboard/AGENT-LAUNCH-HOSTS.md` lines 16–18 now open with
"Attach is supplied: the embedded terminal runs that stored command", keep
`Add a follow-up` as the admitting text, and keep "Stop is not supplied, so
Mark as done stays absent". Inspected against `dashboard/server/cursorHost.ts`
line 14 (`attach: attachCursor`, no `stop` or `rename`) and
`dashboard/server/hosts/cursor/terminal.ts` line 30. `git diff --check`
passes; the refactor pass made no edits.

Learning: wrap-up commit `317d0f1c` had already removed the "supplies no
attach" claim and added the terminal and stop sentences before this
execution, so the slice only made the attach statement explicit.
`dashboard/AGENT-LAUNCH-TERMINALS.md` lines 9–12 still repeat the Cursor
ready text and missing stop; both are correct and that file stays out of
scope.

## Execution state

- Mode: Story Branch Mode, branch
  `cursor/state-that-cursor-supplies-embedded-attach`, workspace
  `.worktrees/state-that-cursor-supplies-embedded-attach`, target
  `origin/main`.
- Claim: `3a68f0c7` published on `origin/main` (starting revision
  `00800bc2`). Readiness was reported as changed since review.

## Verification

No numeric slice target or hard limit was supplied. This slice changes one
paragraph of maintained documentation and no production code. `git diff
--check` applies. Hosted CI is not an extra local gate for this paragraph.
