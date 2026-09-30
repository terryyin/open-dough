---
id: SEED-065
status: active
planted: 2026-09-30
planted_during: Terry's request to add a story making npm run lint produce no warnings, consistently
trigger_when: A maintainer runs npm run lint and sees findings unrelated to their change
scope: story
---

# SEED-065: Warning-free lint

## Why This Matters

`npm run lint` is the repository's quality gate, but on Terry's machine it
reported 8,372 errors while the files changed in the session were clean. Every
error came from a bundled build output, `dashboard/dashboard/dist/assets/`,
and its copy under `.worktrees/`: ignored build artifacts that ESLint still
scanned. A gate that fails or warns for reasons outside the change teaches
maintainers to ignore it.

## Story

<a id="warning-free-lint"></a>

### Make npm run lint report no warnings or errors, consistently

**Identity:** SEED-065#warning-free-lint
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Goal:** A maintainer running `npm run lint` on a checkout with no
  unformatted or unlinted source sees no warnings and no errors, on every run
  and on every machine, including one holding ignored local artifacts such as
  build output, nested `dashboard/dashboard/` folders, `.worktrees/` copies, or
  git-ignored avatars.
- **Evaluation:** With such ignored artifacts present, `npm run lint` exits 0
  and prints no warning or error; repeated runs agree; a real source
  violation still fails it.
- **Observed cause (to verify in refinement):** ESLint ignores appear to match
  only a top-level `dist`, so a stray `dashboard/dashboard/dist` bundle and a
  worktree copy were linted, while `scripts/lint.mjs` already honors Git's
  ignore rules for its other checks.
- **Capture:** Requested by Terry on 2026-09-30 after `npm run lint` failed
  with thousands of errors unrelated to the change.

## Open Decisions

None.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Lint runner](../../scripts/lint.mjs) and [ESLint configuration](../../eslint.config.mjs).
