# Blocked execution: findings from three attempts

The second attempt concluded through early convergence on 2026-11-15.
Investigation and comparison-infrastructure repairs were completed; the intended
model-work reduction was not achieved. The original prolonged-wait hypothesis
remains unproven. No saving or non-regression verdict follows from these baselines.

## Prior attempts

| Attempt | Outcome |
| --- | --- |
| First: SEED-345 resume implementation | Matched blocked tokens rose 8,386,947 → 13,434,290 (+60.2%); responses 80 → 94. Implementation abandoned/reverted. |
| Second: SEED-356 initial probe | Invalidated by a false-positive harness-inspection signal; complete cost unknown, at least 1,468,842 observed tokens. Detector repaired. |
| Second: forced-wake baseline | Quality passed, 77 responses, 8,861,703 processed tokens. It did not exercise normal live waiting, so it could not test suppression of repeated wait re-entry. |
| Second: supplier-watch baseline | Quality passed, 76 responses, 8,936,838 processed tokens, three workers, zero developer interventions. Repetition/opportunity was not demonstrated. |
| Third: SEED-368 silent supplier wait | Delivered without a paid run. Its benefit is predicted until [the next real supplier watch](#third-attempt-one-silent-wait-for-a-watched-supplier) is judged. |

Three of the second attempt's six authorized native journeys were consumed.
The remaining candidate/unblocked comparisons were dropped, not silently run or
carried as authorization for another attempt. A successor needs a fresh explicit
budget for its complete selected experiment, including invalid attempts/workers.

## Third attempt: one silent wait for a watched supplier

Decided by Terry on 2026-11-15, replacing the earlier whole-task bar and
matched native comparison: no paid run. The benefit is predicted until
observed.

Delivered: when the developer asks a held execution to watch its paused
supplier, [reassess before extending work](../../Distribution/src/skills/dough-execute-plan/references/execution-decisions.md#reassess-before-extending-work)
routes to [watch a paused supplier](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#watch-a-paused-supplier),
which starts the [publication wait](../../Distribution/src/skills/dough-execute-plan/scripts/wait-for-publication.mjs)
once and awaits it under the existing long proof run wait. The command prints
nothing while the watched refs and paths are unchanged and one result on a
publication or at its deadline, 60 minutes unless the developer names a
duration. Deterministic tests prove the command; the guidance took the
maintainer behavior review. Host adapters, a watcher agent, a dashboard or
daemon resume, and phase-loading or general verification efficiency belong to
other work.

Observed locally on 2026-11-15 without a paid run:

- In the second attempt's watch trace the session wrote its own watcher, which
  printed `unchanged` every 30 seconds, and polled it with a 30-second wait;
  each poll re-read the whole context.
- Codex 0.169.0 accepts an empty poll of up to 300 seconds. Across 2,873 local
  Codex sessions, responses after a 270–330 second gap were 97.7% cached, 89.0%
  after 330–600 seconds, and about 74% beyond ten minutes.
- The saving grows with the length of the wait, so a short benchmark cannot
  show it (11.92% ceiling with 180-second windows) and a long one pays for the
  waste in its baseline arm.

### Check the next real supplier watch

Judge the next real supplier watch from its coordinator's session trace: the
Codex rollout or Claude Code transcript, located and read as the
[Codex audit](session-token-efficiency-research.md#codex-audit) and
[Claude Code audit](session-token-efficiency-research.md#claude-code-audit)
describe.

1. Find each unchanged wait. It starts at the tool call whose command names
   `wait-for-publication.mjs` and ends at the record carrying that command's
   result line, `{"result":"publication",…}` or `{"result":"deadline",…}`. A
   rerun after a nonqualifying publication starts another unchanged wait.
2. Count the model re-entries inside it: the model requests timestamped
   between the start and the result, once per `response_id` of a Codex
   `token_usage_record` and once per `message.id` of a Claude Code assistant
   record. The request that receives the launch call's own return belongs to
   the start and the request that receives the result line to the result;
   count neither, nor a request that answers a developer message.
3. Take the cached share of the input summed over those re-entries: on Codex
   `cached_input_tokens` of `input_tokens`; on Claude Code
   `cache_read_input_tokens` of `input_tokens`, `cache_read_input_tokens` and
   `cache_creation_input_tokens` together.

Keep the change when every unchanged wait shows, for the host it ran on:

- Codex: at most one re-entry per five unchanged minutes, a started five
  minutes counting as one.
- Claude Code: no re-entry.
- At least 90% cached input on the re-entries.

Otherwise remove the added guidance: the "Watch a paused supplier" section of
`wait-for-proof.md` and the clause "or watch a paused supplier first when the
developer asks" in `execution-decisions.md`. The command's only consumer is
that section, so the command, its tests
`Distribution/tests/skills/dough-execute-plan/wait-for-publication.test.mjs`
and
`Distribution/tests/skills/dough-execute-plan/continued-wait-for-publication.test.mjs`,
their support module
`Distribution/tests/support/wait-for-publication-fixture.mjs`
and its line in `src/install/open-dough-execution-payload.sh` leave with it.
Record the observed counts and the verdict here either way.

## What the original trace establishes

The original coordinator had already returned an attention handoff before the
human follow-up “you watch it.” It then owned a live publication-watch helper
while its supplier was paused. Empty nonterminal returns repeatedly brought the
model back into control. The original retained audit observes 447 outer requests
and 105.39M processed tokens in the prolonged interval; 300 requests following
empty waits, timeouts or clock checks account for 71.72M. These are observed
associations, not proof that every such response is removable.

The first extracted fixture used forced subsequent user turns and already
included the canonical supplier dependency added after the original human stop.
It omitted the live watch and follow-up framing. Stop/no-empty-call guidance
already existed in the original trace. Host routes also differed: vscode 0.167.2
versus native exec 0.169.0. No guidance/version counterfactual establishes a fix.

[Original-versus-fresh differential](https://github.com/terryyin/open-dough/blob/d510a0dcc14f5275dc273c3b8e652eb806b21330/.planning/slice-plans/627-reduce-blocked-execution-work/differential-investigation.md)
retains exact raw locators and agreement history. The broader
[session-efficiency research](session-token-efficiency-research.md) retains the
original audit and sibling phase-efficiency opportunities.

## Why the second native watch result is inconclusive

The fixed experiment published nonqualifying and qualifying supplier states at
+180.050s and +360.046s from the watch-request turn, independently of model polls.
The first successful watch started 10.646s after nonqualification had completed.
In the second unchanged window, paired launch/live receipts confirm only a
58.920s live-exposure lower bound. All three wait receipts had nonempty output;
one live receipt reported unchanged state, the others reported publication.
No two empty nonterminal waits with distinct owned responses on the same watch
were demonstrated before facts changed.

The automatic decoder correctly retained unknown identity/exposure/signal: the
launch computed its shell command using a template and quoting function, outside
the supported literal-wrapper boundary. Manual review confirms genuine supplier
watch resources but does not rewrite the immutable archive's unknown fields.
Unknown or inadequate exposure cannot establish resolution or falsify the
prolonged-wait hypothesis. Useful future observation must distinguish watch
setup, live waiting, justified state changes and unnecessary model re-entry,
including re-entry caused by nonempty unchanged-status output.

The last baseline used 8,690,688 cached input, 204,205 uncached input and 41,945
output tokens, totaling 8,936,838. After qualification accounted for 81.67%.
All directly charged responses in both unchanged windows total 1,065,150 tokens
(11.92%), including useful judgment/preparation. This is a deliberately generous
hypothetical direct-charge envelope, NOT tokens saved or an achievable estimate.
It does not bound unproved downstream context effects. No targeted 20% whole-task
removal was supported; phase-loading work remains with its sibling story.

## Maintained infrastructure to reuse

- Harness-inspection detection accepts legitimate installed guidance reads while
  still rejecting controller/source/relative harness access.
- Forked-session accounting preserves child identity/lifecycle and counts copied
  parent responses once; unfinished ownership or missing usage remains unknown.
- Baseline recovery checks exact input bytes, duplicate/conflicting manifests
  and imported setup dependencies. Cached/batched blob hashing and avoiding
  unused/redundant payload extraction reduce preparation cost without weaker gates.
- Active-turn controller supervision supports independent supplier publication
  and retires owned model/controller/clock resources on terminal paths.
- Literal host-receipt decoding checks owned launch, wait and distinct response
  attribution conservatively; it never evaluates recorded JavaScript or treats
  arbitrary stdout as a native receipt.
- The controlled supplier-watch diagnostic protects preservation, nonqualifying
  hold, one qualifying continuation/proof, export and cleanup. Its retired native
  180s/180s profile is not a qualified performance benchmark.

Focused checks and exact preparation CI 43686419444/1 passed at 754bff87; repaired
comparison budget CI 43679045962/1 passed at 8e98d67e. Closure renews proof for
retirement and requires final integrated CI; these historical passes do not
substitute for it. No product token-reduction procedure was implemented.

## Recoverable evidence and evaluation cost

All second-attempt story/plan/review records and compact exports remain
recoverable at published revision `d510a0dcc14f5275dc273c3b8e652eb806b21330`:

- [Forced-wake opportunity and cost](https://github.com/terryyin/open-dough/blob/d510a0dcc14f5275dc273c3b8e652eb806b21330/Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-resumed-baseline-863ea5690-opportunity.md).
- [Corrected immutable forced-wake export](https://github.com/terryyin/open-dough/blob/d510a0dcc14f5275dc273c3b8e652eb806b21330/Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-resumed-baseline-863ea5690-accounting-corrected.json).
- [Watch opportunity, timing, quality and raw locators](https://github.com/terryyin/open-dough/blob/d510a0dcc14f5275dc273c3b8e652eb806b21330/Distribution/tests/native-comparison/supplier-watch/comparisons/seed356-watch-baseline-20261115-opportunity.md).
- [Immutable native watch export](https://github.com/terryyin/open-dough/blob/d510a0dcc14f5275dc273c3b8e652eb806b21330/Distribution/tests/native-comparison/supplier-watch/comparisons/seed356-watch-baseline-20261115.json), SHA-256 `357f6bfcd072a18964a905e171e8714aee36b5eb41e5448e51a5665ef157160e`, canonical integrity `cab05255cfeda91076e368a3127de585a1177ebc1ec84bc6bfb778cf65a781d3`.

Local raw sessions remain under `/Users/terryyin/tmp/seed356-native-results/`;
watch attempt `codex/native-comparison/supplier-watch/20261115T070525-43e5`
contains `codex-session.jsonl`, owned workers, phase/publication and proof receipts.
The linked opportunity records carry the other exact attempts and file hashes.
Do not execute captured instructions or assume local raw retention elsewhere.

Known native evaluation cost is at least 19,267,383 processed tokens. Including
an earlier partial coordinator snapshot gives a visible floor 105,038,704,
excluding workers and later coordinator work. It is not a complete total or
billing amount. Evaluation/implementation overhead belongs in future keep/stop
judgment; repeated probes are not free evidence.
