# Choose effort when starting a Cursor session

**Identity:** SEED-160#choose-cursor-session-effort
**Source:** [Selected story](../../seeds/SEED-160-choose-cursor-session-effort.md#choose-cursor-session-effort)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer starting a Cursor session from the dashboard can see supported
reasoning-effort choices for the selected Cursor model in the existing start
dialog, choose one, and start a session that applies that choice.

Derive offerings only from the live `cursor-agent models` catalog. Present
Reasoning effort for Cursor when the selected model has listed variants.
Changing model must not silently apply an unsupported effort. An explicit
model+effort pair composes to the matching listed model id and is passed as
`--model` on the first Cursor client, reusing session-scoped model application.
Default (your Cursor setting) still omits `--model` and sends no effort.
Admission may accept `effort` for Cursor under catalog rules; Claude stays
without effort. Do not use bracket `--model` overrides, Codex's
`model_reasoning_effort` config on Cursor, a third Fast control (list fast
variants as distinct effort choices), or Claude / feedback-maintenance effort.

## Existing solution and architectural direction

PFE across the dashboard launch path found one coherent ownership split:

- **Reuse** Codex's dual-control dialog, shared `effort` request field,
  `launchEfforts` / `effortBlocked`, and catalog-shaped `LaunchHostOptions`
  (`LaunchReasoningEffort.tsx`, `launchEffort.ts`, `launchHostOptions.ts`,
  Codex `options.ts` / dialog cases). That is the developer-facing Model +
  Reasoning effort mechanism already in the product.
- **Change** Cursor's host boundary where the gap lives: today
  `hosts/cursor/options.ts` flattens every listed id with `efforts: []`,
  `LaunchHostModel` shows effort only for `host === "codex"`, and
  `launchSettingsAdmission` refuses `effort` unless the host is Codex.
  Cursor launch already applies a chosen id as `--model` only
  (`hosts/cursor/launch.ts`); composition belongs there (or beside options),
  not as a second native transport.
- Do **not** invent a parallel Cursor effort API, bracket overrides, or a
  separate Fast picker. No North Star topic is warranted: ADR 0008 already
  keeps native catalog and startup behind each `LaunchHost`.

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(dashboard observes; host boundary owns native options/startup) and the
[Dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md)
launch-dialog reading order. Update maintained launch docs
(`AGENT-LAUNCH-HOSTS.md` Cursor model paragraph) with the effort behavior.
No Accepted ADR conflict.

## Observed premises and proof limits

Preparation inspected revision
`3c88bd9493022a479a629590c15db21a815502bf` in
`/Users/terryyin/git/open-dough/.worktrees/choose-effort-when-starting-a-cursor-session`.

- Live `cursorOptions(AbortSignal)` in that checkout returned 270 models, every
  one with `efforts: []`, including listed effort-suffixed ids such as
  `claude-opus-5-5-high` and bare `gpt-5.2`. Consuming operation: Cursor
  options reader used by the start dialog catalog.
- Installed CLI `agent --list-models` / `agent models` (`2026.10.22-27dcf5f`)
  lists effort inside model ids. Stripping a trailing
  `-(none|minimal|low|medium|high|xhigh|max)` and optional `-fast`, while
  keeping `-thinking` in the base id, reconstructed every listed slug with
  zero mismatches on that listing. Consuming operation: catalog projection /
  composition for `--model`.
- `LaunchHostModel` gates `LaunchReasoningEffort` on `host === "codex"`;
  `launchSettingsAdmission` throws when `request.effort` is set and host is
  not `codex`. Cursor launch passes `request.model` unchanged as `--model`.
- Existing proof routes to extend: `dashboard/tests/agent-launch-cursor-model.spec.ts`
  (listed model → `--model`, Default omits it) and Codex effort dialog /
  boundary cases (`codexEffortDialogCases.ts`, `codexEffortBoundaryCases.ts`)
  for dual-control interaction and admission. Fake Cursor
  (`tests/support/fakeCursor.ts` / `cursorModels`) must gain multi-effort
  listings for discriminating dialog and argv proof.
- Bracket `--model` effort syntax is not a launch mechanism for this story
  (CLI help still mentions it; product direction and forum guidance treat it
  as unsupported). Do not plan proof around it.

No outstanding infrastructure premise or human-owned decision blocks this plan.
Exact effort-key spelling (for example `high` vs `high-fast`, and how the bare
listed id appears as a choice) is an implementation choice inside the slice so
long as every offered pair maps 1:1 to a listed id and unsupported pairs cannot
start.

## Outside-in proof

All promises map to slice 1. Prefer the existing Cursor Playwright launch
fixture and fake `cursor-agent models` listing; retain setup, commands,
observations and limits in accepted proof at execution.

| Promise | Observable proof in slice 1 |
| --- | --- |
| Effort choices for a multi-effort Cursor model | Fake listing with a base that has several effort (and optional fast) variants: with Host Cursor and that model selected, Reasoning effort lists those choices (not the flat full-id Model dump for that family). |
| Start applies composed listed `--model` | Selecting model+effort and starting: first terminal client argv includes `--model <exact-listed-id>`; launch record retains the requested model/effort pair consistently with other hosts. |
| Model change refuses silent unsupported effort | After selecting an effort, switch to a model that does not list it: Start stays blocked and/or effort is marked invalid / cleared per existing Codex-style feedback; no launch with a non-listed composition. |
| Default omits overrides | Model Default: no Reasoning effort override required; startup omits `--model` as today's Default proofs require. |
| Bare / single-id model | A listed id with no separable variants: no effort control (or empty only); Start sends that exact id as `--model`. |
| Preserve Codex and Cursor model regressions | Focused Cursor model specs and Codex effort specs stay green for unchanged Codex behavior and Default Cursor launches. |

## Ordered slices

### 1. Choose Cursor reasoning effort at session start
Type: Behavior
Status: done
Proof: Accepted. Focused Playwright
`npm run test:dashboard -- dashboard/tests/agent-launch-cursor-model.spec.ts dashboard/tests/agent-launch-codex-model.spec.ts dashboard/tests/boundary/agent-launch-codex-model-boundary.spec.ts --reporter=line`
→ 36 passed (dialog cases in `cursorEffortDialogCases.ts`; Codex regressions green).
Live `cursor-agent models` in this checkout: 270 listed → 57 projected,
composition mismatch 0, unreachable 0. Source review commitments 1–12 and
E1–E7 observed in `source-review.md`.

Behavior: Developer opens a Cursor start dialog whose model catalog is
readable → selects a Cursor model that has listed effort variants and a
supported effort (including fast variants as distinct choices when listed) →
Start creates the session with `--model` set to the matching listed id;
switching to a model that does not support the prior effort prevents a silent
unsupported launch; Default sends no model/effort override; a model without
separable variants starts with its exact listed id.

Implementation notes (not separate slices): project Cursor options into base
models with per-model `efforts` derived only from listed ids; show
`LaunchReasoningEffort` for Cursor with Cursor-specific empty/default copy;
open admission for Cursor `effort` with catalog checks; compose at Cursor
launch; extend fakes and Playwright/boundary coverage; update
`AGENT-LAUNCH-HOSTS.md` Cursor catalog wording. Reuse Codex dialog patterns;
do not send `model_reasoning_effort` on Cursor.

## Concern evidence

- Slice-plan refinement: not needed — one Behavior owns the whole outside-in
  outcome; catalog projection is hidden preparation for that Behavior, not an
  independent Structure slice; no cumulative special-case design beyond
  deriving offerings from listed ids.
- Remaining slice-specific concerns: none identified.

## Learnings (execution)

- Effort is encoded in listed Cursor model ids; project by stripping
  `-(none|minimal|low|medium|high|xhigh|max)(-fast)?` or trailing `-fast`,
  keeping `-thinking` in the base; compose base+effort back to the listed id.
- Shared `effortBlocked` is the single validity rule for dialog Start blocking
  and launch admission (Cursor and Codex).
- Feedback-maintenance stays Codex-only for effort (`effortHosts=["codex"]`)
  until deferred FM Cursor effort lands.

## Execution complete

Product advice: no change
