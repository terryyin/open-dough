# Inspect each project's Client configuration in System settings

**Identity:** SEED-295#inspect-project-configuration-in-dashboard
**Source:** [Refined story](../../seeds/SEED-295-view-project-configuration-in-dashboard.md#inspect-project-configuration-in-dashboard)
**Source review:** [source-review.md](source-review.md)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/view-each-project-s-open-dough-configuration-in`,
branch `cursor/view-each-project-s-open-dough-configuration-in`, starting
revision `6a30db60ed1f19405bb3cd3b553811b52f8414d0`. This plan authorizes no
execution.

## Goal and scope

A maintainer using **System settings → Projects** can inspect each configured
project's Client configuration (`.planning/open-dough.json` in that project's
local checkout) without opening the checkout in an editor. Each entry shows
that project's own file text when readable, or explains absence or unreadability
for that project alone. The view is read-only and leaves the file unchanged.

Excluded: editing or saving the file; published GitHub revision inspection or
local-vs-published comparison; structured key interpretation; opening an
external editor from settings; side-by-side project comparison.

## Architecture and reuse

Follow [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
(Client configuration) and
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
(machine-local project configuration separate from published workflow records).
No Accepted ADR conflict; no North Star topic warranted.

PFE: extend the existing System settings → Projects surface
(`SystemSettings.tsx`, `projectSettings()` / `__project-configuration/settings`,
`projectFolder` / `localFolder`). That surface already owns machine-local
project facts (label, repository, local path, hide/remove). Add a read-only
presentation of each checkout's Client configuration file text or per-project
absent/unreadable explanation.

Do **not** reuse `readCiConfiguration` for this display: it interprets CI keys,
throws on invalid JSON, and returns a subset, which cannot satisfy inspectable
on-disk text including unrecognized keys and invalid JSON. Do **not** reuse
Intent or agent-roster published-revision settings readers; this story owns the
local checkout file beside the configured local path. Keep CI and Intent
readers unchanged.

## Outside-in proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Different projects show their own file texts | 1: System settings Projects journey with two configured checkouts whose `.planning/open-dough.json` texts differ |
| Absent file explained on that project only | 1: one project without the file; other projects with files still show theirs |
| Unreadable path/file explained without cross-project fallback | 1: missing checkout path or unreadable file on one project |
| Opening the view leaves the file unchanged | 1: capture file bytes before opening settings and after leaving; bytes match |
| Invalid JSON text remains inspectable | 1: file exists as non-JSON text and appears in that project's entry |
| No edit/save actions for Client configuration | 1: Projects entry exposes no control that writes `.planning/open-dough.json` |
| Settings boundary remains origin-scoped and read-only for the inspection load | 1: focused HTTP checks on the settings (or extended) read path for allowed origin, foreign origin refusal, and disallowed mutating method |

Arrange domain facts through MakeMe where a shared builder already owns the
shape; state per-project file text, absence, and unreadability at the call site.
Keep actions and independent expectations outside builders. Wait for observable
UI or HTTP outcomes; do not sleep.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Projects settings lists configured projects with repository and local path via `__project-configuration/settings` | Slice 1 extends that surface | Read `dashboard/src/SystemSettings.tsx` and `dashboard/tests/configuration/system-settings.spec.ts` (asserts each row's repository and localPath; GET settings returns `{ id, localPath }[]`) at workspace revision `6a30db60e` | Settled: stable proof entry is System settings → Projects plus the settings read boundary |
| `localFolder` / `projectFolder` resolve a configured `localPath` (including `~/…`) to a filesystem checkout path | Slice 1 reads `.planning/open-dough.json` under that path | Read `dashboard/server/projectFolders.ts` `localFolder` / `projectFolder` | Settled: use the same resolution as other checkout-bound reads |
| `readCiConfiguration` is unsuitable for inspectable file text | Slice 1 chooses a text/status read, not CI interpretation | Read `src/skills/dough-execute-plan/scripts/ci-project-configuration.mjs` (JSON.parse; throws on invalid JSON; returns CI subset) | Settled: new or local read-only text/status helper beside project configuration; leave CI reader unchanged |
| Dashboard configuration Playwright selection can host the journey | Slice 1 proof route | `dashboard/tests/configuration/system-settings.spec.ts` and `projectAddMachine` start a preview server and open System settings; `npx playwright test tests/configuration/system-settings.spec.ts --list` exits 0 from `dashboard/` | Settled: unpaid proof route available; new discriminating cases belong with configuration settings journeys |

## Ordered slices

### 1. Show each project's Client configuration on its Projects settings entry

Type: Behavior
Status: done
Proof: Source examples 1–5 and the read-only / boundary promises in the table.
Focused dashboard configuration selection covering the new System settings
Projects journey(s) and the settings-boundary HTTP checks; extend existing
`tests/configuration/system-settings*.spec.ts` / project-configuration journeys
and backend configuration boundary coverage as the consumer trace requires.
Arrange two (or more) configured projects with distinct local `.planning/open-dough.json`
texts, one absent, one unreadable, and one invalid-JSON text at the call site.

Behavior: Given configured projects on this machine, open **System settings →
Projects** → each project entry shows that project's local Client configuration
file text when the file can be read as text, or explains absence or unreadability
for that project alone, without showing another project's settings, without
edit/save actions, and without writing the file. Invalid JSON text remains
visible as the on-disk text. The inspection load stays origin-scoped and does
not accept a mutating method for that read.

## Current decisions

- Inspection source is the local checkout file at
  `<resolved localPath>/.planning/open-dough.json`, not a published revision.
- Display inspectable text (including invalid JSON); do not gate the view on
  successful JSON parse.
- Present within each Projects settings entry; do not use the Side panel.

## Learnings

- Keep Client-configuration CSS out of `project-configuration.css` (already at
  the 250-line limit); use `project-client-configuration.css`.
- Do not reuse `readCiConfiguration` for inspectable on-disk text (parse/throw
  and CI subset).
- Prefer a status-union assertion for `clientConfiguration` in the existing
  settings journey rather than pinning host-specific unreadability.

## Story obligations

### G1. Editing or saving Client configuration
Reported: slice 1 — "Not undertaken: editing or saving `.planning/open-dough.json`."
Story clause: "editing or saving `.planning/open-dough.json`"
Disposition: excluded "editing or saving `.planning/open-dough.json`"
Commitment: 36

### G2. Side-by-side project comparison
Reported: slice 1 — "Not undertaken: comparing two projects side by side."
Story clause: "comparing two projects side by side"
Disposition: excluded "comparing two projects side by side"
Commitment: 37

### G3. Published GitHub revision display
Reported: slice 1 — "Not undertaken: showing the published GitHub revision that Intent or the agent roster use."
Story clause: "showing the published GitHub revision that Intent or the agent roster use"
Disposition: excluded "showing the published GitHub revision that Intent or the agent roster use"
Commitment: 38

### G4. Key interpretation or validation
Reported: slice 1 — "Not undertaken: interpreting or validating individual keys for the maintainer."
Story clause: "interpreting or validating individual keys for the maintainer"
Disposition: excluded "interpreting or validating individual keys for the maintainer"
Commitment: 39

### G5. External editor from settings
Reported: slice 1 — "Not undertaken: opening the file in an external editor from settings."
Story clause: "opening the file in an external editor from settings"
Disposition: excluded "opening the file in an external editor from settings"
Commitment: 40

### G6. Published-revision or local-vs-published comparison
Reported: slice 1 — "Deferred: published-revision inspection or local-vs-published comparison."
Story clause: "published-revision inspection or local-vs-published comparison"
Disposition: excluded "published-revision inspection or local-vs-published comparison"
Commitment: 41

### G7. Structured field explanations
Reported: slice 1 — "Deferred: structured field explanations."
Story clause: "structured field explanations"
Disposition: excluded "structured field explanations"
Commitment: 42

### G8. Editing from the dashboard
Reported: slice 1 — "Deferred: editing from the dashboard."
Story clause: "editing from the dashboard"
Disposition: excluded "editing from the dashboard"
Commitment: 43

## Local verification

Focused proof is the configuration journey and boundary selection named on
slice 1. No full repository or dashboard suite is a routine local gate for this
bounded change; published CI failures remain owned. When a full suite is run
locally on macOS, start from a fully awake machine on AC power under
`caffeinate -s -i` per
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

A failing or flaky test is a defect to fix. Tests must be stable and give the
same result locally and in CI. A test that fails locally but passes in CI, or
the reverse, or passes alone but fails in the full run, has a bug in the test
or its environment assumptions. A flaky test counts as failing until it is no
longer flaky. Reproducing a failure on the base or main is attribution, not an
exemption. A plan may record that a known failure predates its story; it does
not exclude that failure from the executing agent's repair, and no executor
reports it and moves on. CI failing on a revision you published is yours to
diagnose and repair, even when the step also failed on earlier commits or does
not reproduce locally, through to the applicable final CI. Never rerun until
green as a fix. Stop for a human only when the fix needs product, design or
credential judgment. When another active execution already owns that exact
repair, preserve its uncommitted files: do not stash, claim, or write a
duplicate repair. Report that owner and the remaining gate as the coordination
boundary. A claim that a failure is "pre-existing" is not evidence of such an
owner. A human-authorized exception, such as Terry waiving one native probe or
authorizing one landing despite a failure, covers only its stated scope. Report
the outcome it qualifies truthfully; it never becomes the default for later
work.

## Readiness review

Plan refinement was not needed: one Behavior slice owns the cohesive
inspect-on-settings outcome and its proof loop; no independent second outcome,
hidden preparation, or cumulative special-case design. No project numeric
slice target or hard limit is supplied; size by that bounded proof loop.

Reviewed source examples 1–5 against slice 1 and the settled premises. No
remaining slice-specific, cumulative-design, scope, proof-route, or human-owned
decision concern was identified. Readiness records preparation only; the slice
remains planned.

## Execution complete

Product advice: No backlog change. Story promises for per-project local Client
configuration inspection on System settings → Projects are delivered. Optional
wrap-up assimilation: mention the read-only inspection beside existing Projects
settings guidance in `dashboard/PROJECT-CONFIGURATION.md`. Process findings
DD-485 and DD-486 recorded.
