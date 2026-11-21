# Prove a renamed file's Review diff reads its grammar from the new path

**Identity:** SEED-413#prove-renamed-diff-grammar-from-new-path
**Source:** [Prove a renamed file's Review diff reads its grammar from the new path](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-renamed-diff-grammar-from-new-path)

## Source and findings

The Intent Coverage check of SEED-413#reduce-review-diff-reading-to-logic-cases
ran at `e92a709785b7a8c9071a892af037a719c809ad4f` on 21 November 2026. It made
one scratch change: `dashboard/src/StoryReviewFileDiff.tsx` passed a renamed
file's `oldPath` to `StyledFileDiff` instead of `file.path`. No maintained check
failed:
- the grammar-selection logic spec only calls `diffLanguage(newPath)`;
- the Playwright intent-hints rename uses two paths with no grammar, so the
  hint applies either way;
- the note-context rename keeps the same grammar on both sides.

A scratch witness failed under that change. It renamed `old.txt` to `new.ts`
with no hint, and the `const` token was missing. No delivered defect was found.
`StoryReviewFileDiff.tsx` passes `file.path` today.

## Preserved promises and constraints

The diff styling behavior is unchanged: the path selects the grammar first,
then the Intent hint. The existing grammar-selection and intent-hints cases stay
as they are.

## Outside-in proof

| Promise | Owner | Observation |
| --- | --- | --- |
| A rename from `old.txt` to `new.ts` reads TypeScript; `old.ts` to `new.txt` reads none | Slice 1 | A maintained case fails when the old path is passed |

## Current decisions

- Prefer a logic case. If the path choice moves into a pure function that takes
  the reviewed file, test it in
  `dashboard/frontend-tests/review/story-review-diff-grammar-selection.spec.ts`
  and drop the decorative `oldPath` column there. Otherwise add one case through
  `StoryReviewFileDiff`.
- Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Ordered slices

### 1. A renamed file's diff reads its grammar from the new path

Type: Structure
Status: planned

Make the path choice for a reviewed file observable without a mount, or prove it
through `StoryReviewFileDiff`. Cover two cases with grammars that differ across
the rename: `old.txt` to `new.ts`, and `old.ts` to `new.txt`.

**Proof.** The case passes. It fails on the coverage check's scratch change,
which passes `oldPath` when present. Its median is under 500 ms.

## Local gates

- On AC power, run tests under `caffeinate -s -i` with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes. Run Vitest specs with
  `npx vitest run --config dashboard/frontend.vitest.config.mts <specs>`, then
  `npm run typecheck:dashboard` and `npm run lint`. Keep default timeouts;
  never `test.slow()`.
