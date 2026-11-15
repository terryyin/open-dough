# Slice 1 assertion disposition and accepted proof

Current palette compatibility: [integration proof](integration-proof.md); all four colour-role checks remain exact.

Original source: f8c4841a47719925236f78ff220efe9b0795e4f5. This mapping was
written before deleting the six integrated source cases. Every original observer
is listed below against its named maintained case; unchanged actions keep the
original scenario order, variants and independent expectations. Frontend setup
uses frontendApp (static built app, no dashboardServer/FakeGitHub) and explicit
selected-location/file/candidate answers through frontendIntentSources.

The Java include/omission assertion has two homes: the Frontend case retains the
visible omission, and Backend authenticated-read-intent-java.spec.ts /
“Java kind with include lists only matched .java files” supplies settings and
selected/refused files to the real server, observes the exact location listing,
pinned returned text, 404 refusals and no refused-path upstream content call.
The representative E2E intent-recorded-purpose-read.spec.ts opens the actual
recorded candidate through the real server/FakeGitHub, observes the pinned source,
target line and exact upstream content-read count. The Frontend Purpose count
independently observes browser asks. Neither substitutes for the other.

## intent-code-browse-java

Maintained cases: “Intent lists configured nested JUnit source, reads exact pinned Java with line numbers and theme styling, and shares Purpose/Proof with other source”; “a failed Java grammar load leaves configured source readable as exact plain text”.

| Original observer line | Maintained observer | Assertion / distinguishing result |
| --- | --- | --- |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:65 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:63 | `expect(sourceFile(intent, javaPath)).toBeVisible()` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:66 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:64 | `expect( sourceFile(intent, "backend/src/test/java/com/example/Fixture.java"), ).toHaveCount(0)` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:71 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:69 | `expect(fileReadingTab(intent, "Purpose")).toHaveAttribute( "aria-selected", "true", )` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:75 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:73 | `expect(sourceLineText(source)).toHaveText(javaText.split("\n"))` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:76 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:74 | `expect(sourceLineNumbers(source)).toHaveText([ "1", "2", "3", "4", "5", "6", ])` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:84 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:82 | `expect(sourceRevision(intent, javaPath)).toContainText( ’at revision ${shortRevision(doughnut.revision)}’, )` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:87 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:85 | `expectKeywordAndStringColours(source, /^class$/, /^"two"$/)` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:89 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:87 | `expect(await colourOf(sourceToken(source, /^class$/))).toBe( "rgb(215, 58, 73)", )` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:92 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:90 | `expect(await colourOf(sourceToken(source, /^"two"$/))).toBe("rgb(3, 47, 98)")` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:94 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:92 | `expect(await colourOf(sourceToken(source, /^class$/))).toBe( "rgb(249, 117, 131)", )` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:97 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:95 | `expect(await colourOf(sourceToken(source, /^"two"$/))).toBe( "rgb(158, 203, 255)", )` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:100 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:73 | `expect(sourceLineText(source)).toHaveText(javaText.split("\n"))` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:103 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:101 | `expect(proofRegion(intent)).toContainText( "No result of the selected check was found in the readable history", )` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:106 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:104 | `expect(proofRegion(intent).getByRole("table")).toHaveCount(0)` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:108 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:73 | `expect(sourceLineText(source)).toHaveText(javaText.split("\n"))` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:112 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:110 | `expect(sourceLineText(shell)).toHaveText(shellText.split("\n"))` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:113 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:111 | `expectKeywordAndStringColours(shell, /^echo$/, /^"ok"$/)` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:115 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:101 | `expect(proofRegion(intent)).toContainText( "No result of the selected check was found in the readable history", )` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:148 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:143 | `expect(sourceLineText(source)).toHaveText([ 'class Examples { String value = "still readable"; }', "", ])` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:152 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:147 | `expect(sourceLineNumbers(source)).toHaveText(["1", "2"])` |
| dashboard/tests/intent/intent-code-browse-java.spec.ts:153 | dashboard/frontend-tests/intent/intent-code-browse-java.spec.ts:148 | `expect(sourceLineText(source).locator("span")).toHaveCount(0)` |

## intent-entry-folder-summaries

Maintained cases: “Intent location toggle/name select a summary without opening on first name click”.

| Original observer line | Maintained observer | Assertion / distinguishing result |
| --- | --- | --- |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:48 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:42 | `expect(toggle).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:50 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:42 | `expect(toggle).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:51 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:45 | `expect(name).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:53 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:47 | `expect(summary).toContainText(featuresPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:54 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:48 | `expect(summary).toContainText("4 files")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:55 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:49 | `expect(purposeRegion(intent)).toHaveCount(0)` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:63 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:57 | `expect(toggle).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:64 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:45 | `expect(name).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:65 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:47 | `expect(summary).toContainText(featuresPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:67 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:42 | `expect(toggle).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:68 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:45 | `expect(name).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:69 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:48 | `expect(summary).toContainText("4 files")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:71 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:57 | `expect(toggle).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:72 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:47 | `expect(summary).toContainText(featuresPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:77 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:71 | `expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute( "aria-expanded", "false", )` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:82 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:71 | `expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute( "aria-expanded", "false", )` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:86 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:80 | `expect(intentGroupToggle(intent, featuresPath)).toHaveAttribute( "aria-expanded", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:90 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:84 | `expect(intentLocationName(intent, packagedPath)).toHaveAttribute( "aria-pressed", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:95 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:89 | `expect(summary).toContainText(packagedPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:96 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:90 | `expect(summary).toContainText("1 file")` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:98 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:92 | `expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute( "aria-expanded", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:102 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:96 | `expect(intentGroupToggle(intent, featuresPath)).toHaveAttribute( "aria-expanded", "false", )` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:106 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:89 | `expect(summary).toContainText(packagedPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries.spec.ts:112 | dashboard/frontend-tests/intent/intent-entry-folder-summaries.spec.ts:106 | `expectChildNames(summary, [ "jobs/", "reports/", "disk_space.feature", ])` |

## intent-entry-folder-summaries-folders

Maintained cases: “Intent folder toggle/name, keyboard, and location toggle preserve the reader”.

| Original observer line | Maintained observer | Assertion / distinguishing result |
| --- | --- | --- |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:49 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:43 | `expectIntentFoldersCollapsed(intent, featuresPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:51 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:45 | `expect( intent.getByRole("button", { name: ’Expand ${folder}’ }), ).toBeVisible()` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:55 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:49 | `expect(sourceFile(intent, stooqPath)).toBeHidden()` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:56 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:50 | `expect(sourceFile(intent, topFeaturePath)).toBeVisible()` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:64 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:58 | `expect(summary).toContainText(featuresPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:67 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:61 | `expect( intent.getByRole("button", { name: "Expand jobs" }), ).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:70 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:58 | `expect(summary).toContainText(featuresPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:71 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:65 | `expect(intentLocationName(intent, featuresPath)).toHaveAttribute( "aria-pressed", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:76 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:70 | `expect( intent.getByRole("button", { name: "Collapse jobs" }), ).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:79 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:58 | `expect(summary).toContainText(featuresPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:84 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:78 | `expect(jobsName).toHaveAttribute("aria-pressed", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:86 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:80 | `expect(jobsName).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:87 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:70 | `expect( intent.getByRole("button", { name: "Collapse jobs" }), ).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:91 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:85 | `expect(summary).toContainText(jobsFolder)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:92 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:86 | `expect(summary).toContainText("2 files")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:94 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:88 | `expectChildNames(summary, ["batch.feature", "stooq_refresh.feature"])` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:95 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:89 | `expect(intentLocationName(intent, featuresPath)).toHaveAttribute( "aria-pressed", "false", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:101 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:80 | `expect(jobsName).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:102 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:61 | `expect( intent.getByRole("button", { name: "Expand jobs" }), ).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:105 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:85 | `expect(summary).toContainText(jobsFolder)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:106 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:86 | `expect(summary).toContainText("2 files")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:109 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:70 | `expect( intent.getByRole("button", { name: "Collapse jobs" }), ).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:112 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:85 | `expect(summary).toContainText(jobsFolder)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:118 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:80 | `expect(jobsName).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:120 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:114 | `expect(reportsName).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:121 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:78 | `expect(jobsName).toHaveAttribute("aria-pressed", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:123 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:117 | `expect(summary).toContainText(reportsFolder)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:124 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:118 | `expect(summary).toContainText("1 file")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:125 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:119 | `expect(summary).not.toContainText(jobsFolder)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:131 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:125 | `expect(locationToggle).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:133 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:127 | `expect(locationToggle).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:134 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:128 | `expect(intent.getByRole("region", { name: "Summary" })).toContainText( reportsFolder, )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:142 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:136 | `expect( intent.getByRole("button", { name: "Expand reports" }), ).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:146 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:140 | `expect( intent.getByRole("button", { name: "Collapse reports" }), ).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:151 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:145 | `expect(purposeRegion(intent)).toContainText("Feature: Disk space")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:154 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:80 | `expect(jobsName).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:155 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:149 | `expect(intent.getByRole("region", { name: "Summary" })).toContainText( jobsFolder, )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:159 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:65 | `expect(intentLocationName(intent, featuresPath)).toHaveAttribute( "aria-pressed", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:163 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:157 | `expect(intent.getByRole("region", { name: "Summary" })).toContainText( featuresPath, )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:172 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:166 | `expect(source).toContainText("Feature: Stooq refresh")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:173 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:167 | `expect(intentFolderName(intent, "jobs")).toHaveAttribute( "aria-pressed", "false", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:177 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:171 | `expect(sourceFile(intent, stooqPath)).toHaveAttribute( "aria-pressed", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:184 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:178 | `expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute( "aria-expanded", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:188 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:182 | `expect(intentGroupToggle(intent, featuresPath)).toHaveAttribute( "aria-expanded", "false", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:192 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:166 | `expect(source).toContainText("Feature: Stooq refresh")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:193 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:187 | `expect(intent.getByRole("region", { name: "Summary" })).toHaveCount( 0, )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:199 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:182 | `expect(intentGroupToggle(intent, featuresPath)).toHaveAttribute( "aria-expanded", "false", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:203 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:178 | `expect(intentGroupToggle(intent, packagedPath)).toHaveAttribute( "aria-expanded", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:207 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:65 | `expect(intentLocationName(intent, featuresPath)).toHaveAttribute( "aria-pressed", "true", )` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:212 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:58 | `expect(summary).toContainText(featuresPath)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:213 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:207 | `expect(summary).toContainText("4 files")` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:214 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:208 | `expect(source).toHaveCount(0)` |
| dashboard/tests/intent/intent-entry-folder-summaries-folders.spec.ts:215 | dashboard/frontend-tests/intent/intent-entry-folder-summaries-folders.spec.ts:209 | `expect(purposeRegion(intent)).toHaveCount(0)` |

## intent-gherkin-groups

Maintained cases: “Intent group sections start collapsed, expand exclusively, keep Purpose across collapse, leave nested folders local, and stand apart from their rows”.

| Original observer line | Maintained observer | Assertion / distinguishing result |
| --- | --- | --- |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:49 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:55 | `expect(intentGroupToggle(intent, "e2e_test/features")).toBeVisible()` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:50 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:56 | `expect(intentLocationName(intent, "e2e_test/features")).toBeVisible()` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:51 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:57 | `expect( intentGroupToggle(intent, "e2e_test/packaged/features"), ).toBeVisible()` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:54 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:60 | `expect(intentGroupToggle(intent, "empty_features")).toBeVisible()` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:55 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:61 | `expect(intentGroupToggle(intent, "frontend/src")).toBeVisible()` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:56 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:62 | `expectIntentGroupsCollapsed(intent)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:57 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:63 | `expect( sourceFile(intent, "e2e_test/features/recall/recall_note.feature"), ).toHaveCount(0)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:60 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:66 | `expect( sourceFile(intent, "e2e_test/packaged/features/packaged.feature"), ).toHaveCount(0)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:68 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:74 | `expect( sourceFile(intent, "e2e_test/features/recall/recall_note.feature"), ).toBeVisible()` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:72 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:78 | `expect( intentGroupToggle(intent, "e2e_test/features"), ).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:75 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:63 | `expect( sourceFile(intent, "e2e_test/features/recall/recall_note.feature"), ).toHaveCount(0)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:78 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:84 | `expect( sourceFile(intent, "e2e_test/packaged/features/packaged.feature"), ).toBeVisible()` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:82 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:62 | `expectIntentGroupsCollapsed(intent)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:96 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:102 | `expect(source).toContainText("Feature: Recall a note")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:97 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:103 | `expect(feature).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:99 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:102 | `expect(source).toContainText("Feature: Recall a note")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:100 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:63 | `expect( sourceFile(intent, "e2e_test/features/recall/recall_note.feature"), ).toHaveCount(0)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:104 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:110 | `expect( sourceFile(intent, "e2e_test/features/recall/recall_note.feature"), ).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:111 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:78 | `expect( intentGroupToggle(intent, "e2e_test/features"), ).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:114 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:120 | `expect(intent).toContainText( "No gherkin files are published at empty_features for this revision.", )` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:118 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:124 | `expect(intentGroupToggle(intent, "empty_features")).toHaveAttribute( "aria-expanded", "false", )` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:122 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:128 | `expect(intent).not.toContainText( "No gherkin files are published at empty_features for this revision.", )` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:125 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:131 | `expect(intent).toContainText( "Kind unfamiliar-language is not yet supported.", )` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:133 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:139 | `expect(toggle).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:135 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:141 | `expect( intent.getByRole("button", { name: "Expand recall" }), ).toHaveAttribute("aria-expanded", "false")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:138 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:144 | `expect( intentGroupToggle(intent, "e2e_test/features"), ).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:141 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:63 | `expect( sourceFile(intent, "e2e_test/features/recall/recall_note.feature"), ).toHaveCount(0)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:145 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:151 | `expect( intent.getByRole("button", { name: "Collapse recall" }), ).toHaveAttribute("aria-expanded", "true")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:148 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:74 | `expect( sourceFile(intent, "e2e_test/features/recall/recall_note.feature"), ).toBeVisible()` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:154 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:160 | `expect(storySummary(intent)).toHaveCount(0)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:164 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:170 | `expect(intentLocationName(intent, selectedPath)).toHaveAttribute( "aria-pressed", "true", )` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:168 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:174 | `expect(fileRow).toHaveAttribute("aria-pressed", "false")` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:173 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:179 | `expect(rowBackgrounds).toEqual([transparent, transparent])` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:188 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:194 | `expect(intentGroupToggle(intent, expandedPath)).toHaveAttribute( "aria-expanded", "true", )` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:192 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:198 | `expect(intentGroupToggle(intent, selectedPath)).toHaveAttribute( "aria-expanded", "false", )` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:196 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:202 | `expect(expanded?.background).not.toBe(transparent)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:197 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:203 | `expect(rowBackgrounds).not.toContain(expanded?.background)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:199 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:205 | `expect(looks.get(location)?.background).toBe(expanded?.background)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:200 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:206 | `expect(selected?.background).not.toBe(expanded?.background)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:201 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:207 | `expect(rowBackgrounds).not.toContain(selected?.background)` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:203 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:209 | `expect(look).toMatchObject({ mark: "none", controlsShowHeader: true, fullWidth: true, })` |
| dashboard/tests/intent/intent-gherkin-groups.spec.ts:208 | dashboard/frontend-tests/intent/intent-gherkin-groups.spec.ts:214 | `expect(look.labelWeight).toBeGreaterThanOrEqual(600)` |

## intent-gherkin-layout

Maintained cases: “Intent fills the height below the banner; the location browser meets the left edge and it and the reading pane scroll on their own”.

| Original observer line | Maintained observer | Assertion / distinguishing result |
| --- | --- | --- |
| dashboard/tests/intent/intent-gherkin-layout.spec.ts:42 | dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts:43 | `expect( fileSource(intent, "e2e_test/features/area/case_00.feature"), ).toContainText("Feature: Long")` |
| dashboard/tests/intent/intent-gherkin-layout.spec.ts:49 | dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts:50 | `expect( await region.evaluate((el) => el.scrollHeight > el.clientHeight), "the page below the banner does not scroll", ).toBe(false)` |
| dashboard/tests/intent/intent-gherkin-layout.spec.ts:58 | dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts:59 | `expect(browserBox.x).toBe(column.x)` |
| dashboard/tests/intent/intent-gherkin-layout.spec.ts:59 | dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts:60 | `expect(browserBox.y + browserBox.height).toBe(600)` |
| dashboard/tests/intent/intent-gherkin-layout.spec.ts:60 | dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts:61 | `expect(readingBox.y + readingBox.height).toBe(600)` |
| dashboard/tests/intent/intent-gherkin-layout.spec.ts:68 | dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts:69 | `expect([await topOf(browser), await topOf(reading)]).toEqual([200, 0])` |
| dashboard/tests/intent/intent-gherkin-layout.spec.ts:70 | dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts:71 | `expect([await topOf(browser), await topOf(reading)]).toEqual([200, 300])` |

## intent-purpose-case

Maintained cases: “opening a recorded file shows Purpose on its case, reading it once, and opening it again after reading away returns to the case”.

| Original observer line | Maintained observer | Assertion / distinguishing result |
| --- | --- | --- |
| dashboard/tests/intent/intent-purpose-case.spec.ts:62 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:72 | `expect(intentModeTab(intent, "CI status")).toHaveAttribute( "aria-selected", "true", )` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:66 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:76 | `expect(source).toContainText(’Scenario: ${doughnutUniqueScenario}’)` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:67 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:77 | `expectSourceTargetLine(source, doughnutUniqueScenarioLine)` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:68 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:78 | `expect(fileName).toHaveAttribute("aria-pressed", "true")` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:69 | e2e/intent/intent-recorded-purpose-read.spec.ts:25; Frontend intent-purpose-case request filter | `expect(contentReadsOf(requests, doughnutCaseFeaturePath)).toBe(1)` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:75 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:85 | `expect(sourceTargetLine(source)).not.toBeInViewport()` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:77 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:87 | `expect(intent.locator(".source-token").first()).toBeAttached()` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:78 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:85 | `expect(sourceTargetLine(source)).not.toBeInViewport()` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:81 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:91 | `expect(purposeRegion(intent)).toBeVisible()` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:82 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:76 | `expect(source).toContainText(’Scenario: ${doughnutUniqueScenario}’)` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:83 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:77 | `expectSourceTargetLine(source, doughnutUniqueScenarioLine)` |
| dashboard/tests/intent/intent-purpose-case.spec.ts:84 | dashboard/frontend-tests/intent/intent-purpose-case.spec.ts:78 | `expect(fileName).toHaveAttribute("aria-pressed", "true")` |

## Literal focused proof

- PASS: `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-code-browse-java.spec.ts intent/intent-entry-folder-summaries.spec.ts intent/intent-entry-folder-summaries-folders.spec.ts intent/intent-gherkin-groups.spec.ts intent/intent-gherkin-layout.spec.ts intent/intent-purpose-case.spec.ts --workers=1` (all seven cases across six specs, /tmp/647-slice1-frontend-fixed.log).
- PASS: `caffeinate -s -i npm run test:e2e -- intent/intent-recorded-purpose-read.spec.ts --workers=1` (/tmp/647-slice1-e2e.log).
- PASS: `caffeinate -s -i npm run test:dashboard:backend -- intent/authenticated-read-intent-java.spec.ts --workers=1` (all three selection variants, /tmp/647-slice1-backend-java.log).
- PASS: `npm run typecheck:dashboard` after all slice implementation and scratch restoration, including the new E2E file. Coordinator hook-owned lint remains required.

## Scratch discrimination

Reused old-side observation in preparation-evidence.md at 4df4b24298cf313bdbac952a5edd6421345f6f21:
original integrated Purpose baseline and restored pass; replacing
resolveCaseTargetLine(text, caseTarget) with undefined failed target count 1 → 0.
Applied the identical fault at the maintained Frontend boundary.

- Expected FAIL: `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-purpose-case.spec.ts --workers=1`, /tmp/647-slice1-purpose-broken.log: expectSourceTargetLine at intentCodeBrowsePage.ts:39 expected 1, got 0.
- Invalid restoration run: /tmp/647-slice1-purpose-restored.log timed out because the restoration replaced an earlier undefined ternary, creating a self-reference while leaving the target fault. Exact production diff identified both scratch edits; this is no product/test-flake finding and no accepted proof.
- PASS restored: the same literal Frontend Purpose command, /tmp/647-slice1-purpose-restored-fixed.log, after correcting both scratch edits and confirming `git diff -- dashboard/src/IntentFileReading.tsx` empty.

Initial conversion failures were incomplete Java CI answer fields, omitted
no-matching-files classification and stale publication calls in two copied
specs; repaired before the covering six-spec pass. Java Proof now gets explicit
valid CI/history answers instead of the default backlog fallback.

The source review's revisit/file-column facets remain with slice 7; slice 1 provides
source fidelity, group/selection, grammar fallback, target and reading-lifetime
observations. No original slice-1 assertion remains unmapped.

Failure policy: [shared policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
