# Independent source review

Fresh reviewer /root/balance_source_contract, fork_turns none, received only the
complete selected story Goal, Scope, Examples, Evaluation and Excluded text in
its launch. It was instructed to read no project files, change nothing, derive
individual promises and preserve alternatives/examples without inventing scope.
The actual returned commitments are retained verbatim in the table below.
Q03/Q04/Q05 are conditional reporting alternatives, not three required outcomes.
The original launch/input and return remain in this execution conversation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Refresh dashboard timing weights. | slice 1 | observed: all four duration lists refreshed; refresh-verification.json proves580 exact per-label maxima,519 changed/51 unchanged/10 added/no removals |
| C02 | Rebalance the existing workload. | slice 1 | G1 |
| C03 | Keep all existing tests. | slice 1 | G1 |
| C04 | Keep existing isolation. | slice 1 | G1 |
| C05 | Keep twelve shards. | slice 1 | G1 |
| C06 | Keep four workers per shard. | slice 1 | G1 |
| C07 | Measure the effect on overall CI time. | slice 1 | G1 |
| C08 | Use representative recent post-optimization timing reports. | slice 1 | observed: all36 artifacts from the two fresh15f35ac0 baselines and supporting current-runtime main40834521203 used without per-case exclusions; each run has580 exact spec labels |
| C09 | Use the existing duration-list refresh mechanism first. | slice 1 | observed: literal scripts/test-shares.mjs refresh command in implementation-proof-commands.json exits0; existing indexed-part writer used without source edits |
| C10 | Use the existing deal mechanism first. | slice 1 | observed: unchanged testFiles.mjs and share-deal.mjs consume the data; normal three-file and two shared-allocator suites pass after refresh |
| C11 | Preserve every discovered spec exactly once. | slice 1 | observed: public candidate lists and dashboard-test-files.test.mjs97-105 observe all580 discovered spec paths once across12shards; selection-after.json |
| C12 | Preserve every full test identity exactly once. | slice 1 | observed: selection-after.json retains exact Counter of1741 full identities once across12 public configured splits, matching original unsplit and split sets |
| C13 | Preserve existing platform skips. | slice 1 | G1 |
| C14 | Preserve strict verdicts. | slice 1 | G1 |
| C15 | Preserve the retry policy. | slice 1 | G1 |
| C16 | Preserve serial deployment scheduling. | slice 1 | G1 |
| C17 | Preserve real integration proof. | slice 1 | G1 |
| C18 | Preserve per-test fixture isolation. | slice 1 | G1 |
| C19 | Preserve per-test process isolation. | slice 1 | G1 |
| C20 | Preserve per-test repository isolation. | slice 1 | G1 |
| C21 | Record the timing data source. | slice 1 | observed: all four Source headers name runs40839078106/40839642385 at15f35ac0 and40834521203 atd57a83b2,2026-10-29; exact input paths/hashes retained in raw verification |
| C22 | Record the aggregation. | slice 1 | observed: existing mergeTimes max per spec across36 hook-inclusive artifacts; all580 output values checked against actual input maxima; spec-times shared-hook test160-213 passes |
| C23 | Compare predicted balance with actual balance. | slice 1 | G1 |
| C24 | Retain reproducible whole-CI measurements. | slice 1 | G1 |
| C25 | Obtain fresh, complete baseline CI. | slice 1 | observed: both complete fresh baseline40839078106/40839642385 pass16jobs with identical1741cases/verdicts,580files,12shards/4workers, same4skips/noextraattempts; baseline1/2-measured.json |
| C26 | Obtain fresh, complete candidate CI. | slice 1 | G1 |
| C27 | Name the baseline revision. | slice 1 | observed: both fresh baseline runs execute15f35ac010da59083d254ca8dabcf5ebe7dd2f8b, metadata-only above runtime d57a83b2; named jobs/reports retained |
| C28 | Name the candidate revision. | slice 1 | G1 |
| C29 | Use repeated sequential observations to expose runner variation. | slice 1 | G1 |
| C30 | Compare overall workflow time. | slice 1 | G1 |
| C31 | Compare queue time. | slice 1 | G1 |
| C32 | Compare job time. | slice 1 | G1 |
| C33 | Compare suite time. | slice 1 | G1 |
| C34 | Compare shard spread. | slice 1 | G1 |
| C35 | Compare original case accounting. | slice 1 | G1 |
| C36 | Compare original verdict accounting. | slice 1 | G1 |
| C37 | Run suitable local allocation proof before the change. | slice 1 | observed: normal three-file allocation command passes terminal0 in allocation-before-pass.log; actual runner requires Bash5, so corrected PATH is recorded under G2 |
| C38 | Run suitable local allocation proof after the change. | slice 1 | observed: exact same normal three-file command terminal0 after refresh, wall1.28s; allocator-consumers-after also passes; concrete once-only/project/part/CLI assertions inspected |
| C39 | Run suitable local selection proof before the change. | slice 1 | observed: selection-before.json observes all1741unique full identities across unsplit and the12public CLI splits,580specs each in exactly one shard, complementary projects |
| C40 | Run suitable local selection proof after the change. | slice 1 | observed: all13 after public list commands terminal0; selection-after.json preserves every identity/project/expectedStatus,522files/1575cases move, no missing/duplicate spec |
| Q01 | No numeric speed target is promised. | slice 1 | observed: source/plan declare no numeric speed target; raw candidate preview is explicitly a prediction pending hosted measurement |
| Q02 | Summed test seconds do not establish an overall CI speedup. | slice 1 | observed: implementation return labels678.3–678.5 accumulated predicted spec-seconds as no CI speed proof; G1 retains actual whole-CI measurement ownership |
| Q03 | Report supported improvement honestly when that is the result. | slice 1 | G1 |
| Q04 | Report inconclusive results honestly when that is the result. | slice 1 | G1 |
| Q05 | Report negative results honestly when that is the result. | slice 1 | G1 |
| Q06 | Normal local feedback is not expected to improve. | slice 1 | observed: unsplit normal allocation proof remains1.28s before/after with no speedup claim; source explicitly makes CI elapsed the target |
| Q07 | Unsplit mode does not use timing weights. | slice 1 | observed: testFiles.mjs selectedFiles returns all discovered files before reading weights when split is undefined; actual unsplit lists retain1741identities |
| J01 | Ordinary and deployment projects remain complementary. | slice 1 | observed: unchanged complementary native projects observed by public lists and dashboard-test-files150-174; native scheduling boundary114-132 passes with one setup and overlap |
| J02 | Every selected spec appears in one of twelve shards. | slice 1 | observed: selection-after.json lists every580 spec in one of12shards; dashboard-test-files97-105 actual discovered files match exactly once |
| J03 | A moved case keeps its full identity. | slice 1 | observed: selection-after.json compares full original identities for all1575 moved cases, no loss/addition or project/expectedStatus alteration |
| J04 | A moved case keeps its verdict. | slice 1 | G1 |
| J05 | All existing tests still run. | slice 1 | G1 |
| J06 | Each CI shard has four observed workers. | slice 1 | G1 |
| J07 | An unsplit local invocation keeps the same selection. | slice 1 | observed: before/after unsplit public CLI lists have the identical1741 full identities and projects |
| X01 | Removing tests. | slice 1 | observed: only duration lists change in test tree; no test removed; all1741 original public selections retained |
| X02 | Skipping tests. | slice 1 | observed: no skip annotation/configuration edit and every local listed expectedStatus retained; hosted platform accounting remains C13/G1 |
| X03 | Weakening tests. | slice 1 | observed: no assertion or test-body edit; existing allocation and subprocess strict observations pass unchanged |
| X04 | Retrying tests. | slice 1 | observed: retries0 configuration unchanged; no automated retry added; sandbox diagnostic rerun restores proved process-observation precondition and retains the137 failure separately |
| X05 | Shared mutable fixtures. | slice 1 | observed: no fixture implementation edit; no new mutable shared resource; existing private fakeGitHub/server/context/origin lifetimes remain |
| X06 | Changing isolation. | slice 1 | observed: fixture, context, process and repository boundaries unchanged in aggregate diff; actual candidate isolation execution remains C04/C18-C20/G1 |
| X07 | Changing worker counts. | slice 1 | observed: workflow and CI availableParallelism configuration unchanged; local extra proof worker1 is command-only and supplies no CI speed claim; C06/J06 own actual hosted4workers |
| X08 | Changing shard counts. | slice 1 | observed: workflow matrix remains1..12, allocation/list proof uses exactly12splits; no shard/config edit |
| X09 | Changing test bodies. | slice 1 | observed: aggregate diff changes no test body, only four measured duration inputs and parent planning evidence |
| X10 | Changing application behavior. | slice 1 | observed: application/server/source behavior files unchanged |
| X11 | Changing timeout contracts. | slice 1 | observed: no timer/timeout contract edit; initial sandbox failure is not passed by increasing its60000ms test timeout |
| X12 | Changing clocks. | slice 1 | observed: clock helpers and their callers/configuration unchanged |
| X13 | Changing dependencies. | slice 1 | observed: package/lock/Node pin unchanged; exact-checkout locked install reused |
| X14 | Changing releases. | slice 1 | observed: VERSION,CHANGELOG,tags and installed payload unchanged |
| X15 | Changing guidance. | slice 1 | observed: no skill/rule/AGENTS or published guidance edit; parent evidence metadata is not runtime guidance |
