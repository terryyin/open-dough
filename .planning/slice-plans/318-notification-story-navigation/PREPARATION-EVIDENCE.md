## Preparation evidence and decisive premises

Observed in `/Users/terryyin/git/open-dough/.worktrees/open-the-relevant-dashboard-story-from-a-macos-n`
at `2446f02c17735b08df833c3a4483fabb6f4b150a` on 2026-10-19. The same
preparation branch is `codex/open-the-relevant-dashboard-story-from-a-macos-n`;
the publication target is `origin/main`, and the integration checkout is
`/Users/terryyin/git/open-dough`. These are preparation locations, not a future
execution claim. Plan 318 follows the highest allocated number 317 in current
paths and Git history; its path was checked immediately before creation.

| Premise / consuming operation | Observation and limit |
| --- | --- |
| Existing cross-project navigation waits for the right data and reveals the intended card | `env -u NO_COLOR npm run test:dashboard -- session-sidebar-navigation.spec.ts --workers=1` passed. Its real preview page opens the other project's sidebar entry, withholds that project's response, then asserts the identified card in the viewport after release. This is reusable reveal behavior, not proof of a notification URL. |
| That proof detects a missing reveal | Temporarily omitted only `element.scrollIntoView(...)` in `workFocus.ts`'s `keepInView`, then ran the same command. It failed at `session-sidebar-navigation.spec.ts:109`: target card viewport ratio was 0. Restored the exact source bytes; the combined run below passed. No scratch product edit remains. |
| The local fixtures reach alert decisions, process arguments, unavailable UI, and shutdown without native notifications | `env -u NO_COLOR npm run test:dashboard -- session-sidebar-navigation.spec.ts session-alerts.spec.ts session-alerts-unavailable.spec.ts boundary/session-alerts-unread-report.spec.ts boundary/agent-launch-codex-observation-alerts.spec.ts --workers=2` passed. Tests drive isolated launch/session records and assert fake sender calls, alert availability in the page, and termination of a held sender. They do not establish actual delivery or clicks. |
| A real helper can activate the correct default browser after the sending command exits, without navigating on receipt/dismissal | Unsettled, owned by slice 1. `sw_vers` reports macOS 26.6.2 (25G83); `command -v terminal-notifier` finds none on PATH. Safari and Chrome app bundles are present. The seed links the helper's documented URL action and Homebrew distribution. Presence and documentation are not a native result. Installing/authorizing a helper and changing the default browser are machine-state changes, so the permitted early probe owns them before dependent implementation. |

The initial test invocation with inherited `NO_COLOR` failed the project's
quiet-output rule on a Node color warning. The listed commands unset that
variable and passed. Existing fixtures do not implement the new URL contract;
slice 2 must add a discriminating test before implementing it. The complete
native journey remains required in slice 3 even after the helper probe passes.

## Verification and review

Each implementation slice includes its focused verification and local cleanup;
use the execution workflow's post-change refactor and commit gates. There is no
project-supplied numeric slice limit to invent. Slice 1 has one native handoff
question; slice 2 has one URL-resolution rule; slice 3 composes that rule with
the existing notification lifecycle. Native final acceptance stays with the
delivered behavior rather than becoming an unowned later task.

For dashboard source changes run `npm run typecheck:dashboard` and the focused
Playwright suites above, adding consumers when the effect trace requires them.
These checks cover the changed typed boundary and actual rendered/process
effects; a full repository suite is not a blanket local requirement. At each
new proof boundary, confirm failure without its claimed behavior before green.
For maintained prose, check links and the described setup against the observed
journey. Keep temporary native observations here until wrap-up assimilates
lasting behavior into the feature documentation.

The original review found no further concern. Terry's later tab-reuse requirement
adds the bounded native callback probe in slice 3 before dependent production
changes. The slices retain one target model and explicit proof owners. This plan
records no execution completion; native acceptance remains open in G2 and G3.
