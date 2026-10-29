# Independent source-only review

Fresh isolated task `/root/review_source`, fork_turns none, launched by this
coordinator. Input was only the developer's implement/verify/land/preserve-evidence
instruction and the verbatim Goal, Scope and Key examples of
SEED-010#expose-codex-observer-identity at accepted Take 68014eeb. The reviewer
was told to read no files, use no tools and change nothing; no plan, product,
implementation return or proof was supplied. The numbered source commitments
below retain its returned text. Every product commitment is allocated to slice 1;
commit and landing steps keep their required later workflow boundary.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Implement ODF-376 in the existing source binding. Keep the correction within that binding. | slice 1 | observed: src/skills/dough-execute-plan/references/ci-notify-codex.md; producer/parser/ownership unchanged |
| 2a | Expose the observer’s complete identity to its Codex coordinator while the stream is live. This includes startup that outlasts the first tool yield. | slice 1 | observed: ci-notify-codex-readiness.test.mjs split late identity; native cell 72 initial starting then CI_OBSERVER_READY while live |
| 2b | Publish a late identity exactly once. Example: an empty first yield followed by a split identity receipt exposes one complete identity before a failure notification and managed delivery. | slice 1 | observed: readiness split/duplicate/CRLF assertion; managed-delivery-codex late identity reuse test; native notification ordering |
| 2c | Expose an immediate identity receipt exactly once. Immediate arrival remains a supported alternative to delayed arrival. | slice 1 | observed: ci-notify-codex.test.mjs initial key/coordinator/session/directory/PID and no duplicate readiness |
| 3a | Distinguish starting, ready, and ended states. Starting alone does not establish usable observation. | slice 1 | observed: binding state(result); readiness initial/late terminal cases |
| 3b | Do not claim usable observation for an early terminal or a missing terminal. Preserve both cases; neither may be treated as evidence of readiness. | slice 1 | observed: readiness stopped/finished/final-chunk/missing-terminal cases |
| 4 | Use plain pipes for the stream. | slice 1 | observed: binding tty:false; host binding launch assertion; native cell 72 |
| 5a | Retain stream ownership semantics. Managed delivery and repair reuse the exact owned observer stream. | slice 1 | observed: managed-delivery-codex delayed identity increment/repair: reused, same directory, one launch/watch; owner/owner-gap suites |
| 5b | Allow managed increment delivery to reuse that observer without manual discovery. | slice 1 | observed: managed-delivery-codex first delivery passes notified directory to retained() |
| 5c | Allow repair delivery to reuse that observer without manual discovery. | slice 1 | observed: same test repair delivery and revision registration on same directory |
| 6a | Retain acknowledgment semantics for received failures. Received failures become acknowledged. | slice 1 | observed: ci-codex-delivery-acknowledgment two failures/green completion; native deliveredThrough:1 |
| 6b | Retain unread status for unseen failures. | slice 1 | observed: ci-codex-delivery-acknowledgment unseen failure retains observer |
| 7a | Verify delayed and fragmented streams. The split-receipt journey in 2b is an explicit example. | slice 1 | observed: readiness split late receipt with CRLF/duplicate; original red 5/6 failures then green |
| 7b | Verify early-ending streams. The early-terminal and missing-terminal examples constrain what may count as usable observation. | slice 1 | observed: readiness initially ended and final receipt tests; observation-loss suite |
| 7c | Use documented-cell tests in the verification. | slice 1 | observed: existing extraction helper executes the actual first markdown JS fence |
| 7d | Use real-process delivery in the verification. | slice 1 | observed: processBackedCodexTools yieldBeforeOutput; managed CLI delivery test |
| 7e | Use native Codex transport in the verification. | slice 1 | observed: native functions cell72 and terminal80523; ready /tmp/odf376-native-l3y_xokh/mailboxes/watch-IpcBlf PID70429; real stream, fake provider event, ack1 and confirmed stopped |
| 8 | Preserve the investigation evidence in the implementation commit. | slice 1 | observed: prepared implementation commit body /tmp/odf376-commit-message.txt; guarded fresh commit owns this procedural step; verify committed body before closure |
| 9 | Land the completed correction after implementation and verification. | slice 1 | observed: authorized Dough Land continuation after execution/review/completion; closure owns actual trunk acceptance, not a claim of completed landing at slice acceptance |
| 10a | Keep release outside this correction and explicitly pending. | slice 1 | observed: ODF-376 Response pending first containing release; VERSION/CHANGELOG/tags untouched |
| 10b | Keep installation outside this correction and explicitly pending. | slice 1 | observed: installed .agents/.claude payload unchanged; finding notes pending released adoption |
| 10c | Keep observer retry policy outside this correction and explicitly pending. | slice 1 | observed: binding finished/lost/stop policy unchanged; ODF-121 remains independent/open |
| 10d | Keep finding retirement outside this correction and explicitly pending. | slice 1 | observed: ODF-376 remains unresolved pending release and ordinary relevant use |
