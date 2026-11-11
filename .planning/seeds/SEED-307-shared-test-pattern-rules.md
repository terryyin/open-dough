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

Refine the configuration syntax, the
behavior for existing entries, and delivery to agents in Codex, Cursor, and
Claude Code when each story is selected.

<a id="apply-shared-page-object-rules-per-entry"></a>

### Apply shared page-object rules per entry

**Identity:** SEED-307#apply-shared-page-object-rules-per-entry
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/590-apply-shared-page-object-rules-per-entry/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"416e8ef56b59ac7596e370fdc6a6430d915ad6b90175d6e769dad563f6e62a3b","plan":"bd6201672d08d8e8e41462a680de1754ab9bf51df52bf994ca2aa245f63a0d7f"}}
```

#### Goal

A developer selects shared page-object guidance per test entry, independently of
MakeMe. An agent receives the rule when its entry selects it.

#### Scope

- Select the rule with `intent.locations[].pageObjects: true` in
  `.planning/open-dough.json`, independently of `makeMe`. Omitted, false and
  non-boolean values do not enable it. Reuse MakeMe's file-membership and overlap
  semantics: a matching opt-in applies; another entry's opt-out is no veto.
  Missing configuration is off; malformed/unreadable configuration is reported unresolved.
- Provide one discoverable, conditional convention for ordinary browser authoring,
  Dough execution and implicated refactoring. Reuse MakeMe's changed-source scope:
  staged, unstaged, untracked, moves and supplied committed dispositions. Current
  membership determines application; deletion alone requires no conversion.
- Draw from Donut's `e2e-authoring` and the [browser journey guide](../../dashboard/tests/writing-journeys.md#fluent-phases-in-the-side-panel-content-journeys):
  keep action order, scenario variants, inputs and expected values visible at the
  caller; give scoped locators, browser mechanics and observable waits one focused
  page/component owner. Reuse or extend existing owners with domain-named actions
  and observations. Assertions may run there while expectations remain explicit.
- Show language-neutral examples with fluent handoffs where useful; async and
  construction mechanics follow the project. Require neither Cypress/Gherkin nor
  Open Dough's phase/cue runner, base class or universal fluent conversion.
- Preserve independent boundary evidence, such as held-response order, request
  counts, native records and measurements, at its meaningful observation boundary.
  Keep keyboard/mouse variants and exact contracts under proof explicit.
- Deliver standalone guidance through Codex, Cursor and Claude Code's existing
  skill layouts; prove useful application and all four MakeMe/page-object choices.

Scope limits: no release, project rollout, opt-in changes, local-rule removal,
unrelated suite conversion, new test framework or generic policy registry.
Page-object selection adds no browser abstraction requirement to non-browser work.

#### Key examples

1. Four entries select both flags, page objects only, MakeMe only and neither →
   agents author tests → each receives exactly its selected conventions. Existing
   entries with no page-object flag retain their previous practice.
2. An enabled entry includes `**/*.spec.ts` → a spec and its folder's production
   file are considered → only the spec activates the rule. A `sources` entry can
   select a custom extension; overlapping false entries do not veto a true one.
3. A browser scenario opens a named item and follows a handoff → the agent adds
   the test → shared controls use their existing owner, the caller shows the order
   and expected item, and an independent held-read observation stays visible.
   An incorrect expected item yields an actionable expected/actual failure.
4. Mixed changed tests enter refactoring → opted-in tests reuse focused objects
   and preserve intent; moving out imposes no page-object rule at the destination.

#### Investigation and alternatives

Observed 2026-11-11: Donut `4e328b86ead11bf711ec84071a34bd7170effa9e` supplies
fluent handoffs and focused mechanics in `.agents/skills/e2e-authoring/SKILL.md`.
Open Dough `1c470849e` keeps independent evidence and limits its cue pilot to three
journeys. Its parser drops both proposed flags; direct membership still works.
Recommend MakeMe's conditional skill and callers. Local pointers retain routing
maintenance; generated host rules add activation/coexistence machinery. Borrow
scoped-policy binding: entries select subjects, flags select conventions, consumers
share one resolver. Routing does not prove application. The strongest doubt is
fluent syntax hiding causal order or expectations: native proof must inspect useful
results. Discovery remains a hypothesis bounded by an early execution probe.

#### Architecture

Extend the same selection and changed-source owners as MakeMe; reconcile concurrent
work without assuming future API names or duplicating a matcher. No blocking story
dependency is justified by shared code alone under [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Project-owned opt-ins and standalone use follow [ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md);
one conditional source follows [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Promotion and truthful reusable native proof follow [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md). The index and
records agree; no conflict or new ADR/North Star concern was found.

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
