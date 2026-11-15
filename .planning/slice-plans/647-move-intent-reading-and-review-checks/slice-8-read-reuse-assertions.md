# Slice 8: intent-read-reuse assertion occurrences

Original: HEAD 9007a576291cf2a864965d03fe9ca7a751cb1d18, unchanged from suffix base.
Maintained: `dashboard/frontend-tests/intent/intent-read-reuse.spec.ts`. Browser requests count local authenticated-read/review requests, never GitHub calls.

Named cases:

- reopening a feature and returning from Development ask nothing more and show without a reading moment
- the Test Optimization Candidates record is read once across leaving Intent and returning

Every original observing statement/helper occurrence below maps independently, in source order, with the identical expected expression. Helper internals and setup differences are in [helper observations](slice-8-helper-observations.md).

| Original line | Maintained line | Exact observing statement / helper call |
| --- | --- | --- |
| 86 | 80 | `await expandIntentGroup(intent, "e2e_test/features")` |
| 89 | 83 | `await expect(fileSource(intent, path)).toContainText(text)` |
| 97 | 91 | `expect(featureReads()).toBe(1)` |
| 100 | 94 | `await expect(intent).toBeHidden()` |
| 102 | 96 | `await expect(fileSource(intent, otherPath)).toContainText( "Report free space", )` |
| 105 | 99 | `expect(locationsReads()).toBe(1)` |
| 106 | 100 | `expect(featureReads()).toBe(1)` |
| 107 | 101 | `expect(await moments()).toEqual([])` |
| 122 | 117 | `await chooseOptimizationCandidates(intent)` |
| 123 | 118 | `await expect(entry).toBeVisible()` |
| 126 | 121 | `await expect(intent).toBeHidden()` |
| 128 | 123 | `await expectIntentModeChosen(intent, "Optimization Candidates")` |
| 129 | 124 | `await expect(entry).toBeVisible()` |
| 130 | 125 | `expect(recordReads()).toBe(1)` |
| 131 | 126 | `expect(locationsReads()).toBe(1)` |
