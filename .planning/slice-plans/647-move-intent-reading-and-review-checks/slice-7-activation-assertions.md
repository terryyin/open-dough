# Slice 7 assertion occurrence dispositions

Original files at 76ff4d6cd6a138205a0d2bb217350166734c410d (unchanged since suffix base 37fb6a94cbb69aff99ae403c8177697d40e034c6).

## intent-home-activation

- Original dashboard/tests/intent/intent-home-activation.spec.ts:87 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:82; named case/helper: selectFile.
  Independent expected expression: await expectFileRead(intent);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:91 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:86; named case/helper: expectFileRead.
  Independent expected expression: await expect(fileName(intent)).toHaveAttribute("aria-pressed", "true");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:92 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:87; named case/helper: expectFileRead.
  Independent expected expression: await expect(intent.getByRole("region", { name: "Purpose" })).toBeVisible();
- Original dashboard/tests/intent/intent-home-activation.spec.ts:93 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:88; named case/helper: expectFileRead.
  Independent expected expression: await expect(ciPanel(intent)).toHaveCount(0);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:105 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:101; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expectCiScope(before, failing.branch);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:107 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:103; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(summary).toBeVisible();
- Original dashboard/tests/intent/intent-home-activation.spec.ts:112 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:108; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expectStoryTab(intent, "CI comparison");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:113 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:109; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expectCiScope(panel, failing.branch);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:114 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:110; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(panel.locator(".intent-ci-story")).toHaveText("Story branch.");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:115 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:111; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(panel).not.toContainText(failing.title);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:116 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:112; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expectCiAnswer(panel, "Failed at fa11ed0 (Break the login)");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:117 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:113; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(summary).toBeVisible();
- Original dashboard/tests/intent/intent-home-activation.spec.ts:119 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:115; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(intent).toHaveAttribute("data-selected-story", selected);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:121 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:117; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(fileName(intent)).toHaveAttribute("aria-pressed", "true");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:125 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:121; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(intent).toHaveAttribute("data-selected-story", selected);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:126 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:122; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(intentPageFrame(intent)).toHaveAttribute( "data-intent-context", "project", );
- Original dashboard/tests/intent/intent-home-activation.spec.ts:130 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:126; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect( intent.getByRole("region", { name: "Project Intent", exact: true }), ).toBeVisible();
- Original dashboard/tests/intent/intent-home-activation.spec.ts:134 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:130; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expectCiScope(trunk, "main");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:135 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:131; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expectCiAnswer(trunk, "Passed at 4774f60 (Add login)");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:137 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:133; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect( filesColumn(intent).locator('[aria-pressed="true"]'), ).toHaveCount(0);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:142 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:138; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(fileName(intent)).toHaveAttribute("aria-pressed", "false");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:143 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:139; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expectCiScope(ciPanel(intent), "main");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:147 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:151; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expectStoryTab(intent, "Changed tests");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:148 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:152; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(fileName(intent)).toHaveAttribute("aria-pressed", "true");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:149 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:153; named case/helper: with a story selected, activating CI comparison judges that story's branch, keeping its header and Changed tests reading, while Project Intent judges main with its own selection.
  Independent expected expression: await expect(intent.getByRole("region", { name: "Purpose" })).toBeVisible();
- Original dashboard/tests/intent/intent-home-activation.spec.ts:176 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:175; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expectIntentModeChosen(intent, "Optimization Candidates");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:177 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:176; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expect(candidates).toBeFocused();
- Original dashboard/tests/intent/intent-home-activation.spec.ts:179 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:178; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expectIntentModeChosen(intent, "CI status");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:180 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:179; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expect(intentModeTab(intent, "CI status")).toBeFocused();
- Original dashboard/tests/intent/intent-home-activation.spec.ts:181 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:180; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expect(page).toHaveURL(/project=open-dough/);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:182 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:181; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expectFileRead(intent);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:188 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:187; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expectIntentModeChosen(intent, "Optimization Candidates");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:190 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:189; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:191 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:190; named case/helper: arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home.
  Independent expected expression: await expect(fileName(intent)).toHaveAttribute("aria-pressed", "false");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:207 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:208; named case/helper: with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision.
  Independent expected expression: await expect(notice).toContainText(waiting);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:210 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:211; named case/helper: with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision.
  Independent expected expression: await expect(feature).toHaveAttribute("aria-pressed", "false");
- Original dashboard/tests/intent/intent-home-activation.spec.ts:211 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:212; named case/helper: with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision.
  Independent expected expression: await expect(notice).toHaveCount(1);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:212 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:213; named case/helper: with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision.
  Independent expected expression: await expect(notice).toContainText(waiting);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:213 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:214; named case/helper: with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision.
  Independent expected expression: await expect(notice.getByRole("button")).toHaveText(["Show latest"]);
- Original dashboard/tests/intent/intent-home-activation.spec.ts:215 → dashboard/frontend-tests/intent/intent-home-activation.spec.ts:216; named case/helper: with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision.
  Independent expected expression: expect(reads.filter((read) => read.startsWith("locations@"))).toEqual([ `locations@${pygardon.revision}`, ]);
