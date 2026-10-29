# Case 01 initial independent purpose reference

Status: initial bounded purpose audit complete; no experimental reviewer report or packet inspected. This is an audited reference for the inspected change, not a claim of exhaustive whole-product knowledge. No historical cases were used. No tests, product edits, owner contacts, or delegation occurred.

Timing: dispatch timestamp was not supplied to this assessor and remains unknown; steward must record it. First observed clock was **2026-10-29 06:43:43 UTC**. Initial reference freeze/audit end: **2026-10-29T06:47:46+00:00**. Tool/queue time is included in that first-clock-to-end interval; separate queue duration and hidden host/model settings are unknown. Hard cap: four dispatch-to-return task-minutes. Actual dispatch-to-return duration must use the steward's dispatch and return observations, not this shorter observed interval.

Candidate: `90ea771039c36761b5973ab728e73ddcbce19935`. Actual parent/base, read from Git: `2f8cb0e23717e91c6899dc2a26b65dcc9ffd2425`. All product/source reads were `git show <candidate>:<path>` (or the candidate/base diff), never mutable live product code. Guidance/assessor brief were read from this trial checkout. The ordinary handoff's source hosted-CI obligation is intentionally still unaccepted; no candidate hosted outcome was read.

## Denominator and proof identities

**16 audited required purposes** below: 14 product/test-support purposes and two explicitly required evaluation purposes. Keep that split visible when scoring; a consumer-only sensitivity denominator is **14** (P01–P14), while the complete source-obligation denominator is **16**. P16 is a specific evaluation proof gap, not discovery of a previously unknown runtime consumer. Do not silently combine the two denominators or describe its absence as a live defect.

Purposes are responsibility + observable + observer. D/G/T no-work repetitions are one no-work purpose; repeated E/Q/S prefix/title assertions are not three purposes. The qualifier and watcher are different responsibilities: exact qualification outcomes cannot alone observe no install/restart, and watcher logs cannot alone prove exact path membership. Each row keeps its distinct promise even where a single test observes several rows.

Proof aliases (full test IDs from raw completed reports):

- Q-range: `62fb148960e4b36c7d24-915404278313331c43fd`.
- Q-cleanup: `62fb148960e4b36c7d24-9ab218b07dac3ec02550`.
- Q-policy: `62fb148960e4b36c7d24-be52435c4a10a7f636fb`.
- Q-extra-docs: `62fb148960e4b36c7d24-97de8762b666d9bc06a5`.
- W-policy: `eefbd78ea2673b5ecc21-14ed87514042b601f403`.
- W-recovery: `eefbd78ea2673b5ecc21-4e6218c98a715ef5f006`.
- W-shutdown: `eefbd78ea2673b5ecc21-80f664f1d4c46725b69f`.
- W-held: `eefbd78ea2673b5ecc21-50db71c8b923ffeef8f5`.
- W-retire: `eefbd78ea2673b5ecc21-56225a57d15a7fafb55f`.
- D-pinned: `565b83f40e373b6bd6e9-683453ccdb19dc567e72`.
- W-restart: `ea60d0da76407c97bed8-a0fa8401f404953db8d7`.

Locations below are candidate line numbers; boundary = `dashboard/tests/boundary/production-qualification.spec.ts`, policies = `dashboard/tests/support/productionUpdatePolicies.ts`, journey = `dashboard/tests/support/productionUpdateJourney.ts`.

| ID | Responsibility → changed/preserved observable → concrete observer | Inspected current disposition |
| --- | --- | --- |
| P01 | Real-Git qualifier considers whole published range: excluded-only false, accumulated/mixed app paths qualify → Q-range boundary17–55 exact result/qualifying assertions | Locally proved; retained real remote trees, no fixture-supplied decisions. |
| P02 | Qualifier preserves deletion and both rename endpoints, including tab/newline paths → Q-range boundary57–94 deletion booleans and exact changed/qualifying lists | Locally proved; one destructive-path purpose, not one count per assertion. |
| P03 | Qualifier uses selected published workflow over baseline/dirty local, including original F/H extra-excluded/docs-allowed variation and unrestricted policy → Q-policy143–159; Q-extra-docs201–225 exact changed/qualifying arrays after local workflow conflict206 | Locally proved. New cheap observer supplies the actual removed F/H policy decisions. |
| P04 | Unreadable/unsupported published policy fails explicitly → Q-policy170–179 rejects with selected commit/path-specific errors | Locally proved; maintained separate from watcher baseline ownership. |
| P05 | Extracted qualification setup preserves owned inspection cleanup, even Git background-maintenance race → Q-cleanup117–118 result + empty root; Q-policy180 error-path empty root; extracted helper readdir after each successful qualification | Locally proved. Fixture creates owned real origins/HOME; wrapper changes maintenance, not Git result. |
| P06 | Watcher excluded checks perform no preparation/install/build/activation/restart while served app stays usable → W-policy D/G and W-recovery T exact work object equality + settledSkip + live PID + browser MAIN C/E/R | Locally proved. deploymentWork reads preparing logs, independent build-gate records, activation and preview histories; settledSkip observes two further checks. |
| P07 | Watcher accumulated application+policy+docs selects latest exactly once → W-policy E replacedBy(e), MAIN E, intermediate application SHA absent, exact gate-prefix list and preparing delta +1 | Locally proved; folded E retains real deployment, original F/H extra successful cycles removed. |
| P08 | Actual watcher obeys published exclusion despite dirty local workflow → W-policy writes original workflow locally then G extra-only skip, unchanged work/PID/title and baseline E message | Locally proved. This is actual orchestration precedence, distinct from P03 exact rule outcomes. |
| P09 | Unsupported candidate cannot advance served baseline; workflow/docs-only repair still includes failed app change → W-recovery P exact repeated error >2 + unchanged work/PID/MAIN E; Q replacement and MAIN P + exact prefix list | Locally proved. Q's .github/docs changes are excluded by restored E policy, so only retained P app paths can qualify E→Q. |
| P10 | Real build failure preserves working preview/baseline through later docs; retry recovers latest selected tree → W-recovery R/S explicit real fault errors, Keeping Q/live PID/MAIN P; remove fault, S activates, no R activation/no S skip, MAIN R + exact prefixes | Locally proved. faultGatedPackage gates real scripts before build-gate/Vite; it does not supply success. |
| P11 | Only successful activation advances comparison baseline → W-recovery after S: exact S→T skip message, unchanged work, live PID/MAIN R | Locally proved; do not collapse this baseline promise into generic P06 no-work evidence. |
| P12 | Real selected code installs/builds/serves pinned content and replaces at same URL with former PID ended → E/Q/S real title assertions + productionReplacement URL/new PID/old dead/new alive; D-pinned dist contains selected not later title; W-restart docs-only tree MAIN/NEXT + PINNED SOURCE | Locally proved. Inspected full-source fixture, build/fault gates and observer helpers; no fake build/activation outcome. |
| P13 | Serial deployment preserves shared machine records and configuration → W-held actual shared-record HTTP + exact record/config bytes; W-shutdown exact bytes/inodes after all policy steps | Locally proved; unchanged assertions still registered before/after changed steps in one serial chain. |
| P14 | Superseded/current build, preview and owned checkouts clean up without harming development → W-retire checkedAfterActivation and singleton checkout; W-shutdown held build/preview PIDs dead, HTTP rejects, deployment/inspection roots empty, development HTTP200; fixture cleanup; quiescence process/output checks | Locally proved. Shutdown ordinal derived from actual build list, so narrowed count does not invalidate its held-build observer. |
| P15 | Maintainer evaluates normal-family cost including moved proof and unchanged case verdicts → identical raw runner filters/argv, 10 original identities retained plus Q-extra-docs; strict pass/no retries; raw comparison 74.68s vs67.53/67.75/67.30s | Supported local observation only. Single baseline/host variance limits causal estimate. Gate prefixes support eight→six successful watcher builds plus held shutdown in both; failed attempts are not exact gate counts. |
| P16 | Maintainer evaluates fresh full hosted baseline/candidate CI, intentional moves/verdicts/platform skips/retries, queue/job/suite and fixture cost/runner variance before accepting CI-time benefit → source Evaluation + original plan slice1 proof | **Unresolved, specific gap G01.** No accepted candidate hosted comparison in frozen evidence; local 10/11 or27 passes do not discharge this obligation. |

## Independent traversal and initial gap reference

The diff contains three test/support files plus ordinary plan/source-review/map records; no production code/configuration/package/worker/skip/retry edit. Extraction moves the existing workflow reader/qualifier wrapper and background Git wrapper without changing their behavior. `publishedMainFixture` stages only requested paths, so writing the dirty workflow then publishing extra/docs does not accidentally publish that local conflict. The new Q-extra-docs assertions inspect exact outcomes from actual published Git trees.

I inspected the actual watcher call chain: scripts/watch-dashboard.mjs103–115 passes baseline/selected to qualifyPublishedRange and branches only on qualifies; successful ownership moves at158. Thus the removed docs-allowed H's qualification decision is observed by the new boundary case while retained E/Q/S observe real activation/content/replacement. The new test alone would not replace watcher baseline/no-work proof; those are separately present above. No additional functional omitted observer was established in this bounded inspection.

**G01 initial missing proof:** P16, fresh hosted comparison remains owed. Stage: proof-selection/acceptance if a reviewer declares the entire story/CI benefit complete from local results. Correct arm handling is to name the concrete hosted obligation and leave acceptance unresolved. This supplied obligation can yield G but is not a novel consumer discovery U.

Raw trace and disposition populations both contain **96 distinct located path rows**, equal membership (robust extraction of the first backtick path after the Located consumers heading; one row contains a pipe in its evidence, so naive column splitting incorrectly reports95). All have a disposition. Population equality is not semantic exclusion proof. Inspected support imports register the changed policy journey only in updates; new extracted helper is imported by qualification. Unchanged common repositoryRoot/publishedMainFixture imports do not transmit changes to their other callers. Historical shard weights are unchanged and expressly outside scope. I did not inspect every excluded file's full code: whole-population semantic exclusion completeness remains bounded, not certified by96 labels.

I0/H0 and experimental packets were withheld. Novelty membership beyond the original map is unknown; do not credit U for any supplied map purpose or infer reviewer novelty from my independent rediscovery. No arm scores are assigned before reports. Any valid later lead must amend this reference visibly and rescore both arms.

## Frozen proof observations and limits

Inspected raw JSON: family-before selected10/strict passed/10 attempts, after1–3 each selected11/strict passed/11 attempts; zero retries and nonpassing attempts in each; consumers selected27/strict passed/27 attempts, zero retries/nonpasses. Reporter durations74315.395 /67091.131 /67355.856 /66895.069 /84448.211ms respectively. qualification-replacement selected4/strict passed/5671.789ms, before watcher narrowing per normal record. Original identities match by stable test IDs, not case counts alone. quiescence records all five owned candidate commands completed with no surviving processes or retained output directories.

Raw reporters identify checkout/run and cases but do not themselves embed the candidate Git hash. The normal handoff records final semantic code proof before coordinator formatting; I have not independently reconstructed a pre-format source snapshot. This provenance limit is retained, not invented as exact post-commit execution. Local sufficient dispositions mean inspected observer + observed ordinary local proof under that documented provenance, not hosted acceptance. Full fixture CPU/install attempts, other chats' load, later effects and hidden host settings remain unknown. Broad consumer passes were inspected as records; untouched failure/refusal test implementations were not comprehensively audited. No unavailable outcome is assumed passing.

Ordinary owner actions: finish and accept the fresh named hosted CI comparison and verdict/move/platform/retry/cost/queue/job/suite/runner accounting once, preserve honest uncertainty, and retain exact candidate/proof provenance. Address any future valid functional lead through normal ownership immediately; do not hold a safety repair for the experiment. Steward records actual dispatch/return timing and keeps this audit hidden until both reviews finish. No new human decision is requested by this audit.

## Input freeze manifests

Candidate sources below were read fully or in the observer excerpts described above; full bytes hashed for recovery. Immutable Git blobs preserve source; raw artifact SHA256 values preserve the inspected evidence identity. Only this audit file was written.

| Candidate path | Git blob | SHA256 |
| --- | --- | --- |
| `.planning/seeds/SEED-171-production-policy-ci-time.md` | `410ce86c94e50f500db540252a5e68dc277c7a29` | `5526b781214023b460a2a598ea4ec344cd51261573f75fd235f5a42fd80dbe9b` |
| `.planning/slice-plans/373-production-policy-ci-time/PLAN.md` | `f2ca3b61ae7f17b3843059e60283562fa72c1c00` | `e8262f369339d64753d5461ff5e82b48f66a64912bf3631fc8d9fcc9efb5f05e` |
| `.planning/slice-plans/373-production-policy-ci-time/coverage-map.md` | `b9d8e59e0ba949d6bcf47782f99fa147726ddb3e` | `04a590085053f096a88b50189155d8c2cf7e3e44bf1b456eb48bb3683460a234` |
| `dashboard/tests/boundary/production-qualification.spec.ts` | `d2991336b5e35789d6885ba90ea76fe46b94248d` | `e4a3a2b85f68a3c4a21bf92985a6312e7baeb603ac9664d5effead9e95671ca2` |
| `dashboard/tests/support/productionQualificationFixture.ts` | `60054541a85e43050e7b9d50121c98e8562b8144` | `d9dbc85d7386799411e7288b7111b17ee6d0f6e05b38a749d306d0d5e484ece3` |
| `dashboard/tests/support/productionUpdatePolicies.ts` | `f99ac9563fa1aaaaa525f4a6db57c7a2b71b50ec` | `7363c83b0ce4ca1db8af3ed4b5c66cabd338fe11a6259f0fb334f06e51f275a7` |
| `dashboard/tests/support/productionUpdateJourney.ts` | `e58adbac1f4c49fabb4941e05dcda274cec2f183` | `4ec78f72c09cd12cfacce4c1cd2f9954e031b03613eb5563eb507f8d60d04647` |
| `dashboard/tests/support/productionWatcher.ts` | `c5e134bc94889bdb62aa03e0438ebcd8d4909443` | `58c0cb5476214fbfec5445ffa5b082a673a1aa99777527ba1a36342ab11fb15a` |
| `dashboard/tests/support/publishedMainFixture.ts` | `4d70ef38cb1d6be6d6bd59f5eb5c7462fc7e3b21` | `3f72bf5f2ca4edaec0b3fc59eeaa87e60dbce77dbad5b92287ea2e0556a1f742` |
| `dashboard/tests/support/productionBuildGate.ts` | `00bb90c86a9532d3a0ae3171e5179697ca22c670` | `dd1e1c1125ee2ecbe65666a32335f57a73d461f9b6960e2582b65164bd5af4d1` |
| `dashboard/tests/support/productionFault.ts` | `980795c94c057d9cde855ae5ca92daff7d105125` | `d11b54927d3361c0c5259c138eed6628541722e909ca000a4b1c995745503d1f` |
| `dashboard/tests/production-watcher-updates.spec.ts` | `7908f6f4662b83527260db96bdea7c3b5ee8f6ab` | `1e7e5509bdfdee7336c3632fd8e178050c268d942af46dc3276222d2700f69f5` |
| `dashboard/tests/production-watcher.spec.ts` | `b2d2f08437dec1f04adee6e00c904ddac186cbc8` | `c01c2b9bb80e315003b0d417fd9fb2f9c5f973a5d3edbd1d9b7f9ea379f9ca41` |
| `dashboard/tests/production-deployment.spec.ts` | `f8d2be70bd06f8e5206d4f577bd4e3a3aac5c725` | `9b107128336c671a135c02a3fb86c4c425a46e5cf373e50e1b6ba6b5757672e4` |
| `dashboard/server/productionQualification.mjs` | `3b793e65e3028bdc327eee5bdf72dc6f9cc4e76a` | `c2061a6b0ef797ffa5312ffbff3cb39a3bd3c93e85da76ce83877956d24531e8` |
| `scripts/watch-dashboard.mjs` | `642dcf54ea33a41f1b80b20c4bfccd0fd6380d4f` | `05d2890a6dc1fb5e1caf14c2db6ff71f6f7cd23b517418b082268f5096f34eff` |

| Trial checkout guidance | SHA256 |
| --- | --- |
| `AGENTS.md` | `80825f2f8b6f7c4cf744fec4430f6d59f57faaeedd5658e033ba33a703a77c54` |
| `.planning/slice-plans/374-consumer-handoff-trial/PLAN.md` | `33c8124f3d4d32f9427c3232389d84ab44721e9ea94625e114245c923c7b1582` |
| `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md` | `d1f4e775b49e1dac74020fb27ceb529a397c97883c06cfd09eea04e9bdb3b550` |

Raw root: `/private/tmp/production-policy-ci-time-171`.

| Artifact | SHA256 |
| --- | --- |
| `consumer-trace.json` | `38cf7350c7c9c7780aad59b0b4f151d904129c812ff64269e83760524511d7bf` |
| `consumer-trace-dispositions.md` | `8e59ec7b8dd222347715b797c5c273f52df5c846358a6ea84f84a7bb3fb97008` |
| `local-family-comparison.json` | `3da75d97a66b741c54dea43386f6d7ff0f7b191e57a77a320f951cac703b2111` |
| `implementation-commands.txt` | `39cad3426a99805f04552d7e9fc74d93dbf982533af5b3a71176afa9dabb0c12` |
| `family-before.json` | `89f104b0c5df22614cbe2c6a9a609fafcb0a50130743bc4d4e1cc732a4fe04e5` |
| `family-after-1.json` | `eee2678bb3ee87eca8ab121093a168e4b676ae6e490eb1c668cd24c49d0a4afc` |
| `family-after-2.json` | `2cf3bcdbc7842c0f5c411470e197911fb2a4caa2b8a5236fc79361e0a3218ed9` |
| `family-after-3.json` | `a538b895415a676f594adbf30deccdf1b2542b6c3ab54fd86001213f6832ee04` |
| `consumers.json` | `5c6473e343b448b6ac6e429cf5b64fc411e052bfe4842f5df0d7a4853a1d7134` |
| `quiescence.json` | `69587a869952e5630bacf88d91b763c137869dbd2d8f6f3c57929bb53f776ced` |
| `qualification-replacement.json` | `47a196c8cff99a5ea6a41ccc0cb3b29af2cec6a6e156d7aecf602bd2a6ad01f0` |
