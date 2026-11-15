# Source review

Launch: fresh general-purpose reviewer `/root/story_source_review`,
`fork_turns: none`, 2026-11-15. Actual launch and returned text are retained
in that collaboration task's conversation. Input: only the selected story's
Goal, Scope, limits and five examples, transcribed from seed lines 40–102 at
`7bb9992277410f6b5c3ba8da0b461c3c61939a84`; no human amendments.
Instruction: source-only, no files or changes; individual numbered commitments,
qualifications, triggers, examples and exclusions; no plan, proof or ownership.
The reviewer confirms no project files read or changed. All 29 returned ids
are retained below; allocations are the coordinator's subsequent decisions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Promise boundaries: “The source-only reviewer numbers independently observable promises, rather than every clause or list item.” | slice 1 | observed: replays/small.md Actual reviewer return ids 1–26; repeated blank result is id 1 |
| 2 | Attached qualifications: “Keep a promise's conditions, qualifications, triggers and examples attached to its source text”. | slice 1 | observed: replays/small.md input and return ids 1, 10–12, 20–21 retain conditions and source locations |
| 3 | Shared observation: “one sufficient observation can cover that promise without repeated allocations.” This includes the Goal’s “recording a shared observation once when several qualifications describe the same promise.” | slice 1 | observed: replays/small.md old-row mapping; old reason 1.4 is unnumbered and blank examples share id 1 |
| 4 | Independent outcomes: “Separate outcomes that can fail independently, including user-visible alternatives and justified rejection behavior.” Qualification: “Sharing a test command or proof location does not by itself make two outcomes one promise.” | slice 1 | observed: replays/small.md ids 1–2 separate blank and typed; 10–12 focus alternatives; 20–21 Cursor continuation |
| 5 | Expected results survive grouping: “Grouping must preserve each expected result”. | slice 3 | observed: replays/pronunciation-return.md P11 explicitly retains one-kana て inside 挙げて; P18 separately refuses pronunciation membership alone while preserving title/alias overlaps; pronunciation.md maps every source section |
| 6 | Source provenance survives grouping: “Grouping must preserve […] its source provenance.” The Goal specifically includes “user-visible alternatives, restrictions that need their own check, and post-execution owners”. | slice 4 | observed: replays/acceptance-cli.mjs prepare() compares all 26/39 ids and complete qualified text with real list results; final records retain shared context and source provenance |
| 7 | Context remains available without extra observation rows: “Keep context, reasons, settled baselines, effort hypotheses, proof-method explanations and delivery deferrals available as source context without creating observation rows merely for those statements.” | slice 2 | observed: replays/compound.md source comparison and compound-return.md unnumbered G5/U1/proof-method/deferral context; all 112 old ids mapped to 43 qualified promises or retained context |
| 8 | Mixed statements retain their promises: “A statement that also promises an independently checkable result still needs a numbered promise.” | slice 4 | observed: replays/compound-return.md ids 22–23 preserve results in scope limits; lifecycle.md second return retains the target-CI result from Scope and source context while baseline/hypothesis stay unnumbered |
| 9 | Limits remain limits: “Scope limits do not become new product rejection rules.” | slice 1 | observed: replays/small.md scope limits 22–26 retain preservation without new rejection rules |
| 10 | Isolation: “Preserve the fresh review's source-only isolation”. | slice 1 | observed: replays/small.md exact source-only launch /root/slice1/small_reviewer with fork_turns none |
| 11 | Timing: Preserve its “timing before planned delegation”. | slice 1 | observed: source-review.md retained before /root/slice1 delegation; obtain-source-review.md Before planned delegation unchanged |
| 12 | Launch evidence: Preserve “retained launch […] evidence”. | slice 1 | observed: replays/small.md Launch and isolation identifies actual reviewer task and launch |
| 13 | Input evidence: Preserve “retained […] input […] evidence”. | slice 1 | observed: replays/small.md Actual reviewer input includes candidate brief and complete recovered source |
| 14 | Return evidence: Preserve “retained […] return evidence”. | slice 1 | observed: replays/small.md Actual reviewer return retains all 26 ids and unnumbered context |
| 15 | Reuse: Preserve “unchanged-source reuse”. | slice 4 | observed: replays/acceptance.md Consumer and unchanged-boundary review; obtain-source-review.md Before planned delegation and At acceptance retain unchanged-source reuse |
| 16 | Amendment response: Preserve “replacement after human amendments”. | slice 4 | observed: replays/acceptance.md caller-chain inspection; obtain-source-review.md still requires fresh review, replacement and reallocation after human amendment |
| 17 | Reviewer authority: “The reviewer chooses the promise boundaries”. | slice 4 | observed: story-obligations.md retains reviewer promise boundaries and forbids silent discard/regroup; replays/lifecycle.md keeps both source-correct first-return ids and explicit fixture correction |
| 18 | Retained IDs: “the coordinator retains […] every returned promise id, rather than silently deleting ids during acceptance.” | slice 4 | observed: replays/acceptance-cli.mjs asserts exact 26/39 ids and texts; lifecycle.md preserves both complete fresh returns; source-review.md preserves all original 29 story ids |
| 19 | Allocated IDs: “the coordinator […] allocates every returned promise id”. | slice 4 | observed: replays/acceptance-terminal.md records all 26+39+1 allocations through existing record CLI; this linked source review allocates all 29 story ids or explicit G1 disposition |
| 20 | Existing review file: “Reuse source-review.md”. | slice 4 | observed: story-obligations.md retains source-review.md and existing Commitments table; real fixtures and acceptance-*-record.md use that existing file form |
| 21 | Existing allocation cells: Reuse “its existing allocation […] cells”. | slice 4 | observed: replays/acceptance-cli.mjs prepare() records existing slice cells; lifecycle allocation uses unchanged target CI cell; existing schema unchanged |
| 22 | Existing observation cells: Reuse “its existing […] observation cells”. | slice 4 | observed: replays/acceptance-terminal.md unobserved refusal, fixture marker acceptance and G11 obligation use the existing observation cell; standalone-only marker is explicitly semantically unproved |
| 23 | Existing obligations record: Reuse “the Story obligations record”. | slice 4 | observed: replays/acceptance-terminal.md P11 receives G11 with quoted inside-word clause; completion returns open-obligation; existing Story obligations format unchanged |
| 24 | Missing results: “Missing results still receive an obligation or block acceptance.” Preserve or; this does not require both responses. | slice 4 | observed: replays/acceptance-terminal.md typed 2 and P11 return unobserved-commitment; fixture-only observation or receiving G11 permits slice check and open G11 still blocks completion |
| 25 | Post-execution ownership: “A promise observable only after execution keeps its own landing, target CI or reporting owner”. Preserve those owner alternatives and its source traceability. | slice 4 | observed: replays/acceptance-terminal.md target-CI row appears in pendingLifecycle under check with exact text/owner; record guide preserves landing, target CI and reporting owners |
| 26 | Post-execution observation timing: Such a promise “is not marked observed early.” | slice 4 | observed: replays/acceptance-cli.mjs asserts empty lifecycle cell and refusal without mutation of observed-lifecycle-commitment; no actual CI receipt claimed by fixture |
| 27 | Response recording: “record this response […] in ODF-481 when each becomes known”. | slice 4 | observed: docs/maintainer/findings/ODF-481.md Response and bounded evaluation records first response 8ac10364f82362f3dac2504304a52645ed661456 and exact replay outcomes |
| 28 | Release recording: Record “its first containing release in ODF-481 when each becomes known”. |  | G1 |
| 29 | Delivery versus improvement evidence: “without treating delivery as an observed ordinary-use improvement.” | slice 4 | observed: docs/maintainer/findings/ODF-481.md explicitly leaves ordinary-use effectiveness pending and finding open; no causal, cross-host or time/token claim |

## Returned example qualifications

- Blank instruction: “a blank instruction opens the terminal because the session waits for the developer” and the repeated example stay with the terminal-opening promise. One allocation and sufficient observation cover it; the explanation adds none. This illustrates 2, 3 and 7.
- Typed instruction: “a typed instruction leaves the current view in place” remains a separate alternative under 4. “keeping developer-moved keyboard focus” stays attached wherever it changes the result under 2 and 5. Blank-input evidence alone leaves this alternative unproved.
- Clipboard journey: Repetition across Goal, Scope and examples does not multiply allocations. The distinct expected results—copy, paste, scrolling, and preservation—remain separately provable under 4 and 5. “the limits of automated proof” remain context under 7.
- Pronunciation: “a one-kana pronunciation such as て is hidden even inside 挙げて” must survive grouping under 2 and 5; standalone-only hiding evidence leaves a gap. “refusing a pronunciation as a correct written answer” is the separate rejection outcome under 4.
- Final CI: A “settled baseline and effort hypothesis” remain context under 7. “final target CI after landing” retains its separate owner and pending receipt under 25–26.

Retained exclusions and delivery context: “no new review registry, record schema, bulk-recording interface, automatic prose classifier, or change to evidence sufficiency, amendment remapping, execution authority, or lifecycle completion.” “Release and rollout are separate work.” These limits do not introduce product rejection rules.
