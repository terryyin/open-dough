Wrapped up **Trim names** (`SEED-001#trim-names`) successfully.

- Execution and retrospective confirmed complete.
- Existing code/tests preserve trimming, internal spaces, and Guest behavior.
- Removed the spent story section, plan, evidence, backlog entry, and related `DearDough.md` finding.
- Preserved the unrelated Formal titles story and process finding.
- Focused tests: 3/3 passed.
- Cleanup commit: `8f3a441`
- Pre-cleanup recovery commit: `49c2199`

Recover the deleted plan with:

```sh
git show 49c2199:planning/plans/trim-names.md
```

## STORY WRAP-UP COMPLETE