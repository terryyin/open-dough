# Source review

Launch: fresh general-purpose reviewer (`029a7559-2e1a-4ac2-be44-3ada051f4178`), source text only — Goal, Scope, key examples and exclusions from SEED-247#restore-file-purpose-and-proof. No plan, return, product, or proof supplied.
Input: story Goal, Required / Required restrictions / Scope limits / Deferred promises, Key examples 1–6.
Reviewer: numbered commitments, qualifications, journey examples, exclusions, and deferred items as returned below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When an individual file in a configured Intent location is selected, the reading pane offers Purpose and Proof as named tabs using the shared Intent tablist pattern. | slice 1 | observed: IntentFileReading.tsx IntentTabs Purpose/Proof; intent-file-purpose-proof.spec.ts purpose+proof tabs |
| 2 | For a fresh file reading, Purpose is chosen first. | slice 1 | observed: intent-file-purpose-proof.spec.ts and intent-summary-story-comparison-file.spec.ts: Purpose aria-selected true on fresh file |
| 3 | The chosen tab is kept across file selections in the same Intent visit as disposable page state (not URL, not durable storage). | slice 1 | observed: IntentBrowser useKeptReading readingTab; both file specs keep Proof across files; pageIntentReading disposable |
| 4 | Purpose | slice 1 | observed: IntentFileReading purpose panel: source reader or story Diff without comparison |
| 4.1 | Presents the existing source reader. | slice 1 | observed: intent-file-purpose-proof.spec.ts purposeRegion contains published source test("a" |
| 4.2 | When the selected story changed the file, presents that story's source diff. | slice 1 | observed: intent-summary-story-comparison-file.spec.ts purpose .intent-story-diff-name + story-review-code changed |
| 4.3 | Content of that source / diff presentation is unchanged. | slice 1 | observed: same source/diff presentation via IntentSourceLines / FileDiff; docs update only relocates comparison |
| 4.4 | Does not stack a CI comparison above Purpose. | slice 1 | observed: purpose getByRole(table) count 0; no File summary region; no intent-ci-comparison-framing on Purpose |
| 5 | Proof shows that file's published CI runtime evidence from Intent's existing CI evidence owner. | slice 1 | observed: IntentFileProof via scopeEvidenceOf(useIntentCiEvidence()); Proof panel mounts it |
| 5.1 | Does not introduce a new CI fetch path. | slice 1 | observed: intent-file-purpose-proof.spec.ts proofCalls equals homepage one CI evidence read |
| 5.2 | Does not execute tests on selecting Proof. | slice 1 | observed: IntentFileProof only reads IntentCiEvidence; no runner/local proof modules restored |
| 6 | Without a story selected, Proof shows that file's results and execution time for the judged run's proof, using the same columns and gap wording Summaries use for a file row. | slice 1 | observed: intent-file-purpose-proof.spec.ts Proof table Counts/Test execution time/Parts; 1 passed and 1 failed / 550 ms |
| 7 | With a selected executed or Taken story that has a comparison, Proof shows that file's baseline / branch / landed comparison | slice 1 | observed: intent-summary-story-comparison-file.spec.ts Proof comparison table for modified file |
| 7.1 | Measured times | slice 1 | observed: modifiedFileRow 10.0 s / 14.0 s endpoints in Proof table |
| 7.2 | Signed timing differences | slice 1 | observed: modifiedFileRow 14.0 s +4.0 s signed differences |
| 7.3 | Story change markers | slice 1 | observed: rowheader dashboard/tests/folder/a.spec.ts modified; added marker on added file |
| 7.4 | The existing observed-not-attributed qualification | slice 1 | observed: proof .intent-ci-comparison-framing contains observedNotAttributed |
| 8 | Today's stacked file comparison moves into the Proof tab rather than being duplicated above Purpose. | slice 1 | observed: File summary region count 0; comparison only under proofRegion |
| 9 | Evidence stays tied to its actual revision and run. | slice 1 | observed: EvidenceNamed/ComparisonNamed with treeRevision; framing shows baseline/branch/landed short SHAs |
| 10 | A missing measurement or unusable proof explains the gap | slice 1 | observed: Proof gap path: missing/unusable shows wording rather than invented counts |
| 10.1 | Absence is not treated as zero. | slice 1 | observed: added.spec.ts Proof cells no CI result (not zero) |
| 10.2 | Figures are not borrowed from another file. | slice 1 | observed: added.spec.ts one table for its path; no borrowed a.spec.ts figures |
| 11 | Opening from Optimization Candidates still lands on Purpose positioned on the case. | slice 1 | observed: openRevealed setReadingTab("purpose"); intent-test-optimization-candidates{,-open,-case}.spec.ts land Purpose |
| 12 | Do not restore local proof readers. | slice 1 | observed: no IntentProof/local proof modules; SEED-238 remains; Proof uses IntentCiEvidence only |
| 13 | Do not restore location proof / runner settings. | slice 1 | observed: no location proof/runner settings restored in Intent file reading |
| 14 | Do not restore on-demand test execution from Intent. | slice 1 | observed: selecting Proof does not run tests; proofCalls unchanged beyond one CI evidence read |
| 15 | Leave location and folder presentation and behavior unchanged (existing Summary, navigation, and story comparison). | slice 1 | observed: intent-summary-ci-proof*.spec.ts and intent-summary-story-comparison.spec.ts green; Summaries unchanged |
| 16 | Do not change the Intent / Optimization Candidates mode strip. | slice 1 | observed: IntentModeTabs comment-only; intent-test-optimization-candidates mode strip behavior green |
| 17 | Do not change homepage CI status → Proof. | slice 1 | observed: intent-home-activation.spec.ts and intent-ci-status*.spec.ts green |
| 18 | Do not change Structure. | slice 1 | observed: Structure not touched in owned paths |
| 19 | Do not revive side-by-side Purpose/Proof layout. | slice 1 | observed: IntentFileReading tab panels only; no side-by-side layout |
| 20 | Do not revive a remembered split preference. | slice 1 | observed: readingTab via useKeptReading disposable; no durable split preference |
| D1 | Deferred: side-by-side Purpose/Proof reading |  | G1 |
| D2 | Deferred: durable remembered Proof tab across reloads |  | G1 |
| D3 | Deferred: Purpose/Proof tabs on location or folder selections |  | G1 |
| D4 | Deferred: Structure |  | G1 |
