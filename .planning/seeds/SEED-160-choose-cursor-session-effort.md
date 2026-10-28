---
id: SEED-160
status: active
planted: 2026-10-28
planted_during: Maintainer report of missing Cursor effort selection
trigger_when: Starting a Cursor session from the dashboard
scope: small
---

# SEED-160: Choose effort when starting a Cursor session

## Why This Matters

Terry reported that the dashboard's Cursor start dialog has no option to choose
effort. Developers starting a Cursor session need to see the available effort
choices in that dialog and select the effort for their work before starting.

## Alternatives and Decision

Cursor's installed `agent models` / `cursor-agent models` list already exposes
reasoning effort inside each model id (for example `claude-opus-5-5-high`), and
startup applies a chosen id only as `--model <id>`. There is no separate native
`--effort` flag. The dashboard today flattens that list into Model and hard-codes
`efforts: []`, and launch admission refuses `effort` for any host other than
Codex.

Credible directions compared against the same goal (see and choose a supported
effort, then start with it applied):

1. **Keep the flat Model list** — simplest existing path. Effort remains buried
   among hundreds of ids; it does not meet the reported need.
2. **Codex-shaped Model + Reasoning effort, compose to a listed slug** —
   borrow Codex's dual control and catalog-constrained effort list; derive base
   model and efforts only from ids Cursor actually listed; launch with
   `--model <composed-listed-id>`. Matches the dialog mental model developers
   already use for Codex, without inventing a Cursor effort API.
3. **Bracket overrides on `--model`** (`model[effort=…]`) — Cursor help still
   mentions them, but current CLI behavior and Cursor forum guidance treat that
   syntax as unsupported. Rejected for this story.

**Recommended:** direction 2. Treat each borrowed Codex mechanism as one
candidate judged against Cursor's slug-based launch, not as proof that Codex's
config override applies. Analogy limit: Codex sends effort as
`model_reasoning_effort` beside a base model; Cursor must send one listed model
id and must not invent efforts the list does not offer.

Observed on this machine (CLI `2026.10.22-27dcf5f`): about 270 listed ids;
stripping a trailing effort token (`none` / `minimal` / `low` / `medium` /
`high` / `xhigh` / `max`) and optional `-fast`, while keeping `-thinking` in the
base id, reconstructs every listed slug with no mismatch. A few legacy ids have
no separable effort suffix and stay model-only.

## Selected Story

<a id="choose-cursor-session-effort"></a>

### Choose effort when starting a Cursor session

**Identity:** SEED-160#choose-cursor-session-effort
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/365-choose-cursor-session-effort/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5fe94314d332b1372df8d7f41fb3e8400a18183af58d2c26eea521d101fa1785","plan":"ec67129186b3b0b35073d79f00c5a28a7bf705dac8c3f3a186bd6471d25720c9"}}
```

**Goal:** A developer starting a Cursor session from the dashboard can see the
supported reasoning-effort choices for the selected Cursor model in the existing
start dialog, choose one, and have the new session start with that choice
applied.

**Scope:** In the existing Cursor start dialog (story, refinement, and ad hoc
where Model is already offered), present Reasoning effort for Cursor when the
selected model has listed effort variants. Derive model and effort offerings
only from the live `cursor-agent models` catalog—never invent an effort Cursor
did not list. Changing the selected model refreshes the effort choices and keeps
an incompatible prior effort from being silently applied. Starting with an
explicit model and effort composes the matching listed model id and passes it as
`--model` on the first Cursor client, reusing the existing session-scoped model
application. Default (your Cursor setting) still omits `--model` and offers no
effort override. Admission may accept `effort` for Cursor under those catalog
rules; Claude and other non-Codex hosts stay without effort. Reuse the shared
launch request field and dialog patterns already used for Codex effort where
they fit; do not send Codex's `model_reasoning_effort` config on Cursor.

**Constraints:** Do not rely on unsupported bracket `--model` overrides. Do not
change Cursor resume/attach to re-send `--model` beyond today's session-scoped
behavior. Do not require a third Fast control: when Cursor lists fast variants,
offer them as distinct effort choices for that model (labeled from the native
name), still composed into one listed id.

**Deferred promises:** Claude effort selection; feedback-maintenance Cursor
effort; redesigning the Model control into a searchable picker; changing how
Default resolves Cursor's configured model; verifying effort inside a live
Cursor session beyond confirming the composed `--model` id was used at startup;
parsing or exposing non-effort model dimensions beyond what composition needs.

**Key examples:**

1. Pre-condition: Cursor model choices are readable and include a model with
   several effort variants (for example a family whose listed ids end in
   `-low` / `-high`). Trigger: the developer selects Cursor and that model in
   the start dialog. Result: Reasoning effort lists those supported choices;
   selecting one and starting launches with `--model` set to the listed id that
   matches that model and effort.
2. Pre-condition: an effort is selected for model A. Trigger: the developer
   switches to model B that does not list that effort. Result: the dialog does
   not silently keep an unsupported pair; Start stays blocked or the effort is
   cleared until a supported choice (or Default with no override) is selected.
3. Pre-condition: the developer leaves Model as Default (your Cursor setting).
   Trigger: Start. Result: no `--model` and no effort override are sent; Cursor
   starts with the developer's current setting as today.
4. Pre-condition: a listed Cursor id has no separable effort variants (bare or
   legacy id). Trigger: that model is selected. Result: Reasoning effort is
   absent or empty; Start still sends that exact listed id as `--model`.

**Evaluation:** Observe the Cursor start dialog listing supported effort
choices for a multi-effort model, refusing or clearing an unsupported pair after
a model change, and starting Default without overrides. Verify startup passes
the composed listed `--model` id for an explicit pair. Catalog parsing and
composition are confirmed against live `cursor-agent models` output in the
checkout; do not treat help-text bracket examples as a launch mechanism.

**Architecture:** Host launch options remain behind each host's
`LaunchHost` boundary ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)):
Cursor's options reader gains real per-model `efforts` derived from listed ids,
admission stops refusing Cursor `effort`, and Cursor launch composes a listed
`--model` id rather than adding a second native transport. Shared dialog and
request shapes may carry `effort` for Cursor; durable project records stay
unchanged beyond existing local launch evidence. Session-scoped Cursor
configuration for a chosen model continues to own applying that id for the
session. No Accepted ADR conflict: this extends the existing host-specific
catalog and startup path without moving workflow authority into the dashboard.

**UI:** Same start dialog reading order as today (Host and Model on one row).
When Cursor and a model with listed efforts are selected, Reasoning effort
appears with Model as it already does for Codex—same label pattern, Cursor-
specific default/empty copy (“use your Cursor setting” only when Default is
selected; otherwise choose a listed effort). No new layout system; describe
feedback for unavailable or unverified catalog reads in the quiet line already
used for model choices.

## Breadcrumbs

- Terry's report and instruction on 2026-10-28: list effort in the Cursor session
  start dialog, place this story at the top of the product backlog, and commit
  and synchronize the planning change directly on main.
- Observed Cursor CLI `agent --list-models` / `agent models` on 2026-10-28
  (`2026.10.22-27dcf5f`): effort encoded in model ids; composition from base +
  effort (+ optional `-fast`) matches listed ids; bracket effort syntax not
  relied on.
- Existing Codex Model + Reasoning effort dialog, catalog, and admission
  (`dashboard/src/LaunchReasoningEffort.tsx`,
  `dashboard/server/hosts/codex/options.ts`,
  `dashboard/server/launchSettingsAdmission.ts`) as the borrowed dual-control
  pattern; Cursor launch remains `--model` only
  (`dashboard/server/hosts/cursor/launch.ts`,
  `dashboard/server/hosts/cursor/options.ts`).
- [Product backlog](../PRODUCT-BACKLOG.md).
- [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
- [Dashboard UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md) launch
  dialog reading order and Model wording.
