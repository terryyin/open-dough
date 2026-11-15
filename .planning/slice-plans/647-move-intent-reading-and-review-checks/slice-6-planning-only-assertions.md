# Slice 6 planning-only assertion dispositions

Original: `37fb6a94cbb69aff99ae403c8177697d40e034c6:dashboard/tests/intent/intent-revision-planning-only.spec.ts`.
Maintained: `dashboard/frontend-tests/intent/intent-revision-planning-only.spec.ts`.

Every observing statement retains the exact original expected expression and order.
Setup: actual app entry and selection through frontendIntentRevisionJourney;
immutable answers keyed by source and revision, canonical stream slots held.
Original publishMovingFiles acquisition belongs to the real Backend/E2E cases
named in slice-6-proof.md. Assertions below observe real UI and browser requests.

| Original line | Named maintained case | Maintained line | Exact observing statement |
| --- | --- | --- | --- |
| 38 | a planning-only update keeps a persistent browser revision with no file selected | 40 | <code>await expect(intent.getByLabel(/ source$/)).toHaveCount(0);</code> |
| 39 | a planning-only update keeps a persistent browser revision with no file selected | 41 | <code>await expect(browserRevision(intent)).toHaveText( `Test browser at ${shortRevision(pygardon.revision)}`, );</code> |
| 51 | a planning-only update keeps a persistent browser revision with no file selected | 53 | <code>await expect(revisionNotice(intent)).toBeVisible();</code> |
| 52 | a planning-only update keeps a persistent browser revision with no file selected | 54 | <code>await expect(browserRevision(intent)).toHaveText( `Test browser at ${shortRevision(pygardon.revision)}`, );</code> |
| 55 | a planning-only update keeps a persistent browser revision with no file selected | 57 | <code>expect(reads).toHaveLength(2);</code> |
| 65 | a planning-only update keeps a persistent browser revision with no file selected | 67 | <code>await expect.poll(latest.held).toBe(1);</code> |
| 66 | a planning-only update keeps a persistent browser revision with no file selected | 68 | <code>await expect(revisionNotice(intent)).toContainText("Updating…");</code> |
| 67 | a planning-only update keeps a persistent browser revision with no file selected | 69 | <code>await expect(browserRevision(intent)).toHaveText( `Test browser at ${shortRevision(pygardon.revision)}`, );</code> |
| 70 | a planning-only update keeps a persistent browser revision with no file selected | 72 | <code>await expect(ciPanel(intent)).toBeVisible();</code> |
| 72 | a planning-only update keeps a persistent browser revision with no file selected | 74 | <code>await expect(browserRevision(intent)).toHaveText( `Test browser at ${shortRevision(revision)}`, );</code> |
| 75 | a planning-only update keeps a persistent browser revision with no file selected | 77 | <code>await expect(revisionNotice(intent)).toHaveCount(0);</code> |
| 76 | a planning-only update keeps a persistent browser revision with no file selected | 78 | <code>await expect(intent.getByLabel(/ source$/)).toHaveCount(0);</code> |
| 78 | a planning-only update keeps a persistent browser revision with no file selected | 80 | <code>await expect(source).toHaveText(originalText);</code> |
| 80 | a planning-only update keeps a persistent browser revision with no file selected | 82 | <code>expect(reads.slice(2)).toEqual([ `locations@${revision}`, `${featurePath}@${revision}`, ]);</code> |
| 88 | a planning-only update keeps a persistent browser revision with no file selected | 90 | <code>await expect(browserRevision(intent)).toHaveText( `Test browser at ${shortRevision(revision)}`, );</code> |
| 91 | a planning-only update keeps a persistent browser revision with no file selected | 93 | <code>await expect(source).toHaveText(originalText);</code> |

All 16 statements have identical expected expressions. The new shared opener
also retains the original opener’s source contains “Scenario: Archive a job” assertion.
