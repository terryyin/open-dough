# Slice 6 update-boundaries assertion dispositions

Original: `37fb6a94cbb69aff99ae403c8177697d40e034c6:dashboard/tests/intent/intent-revision-update-boundaries.spec.ts`.
Maintained: `dashboard/frontend-tests/intent/intent-revision-update-boundaries.spec.ts`.

Every observing statement retains the exact original expected expression and order.
Setup: actual app entry and selection through frontendIntentRevisionJourney;
immutable answers keyed by source and revision, canonical stream slots held.
Original publishMovingFiles acquisition belongs to the real Backend/E2E cases
named in slice-6-proof.md. Assertions below observe real UI and browser requests.

| Original line | Named maintained case | Maintained line | Exact observing statement |
| --- | --- | --- | --- |
| 56 | an unusable settings file at the latest revision takes the reading's focus into its explanation | 56 | <code>await expect(explanation).toContainText("is not valid JSON");</code> |
| 57 | an unusable settings file at the latest revision takes the reading's focus into its explanation | 57 | <code>await expect(explanation).toBeFocused();</code> |
| 58 | an unusable settings file at the latest revision takes the reading's focus into its explanation | 58 | <code>await expect(browserRevision(intent)).toContainText( shortRevision("ec".repeat(20)), );</code> |
| 83 | choosing another project while an update is held shows only that project's reading when it is answered | 88 | <code>await expect.poll(latest.held).toBe(1);</code> |
| 84 | choosing another project while an update is held shows only that project's reading when it is answered | 89 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 89 | choosing another project while an update is held shows only that project's reading when it is answered | 94 | <code>await expect(intentGroupToggle(intent, "scripts")).toBeVisible();</code> |
| 92 | choosing another project while an update is held shows only that project's reading when it is answered | 97 | <code>await expect(intentGroupToggle(intent, "scripts")).toBeVisible();</code> |
| 93 | choosing another project while an update is held shows only that project's reading when it is answered | 98 | <code>await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveCount(0);</code> |
| 94 | choosing another project while an update is held shows only that project's reading when it is answered | 99 | <code>await expect(intent.getByText(featurePath)).toHaveCount(0);</code> |
| 95 | choosing another project while an update is held shows only that project's reading when it is answered | 100 | <code>await expect(intent).not.toContainText("Purge a job");</code> |
| 96 | choosing another project while an update is held shows only that project's reading when it is answered | 101 | <code>await expect(revisionNotice(intent)).toHaveCount(0);</code> |
| 97 | choosing another project while an update is held shows only that project's reading when it is answered | 102 | <code>await expect(ciPanel(intent)).toBeVisible();</code> |
| 98 | choosing another project while an update is held shows only that project's reading when it is answered | 103 | <code>await expect(purposeRegion(intent)).toHaveCount(0);</code> |
| 99 | choosing another project while an update is held shows only that project's reading when it is answered | 104 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(doughnut.revision), );</code> |

All 14 statements have identical expected expressions. The new shared opener
also retains the original opener’s source contains “Scenario: Archive a job” assertion.
