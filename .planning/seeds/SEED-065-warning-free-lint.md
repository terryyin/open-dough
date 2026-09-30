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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/187-warning-free-lint/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"87f6c8a38f4e10c7a4f838331783742f2b81364f41d704bbd6aa9b159cdd3f42","plan":"444756ca2f201d81017fc7eb832090fae4c2da2ea69552511fd51cc36e451ab1"}}
```

- **Goal:** A maintainer running `npm run lint` sees findings only about the
  checkout's own source, so a clean result can be trusted and a failure always
  points at something to fix. On a checkout with no unformatted or unlinted
  source, it prints no warning or error and exits 0, on every run and on every
  machine, whatever ignored local artifacts the checkout holds.
- **Scope:**
  - Every check in `npm run lint` and `npm run format` covers the same file
    set: files Git tracks plus untracked files Git does not ignore. Git's
    ignore rules decide what is skipped, at any depth, so ignored build output
    (such as a nested `dashboard/dashboard/dist/`), test reports, and
    `.worktrees/` copies are never checked. Existing deliberate lint
    exclusions of tracked paths, such as `.planning/`, stay.
  - A linked worktree is checked only when lint runs inside it.
  - New untracked, non-ignored source is still checked, and any real violation
    still fails the run.
  - Boundary assumption: the project's lint tools are installed. A missing
    tool stays a reported failure, not a skipped check.
  - Deferred: changing lint rules, lint speed, and fixing violations inside
    other worktrees' in-progress code.
- **Key examples:**
  1. A checkout holds a stray, git-ignored bundle
     `dashboard/dashboard/dist/assets/index-*.js` → `npm run lint` → exits 0
     and reports no problem. (Today: 8,372 errors from that one file.)
  2. `.worktrees/<name>/dashboard/tests/*.spec.ts` has unsafe `any` member
     access → `npm run lint` in the main checkout → exits 0; the same command
     inside that worktree fails naming that file. (Today the main checkout
     reports it.)
  3. A new untracked `scripts/example.mjs` uses `var` → `npm run lint` → fails
     naming that file and rule.
  4. The same checkout is linted twice → both runs give the same result and
     output.
- **Confirmed cause:** `eslint.config.mjs` ignores `dist/` only at the
  repository root and does not ignore `.worktrees/`, while `.gitignore`
  ignores `dist/` at any depth and `/.worktrees/`. `scripts/lint.mjs` already
  derives its shell-script list from Git, and Prettier honors `.gitignore`;
  only ESLint scans ignored paths.
- **Capture:** Requested by Terry on 2026-09-30 after `npm run lint` failed
  with thousands of errors unrelated to the change.

## Open Decisions

None.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Lint runner](../../scripts/lint.mjs) and [ESLint configuration](../../eslint.config.mjs).
