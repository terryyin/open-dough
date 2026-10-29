# Policy observation coverage map

This map was written before narrowing `productionUpdatePolicies.ts` at
`2f8cb0e23717e91c6899dc2a26b65dcc9ffd2425`. Original locations below refer to
that revision. Surviving locations name the test/helper and the actual signal;
current observation locations are recorded below; names remain stable through formatting. No production code changes.

## Boundary and setup

The real watcher journey still starts from `publishedMainFixture(true)` with
real package scripts, fault gate, counting build gate, npm install, Vite build,
preview and browser. `productionReplacement` observes the reported selected
commit, same URL, new PID, former PID ended and new PID alive. `journey.built`
is an expected list populated only after that activation; comparison with
`builtCommitPrefixes` reads independent build-gate records. `deploymentWork`
compares preparation/install attempts, gate builds, activation reports and
preview PIDs. `settledSkip` waits for a skip and two further completed checks.
Fixtures supply commits and machine-local causes, never qualification outcomes,
build success or served pages.

The qualification fixture publishes real remote Git trees, invokes the unchanged
`qualifyPublishedRange`, asserts an empty inspection directory after each call,
and removes its owned origin/HOME. Its extracted support remains read-only
setup and the existing background-maintenance test support. Qualification proves
path/policy decisions; only the retained watcher assertions prove baseline
ownership and no deployment work.

## Original observation ledger

| Original setup → trigger | Original observation | Inspected surviving/replacement observation | Fault detection and disposition |
| --- | --- | --- | --- |
| Served C; publish docs+D planning | D skip reports D and baseline C | Retained D exact skip message after `settledSkip` | Unique real watcher baseline/no-work path retained. |
| Same D | `work()` unchanged | Retained exact before/after object equality | Observes no preparation/install attempt, gate build, activation or preview restart; direct qualification cannot replace this. |
| Same D | served PID alive, browser title MAIN C | Retained PID and title assertions | Actual served app remains usable after excluded checks. |
| App E+docs then notes E arrive in one push | latest E replaces prior preview | Retained `journey.replacedBy(e)` with policy now included in the accumulated app commit | Same URL/new PID/old ended/new live still observed; no intermediate application activation. |
| Same accumulated range | browser title MAIN E | Retained MAIN E title after actual build | Build content is from the real application tree. |
| Same accumulated range | intermediate application SHA absent from watcher output | Retained `not.toContain(application)` | Selection is the latest remote commit, not an earlier qualifying commit. |
| Same accumulated range | exact gate prefix sequence | Retained `builtCommitPrefixes === prefixesOf(state.built)` | Detects additional or wrong selected builds. |
| Same accumulated range | exactly one preparation delta | Retained `preparing === before.preparing + 1` | Combined policy/application/docs range performs one real activation. |
| F publishes changed exclusions+app+docs | F replaces prior preview | Policy update is folded into real E replacement; real-Git new `qualification follows published extra and documentation rules…` asserts exact changed/qualifying paths for original F policy variation | Separate full deployment duplicates selected-policy qualification plus real replacement already retained at E/Q/S. Policy grammar stays in existing owner. |
| Same F | browser title MAIN F | Real E MAIN E title with combined policy/application update; retained Q MAIN P and S MAIN R titles | Removed literal F marker is replaced by equivalent real built-title observation, not a case-title/count claim. |
| Development workflow differs uncommitted | Precondition consumed by subsequent policy checks | Retained dirty original workflow before G; new boundary case writes same conflict before extra/docs qualification | Candidate E excludes extra while local original does not; real G must reach this conflicting consumer. |
| Published F policy; extra G | G settled skip, baseline F in message | Retained G settled skip and exact baseline E message | Direct watcher precedence remains: reading dirty local policy would attempt a deployment. |
| Same G | work unchanged, served PID alive | Retained work equality/PID; browser title MAIN E additionally checked | No installation/build/restart remains a watcher observation. |
| F policy allows docs; publish docs H | H qualifies (`replacedBy`, no skip) | New real-Git extra/docs case: exact docs-only result `qualifies: true`, `changed/qualifying: [docs/h.md]` despite conflicting dirty local policy; accumulated docs+extra result also exact | Overlapping rule decision relocated. General watcher qualification→real deployment remains at E/Q/S. No claim that boundary proof observes watcher baseline or no-work. |
| Same H | exact build prefix sequence | Retained E/Q/S exact independent gate-prefix comparisons | Extra/wrong builds remain detected; H's now-removed cycle is intentionally absent. |
| Same H | browser title remains MAIN F | Retained S docs-only selected commit serves MAIN R from retained app tree; basic watcher restart test also builds docs-only latest commit and observes NEXT MAIN title and PINNED SOURCE asset | Content pinning to selected tree, including unchanged title/source across a docs-only selected commit, still crosses real npm/Vite/browser. |
| Unsupported P includes app MAIN P | identical error names P, baseline and served URL more than twice | Retained exact `policyError`, count >2 | Policy failures remain retryable and keep baseline through multiple completed attempts. |
| Same P | work unchanged, PID alive, title MAIN F | Retained work equality/PID; title MAIN E tracks folded predecessor | Unsupported policy cannot install/build/restart or replace served app. |
| Repair Q workflow+docs after P | Q activates, title MAIN P | Retained Q actual replacement/title; Q restores same E policy, which excludes .github/docs | Stronger discriminator: only P's retained application paths qualify E→Q; advancing baseline to failed P would leave only ignored workflow/docs and skip Q. |
| Same Q | exact prefix sequence | Retained exact gate-prefix comparison | Real success advances baseline, with no phantom/intermediate build. |
| Fault file then app R | R failure names selected R; real transient build cause logged | Retained failure and TRANSIENT build FAILURE assertions | Distinct from unsupported policy; real build fails before counting/Vite gate. |
| Fault remains; docs-only S | S also fails, keeping Q at URL, Q PID alive | All retained; additionally reload/title MAIN P while fault remains | Failed build must preserve working preview and baseline; docs cannot hide retained R application paths. |
| Remove cause; same S retried | S replaces; S not skipped; R never activates | All retained | Recovery requires latest candidate while preserving selected-commit exactness and same URL/process replacement. |
| Same recovery S | real title MAIN R; exact gate prefix sequence | All retained | Latest docs-only tree includes unserved app R; real build and served tree remain observed. |
| Successful S; docs T | settled skip and message compares S→T; work unchanged; PID alive | All retained; browser title MAIN R additionally checked | Only successful activation advances baseline; post-success excluded commit does no deployment work. |

The retained E/Q watcher policy adds `extra/**` and `.github/**` while keeping
original docs/planning exclusions. Original F's different policy (docs qualifies,
extra does not) is independently observed in the new Git-boundary test before
removing F/H. E's own app path still qualifies even though its workflow is ignored.
P's comment makes that published policy unsupported. Q restores the exact E
policy; neither its workflow repair nor docs can hide a lost P baseline.

## Unchanged integration owners inspected

- `productionUpdateJourney`: beforeAll MAIN A browser title, real install and
  gate; afterAll stops page/watcher/development and fixture/hosts even on failure.
- `production-watcher-updates.spec.ts`: initial exact gate checkout; repeated
  unchanged checks retain PID/one preparation/one build; held B then C preserve
  B title until C is served; B/C prefixes; shared record reads/bytes; configuration
  bytes; retired checkouts only after replacement; accepted starts settle once.
- `productionUpdateShutdown`: held real build PID and served PID end, HTTP fails,
  deployment/inspection roots empty, shared record/configuration bytes and inode
  unchanged, development HTTP remains200.
- `production-deployment.spec.ts`: selected origin commit ignores local state;
  pinned checkout installation/build/preview after main advances; actual dist
  contains selected title and excludes later title; real preview boundaries and
  cleanup. No assertion is removed here.
- `production-watcher.spec.ts`: PINNED SOURCE versus development HMR, same-URL
  replacement, Cursor runner/client survival, occupied port refusal, current-main
  restart even for docs-only latest commit, browser NEXT MAIN/PINNED SOURCE,
  SIGTERM/SIGINT cleanup.
- `production-watcher-failures.spec.ts`: real build retry retains WORKING A,
  preview failure restores WORKING B, origin recovery, restoration failure and
  unexpectedly ended preview clean up. These supplement, not replace, P/Q/R/S.
- `boundary/production-watcher-refusals.spec.ts`: invalid options and unavailable
  main fail before preparation/serving.

## Source commitment accounting

All67 individual commitments from the supplied slice1 listing remain carried.

| Ids | Owned observation/constraint |
| --- | --- |
| C01 | E/F folded and H rule decision relocated; successful policy activations5→3. Actual measured attempts reported after runs. |
| C02, Q01, Q02, Q03 | Original ledger above maps every removed/changed assertion before narrowing; survivors and replacements both used. |
| C04, C05, C06, J01, J02, J03 | Existing whole-range excluded/accumulated/mixed/deletion/rename case plus new exact original-F extra/docs case, from real remote Git trees. |
| C07, C08, C09 | D/G/T unchanged work object plus settled checks/PID/browser; P also unchanged. |
| C10, J04 | Real G dirty-local conflict and cheap selected-policy cases. |
| C11 | E latest SHA activates, intermediate SHA absent, exact prefixes/preparation delta. |
| C12, J05 | P repeat errors/no-work/PID/title then Q required app recovery. |
| C13, J06 | R failure plus S failure, keeping Q URL/PID/title. |
| C14, J07, J08 | Distinct Q and S recoveries; ignored Q workflow/docs require retained P app; S docs require retained R app; T skip baseline S. |
| C15, C16, C17, C18 | Retained real npm/Vite E/Q/S, browser titles, `productionReplacement`; unchanged deployment/watcher/failure owners above. |
| C19, C20 | Update B/C shared-record/config assertions and shutdown byte/inode assertions unchanged. |
| C21, C22 | Shutdown PID/HTTP/empty-root assertions; owned fixture cleanup and normal strict global teardown unchanged. |
| Q04, Q05, Q06, Q07, Q08 | Same two normal filters/default workers/Node/deps/env; new Git case cost included, no focused-only performance claim. |
| Q10 | Baseline admission80678d4a (runtimeb8ad020a); local accepted raw family-before files and fresh hosted40825747965. |
| Q12, Q13, Q14, Q15, Q16, Q17 | Local counts/selection/verdicts/build counts/fixture costs reported; hosted unchanged-verdict/move/platform/retry accounting remains coordinator-owned. |
| C03, Q09, Q11, Q18, Q19, Q20, Q21 | Fresh candidate revision/full hosted CI, queue/job/suite/runner comparison remain coordinator-owned, incomplete in this implementation return. |
| Q22, Q23 | Keep only supported normal-family gain; local and hosted uncertainties stated separately. |
| X01, X02, X03, X04 | Production unchanged; real outcomes/owned isolated fixtures and assertion equivalence preserved. |
| X05, X06, X07, X08, X09, X10 | No skip/retry/second-server/clock/worker/shard change. |
| X11, X12, X13, X14 | No unrelated fixture optimization, release, guidance or shard-weight change. |

## Proof and remaining ownership

Cheap replacement proof is run before watcher narrowing. Final source locations,
normal family observations, consumer trace and process quiescence are recorded
below when observed. Hosted proof remains with the coordinator; this file does
not mark the slice complete.

## Current observation locations before coordinator formatting

`dashboard/tests/support/productionUpdatePolicies.ts`: shared published policy18;
D settled skip/work/PID/title38–45; latest E replacement/title/intermediate-SHA
absence/exact prefixes/one-preparation59–66; dirty-local conflict69–72 and G
settled skip/work/PID/title76–84; P repeated exact error/no-work/PID/title105–114;
Q real activation/MAIN P/exact prefixes125–130; R and S failure names/real cause/
Keeping Q/PID/MAIN P138–147; S replacement/no-skip/no-R-activation/MAIN R/exact
prefixes149–158; T skip comparing S/work/PID/MAIN R163–170.

`dashboard/tests/boundary/production-qualification.spec.ts`: existing excluded,
accumulated and mixed results33–54; deletion and both rename endpoints60–87;
background-maintenance qualification/empty root102–111; candidate policy rather
than baseline136–140; unrestricted/unsupported/missing149–173; new original-F
mixed policy exact result194–198; local conflict199; extra exclusion201–203;
docs qualification205–207; accumulated docs+extra exact result208–212.
`support/productionQualificationFixture.ts` reads the actual repository workflow,
provides only Git/HOME preconditions, and checks the empty inspection directory
on every `qualify` return. The background Git wrapper's behavior is unchanged.

The new case and extracted support first passed `qualification-replacement`:
4 selected, all expected strict passes, no retries, terminal0, wall6.12s,
reporter5.672s, before the watcher predecessor narrowed. Existing supplied
selected-policy and accumulated-range negative controls remain applicable:
qualification implementation and those assertions have not changed.

## Local family observation

The exact normal two-filter command remained
`env -u NO_COLOR npm run test:dashboard -- production-watcher-updates.spec.ts production-qualification.spec.ts`,
with `/usr/bin/time -p` and run-specific `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` /
`OPEN_DOUGH_DASHBOARD_TIMES` paths under
`/private/tmp/production-policy-ci-time-171`. Each completed run retained its
literal runner argv, selected cases, expected verdicts and retries in JSON, its
wall time in the log, and aggregate owning-spec costs in `-times.txt`.

| Record | Selection / strict terminal | Wall / reporter seconds |
| --- | --- | --- |
| family-before | 10 / pass, exit0 | 74.68 / 74.315 |
| family-after-1 | 11 / pass, exit0 | 67.53 / 67.091 |
| family-after-2 | 11 / pass, exit0 | 67.75 / 67.356 |
| family-after-3 | 11 / pass, exit0 | 67.30 / 66.895 |

Each candidate retains all ten original case identities with expected passing
verdicts and adds one original-F real-Git case; there are no removed cases,
skips or retries. These are three consecutive complete runs after the final code
edit. The replacement and unchanged global production build/setup costs are
included. Qualification owning-spec costs were3.5s before and5.6/5.3/5.2s after;
update owning-spec costs were69.2s before and63.5/64.1/63.5s after. Those costs
are concurrent aggregates and must not be subtracted as whole-CI savings.

The exact surviving gate-prefix assertions observe six successful watcher
builds A/B/C/E/Q/S instead of eight A/B/C/E/F/H/Q/S; shutdown enters one further
held gate in both. Policy activations reduce5→3. Each normal suite also completes
its unchanged global Vite build. R/S real failures happen before counting/Vite
gate; actual install/preparation attempts are at least two, with no exact retry
attempt count claimed. Baseline is one sample; different local load and runner
variance remain limitations. Hosted queue/job/suite benefit is unobserved here.

The local target is16 logical CPUs/48GiB. Owned expensive commands were sequenced;
headroom was inspected before launches (load4.83 before first family,6.28 before
second,8.29 before third,7.00 before broader consumers). Other chats' machine
work remains unknown. Default runner capacity and strict verdict policy stayed
unchanged; no extra owned proof ran concurrently.

Consumer trace command used installed
`.agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/production-policy-ci-time --base 2f8cb0e23717e91c6899dc2a26b65dcc9ffd2425 --term productionUpdatePolicies --term qualifyPublishedRange --term 'policy coverage' --term qualificationFixture --term backgroundPackWriterGit --term productionUpdateJourney`.
Its raw Markdown is `consumer-trace.json` in the raw directory;
`consumer-trace-dispositions.md` gives every one of96 listed files a run or
excluded disposition. Actual changed-support callers are the owning update and
qualification specs. Broad common-word/retired-marker matches do not import the
changed support; unchanged shared fixture imports alone do not transmit its
private extraction to other tests. Historical shard weights remain untouched.

The ordinary consumer command
`env -u NO_COLOR npm run test:dashboard -- production-watcher production-deployment production-qualification`
selected27 cases in8 registration sources/6 owning specs (updates, basic watcher,
failures, refusals, deployment, qualification), as separately listed before the
normal run. `consumers.json/.log/-times.txt` records all expected strict passes,
exit0, no skip/retry, wall84.83s/reporter84.448s. It observes the unchanged
integration owners listed above as well as the changed family.

After every launched command reached its terminal result, `quiescence.json`
recorded all five owned run identities with no surviving processes and no retained
output directories. Normal strict global teardown observed no leaks. No extra
watch was created; the coordinator's hosted observer was untouched. Existing
shutdown assertions still observe empty deployment/inspection roots and awaited
fixture cleanup removes each isolated origin/HOME. Read-only Prettier inspection
predicts172/230/78 lines for policy/qualification/support code; no formatter,
hook-owned lint/typecheck, refactor pass, commit or push was run here. Only the
three test/support files and this map are changed/untracked; production,
configuration, package/lock, shard weights, guidance and release files are
unchanged. Hosted commitments remain incomplete and coordinator-owned.
