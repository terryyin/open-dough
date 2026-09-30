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

`npm run lint` is the repository's quality gate: it checks the files Git would
track and fails on any warning. A gate that fails for reasons outside the
change, or that a commit can bypass, teaches maintainers and agents to ignore
it and leaves CI to catch what a local check should have stopped.

## Story

<a id="pre-commit-lint-hook"></a>

### Stop a commit that fails lint before it leaves the machine

**Identity:** SEED-065#pre-commit-lint-hook
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Beneficiary:** maintainers and executing agents committing in this
  repository, and everyone waiting on CI after them.
- **Outcome:** a commit whose staged JavaScript, TypeScript, JSON, or shell
  files fail the repository's lint or formatting checks is refused locally with
  the findings and a pointer to `npm run format`, so a masked or skipped
  format step no longer reaches CI. The hook only checks: it never fixes,
  restages, or changes the index. `npm ci` installs it in every checkout and
  worktree, a missing lint tool is a reported failure, and CI's lint job stays
  as the backstop.
- **Evidence:** [ODF-100](../../DearDough.md#odf-100--a-piped-lint-failure-did-not-stop-publication)
  in `DearDough.md` (a formatter piped through `tail` let delivery continue),
  with lint-only repair commits such as `235583f7` and `57505b5d`.
- **Completion:** after delivery, update ODF-100's follow-up in `DearDough.md`
  under [finding status](../../docs/maintainer/finding-names.md#retained-evidence).

## Open Decisions

None.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Lint runner](../../scripts/lint.mjs) and [ESLint configuration](../../eslint.config.mjs).
