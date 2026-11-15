# Slice 8: intent-read-reuse-story assertion occurrences

Original: HEAD 9007a576291cf2a864965d03fe9ca7a751cb1d18, unchanged from suffix base.
Maintained: `dashboard/frontend-tests/intent/intent-read-reuse-story.spec.ts`. Browser requests count local authenticated-read/review requests, never GitHub calls.

Named cases:

- with a selected story, browsing reads nothing and a changed file's diff is read once, without its published text

Every original observing statement/helper occurrence below maps independently, in source order, with the identical expected expression. Helper internals and setup differences are in [helper observations](slice-8-helper-observations.md).

| Original line | Maintained line | Exact observing statement / helper call |
| --- | --- | --- |
| 60 | 60 | `await expect(intentLocationName(intent, "dashboard/tests")).toHaveAttribute( "aria-pressed", "true", )` |
| 66 | 66 | `await expect(intentFolderName(intent, folder)).toHaveAttribute( "aria-pressed", "true", )` |
| 71 | 71 | `await expect(purpose).toHaveCount(0)` |
| 72 | 72 | `expect(reads).toEqual({ text: [], diffs: [], texts: [] })` |
| 77 | 77 | `expect(first).toContain("more")` |
| 79 | 79 | `await expect(purpose).toHaveCount(0)` |
| 80 | 80 | `expect(await intentDiff(intent, changed.modified)).toBe(first)` |
| 81 | 81 | `expect(reads).toEqual({ text: [], diffs: [modifiedPath], texts: [modifiedPath], })` |
