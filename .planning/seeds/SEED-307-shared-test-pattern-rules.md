---
id: SEED-307
status: active
planted: 2026-11-11
planted_during: Terry requested shared test pattern rules selected per test entry
trigger_when: Terry selects either shared testing rule for refinement
scope: story
---

# SEED-307 — Shared test pattern rules

Projects can document test patterns in local guidance, but each project has
to maintain that guidance and tell agents which test entries it covers.
Developers should be able to select shared rules for each test entry so agents
receive guidance that fits the tests they are working on.

Deliver MakeMe first so developers can use the shared data-building guidance
even if page-object work is deferred. Refine the configuration syntax, the
behavior for existing entries, and delivery to agents in Codex, Cursor, and
Claude Code when each story is selected.

<a id="apply-shared-makeme-rules-per-entry"></a>

### Apply shared MakeMe rules per entry

**Identity:** SEED-307#apply-shared-makeme-rules-per-entry
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/589-apply-shared-makeme-rules-per-entry/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"aee3fdbba3d097b3d406c79af27ea87df180b2cfa042ab26bc9e856c83d77cd8","plan":"0bb1fa1f605f2ac3149ff454c9aca540e294fb5fd3808477efcbda90e07ff90b"}}
```

#### Goal

A developer can declare whether a configured test entry uses MakeMe. An agent
working on that entry receives the shared MakeMe rule when the entry selects
it. Another entry in the same project can opt out.

#### Scope

- Select MakeMe independently on each existing test entry,
  `.planning/open-dough.json` → `intent.locations[]`, with `"makeMe": true`.
  Omitted or `false` means off, including for existing configurations. File
  membership retains the entry's `kind`/`include` or `sources` selection;
  folder containment alone does not select a test. An opt-in applies to the
  files its entry selects; another entry's opt-out does not veto that opt-in.
- Provide one shared, discoverable MakeMe guidance source for ordinary test
  authoring and Dough execution. Keep its entry check separate from the
  conditional convention, so discovering the skill does not impose MakeMe on
  an unselected entry. Missing configuration means no opt-in; unreadable or
  malformed configuration is reported as an unresolved check rather than a
  claim that selection succeeded. A non-boolean flag does not enable the rule.
- Extract the convention primarily from Donut's `unit-testing` and
  `backend-testing` skills, informed by Open Dough's
  [test data architecture](../../tests/test-data-architecture.md): one shared
  test-data factory, fresh builders, domain-named chained operations and a
  completion operation such as `please()`. Reuse or extend the owning builder
  for canonical domain setup and consistent relationships. Prefer sensible,
  deterministic incidental defaults; state identities, time and other facts
  that drive the case at the call site. Prefer builder operations to later
  mutation and domain-shaped operations to repeated field lists.
- Explain this with language-neutral pseudocode. Factory access spelling,
  imports, typing and completion/persistence mechanics follow the project's
  language and established builder boundary. Do not export Donut's Java
  persistence default or Open Dough's JavaScript paths as universal rules.
- Keep actions, independent expected answers, captured evidence, and exact
  bytes, legacy shapes or deliberate invalidity under proof outside builders;
  build surrounding valid state through the shared API. Preserve the
  relationships required for destructive-operation proof. Resource lifecycle,
  environment setup and controlled clocks retain their project owners.
- When concise setup or performance needs improvement, extend the existing
  construction API and improve its implementation/harness while preserving
  scenario facts, independent observations and isolation. Share immutable
  preparation or safely resettable resources only with isolation demonstrated;
  do not bypass MakeMe or share mutable test data as an optimization shortcut.
- During post-change refactoring, automatically resolve the entries of changed
  test sources and load the same convention for opted-in entries. Cover staged,
  unstaged and untracked changes, both sides of moves, and any committed
  dispositions supplied by the caller. Apply it to implicated tests under the
  refactoring skill's existing scope, rather than converting unrelated suites.
- Deliver one standalone shared behavior through the existing Codex, Cursor
  and Claude Code skill layouts. Verify selection and useful authoring and
  refactoring outcomes; copied files or a selector result alone do not prove
  agent application.

Scope limits: page-object rules remain the sibling story. This story does not
release Open Dough, update Donut or Pygardon, enable their entries, remove their
local rules, or convert their tests. Those adoption steps can follow once the
shared rule is released and installed. The current candidate uses existing
skill discovery; evidence that a host needs another activation mechanism
returns for planning rather than silently narrowing the authoring promise.
No generic policy framework is needed in anticipation of later rules.

Execution proof exception authorized by Terry on 2026-11-11: "skip the cursor
test this time then". For this execution only, Cursor native probes are waived.
Preserve selector and installation checks and the other hosts' native proof;
report Cursor native behavior as unverified. This grants no default waiver for
future execution or release eligibility.

#### Key examples

1. A project declares `backend/tests` with MakeMe on and `frontend/tests` with
   MakeMe off → an agent authors tests in each → the backend setup uses the
   shared convention, while the frontend receives no MakeMe requirement from
   Open Dough. A project with no flag keeps its prior behavior.
2. An enabled entry includes only `**/*.spec.ts` → a selected spec and a
   production/helper file in the same folder are considered → only the spec
   activates the rule. A `sources` entry selects a custom `.check` filename by
   its pattern without requiring a recognized language extension.
3. An opted-in case depends on a note's owner but not its incidental title →
   the agent arranges it → pseudocode such as
   `makeMe.aNote.ownedBy(reader).please()` states the meaningful fact, and a
   related tracker derives the same owner through its builder. A second test
   receives independent mutable values. Equivalent language-specific factory
   access is valid.
4. A parser case needs malformed wire text and surrounding valid state → the
   agent adds it → the malformed text and independent expectation stay visible;
   MakeMe arranges the surrounding state without supplying the answer under
   proof. A deletion case retains its relevant dependent relationships.
5. An opted-in test needs expensive repeated preparation → setup is optimized
   → calls still express the same domain facts, each test remains isolated,
   and the surviving observations and measured saving justify the change.
6. A change includes a staged enabled test, a new untracked enabled test and an
   opted-out test → post-change refactoring begins → it loads the convention
   once for the enabled entries and applies it to their implicated tests. A
   move considers both paths for change discovery, then applies the rule by
   the test's current entry: moving to an opted-out entry imposes no MakeMe
   requirement there, and deletion alone invents no conversion. Caller-supplied
   committed dispositions receive the same check; a production-only change
   supplies no selected test source.

#### Investigation and alternatives

Observed 2026-11-11: Donut at `f6d89e3470a6ed3064443c324763a074bd5bc884`
has the factory/chaining/completion convention in
`.agents/skills/unit-testing/SKILL.md` (Concise makeMe setup) and
`.agents/skills/backend-testing/SKILL.md` (MakeMe Builders). Its Java completion
can persist, while TypeScript returns data; some incidental dates use the wall
clock. Deterministic defaults are a shared preference, not a claim that every
source builder already has them. Pygardon at
`5a7bf85d61e40f778096854900983e270605de5d` contributes the boundaries in
`AGENTS.md` (Test data and coverage), but its Python factories do not establish
the literal MakeMe fluent convention. These are source observations, not target
project changes.

Recommend a discoverable shared MakeMe skill with a configuration gate, plus
explicit execution and refactoring callers. Project-owned pointers are simpler
but leave routing maintenance in every project; host-specific generated rules
would add another activation and coexistence mechanism. The borrowed scoped
policy mechanism maps entry selection to subjects (test paths), explicit opt-in
to policy, and authoring/refactoring to consumers of one resolver. Its limit is
that resolving applicability does not make an agent load or follow a rule.

The strongest challenge is ordinary authoring activation: a correct detector
and refactoring link can still miss test work outside those workflows. Keep
ordinary discovery and useful test changes as explicit native proof, with an
early execution probe before relying on that activation approach. No native
activation result is claimed by refinement.

#### Architecture

Reuse the existing test-entry selection responsibility, including pattern and
syntax semantics, rather than introducing another registry or folder matcher.
The dashboard currently owns it in `dashboard/src/intentLocationSelection.ts`
and parses declarations in `dashboard/server/intentLocationsSettings.ts`;
installed guidance must expose a standalone owner rather than import dashboard
infrastructure. Configuration remains project-owned and off by default under
[ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md).
One rule source and conditional links follow
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Source authoring/payload declarations follow
[ADR 0003 — Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md);
behavior and justified integration reuse follow
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md).
No conflict with these Accepted decisions was found. No new ADR or North Star
topic is needed for this extension of existing ownership.

<a id="apply-shared-page-object-rules-per-entry"></a>

### Apply shared page-object rules per entry

**Identity:** SEED-307#apply-shared-page-object-rules-per-entry
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can declare whether a configured test entry uses page objects.
An agent working on that entry receives the shared page-object rule when the
entry selects it. The page-object choice is independent of the MakeMe choice.

#### Scope to refine

- Draw reusable guidance from Donut's `e2e-authoring` skill and Open Dough's
  [browser journey guide](../../dashboard/tests/writing-journeys.md#fluent-phases-in-the-side-panel-content-journeys).
  Keep user actions and expected behavior visible in tests and put shared
  browser mechanics in page objects.
- Verify that entries in the same project can select page objects with or
  without MakeMe, and that entries with page objects disabled still receive
  the MakeMe rule when selected. Cover both rules, either rule alone, and
  neither rule.

<a id="run-makeme-harness-once"></a>

### Run MakeMe harness checks once by default

**Identity:** SEED-307#run-makeme-harness-once
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/594-run-makeme-harness-once/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"91275e8ef4405aae30ff9d72c2bccb8d7580f4c869e0a4235d6260334d9aecf0","plan":"039c6db40706575a71934d81c88baa82be9f3df2c072d93c4bbf98c466035b5f"}}
```

#### Goal

Developers and CI retain the seven MakeMe assessment controls without repeating
their fixture installation, Git setup and mutation checks in each default run.

#### Scope

Give each MakeMe harness test one default execution route. Preserve the two
directly discovered Node harness files and the explicit zero-argument and native
uses of `tests/makeme-native-use.sh`. Keep existing runner selection, split and
failure behavior. This is bounded retrospective suite correction, with no
MakeMe rule, selector, native-host or adoption change and no paid native probe.

**Plan:** [Run MakeMe harness checks once by default](../slice-plans/594-run-makeme-harness-once/PLAN.md)
