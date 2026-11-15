# Slice 6 settings-update assertion dispositions

Original: `37fb6a94cbb69aff99ae403c8177697d40e034c6:dashboard/tests/intent/intent-revision-settings-update.spec.ts`.
Maintained: `dashboard/frontend-tests/intent/intent-revision-settings-update.spec.ts`.

Every observing statement retains the exact original expected expression and order.
Setup: actual app entry and selection through frontendIntentRevisionJourney;
immutable answers keyed by source and revision, canonical stream slots held.
Original publishMovingFiles acquisition belongs to the real Backend/E2E cases
named in slice-6-proof.md. Assertions below observe real UI and browser requests.

| Original line | Named maintained case | Maintained line | Exact observing statement |
| --- | --- | --- | --- |
| 53 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 46 | <code>await expect(notice).toContainText( `New revision available — showing ${shortRevision(pygardon.revision)}`, );</code> |
| 56 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 49 | <code>await expect(notice).toContainText( `Revision ${shortRevision(c)} could not be read: .planning/open-dough.json could not be read.`, );</code> |
| 59 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 52 | <code>await expect(notice.getByRole("button")).toHaveText(["Retry"]);</code> |
| 60 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 53 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 61 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 54 | <code>await expect(feature).toHaveAttribute("aria-pressed", "true");</code> |
| 62 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 55 | <code>await expect(intent.locator(".intent-settings-problem")).toHaveCount(0);</code> |
| 63 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 56 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 69 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 62 | <code>await expect(source).toContainText("Scenario: Purge a job");</code> |
| 70 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 63 | <code>await expect(revisionNotice(intent)).toHaveCount(0);</code> |
| 71 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | 64 | <code>await expect(browserRevision(intent)).toContainText(shortRevision(c));</code> |

All 10 statements have identical expected expressions. The new shared opener
also retains the original opener’s source contains “Scenario: Archive a job” assertion.
