# Slice 7 assertion occurrence dispositions

Original files at 76ff4d6cd6a138205a0d2bb217350166734c410d (unchanged since suffix base 37fb6a94cbb69aff99ae403c8177697d40e034c6).

## intent-sidebar-toggle

- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:61 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:61; named case/helper: expectReadingFillsBrowser.
  Independent expected expression: expect(Math.abs(pane.width - browser.width)).toBeLessThanOrEqual(1);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:62 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:62; named case/helper: expectReadingFillsBrowser.
  Independent expected expression: expect(Math.abs(pane.x - browser.x)).toBeLessThanOrEqual(1);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:63 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:63; named case/helper: expectReadingFillsBrowser.
  Independent expected expression: expect(Math.abs(pane.y + pane.height - (browser.y + browser.height))) // The browser's top border sits above the pane. .toBeLessThanOrEqual(1);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:66 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:66; named case/helper: expectReadingFillsBrowser.
  Independent expected expression: expect(pane.y - browser.y).toBeLessThanOrEqual(1);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:76 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:76; named case/helper: openIntentWithoutStory.
  Independent expected expression: await expect(ciPanel(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:77 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:77; named case/helper: openIntentWithoutStory.
  Independent expected expression: await expectFilesShown(intent, true);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:93 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:92; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(intentDiffReading(intent).name).toHaveText(deepSpec);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:96 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:95; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(proofRegion(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:98 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:97; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: expect(offset).toBeGreaterThan(20);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:106 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:105; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: expect(toggleBox.x).toBeGreaterThan(tabsBox.x + tabsBox.width);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:107 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:106; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: expect( Math.abs(toggleBox.x + toggleBox.width - (barBox.x + barBox.width)), ).toBeLessThanOrEqual(32);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:110 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:109; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(intentModeBar(intent).getByRole("button")).toHaveCount(0);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:113 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:112; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expectFilesShown(intent, false);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:115 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:114; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: expect(hidden.width).toBeGreaterThan(before.width);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:116 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:115; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(proofRegion(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:119 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:118; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: expect(hidden.y).toBeGreaterThanOrEqual(header.y + header.height);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:123 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:122; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(filesToggle(intent)).toHaveCount(0);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:124 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:123; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(intentReadingPane(intent)).toBeHidden();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:126 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:125; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expectFilesShown(intent, false);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:127 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:126; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(proofRegion(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:131 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:130; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expectFilesShown(intent, true);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:132 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:131; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(storyOnly(intent)).toBeChecked();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:133 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:132; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(intentFile(intent, deepSpec)).toHaveAttribute( "aria-pressed", "true", );
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:138 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:137; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(folderToggle(intent, name, true)).toBeVisible();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:139 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:138; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect.poll(() => filesScroll(intent)).toBe(offset);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:140 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:139; named case/helper: Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were.
  Independent expected expression: await expect(proofTab).toHaveAttribute("aria-selected", "true");
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:149 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:148; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expectFilesShown(intent, false);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:153 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:152; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expectFilesShown(intent, true);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:155 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:154; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expect(filesToggle(intent)).toHaveCount(0);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:157 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:156; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expectStoryTab(intent, "Changed tests");
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:158 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:157; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expectFilesShown(intent, false);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:162 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:161; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expect(intent).toHaveCount(0);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:164 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:163; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expectFilesShown(intent, false);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:168 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:167; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expect(intent).toContainText( "No intent locations are configured for Doughnut.", );
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:171 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:170; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expect(filesToggle(intent)).toHaveCount(0);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:174 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:173; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expect(storyTitle(intent)).toHaveText(storyA.title);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:176 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:175; named case/helper: the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it.
  Independent expected expression: await expectFilesShown(intent, true);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:188 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:187; named case/helper: with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width.
  Independent expected expression: await expect(filesToggle(intent)).toBeFocused();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:190 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:189; named case/helper: with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width.
  Independent expected expression: await expectFilesShown(intent, false);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:191 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:190; named case/helper: with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width.
  Independent expected expression: await expect(intentModeBar(intent).getByRole("tab")).toHaveText([ "CI status", "Optimization Candidates", ]);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:195 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:194; named case/helper: with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width.
  Independent expected expression: await expect(filesToggle(intent)).toHaveAccessibleName("Show files");
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:196 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:195; named case/helper: with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width.
  Independent expected expression: await expect(ciPanel(intent)).toBeVisible();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:197 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:196; named case/helper: with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width.
  Independent expected expression: await expectReadingFillsBrowser(intent);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:199 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:198; named case/helper: with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width.
  Independent expected expression: await expect(filesToggle(intent)).toBeFocused();
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:201 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:200; named case/helper: with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width.
  Independent expected expression: await expectFilesShown(intent, true);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:212 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:211; named case/helper: narrow, the hidden column gives the reading pane the height under the strip.
  Independent expected expression: expect(before.height).toBeLessThan(browser.height - 40);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:215 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:214; named case/helper: narrow, the hidden column gives the reading pane the height under the strip.
  Independent expected expression: await expectFilesShown(intent, false);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:217 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:216; named case/helper: narrow, the hidden column gives the reading pane the height under the strip.
  Independent expected expression: expect(pane.height).toBeGreaterThan(before.height);
- Original dashboard/tests/intent/intent-sidebar-toggle.spec.ts:219 → dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts:218; named case/helper: narrow, the hidden column gives the reading pane the height under the strip.
  Independent expected expression: expect(pane.y).toBeGreaterThanOrEqual(bar.y + bar.height);

Total original observing statements: 143. Missing: 0.
