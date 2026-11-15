# Slice 6 notice assertion dispositions

Original: `37fb6a94cbb69aff99ae403c8177697d40e034c6:dashboard/tests/intent/intent-revision-notice.spec.ts`.
Maintained: `dashboard/frontend-tests/intent/intent-revision-notice.spec.ts`.

Every observing statement retains the exact original expected expression and order.
Setup: actual app entry and selection through frontendIntentRevisionJourney;
immutable answers keyed by source and revision, canonical stream slots held.
Original publishMovingFiles acquisition belongs to the real Backend/E2E cases
named in slice-6-proof.md. Assertions below observe real UI and browser requests.

| Original line | Named maintained case | Maintained line | Exact observing statement |
| --- | --- | --- | --- |
| 66 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 68 | <code>await expect( intentGroupToggle(intent, "e2e_test/features"), ).toHaveAttribute("aria-expanded", "true");</code> |
| 69 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 71 | <code>await expect(feature).toHaveAttribute("aria-pressed", "true");</code> |
| 70 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 72 | <code>await expectReadingOffset(intent, scrolled);</code> |
| 75 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 77 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 78 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 80 | <code>expect(reads).toEqual([ `locations@${pygardon.revision}`, `${featurePath}@${pygardon.revision}`, ]);</code> |
| 94 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 96 | <code>await expect(notice).toHaveCount(1);</code> |
| 95 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 97 | <code>await expect(notice).toHaveAttribute("aria-live", "polite");</code> |
| 96 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 98 | <code>await expect(notice).toContainText( `New revision available — showing ${shortRevision(pygardon.revision)}`, );</code> |
| 99 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 101 | <code>await expect(notice.getByRole("button")).toHaveText(["Show latest"]);</code> |
| 100 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 102 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 103 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 105 | <code>expect(await focused()).toBe(focusedBefore);</code> |
| 104 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 106 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 105 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 107 | <code>await expectReadingKept();</code> |
| 106 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 108 | <code>expect(reads).toHaveLength(2);</code> |
| 115 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 117 | <code>await expect.poll(latest.held).toBe(1);</code> |
| 116 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 118 | <code>await expect(notice).toContainText("Updating…");</code> |
| 117 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 119 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 120 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 122 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 121 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 123 | <code>await expect(feature).toHaveAttribute("aria-pressed", "true");</code> |
| 124 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 126 | <code>await expect(source).toContainText("Scenario: Purge a job");</code> |
| 126 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 128 | <code>await expect(notice).toHaveCount(0);</code> |
| 127 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 129 | <code>await expect(browserRevision(intent)).toContainText(shortRevision(c));</code> |
| 128 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 130 | <code>await expectReadingKept();</code> |
| 129 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 131 | <code>await expect(feature).toBeFocused();</code> |
| 130 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | 132 | <code>expect(reads.slice(2)).toEqual([`locations@${c}`, `${featurePath}@${c}`]);</code> |
| 144 | Development follows a new revision while Intent, opened again, keeps its reading behind the notice | 148 | <code>await expect(intent).toBeHidden();</code> |
| 151 | Development follows a new revision while Intent, opened again, keeps its reading behind the notice | 155 | <code>await expect(status).toContainText( `Published work read at revision ${shortRevision(revision)}`, );</code> |
| 156 | Development follows a new revision while Intent, opened again, keeps its reading behind the notice | 160 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 157 | Development follows a new revision while Intent, opened again, keeps its reading behind the notice | 161 | <code>await expect(revisionNotice(intent)).toContainText( `New revision available — showing ${shortRevision(pygardon.revision)}`, );</code> |
| 160 | Development follows a new revision while Intent, opened again, keeps its reading behind the notice | 164 | <code>await expect(feature).toHaveAttribute("aria-pressed", "true");</code> |
| 162 | Development follows a new revision while Intent, opened again, keeps its reading behind the notice | 166 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 165 | Development follows a new revision while Intent, opened again, keeps its reading behind the notice | 169 | <code>expect(reads).toEqual([ `locations@${pygardon.revision}`, `${featurePath}@${pygardon.revision}`, ]);</code> |
| 185 | a selected feature the latest revision deleted is explained, with nothing else selected | 190 | <code>await expect(purposeRegion(intent)).toContainText( `${featurePath} is not in revision ${shortRevision(revision)}`, );</code> |
| 189 | a selected feature the latest revision deleted is explained, with nothing else selected | 194 | <code>await expect(sourceFile(intent, otherPath)).toBeVisible();</code> |
| 190 | a selected feature the latest revision deleted is explained, with nothing else selected | 195 | <code>await expect( filesColumn(intent).locator('[aria-pressed="true"]'), ).toHaveCount(0);</code> |
| 193 | a selected feature the latest revision deleted is explained, with nothing else selected | 198 | <code>await expect(intent.getByLabel(/ source$/)).toHaveCount(0);</code> |
| 194 | a selected feature the latest revision deleted is explained, with nothing else selected | 199 | <code>await expect(intentReadingPane(intent)).toBeFocused();</code> |
| 195 | a selected feature the latest revision deleted is explained, with nothing else selected | 200 | <code>await expect(browserRevision(intent)).toContainText(shortRevision(revision));</code> |
| 196 | a selected feature the latest revision deleted is explained, with nothing else selected | 201 | <code>expect(reads.slice(2)).toEqual([`locations@${revision}`]);</code> |

All 39 statements have identical expected expressions. The new shared opener
also retains the original opener’s source contains “Scenario: Archive a job” assertion.
