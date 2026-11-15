# Slice 6 update-outcomes assertion dispositions

Original: `37fb6a94cbb69aff99ae403c8177697d40e034c6:dashboard/tests/intent/intent-revision-update-outcomes.spec.ts`.
Maintained: `dashboard/frontend-tests/intent/intent-revision-update-outcomes.spec.ts`.

Every observing statement retains the exact original expected expression and order.
Setup: actual app entry and selection through frontendIntentRevisionJourney;
immutable answers keyed by source and revision, canonical stream slots held.
Original publishMovingFiles acquisition belongs to the real Backend/E2E cases
named in slice-6-proof.md. Assertions below observe real UI and browser requests.

| Original line | Named maintained case | Maintained line | Exact observing statement |
| --- | --- | --- | --- |
| 65 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 67 | <code>await expect.poll(latest.held).toBe(1);</code> |
| 66 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 68 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 73 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 75 | <code>await expect(notice).toContainText( `New revision available — showing ${shortRevision(pygardon.revision)}`, );</code> |
| 76 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 78 | <code>await expect(notice).toContainText( `Revision ${shortRevision(c)} could not be read: The local authenticated read could not be reached`, );</code> |
| 79 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 81 | <code>await expect(notice).not.toContainText("Updating…");</code> |
| 80 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 82 | <code>await expect(notice.getByRole("button")).toHaveText(["Retry"]);</code> |
| 81 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 83 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 84 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 86 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 85 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 87 | <code>await expect(feature).toHaveAttribute("aria-pressed", "true");</code> |
| 86 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 88 | <code>await expect(feature).toBeFocused();</code> |
| 87 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 89 | <code>await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveAttribute( "aria-expanded", "true", );</code> |
| 92 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 94 | <code>await expect(fileSource(intent, otherPath)).toContainText( "Report free space", );</code> |
| 96 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 98 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 107 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 109 | <code>await expect.poll(latestText.held).toBe(1);</code> |
| 108 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 110 | <code>await expect(browserRevision(intent)).toContainText(shortRevision(c));</code> |
| 109 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 111 | <code>await expect(notice).toHaveCount(0);</code> |
| 110 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 112 | <code>await expect(feature).toBeFocused();</code> |
| 113 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 115 | <code>await expect(readFailure(purpose)).toHaveText( `${featurePath} could not be read at revision ${shortRevision(c)}; showing ${shortRevision(pygardon.revision)}. Retry`, );</code> |
| 116 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 118 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 117 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 119 | <code>await expect(browserRevision(intent)).toContainText(shortRevision(c));</code> |
| 119 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 121 | <code>await expect(source).toContainText("Scenario: Purge a job");</code> |
| 120 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 122 | <code>await expect(readFailure(purpose)).toHaveCount(0);</code> |
| 122 | a failed update keeps the shown reading with its failure and Retry, which applies the update | 124 | <code>expect(reads.slice(2)).toEqual([ `locations@${c}`, `${otherPath}@${pygardon.revision}`, `locations@${c}`, `${featurePath}@${c}`, `${featurePath}@${c}`, ]);</code> |
| 153 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 157 | <code>await expect.poll(latest.held).toBe(1);</code> |
| 155 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 159 | <code>await expect(notice).toContainText( `Revision ${shortRevision(c)} could not be read`, );</code> |
| 158 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 162 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 168 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 172 | <code>await expect(intent).toHaveCount(0);</code> |
| 170 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 174 | <code>await expect.poll(again.held).toBe(1);</code> |
| 171 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 175 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 174 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 178 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 175 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 179 | <code>await expect(feature).toHaveAttribute("aria-pressed", "true");</code> |
| 178 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 182 | <code>await expect(revisionNotice(intent)).toContainText( `New revision available — showing ${shortRevision(pygardon.revision)}`, );</code> |
| 181 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 185 | <code>await expect(revisionNotice(intent)).toContainText( `Revision ${shortRevision(c)} could not be read: The local authenticated read could not be reached`, );</code> |
| 184 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 188 | <code>await expect(revisionNotice(intent).getByRole("button")).toHaveText([ "Retry", ]);</code> |
| 187 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 191 | <code>await expect(browserRevision(intent)).toContainText( shortRevision(pygardon.revision), );</code> |
| 190 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 194 | <code>await expect(source).toContainText("Scenario: Archive a job");</code> |
| 191 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 195 | <code>await expect(feature).toHaveAttribute("aria-pressed", "true");</code> |
| 192 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 196 | <code>await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveAttribute( "aria-expanded", "true", );</code> |
| 196 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | 200 | <code>expect( reads.filter((each) =&gt; each === `locations@${pygardon.revision}`), ).toEqual([`locations@${pygardon.revision}`]);</code> |

All 39 statements have identical expected expressions. The new shared opener
also retains the original opener’s source contains “Scenario: Archive a job” assertion.
