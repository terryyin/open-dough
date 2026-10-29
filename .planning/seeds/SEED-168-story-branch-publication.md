---
id: SEED-168
status: active
planted: 2026-10-29
trigger_when: Story-branch publication encounters an open first-trunk-landing expectation
scope: bounded
---

# SEED-168: Publish story increments before their first trunk landing

## Story

<a id="story-branch-publication-with-first-landing"></a>

### Publish story increments with a pending trunk landing

**Identity:** SEED-168#story-branch-publication-with-first-landing
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Developers can publish intermediate story-branch increments while a
dashboard launch's first-trunk-landing expectation remains open, then capture
the original launch's landing comparison when that work first lands on trunk.

**Scope:** Reproduce and repair the shared publication boundary reported in
Open Dough DD-366, Pygardon DD-380 and Lizard DD-017. Keep interrupted
publication recovery and explicit landing-context validation coherent. Do not
change installed managed copies or release and roll out the repair here.

**Expected behavior:**

- An open expectation for `refs/heads/main` or `refs/heads/master` must not
  attach its trunk context to an intermediate story-branch publication.
- That publication succeeds without clearing or parking the expectation.
- The eventual matching trunk publication still captures the original
  comparison and settles its expectation.
- An explicitly supplied incompatible landing context still refuses safely;
  no genuine landing receipt is fabricated or lost.
- Publication recovery applies the same target selection as fresh delivery.

**Observed behavior:** All three reports use Cursor and installed 0.3.74.
Fresh delivery commits, auto-resolves the trunk expectation, and then refuses
with `Publication does not match the supplied landing context.` Manual
recovery without that context or with the expectation temporarily parked
publishes the same committed candidate.

**Evidence:**

- Open Dough `DearDough.md`, DD-366, SEED-166#handle-stale-worktree-bundles,
  first implementation `0bb02d31c8e9c6c995bfcc41c0e9685ab387e8ea`.
- Pygardon `docs/process-findings/publication-and-workspaces.md`, DD-380,
  SEED-20261048#story-holding-lifecycle-journey-duckdb-lock-conflict,
  accepted increment `d3293a3690e7084f91c1691f7e20b695607daa49`.
- Lizard `DearDough.md`, DD-017, SEED-019#dedupe-template-interpolation-tests,
  committed candidate `7ce8aec`.

**Execution authority:** The developer requested reproduction and repair on
2026-10-29. Dough Bug Fixing supplies one bounded planless repair attempt,
with reproduction before repair, independent post-change refactoring, related
verification, and ordinary shared delivery. The repair attempt has a ten-minute
hard limit and no automatic replanning; remaining work stays under this identity.

**Remaining uncertainty:** Confirm the mismatch through the real publication
boundary, identify every shared consumer of automatic landing-context selection,
and verify matching trunk landing and interrupted-publication recovery.
