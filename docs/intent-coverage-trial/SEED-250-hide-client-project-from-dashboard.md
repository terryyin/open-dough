# Hide a client project from the dashboard while keeping it maintained

Checkpoint `22fa90aefd3dbed75eba38917fb4dd5b19312d25`. The focused Chromium baseline passed all 31 tests. The strongest proof follows a real settings save into both selectors, keyboard navigation, reload and server restart. A separate journey attaches a hidden project's Claude terminal and checks that Board and Intent stay on a visible project. The main gap is consumer eligibility. File equality protects the saved inventory, while the rollout and feedback workflows have source guidance and no hidden-entry execution proof.

The assessment uses the original [story requirements and examples][story] and [plan proof and slices][plan]. The plan uses file retention as the proof for example 6. The story also promises that downstream consumers still include an otherwise eligible hidden project. Protected verdicts below are reasoned from the observed assertions and fixture paths. No mutations were run.

## Dashboard visibility and selection

| Promise | Verdict | What the tests distinguish |
| --- | --- | --- |
| Hide and show are reachable in System settings → Projects, with clear state and no re-add | **Protected, reasoned-only** | Doughnut's row starts visible, remains present with the user-facing “Hidden from dashboard” and a named Show button, then returns to visible with Hide and the message gone. The action runs against the real settings server. The all-hidden journey also checks Show for each other configured project. The visible copy and named controls make the outcome explicit. [Hide and show][hide] [All-hidden journey][selection] |
| Actions sit on each row beside identity facts and Remove, away from the banner | **Partially protected** | The status assertion is scoped to the named row. The Hide, Show and Remove locators are page-wide after settings opens, so they would accept displaced controls. The implementation places them together on the row. [Locator scope][settings-helpers] [Settings rows][settings-rows] |
| Hidden projects leave tabs, compact selector and page-wide Left/Right cycling | **Protected, reasoned-only** | The hide journey asserts the exact remaining tab labels and open compact option list. Right skips the middle hidden project and Left skips it in reverse. The compact helper opens the actual chooser and checks its selected option, so the check would catch a hidden entry anywhere in that menu. Separate keyboard tests establish wrap and eligibility for the ordinary catalog. A hidden project at the wrap boundary is unexercised. [Hide and show][hide] [Compact helper][compact] [Keyboard cycle][keyboard] |
| Hiding the selected project falls back to a visible project, while hiding another keeps selection | **Protected, reasoned-only** | With Doughnut selected, Hide followed by Back selects Pygardon and puts its ID in the URL. The first journey hides unselected Doughnut and checks that Open Dough remains selected. Both assert the result through the visible selector. The hidden-last wrap fallback is unexercised. [Selection and history][selection] [Hide and show][hide] |
| Direct URLs and prior selection keep hidden Board and Intent out of view | **Partially protected** | Direct Board and Intent URLs for hidden Doughnut normalize and select Open Dough. Back from settings exercises the just-hidden selection. The later browser Back goes to an older Open Dough entry, leaving a separately retained hidden history entry unexercised. The direct-link checks assert chrome and URL, with one fake backlog for all repos and no project-specific content assertion. The generic header journey distinguishes repository content with all projects visible. [Selection and history][selection] [Fake published work][fixture] [Distinct published work][header] |
| All hidden gives an empty Board and keeps settings reachable, distinct from an empty configuration | **Protected, reasoned-only** | The journey keeps four configured rows with Show available, rejects the unconfigured message, then checks the all-hidden heading, no Taken or Backlog list, no radios, and focused settings. It reopens settings and shows Pygardon. The empty-list journey separately checks the unconfigured heading and enabled Add. The state and recovery are directly observable. [Selection and history][selection] [Empty saved list][empty] |
| All hidden gives no Intent content | **Partially protected** | The hide-all sequence starts from Intent and checks the empty heading and absent controls. An explicit hidden-project Intent URL also normalizes to the empty dashboard. There is no negative assertion on the Intent main region or its contents, so stale Intent content alongside the empty heading could escape. [Selection and history][selection] |
| Show restores tabs, compact selection, cycling and ordinary Board selection without Add | **Protected, reasoned-only** | Show restores the exact four labels and menu options. Right selects Doughnut again, and the session journey chooses it and sees the Doughnut-specific Taken record. Together these assertions distinguish restoration of navigation and project content. The show journey exercises restored cycling in one direction. [Hide and show][hide] [Show after session][session-intent] |
| Show restores ordinary Intent selection | **Partially protected** | The first journey checks the Intent radio. The session journey sees the Doughnut-specific Intent read-error message after Show and selection, which identifies the new source. Neither journey loads distinct successful Intent content after Show. [Hide and show][hide] [Show after session][session-intent] |

## Persistence, configuration and consumers

| Promise | Verdict | What the tests distinguish |
| --- | --- | --- |
| Hide survives a page reload and a server restart | **Protected, reasoned-only** | The first journey reloads and then starts a fresh preview server on the same temporary home. The exact visible tab list excludes Doughnut both times. These checks distinguish browser-memory state from configuration restored by the server. [Hide and show][hide] [Fixture][fixture] |
| Show is saved | **Protected, reasoned-only** | After Show the same machine-local JSON parses to exactly the original entries without `hidden`, and the UI returns to the original project list. The older-format startup proof below separately verifies the representation that Show writes. A reload or restart immediately after Show is unexercised. [Hide and show][hide] [Saved-list restart][saved-list] |
| Legacy entries without a visibility choice stay visible | **Protected, reasoned-only** | The hide journey confirms the field is absent before observing four choices. The saved-list journey starts two fresh previews on a pre-written legacy-format two-project file and observes both choices and exact saved bytes. It exercises parsing existing configuration independently of first-start seeding. [Hide and show][hide] [Saved-list restart][saved-list] |
| Production and development save visibility independently | **Partially protected** | One machine fixture adds and hides Sample App in development, checks `hidden: true` in its file, then sees four visible production projects with no hidden field. The environments have different entries. Same-project state across both files, production-to-development isolation and development restart after Hide have no direct exercise. The resolver names one file per environment. [Environment test][environment] [Configuration resolver][configuration] |
| Saved membership, repository, ref and local path are unchanged by hide or show, within the existing machine-local settings | **Protected, reasoned-only** | Exact parsed-array equality after Hide allows only Doughnut's visibility field to change. Exact equality after Show restores the original array. The fixture resolves the normal preview config in its temporary home, and the config spec pins the seed values. The comparison catches removal, reordering and field changes. Development's test asserts the ID and flag only. [Hide and show][hide] [Fixture][fixture] [Seeded fields][seeded-fields] |
| Hide/show stay separate from Remove and the existing Add workflow | **Partially protected** | A hidden row retains Remove and the named confirmation opens and cancels without changing the row. The separate Remove journey confirms actual deletion and restoration through Add for a visible project. The development visibility test adds through the normal UI. Confirming removal of a hidden row is unexercised. [Hide and show][hide] [Remove journey][remove] [Environment test][environment] |
| Release rollout includes an otherwise eligible hidden project | **Not protected** | The rollout skill reads the production file, resolves every entry's repository, ref and path, then rechecks the inventory. File equality protects its input. No reviewed automated test passes a hidden entry through rollout selection or compares eligible visible and hidden entries. [Rollout inventory][release] |
| Shared and combined feedback maintenance include an otherwise eligible hidden project | **Not protected** | Shared collection reads the same production file and applies the process-retrospective setting. The combined cycle uses that discovery with its own local-phase rules. No reviewed test drives a hidden entry through either phase's eligibility and selection. [Shared inventory][shared] [Combined inventory][combined] |
| Other production or development inventory consumers keep their eligibility rules | **Unknown** | The story gives no additional consumer inventory. The server exposes the full configured list and the browser filters separately. The passing raw GET boundary check reads only default visible entries. That identifies the separation in source and the ordinary HTTP boundary, with no general hidden-entry coverage for downstream readers. [Configuration][configuration] [Visible list][visible-list] [Boundary test][boundary] |

## Runtime sessions

| Promise | Verdict | What the tests distinguish |
| --- | --- | --- |
| A hidden project's open session can stay listed and attach its terminal | **Protected, reasoned-only** | A seeded launch record and fake Claude listing produce a uniquely named session before Hide. The entry remains visible after Hide. Clicking it shows the named Terminal and records attachment of the expected short ID at the fake host boundary. This proves the sidebar journey and actual attach request in the fixture. [Session journey][session-board] |
| Opening a hidden project's terminal preserves selection chrome and the visible project's Board and Intent | **Protected, reasoned-only** | After click, the journey checks Pygardon in the tabs, URL and compact list, Pygardon's launch action, and the absence of Doughnut's launch action and Taken marker. It repeats from Intent, requiring Pygardon's source-specific Intent message and no Doughnut text. It checks cycling and shows Doughnut again via settings. These assertions distinguish opening the panel from switching projects. No all-hidden terminal open is exercised. [Board journey][session-board] [Intent journey][session-intent] |
| A hidden project's report can open without restoring that project | **Not protected** | The shared sidebar handler resolves project selection against the visible list and then opens the panel independently. The panel has distinct terminal and final-report dispatch branches. The hidden-project fixture exercises a running Claude terminal twice, with no report-eligible hidden entry. [Sidebar handler][frame] [Panel dispatch][panel] |

The story defers sidebar filtering or labeling, hide confirmation, and bulk changes. They carry no verdict. The test's assertion that Hide opens no dialog describes this implementation.

## Baseline and isolation

Commands ran from the temporary case worktree. On AC immediately before Playwright, load was 3.37 / 4.56 / 5.40, about 3.95 GiB was free, and no competing Playwright process remained. The named run used the repository's macOS sleep guard and two workers. [Local test resources][resources]

```sh
unset GIT_ALTERNATE_OBJECT_DIRECTORIES
time node scripts/setup-native.mjs npm && time node scripts/setup-native.mjs browser
time caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  npx playwright test --config dashboard/playwright.config.ts \
  dashboard/tests/configuration/project-hide.spec.ts \
  dashboard/tests/configuration/project-hide-sessions.spec.ts \
  dashboard/tests/navigation/dashboard-header.spec.ts \
  dashboard/tests/navigation/dashboard-header-compact.spec.ts \
  dashboard/tests/navigation/project-keyboard-navigation.spec.ts \
  dashboard/tests/navigation/project-keyboard-navigation-eligibility.spec.ts \
  dashboard/tests/navigation/project-keyboard-navigation-focus.spec.ts \
  dashboard/backend-tests/project-configuration-boundary.spec.ts \
  dashboard/tests/configuration/project-configuration.spec.ts \
  dashboard/tests/configuration/project-remove.spec.ts \
  dashboard/backend-tests/project-remove-boundary.spec.ts \
  --workers=2 --reporter=list
```

Both setup stages passed, npm in 1.197s and browser in 0.247s. npm printed an allowScripts warning for fsevents. Playwright exited 0 with 31 passed in 27.4s and shell time 28.029s. The three added specs corroborate saved configuration, empty-list behavior and the existing Remove path.

The first boundary check found an inherited Git object alternate pointing outside the temporary directory. Unsetting it initially produced `fatal: bad object HEAD`. The coordinator populated the temporary object store and the repeated check with the variable unset resolved the detached checkpoint with one reachable commit, no refs or remotes, and no alternates file. Planning and docs were omitted from the working tree. The assessment used the supplied original excerpts and relevant source in the temporary checkout. The host filesystem and installed browser cache were shared and Git isolation was an operating boundary. The tests use real preview/dev servers with temporary machine homes, fake GitHub, and a fake Claude host. Final `git status --porcelain --untracked-files=no` was empty. `git diff --quiet` and `git diff --cached --quiet` both exited 0. Active elapsed time was about six minutes, from boundary inspection at 16:25 through report and tracked-state verification at 16:31 SGT.

[story]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/.planning/seeds/SEED-250-hide-client-project-from-dashboard.md#L30-L121
[plan]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/.planning/slice-plans/476-hide-client-project-from-dashboard/PLAN.md#L82-L127
[hide]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-hide.spec.ts#L39-L133
[selection]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-hide.spec.ts#L135-L208
[environment]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-hide.spec.ts#L210-L231
[session-board]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-hide-sessions.spec.ts#L34-L129
[session-intent]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-hide-sessions.spec.ts#L131-L168
[settings-helpers]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/support/systemSettingsPage.ts#L3-L16
[settings-rows]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/src/SystemSettings.tsx#L103-L148
[compact]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/projectChoice.ts#L68-L90
[keyboard]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/navigation/project-keyboard-navigation.spec.ts#L29-L80
[fixture]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/support/projectAddMachine.ts#L25-L85
[header]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/navigation/dashboard-header.spec.ts#L169-L215
[saved-list]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-configuration.spec.ts#L134-L163
[empty]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-configuration.spec.ts#L165-L176
[seeded-fields]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-configuration.spec.ts#L93-L128
[remove]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/tests/configuration/project-remove.spec.ts#L64-L175
[boundary]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/backend-tests/project-configuration-boundary.spec.ts#L5-L50
[configuration]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/server/projectConfiguration.ts
[visible-list]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/src/projectList.tsx#L20-L24
[release]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/.agents/skills/release-and-update-clients/SKILL.md#L28-L50
[shared]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/.agents/skills/collect-client-feedback/SKILL.md#L35-L58
[combined]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/.agents/skills/maintain-feedback-cycle/SKILL.md#L29-L37
[frame]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/src/PageFrame.tsx#L125-L144
[panel]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/dashboard/src/pageSidePanel.ts#L196-L212
[resources]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/tests/local-test-resources.md#L32-L42
