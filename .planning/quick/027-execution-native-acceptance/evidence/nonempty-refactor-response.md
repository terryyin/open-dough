Refactored invoice labeling to reuse the canonical `customerLabel` normalization in `src/invoice.mjs`.

- Check addressed: duplication
- Renamed/extracted/split/deleted files: none
- Focused tests: `node --test test/labels.test.mjs` — 2 passed
- Whitespace: `git diff --check` — passed
- Commit/push: not performed
- Active elapsed time: approximately 1 minute

## REFACTOR COMPLETE