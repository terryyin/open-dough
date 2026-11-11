---
id: SEED-317
status: active
planted: 2026-11-11
planted_during: Terry's direct maintenance instruction to upgrade all dependencies
trigger_when: Admitted for execution by that instruction
scope: story
---

# SEED-317 — Upgrade all dependencies

<a id="upgrade-all-dependencies"></a>

### Upgrade all dependencies

**Identity:** SEED-317#upgrade-all-dependencies
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Open Dough maintainers work on current releases of every dependency
this repository declares, with the automated tests and hosted CI still passing.

#### Scope

- Raise each dependency this repository pins to its latest release that the
  project's supported Node range and the other dependencies accept: the npm
  packages in `package.json` with `package-lock.json`, and the pinned versions
  CI and setup declare (GitHub Actions, the Node patch in `.node-version`,
  and the Playwright browser that follows `@playwright/test`).
- Adapt source, tests and configuration only as far as an upgraded dependency
  requires. Product behavior stays unchanged.
- A dependency whose latest release cannot be adopted without a product,
  design or credential decision stays at its newest adoptable version, with
  the blocking reason reported.

#### Known expectations

- After the upgrade, a locked install from the committed lockfile succeeds,
  and lint, typecheck, `npm test` and the dashboard suite pass locally and in
  hosted CI under [the failure policy](../../AGENTS.md#failing-and-flaky-tests).
- Released client payloads under `src/` change only if they declare a
  dependency version that is upgraded.

#### Remaining uncertainty

Which dependencies have newer releases, and whether any major-version change
needs more than mechanical adaptation, is unknown until the upgrade is tried.
Work that stops fitting one coherent slice is planned before it continues.
