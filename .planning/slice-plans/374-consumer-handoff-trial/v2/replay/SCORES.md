# Masked replay scoring — X and Y

This is the separate measured scoring phase. No timing.json, original clocks, A/B packets, pre-review receipt, arm mapping, later CI or other trial result was read. Masking is imperfect: writing style and report structure could suggest presentation; no arm identity is inferred or assigned here. Fixed replay only; no prospective rate or population inference.

## Inputs and frozen baseline

Initial immutable `AUDIT.md` SHA-256 `db1398a2c1449f74139ce2d194d27c5b48b7eee5fbf9b8ae77b557059a624efc`, freeze `2026-10-29T07:48:28.036971Z`, had16 bounded consumer purposes CP01–CP16. Its contents remain unchanged. Scoring read both complete masked reports and I0/H0, then rechecked the immutable candidate deployment source/test and actual consumers record for the two new leads. No test or product edit was performed.

The original16 are all mapped below. Two disclosed refinements are necessary: separate the already-mentioned installation-cancellation part of CP15 from held-build shutdown, and add the valid asset-filter purpose absent from the initial reference. These apply symmetrically, bringing the final denominator to **18**. This corrects the bounded reference rather than treating it as omniscient.

## Validated reference amendments

**AM1: CP15 → CP15a plus CP15b.** CP15a retains held-build shutdown/preview/checkout cleanup and development continuity. CP15b is cancellation during installation before any preview exists: `stageDeployment` propagates signal into actual npm installation and removes failed staging; deployment cancellation test publishes a prepare script that records a live child PID, aborts, expects rejected staging, then child death and empty deployment root. Initial CP15 already explicitly cited this case, but combining it with held-build SIGTERM obscured a distinct responsibility/phase/observer. X-U1 selects this proof; Y reports only the held-build observer. A held-build shutdown cannot establish cleanup of an installing prepare child before preview creation. CP15b is not a newly invented failure or a missing test.

**AM2: add CP17, preserve the allowed local cartoon overlay and exclude other local assets.** Y-N01 is valid. Candidate `productionDeployment.mjs` copies only direct `.webp` files from the development cartoon directory before building. The pinned deployment test writes `stanly.webp`, `notes.txt` and raw `stanly.jpg`; asserts served WebP status/type/body equality and exact dist lists containing only `cartoon/stanly.webp`. Therefore the application-code pinning claim must explicitly allow that local overlay; title and selected-SHA assertions cannot establish the asset filter. Initial CP10 deliberately did not count asset subassertions separately; this lead demonstrates a different responsibility/observable/assertion and corrects that omission. Application pinning remains CP10. Neither source behavior nor tests change.

Both leads are validated by the actual `consumers.json` records: the separately named cancellation case and pinned deployment case are expected passes, actual passed retry0 in completed strict-pass run `499018b6-29b8-4509-adb6-db793eb5452c`. As before, the record lacks historical tested-source hashes; this is qualified ordinary proof, not exact-candidate execution certification.

## Per-purpose dispositions

`S` = report states an actual inspected sufficient observer and relevant ordinary execution disposition within the retained provenance limit. `M` = no sufficient observer reported and no specific unresolved gap for that purpose. Matching names/counts alone receive no credit. Report P-numbers are navigation, not audited identity.

| Audited purpose | X actual reported proof or gap | Y actual reported proof or gap | Result X / Y |
| --- | --- | --- | --- |
| CP01 full range/path classification | P01 exact exclusion/accumulated/mixed/deletion/rename and unusual-name assertions; F/C actual case records | P01 same actual arrays/classification and F1/C records | S / S |
| CP02 selected policy and relocated extra/docs rules | P02 selected-policy/new docs+extra assertions and live G conflicting-local skip; named F/C cases | P02 same qualifier assertions and live G work/PID/title; F1/C | S / S |
| CP03 policy diagnostics before deployment | P03 missing/unsupported errors plus P06 repeated exact P error/no work/title | P03 errors plus P06 repeated P error/work/PID/title | S / S |
| CP04 inspection lifecycle/race | P03 fixture success/error empty roots, maintenance race, finally-remove; F/C | P03 same success/error/race assertions; F1/C | S / S |
| CP05 skipped changes no work/served continuity | P04 entire deploymentWork equality, settled checks, PID and D/G/T titles; F/C | P04 same full object/checks/PID/title; F1/C | S / S |
| CP06 latest accumulated activation once | P05 latest E, intermediate SHA absent, exact independent prefixes and preparation+1 | P05 same plus expected list appended after actual activation | S / S |
| CP07 failed-policy baseline/P→Q | P06 ignored-only repair Q activates MAIN P, repeated P no-work/error | P06 same discriminator and actual replacement/prefixes | S / S |
| CP08 failed-build baseline/R→S | P07 real R/S causes, keep Q PID/MAIN P, latest S replaces MAIN R, R never activates | P07 same actual assertions and F1/C disposition | S / S |
| CP09 advance baseline only on success | P07 T exact skip since S, no work/title | P07 T exact successful S baseline plus no work/PID/title | S / S |
| CP10 pinned application build/serving | P09 real selected checkout/dist/HTTP, dirty development HMR difference; qualified historical C proof. Its broad isolation wording needs AM2 allowance. | P09 selected code/dist/HTTP/HMR and docs-only restart; explicitly corrected with N01 allowance | S / S for application pinning |
| CP11 replacement/retirement | P10 same URL/new PID/old stopped/new alive; held B/C content and post-activation current checkout | P10 same replacement helper plus post-activation retirement assertions; F1/C | S / S |
| CP12 preview failure/restoration | P14 WORKING B restoration then WORKING C retry; actual F cases in C | P14 same failure/restoration observers and actual C cases | S / S |
| CP13 shared store/config preservation | P11 real shared-record reads/store bytes/inode plus P12 configuration bytes/inode; F/C | P11 shared record/store plus P12 config; F1/C | S / S; resources deduplicated under frozen storage purpose |
| CP14 accepted starts survive drain | P15 concrete503, previous PID/no B, exactly one launch, launched/settledAt/session records; named F/C. Scope explicitly unresolved, proof inspected. | P15 same concrete observer and historical pass; required scope explicitly unresolved | S / S; actual proof suffices despite unknown scope label |
| CP15a held-build shutdown and development continuity | P13 live held PID then build/served death, HTTP refusal, empty roots, development200 | P13 same actual assertions and F1/C | S / S |
| CP15b installation-phase cancellation | X-U1 actual prepare child, abort/rejected stage, dead child/empty root; specific C cancellation record and staging/process source | No installation-abort observing assertion/disposition. P13 is held-build shutdown; P14 preview/fatal recovery; P09 title/code pinning is a different case. No specific installation gap flagged. | S / M |
| CP16 unavailable origin/return | P14 real unavailable-origin, live service and resumed checks; C actual case | P14 same distinct origin recovery; C case | S / S |
| CP17 allowed local overlay/filter | No asset-filter observer or specific unresolved asset scope in report. P09 selected title/dist isolation does not inspect WebP/body or exclusion lists. | N01 exact allowed WebP and filtered dist lists, correction to blanket isolation, actual pinned C case | M / S |

Both reports deliberately withheld a numeric denominator; that is not a miss and does not grant blanket-caveat protection. Their explicit concrete proof of CP14 is sufficient even though they ask whether it belongs in the required inventory. No miss is inferred merely from failure to enumerate every assertion. The two M judgments follow different actual responsibility/phase observers, not absent exhaustive wording.

## Final scores and useful set comparison

| Metric | X | Y |
| --- | --- | --- |
| Final consumer M / audited required denominator | **1/18**, CP17 | **1/18**, CP15b |
| Sufficient observed purposes | all18 except CP17 | all18 except CP15b |
| Consumer G | **1 resolved proof-selection gap**, CP15b | **1 resolved proof-selection gap**, CP17 |
| Evaluation/provenance G | **2**, EV01 hosted comparison and EV02 historical tested-source identity | **2**, EV01 and EV02 |
| Valid reviewer U beyond semantic H0 | **1**, installation-phase abort observer/selected proof | **1**, local asset allowance/filter observer and corrected isolation claim |

X's self-reported grouped provenance G is evaluation/provenance, not a consumer gap. Its installation lead nevertheless specifically identifies why held-build proof cannot establish installation cleanup and selects the correct observer, so that actual proof-selection contribution earns consumer G. Y's N01 consumer G is supported. Neither requires a new test or demonstrates a live product defect.

**X-not-Y:** CP15b installation cancellation. No equivalent observer/disposition established in Y. **Y-not-X:** CP17 asset allow/filter. No equivalent observer/disposition established in X. The common16 other purposes have inspected equivalent proof in both directions. Parent may map directions to L after unmasking; this file assigns no A/B label. Counting only reports' shared P01–P17 labels would hide both substantive differences.

The initial reference has been disclosed and refined symmetrically; both M values use18. The original CP15 row was partly covered in Y, so treating that broad row as a single full pass would be misleading. CP17 was absent from the initial denominator; treating its rediscovery as proof that the original audit was exhaustive would likewise be false.

## Novelty validation against I0/H0

Reviewer novelty is against semantic H0, not against this auditor's knowledge. H0 contains held-build shutdown P13 and generic preview/origin recovery P14 but no installation-abort prepare-child observer. X-U1 is therefore a valid new observing purpose/proof choice beyond H0, even though initial audit CP15 already mentioned it. H0 P09 contains pinning/title/dist/serving assertions but does not identify the allowed cartoon overlay/filter or exact filtered-asset observer. Y-N01 makes a concrete correction to its overbroad isolation claim and adds that observer; it is valid U once. X/Y P01–P17 restatements, exact-source limitation and unfinished hosted evaluation were supplied in H0 and earn no reviewer U. No novelty is inferred from changed labels or rediscovery.

Producer H0−I0 requires separate assessment. I0 already names broad uninspected pinning/replacement/recovery/storage/cleanup obligations, so these are not newly discovered source promises. It does not contain their concrete observing assertions or justified proof selections. H0 adds these useful observer/decision discoveries, deduplicated to **six** confirmed purpose decisions:

1. P09 → CP10: selected tree's real staged/dist/served observer and required C proof.
2. P10 → CP11: actual URL/PID/retirement observer, not qualifier proof.
3. P11/P12 together → CP13: machine-record/config storage preservation assertions in the same retained journey, one frozen storage purpose.
4. P13 → CP15a: actual held-build shutdown and dynamic-ordinal proof selection.
5. P14 preview restoration → CP12: distinct working-preview restoration and retry observer.
6. P14 origin return → CP16: distinct availability/continued-service/resumed-check observer.

These are six after deduplication/splitting, not credit for six IDs automatically; all change justified proof selection beyond I0's uninspected generic obligations. H0 P15 additionally supplies CP14's actual accepted-start observer but leaves required change-impact scope unresolved. It is a useful retained lead and sufficient proof for our bounded audit, **not an additional validated producer decision U**: H0 itself does not settle the proof/exclusion scope decision. H0 P16/P17 likewise remain unvalidated relevance leads within this bounded assessment; neither is silently excluded from all future inquiries. Therefore producer validated observer/decision U=6, with three uncertain scope leads separately retained. No new source-promise count or nine-automatic-discovery claim is accepted.

## Acceptance, requests and limits

Neither report claims full consumer closure, exact-candidate execution, hosted benefit or whole-story completion; no false completion, weakened tests, authority breach or unsupported blanket exclusion is established. X's broad P09 isolation wording lacks the explicit local-asset allowance; AM2 limits it and records the missing CP17 disposition rather than labeling the product defective. Both keep trace exclusions as owner claims and acknowledge uninspected semantic scope. Their generic completeness caveats do not discharge CP15b/CP17 specifically.

Both request human/steward decisions or ordinary-owner evidence for uncertain P15–P17 scope/exclusions, acceptable tested-source provenance and hosted comparison. These are recorded requests, not observed human interruptions; neither contacted a human/owner or ran proof. Both have the same substantive unresolved request families; actual human minutes/interruption cost remain unknown. CP14 proof is already sufficient despite the scope question. Uninspected semantic consumers, actual tested-tree identity and hosted outcomes remain unknown; the18-purpose reference is bounded.

Scoring inspected actual frozen source and selected raw case outcomes for the two distinguishing leads; it did not reconstruct every reviewer tool action or independently verify every stated reread count. Historical proof retains the original audit's source/provenance limits. No further favorable retry or new reviewer was created.

## Input hashes

- `AUDIT.md`: `db1398a2c1449f74139ce2d194d27c5b48b7eee5fbf9b8ae77b557059a624efc`
- `masked-x.md`: `0a8854afbf7bf4f59c30e18c2fbb70cb37a9cf03d53b8147987c6b9f2aab6c6c`
- `masked-y.md`: `49865340afa83b5c44abb64d58105a98d81fd4fd0a810ce710f074aaab45416e`
- `common/I0.json`: `823cb5781d5edc5a3823bfd9828135ee42e31f1305fb3ea1fbbd62edc042cdb9`
- `common/H0.json`: `8a6594b84563370b17a3056acf6efc4c5f1872e30627eea532f22c435306efb8`
- `common/raw-proof/consumers.json`: `5c6473e343b448b6ac6e429cf5b64fc411e052bfe4842f5df0d7a4853a1d7134`

Scoring write completed 2026-10-29T08:12:24.502642Z. Parent captures native scoring dispatch/return; source clocks do not substitute.
