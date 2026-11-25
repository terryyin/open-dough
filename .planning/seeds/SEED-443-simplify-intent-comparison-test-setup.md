---
id: SEED-443
status: active
planted: 2026-11-26
planted_during: SEED-417 execution follow-up
trigger_when: selected from the product backlog
scope: one story
---

# SEED-443 — Simplify Intent comparison test setup

<a id="simplify-intent-comparison-test-setup"></a>

### Simplify Intent comparison test setup

**Identity:** SEED-443#simplify-intent-comparison-test-setup
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/852-simplify-intent-comparison-test-setup/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"380d5b4e109bd36ddbf87b7c9d94d4de05cdea24068a2d57e358cde34e1d2bd3","plan":"edd23f61956edc7e5f034b54e5ace373f41230be685c7293fd6064f831a82b18"}}
```

**Goal.** Dashboard maintainers can read and change mounted Intent comparison
specs without stepping through Files drawer setup that adds no comparison
coverage, so each case shows only the comparison it proves.

**Scope.**

- *Required behavior.* Mounted Intent specs read a selected story's
  comparison through the [mounted story comparison helper](../../dashboard/frontend-tests/intent/intent-story-compare-page.ts)
  and its Story A, Done, changes and summary mounts. When those specs are
  not proving narrow layout, they mount at a docked desktop width. Story A
  and Done mounts now inherit the frontend Vitest 390 px default; the other
  mounts already start docked. The explicit `showFiles` or `browseFiles`
  steps that only reached the tree go. Every comparison assertion stays.
- *Retained.* The 390 px default viewport for the frontend Vitest group; every
  case that sets a phone or narrow width itself or asserts the Files drawer,
  its toggle, outside-tap dismissal, keyboard reach, or fit at narrow width
  (for example the Files drawer, Files actions, narrow story views, sidebar
  toggle, comparison follow-up at 390 px, and the narrow iterations of
  comparison summary, CI cues and dark appearance).
- *Scope limits.* End-to-end Playwright specs and their test-support pages
  stay as they are. No product code changes. Shared helper steps that a
  retained phone case still needs keep their drawer handling.

**Key examples.**

1. A comparison case such as "including merged changes leaves CI comparison
   and file Proof at the measured…" mounts the Done story without a
   viewport → it mounts docked → it activates the outside file directly, with no
   `showFiles` step, and its diff and Proof assertions still pass.
2. A Done story case reading captured landed runs → mounted docked → it reads
   the outside files after choosing a run without opening Files.
3. A case opening review details or going Home → mounted docked → the details
   eye and Home are reachable without closing or opening a drawer.
4. The Files drawer spec at 390 px → unchanged → Files still opens as a
   drawer, selection closes it, and an outside tap dismisses it.
5. A comparison summary case at 375 px → unchanged → it still proves the
   narrow presentation.

**Evaluation.** The migrated comparison specs pass with the tree available at
mount and their comparison assertions intact. The dedicated phone tests still
exercise Files as a drawer, including selection and outside-tap dismissal.

**Source.** The SEED-417 execution report identified this cleanup. The
[frontend Vitest configuration](../../dashboard/frontend.vitest.config.mts)
sets the 390 px default, and commit `a2343a170` added the Files-opening steps
when Files became a closed drawer at phone width.
