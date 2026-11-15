# Slice 7 assertion occurrence dispositions

Original files at 76ff4d6cd6a138205a0d2bb217350166734c410d (unchanged since suffix base 37fb6a94cbb69aff99ae403c8177697d40e034c6).

## intent-project-visit

- Original dashboard/tests/intent/intent-project-visit.spec.ts:66 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:56; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: expect(selected).not.toBeNull();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:70 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:60; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentDiffReading(intent).code).toHaveAttribute( "aria-busy", "false", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:76 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:66; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intent).toHaveAttribute("data-selected-story", selected ?? "");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:77 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:67; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentPageFrame(intent)).toHaveAttribute( "data-intent-context", "project", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:81 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:71; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect( intent.getByRole("region", { name: "Project Intent", exact: true }), ).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:84 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:74; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expectIntentModeChosen(intent, "CI status");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:85 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:75; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(ciPanel(intent)).toContainText("CI status of main");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:86 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:76; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(filesColumn(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:88 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:78; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expectStoryTab(intent, "Changed tests");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:89 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:79; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentFile(intent, deepSpec)).toHaveAttribute( "aria-pressed", "true", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:93 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:83; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
- Original dashboard/tests/intent/intent-project-visit.spec.ts:97 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:87; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentDiffReading(intent).name).toHaveText(changed.modified);
- Original dashboard/tests/intent/intent-project-visit.spec.ts:102 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:92; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(storyCiLink).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:109 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:99; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(record).toHaveAttribute("data-candidates-reads", /^[1-9]\d*$/);
- Original dashboard/tests/intent/intent-project-visit.spec.ts:114 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:104; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expectIntentModeChosen(intent, "CI status");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:115 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:105; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute( "aria-selected", "true", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:120 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:110; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(source).toContainText("a 11");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:121 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:111; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(source).not.toContainText("more");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:122 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:112; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentDiffReading(intent).container).toHaveCount(0);
- Original dashboard/tests/intent/intent-project-visit.spec.ts:123 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:113; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentFile(intent, candidatePath)).toHaveAttribute( "aria-pressed", "true", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:128 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:118; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(proofRegion(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:129 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:119; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect( intent.getByRole("button", { name: "View story CI comparison" }), ).toHaveCount(0);
- Original dashboard/tests/intent/intent-project-visit.spec.ts:136 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:126; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(entry).toBeFocused();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:137 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:127; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(record).toHaveAttribute( "data-candidates-reads", readsBefore ?? "", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:145 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:135; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expectStoryTab(intent, "Changed tests");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:146 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:136; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentFile(intent, changed.modified)).toHaveAttribute( "aria-pressed", "true", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:150 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:140; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(fileReadingTab(intent, "Proof")).toHaveAttribute( "aria-selected", "true", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:154 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:144; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(storyCiLink).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:156 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:146; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentDiffReading(intent).name).toHaveText(changed.modified);
- Original dashboard/tests/intent/intent-project-visit.spec.ts:161 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:151; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expectIntentModeChosen(intent, "Optimization Candidates");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:164 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:154; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(ciTab).toBeFocused();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:165 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:155; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentFile(intent, candidatePath)).toHaveAttribute( "aria-pressed", "true", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:169 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:159; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(proofRegion(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit.spec.ts:171 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:161; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(ciPanel(intent)).toContainText("CI status of main");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:172 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:162; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(fileReadingTab(intent, "Proof")).toHaveCount(0);
- Original dashboard/tests/intent/intent-project-visit.spec.ts:174 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:164; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expectStoryTab(intent, "Changed tests");
- Original dashboard/tests/intent/intent-project-visit.spec.ts:175 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:165; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: await expect(intentFile(intent, changed.modified)).toHaveAttribute( "aria-pressed", "true", );
- Original dashboard/tests/intent/intent-project-visit.spec.ts:181 → dashboard/frontend-tests/intent/intent-project-visit.spec.ts:171; named case/helper: a candidate's test the story changes reads as published in Project Intent, and returning restores the candidate and then the story's reading.
  Independent expected expression: expect(reads).toEqual(["candidates", `text ${candidatePath}`]);
## intent-project-visit-selection

- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:28 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:28; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expectStoryTab(intent, "Changed tests");
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:37 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:37; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expectSelected(card, false);
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:39 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:39; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expectSelected(card, true);
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:41 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:41; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect(storySummary(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:42 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:42; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect(intentPageFrame(intent)).toHaveAttribute( "data-intent-context", "story", );
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:46 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:46; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expectStoryTab(intent, "CI comparison");
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:47 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:47; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect(backToStory(intent)).toHaveCount(0);
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:50 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:50; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expectIntentModeChosen(intent, "CI status");
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:57 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:57; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expectSelected(card, false);
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:59 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:59; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect(intent).not.toHaveAttribute("data-selected-story");
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:60 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:60; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect(storySummary(intent)).toHaveCount(0);
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:61 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:61; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect( intent.getByRole("heading", { name: "No story selected", exact: true }), ).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:64 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:64; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect(intentPageFrame(intent)).toHaveAttribute( "data-intent-context", "project", );
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:68 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:68; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect( intent.getByRole("region", { name: "Project Intent", exact: true }), ).toBeVisible();
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:71 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:71; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expectIntentModeChosen(intent, "CI status");
- Original dashboard/tests/intent/intent-project-visit-selection.spec.ts:72 → dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts:72; named case/helper: each new selection opens the story at CI comparison, even one cleared and selected again while Intent is hidden, and clearing lands on Project Intent's CI status after a visit that ended on Optimization Candidates.
  Independent expected expression: await expect(ciPanel(intent)).toContainText("CI status of main");
