# Slice 2 assertion disposition

Original revision: `cd02f6a5171cf066ef111a467e12fd7492339171`. This map was recorded before deleting the three original specs. Frontend uses the built app, explicit service answers, shared original source data/builders and page objects. Every original observer below remains at the same scenario point unless its real upstream boundary is named.

## intent-gherkin-settings-problems

Maintained Frontend cases keep the original test names, concrete variants and ordering.

| Original observer | Maintained observer | Preserved assertion |
| --- | --- | --- |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:50 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:38 | `expect(intent).toContainText( ".planning/open-dough.json could not be read, so Intent locations for Doughnut are unavailable.", );` |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:53 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:41 | `expect(intent).not.toContainText( "No intent locations are configured", );` |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:56 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:44 | `expect(intent).not.toContainText("is not valid JSON");` |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:61 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:54 | `expect(intent).toContainText( ".planning/open-dough.json is not valid JSON, so Intent locations for Pygardon could not be read.", );` |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:64 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:57 | `expect(intent).not.toContainText( "No intent locations are configured", );` |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:67 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:60 | `expect(intent).not.toContainText( "could not be read, so Intent locations for Pygardon are unavailable.", );` |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:95 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:82 | `expect(problem).toHaveText( `Intent locations for Doughnut could not be read: The local authenticated read could not be reached while reading .planning/open-dough.json at ${published.revision}. Retry`, );` |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:101 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:88 | `expect(readFailure(intent)).toHaveCount(0);` |
| dashboard/tests/intent/intent-gherkin-settings-problems.spec.ts:102 | dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts:89 | `expect(intent).toContainText( "No intent locations are configured for Doughnut.", );` |

## intent-read-recovery

Maintained Frontend cases keep the original test names, concrete variants and ordering.

| Original observer | Maintained observer | Preserved assertion |
| --- | --- | --- |
| dashboard/tests/intent/intent-read-recovery.spec.ts:49 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:57 | `expect(problem).toContainText( "The local authenticated read could not be reached", );` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:52 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:60 | `expect(readRetry(problem)).toBeVisible();` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:53 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:61 | `expect(reads()).toBe(1);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:58 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:65 | `expect(reads()).toBe(1);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:59 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:66 | `expect(await askedAfter()).toEqual([]);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:61 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:68 | `expect(await askedAfter()).toEqual([15_000]);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:62 | e2e/intent/intent-read-boundary-recovery.spec.ts:82 (both classified-failure variants) | `expect(headsChecks(githubFor(page).calls)).toHaveLength(checksBefore + 1);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:63 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:69 | `expect(reads()).toBe(2);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:64 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:70 | `expect(problem).toContainText("could not be reached");` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:74 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:80 | `expect(reads()).toBe(before);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:77 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:83 | `expect(reads()).toBe(before + 1);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:79 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:85 | `expect(problem).toContainText("could not be reached");` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:83 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:89 | `expect(intentLocationName(intent, "scripts")).toBeVisible();` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:84 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:90 | `expect(problem).toHaveCount(0);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:86 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:92 | `expect(reads()).toBe(5);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:104 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:107 | `expect(readFailure(intent)).toContainText("could not be reached");` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:107 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:110 | `expect(reads()).toBe(1);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:111 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:115 | `expect(reads()).toBe(2);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:112 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:116 | `expect(intentLocationName(intent, "scripts")).toBeVisible();` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:114 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:118 | `expect(reads()).toBe(2);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:146 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:144 | `expect(publishedProblem).toBeVisible();` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:147 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:145 | `expect(intentProblem).toContainText("could not be reached");` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:148 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:146 | `expect([detailReads, reads()]).toEqual([1, 1]);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:152 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:150 | `expect([detailReads, reads()]).toEqual([1, 1]);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:154 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:152 | `expect([detailReads, reads()]).toEqual([2, 2]);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:155 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:153 | `expect(publishedProblem).toHaveCount(0);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:156 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:154 | `expect(intentProblem).toContainText("could not be reached");` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:160 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:158 | `expect([detailReads, reads()]).toEqual([2, 2]);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:162 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:160 | `expect([detailReads, reads()]).toEqual([2, 3]);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:163 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:161 | `expect(intentLocationName(intent, "scripts")).toBeVisible();` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:175 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:176 | `expect(problem).toContainText( ".planning/open-dough.json is not valid JSON", );` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:179 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:180 | `expect(reads()).toBe(1);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:180 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:181 | `expect(problem).toBeVisible();` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:184 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:185 | `expect(reads()).toBe(2);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:185 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:186 | `expect(problem).toContainText( ".planning/open-dough.json is not valid JSON", );` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:211 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:204 | `expect(readFailure(intent)).toContainText("GitHub limited the rate");` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:216 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:209 | `expect(reads()).toBe(1);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:219 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:211 | `expect(reads()).toBe(2);` |
| dashboard/tests/intent/intent-read-recovery.spec.ts:220 | dashboard/frontend-tests/intent/intent-read-recovery.spec.ts:212 | `expect(intentLocationName(intent, "scripts")).toBeVisible();` |

## intent-source-target-recovery

Maintained Frontend cases keep the original test names, concrete variants and ordering.

| Original observer | Maintained observer | Preserved assertion |
| --- | --- | --- |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:89 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:90 | `expectCandidatesRevision(intent, beforeRevision);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:96 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:97 | `expect(source).toContainText(`def ${pygardonClipCase}()`);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:97 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:98 | `expectSourceTargetLine(source, targetLine);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:101 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:102 | `expect(source).toBeFocused();` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:103 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:104 | `expect(offset).toBeGreaterThan(0);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:104 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:105 | `expect(sourceRevision(intent, pygardonClipPath)).toHaveText( `${pygardonClipPath} at revision ${shortRevision(beforeRevision)}`, );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:107 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:108 | `expect(reads).toEqual([ `locations@${beforeRevision}`, `test-optimization-candidates@${beforeRevision}`, `${pygardonClipPath}@${beforeRevision}`, ]);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:116 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:118 | `expect(revisionNotice(intent)).toBeVisible();` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:117 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:119 | `expect(source).toBeFocused();` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:118 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:120 | `expectSourceTargetLine(source, targetLine);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:119 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:121 | `expectReadingOffset(intent, offset);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:120 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:122 | `expect(browserRevision(intent)).toContainText( shortRevision(beforeRevision), );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:134 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:136 | `expect.poll(latest.held).toBe(1);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:135 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:137 | `expect(browserRevision(intent)).toContainText( shortRevision(afterRevision), );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:138 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:140 | `expect(sourceRevision(intent, pygardonClipPath)).toHaveText( `${pygardonClipPath} at revision ${shortRevision(beforeRevision)}`, );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:141 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:143 | `expect(source).toContainText("assert True");` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:142 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:144 | `expectSourceTargetLine(source, targetLine);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:143 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:145 | `expectReadingOffset(intent, offset);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:144 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:146 | `expect(file).toBeFocused();` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:147 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:149 | `expect(problem).toHaveCount(0);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:150 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:152 | `expectSteadyPace(await passTimeUntilCheckedWhileReadsOutstanding(page));` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:151 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:153 | `expect(source).toContainText("assert True");` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:152 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:154 | `expect(sourceRevision(intent, pygardonClipPath)).toHaveText( `${pygardonClipPath} at revision ${shortRevision(beforeRevision)}`, );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:158 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:160 | `expect(problem).toHaveText( `${pygardonClipPath} could not be read at revision ${shortRevision(afterRevision)}; showing ${shortRevision(beforeRevision)}. Retry`, );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:161 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:163 | `expect(source).toContainText("assert True");` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:162 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:164 | `expectSourceTargetLine(source, targetLine);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:163 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:165 | `expect(sourceRevision(intent, pygardonClipPath)).toHaveText( `${pygardonClipPath} at revision ${shortRevision(beforeRevision)}`, );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:166 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:168 | `expect(file).toBeFocused();` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:167 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:169 | `expectReadingOffset(intent, offset);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:168 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:170 | `expect(reads).toHaveLength(6);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:171 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:173 | `expect(source).toContainText("assert 2 == 2");` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:172 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:174 | `expectSourceTargetLine(source, targetLine);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:173 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:175 | `expect(sourceRevision(intent, pygardonClipPath)).toHaveText( `${pygardonClipPath} at revision ${shortRevision(afterRevision)}`, );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:176 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:178 | `expect(browserRevision(intent)).toContainText( shortRevision(afterRevision), );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:179 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:181 | `expect(problem).toHaveCount(0);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:180 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:182 | `expectReadingOffset(intent, offset);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:181 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:183 | `expect(file).toBeFocused();` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:183 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:185 | `expect(reads[3]).toBe(`locations@${afterRevision}`);` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:185 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:187 | `expect(reads.slice(4, 6).sort()).toEqual( [ `test-optimization-candidates@${afterRevision}`, `${pygardonClipPath}@${afterRevision}`, ].sort(), );` |
| dashboard/tests/intent/intent-source-target-recovery.spec.ts:191 | dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts:193 | `expect(reads.slice(6)).toEqual( outcome === "failed then retried" ? [`${pygardonClipPath}@${afterRevision}`] : [], );` |

## Setup and boundary ownership

- Frontend settings cases arrange classified location answers; Backend `authenticated-read-intent-locations-problems` / “answers malformed and unreadable settings distinctly from not-configured” parses the real published `{not json` and real unreachable settings. `authenticated-read-intent-locations` / “answers not-configured when the settings omit intent locations” proves absence separately.
- Backend “keeps an unmarked settings refusal and a classified whole-read listing failure distinct” observes the real 403 upstream refusal and 503→502 transient answer; the admission case observes real 404 outside-path and HTTP400 unsafe-path refusals.
- Supplemental `intent-shared-reads` checks real client sharedRead/repositoryFileReads/answerMemo behavior behind a substituted fetch. Its Backend folder does not make it real-server or GitHub upstream evidence; no such claim is made. The actual original upstream count is observed in E2E.
- E2E `intent-read-boundary-recovery` uses real dashboardServer/FakeGitHub and published settings/source. Both “settings” and “listing” variants observe classified failure, no retry at14999ms, one retry at15250ms, healing UI and exactly one additional upstream heads check. The original GitHub-count assertion moved here; Frontend still independently observes the browser check at15000ms.
- Source-target cases retain the original before/after described revisions, selected line44, held/failure protocol, old text/revision/focus/offset while pending and exact request sequence after release/retry. The state is advanced only after the old source has been observed; no historical judgment is supplied by setup.
- `preholdRevisionStreamSlots` in `dashboard/tests/support/revisionStreamSlots.ts` supplies the same genuine precondition as original dashboardTest: both named navigator-lock stream slots are occupied before navigation. The fixture, converted Frontend recovery cases and connection-logo case share this owner. Real app code therefore uses its revision-check schedule, observed by `whileNotingChecks`; the helper does not synthesize the expected requests. No real SSE connection is claimed.

## Literal passing proof

- `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-gherkin-settings-problems.spec.ts intent/intent-read-recovery.spec.ts intent/intent-source-target-recovery.spec.ts --workers=1 --reporter=line`: all9 cases pass, including restored candidate; `/tmp/647-slice2-frontend-restored.log`.
- `caffeinate -s -i npm run test:e2e -- intent/intent-read-boundary-recovery.spec.ts --workers=1 --reporter=line`: all three real classified-failure/rate-limited cases pass; `/tmp/647-slice2-e2e-final.log`.
- `caffeinate -s -i npm run test:dashboard:backend -- intent/authenticated-read-intent-locations-problems.spec.ts intent/authenticated-read-intent-locations.spec.ts intent/intent-shared-reads.spec.ts --workers=1 --reporter=line`: all13 cases pass; `/tmp/647-slice2-backend.log`.

The same original rate-limited listing journey also remains in E2E `intent-read-boundary-recovery` to preserve actual GitHub classification and directed server wait; Frontend separately proves controlled-answer timing.

## Recovery discrimination

The source-target fault accepted in slice1 cannot discriminate backoff. Here change only `transientRecovery.ts`’s initial15s wait to16s. Original baseline passed; both original and maintained cases fail at the retry-count assertion expected2, actual1 after15250ms. Exact restoration leaves the production diff empty. Original restored case and all9 restored Frontend cases pass.

- Old baseline and restored command: `caffeinate -s -i npm run test:dashboard:integrated -- intent/intent-read-recovery.spec.ts --grep 'unreachable Intent locations' --workers=1 --reporter=line`; logs `/tmp/647-slice2-old-baseline.log`, `/tmp/647-slice2-old-restored.log`.
- Same old command with scratch fault: expected fail, `/tmp/647-slice2-old-broken.log`.
- New scratch command: `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-read-recovery.spec.ts --grep 'unreachable Intent locations' --workers=1 --reporter=line`: expected fail, `/tmp/647-slice2-new-broken.log`. Restored covering command above passes.

Initial conversion failures were copied argument insertions and a malformed route copied without its matcher, plus missing original stream-slot preholding. They were diagnosed from exact source/error context and repaired; the complete nine-case pass establishes the repaired setup. No production behavior changed.

Proof host: macOS awake on AC, load7.63/9.67/12.83,47%memory free. Focused one-worker browser/backend runs sequenced under `caffeinate -s -i`; no observation deferred.

Failure policy: [shared policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Refactor proof

Extracted the original named browser callback and its `addInitScript` installation
into `revisionStreamSlots.ts`; dashboardTest retains server/GitHub lifecycle and
its default-true, explicit-false fixture API. Stream journeys retain independent
lock acquisition/release observations. No production code or lock values changed.

- `caffeinate -s -i npm run test:e2e -- observation/auto-refresh.spec.ts observation/revision-stream.spec.ts --grep 'quiet main is only checked|a streaming page sends no since|seven pages of one context' --workers=1 --reporter=line`: all3 pass,13.7s; default-preheld exact conditional heads checks, explicit-opt-out quiet stream, and actual two-holder/five-checker slot transfer when a holder hides.
- `caffeinate -s -i npm run test:dashboard:integrated -- intent/intent-test-optimization-candidates-revision.spec.ts --workers=1 --reporter=line`:1 pass,5.6s; a real revision check retains the shown candidate record until Show latest, then shows the new record.
- `npm run typecheck:dashboard`: pass,exit0; `git diff --check`: pass.

Existing Frontend scenario/assertion proof is retained: only identical lock
installation moved. The coordinator's covering Frontend group passed with2workers
after the initial refactor return, including connection-logo. Accepted no-page Backend proof and
registration proof are unaffected. Equivalent-purpose E2E/Integrated checks above
freshly cover shared default and opt-out preconditions; no whole-group replay was
needed for this mechanical relocation.

Proof host at launch: awake macOS on AC,load10.38/8.34/9.98,46%memory free;
no competing Playwright process and no owned heavy overlap. Focused one-worker
runs were sequenced under `caffeinate -s -i`; neither failure/contention nor the
10min reconsideration window arose. Raw logs are `/tmp/647-slice2-refactor-{e2e,integrated,typecheck}.log`.

The read-only formatting projection exposed repeated script-location setup in
`intent-read-recovery.spec.ts`. Its private `putScriptIntentSources` now constructs
that one precondition through MakeMe and `putFrontendIntentSources` for the four
configured-location cases. Malformed/no-location setup remains separate. Every
scenario action, expected time/count and assertion is unchanged; observer line
references above follow the insertion. No new shared API was added.

- `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-read-recovery.spec.ts --workers=1 --reporter=line`: all5 pass,6.5s; `/tmp/647-slice2-private-setup-frontend.log`.
- `./node_modules/.bin/prettier dashboard/frontend-tests/intent/intent-read-recovery.spec.ts | wc -l`:242 projected lines; source213lines. Read-only output; no formatting applied.
- `npm run typecheck:dashboard`: pass,exit0; `/tmp/647-slice2-private-setup-typecheck.log`. `git diff --check`: pass.

Only this file's source setup required fresh proof. Shared stream-helper,
connection-logo and other accepted boundaries retain the coordinator's full
Frontend pass (`/tmp/647-slice2-frontend-group.log`, terminal exit0) and prior
E2E/Integrated/Backend proof. No required observation remains deferred.

Private-setup launch basis: awake AC macOS,load38.37/21.57/15.27,37%memory free;
actual CPU64.41%idle and14GBunused despite historical load and another worktree's
Frontend run. One-worker five-case proof under `caffeinate -s -i` was bounded and
sequenced with owned work. No failure/contention or10min reconsideration arose.
