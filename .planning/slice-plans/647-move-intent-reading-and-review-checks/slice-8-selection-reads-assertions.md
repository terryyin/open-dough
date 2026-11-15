# Slice 8: intent-selection-reads assertion occurrences

Original: HEAD 9007a576291cf2a864965d03fe9ca7a751cb1d18, unchanged from suffix base.
Maintained: `dashboard/frontend-tests/intent/intent-selection-reads.spec.ts`. Browser requests count local authenticated-read/review requests, never GitHub calls.

Named cases:

- selecting another feature never shows the previous feature's text in Purpose
- a feature selected while startup detail completes stays selected with its Purpose

Every original observing statement/helper occurrence below maps independently, in source order, with the identical expected expression. Helper internals and setup differences are in [helper observations](slice-8-helper-observations.md).

| Original line | Maintained line | Exact observing statement / helper call |
| --- | --- | --- |
| 47 | 44 | `await expandIntentGroup(intent, "e2e_test/features")` |
| 50 | 47 | `await expect(fileSource(intent, otherPath)).toContainText( "Report free space", )` |
| 83 | 80 | `await expect.poll(jobsRead.held).toBe(1)` |
| 84 | 81 | `await expect(purpose).toContainText(’Reading ${featurePath}…’)` |
| 85 | 82 | `await expect(intent).not.toContainText("Report free space")` |
| 88 | 85 | `await expect(fileSource(intent, featurePath)).toContainText( "Scenario: Archive a job", )` |
| 94 | 91 | `expect(labelled.length).toBeGreaterThan(0)` |
| 95 | 92 | `expect( labelled.filter((each) => /Disk space&#124;Report free space/.test(each)), ).toEqual([])` |
| 115 | 113 | `await expandIntentGroup(intent, "e2e_test/features")` |
| 118 | 116 | `await expect(source).toContainText("Scenario: Archive a job")` |
| 119 | 117 | `await expect.poll(detail.held).toBeGreaterThan(0)` |
| 120 | 118 | `expect(locationsReads()).toBe(1)` |
| 124 | 122 | `await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveAttribute( "aria-expanded", "true", )` |
| 128 | 126 | `await expect(sourceFile(intent, featurePath)).toHaveAttribute( "aria-pressed", "true", )` |
| 132 | 130 | `await expect(source).toContainText("Scenario: Archive a job")` |
| 133 | 131 | `expect(locationsReads()).toBe(1)` |
