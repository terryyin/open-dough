# Matched Token Index case timings

Both runs used the maintained Dashboard backend command with the same
filename-anchored selection, Node 24.21.0, two workers and the macOS
sleep guard on AC power. Every selected case passed on its first attempt.

| Engine | Files | Cases | Elapsed | Summed case time | Cases above 100 ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Playwright | 19 | 58 | 58.70 s | 107.479 s | 40 |
| Node Vitest | 19 | 61 | 5.95 s | 3.956 s | 13 |

## Cases above 100 ms

- The stale-cache, concurrent refresh and unreadable-store cases exercise
  the production child and inspect the actual cache or preserved bytes.
- The retained-detail case reads both launch stores. The Claude coverage
  case imports native transcripts to expose absent root and worker evidence.
- The Claude reply with worker and typed-workflow cases import private
  transcripts and read saved contributions or exact response ownership.
- The first root, missing descendant and late Claude worker cases require
  successive refreshes to show distinct gap or replay transitions.
- The new Claude launch, late Codex reply and changed Codex roots cases
  read real root and worker files, compare persisted contributions and
  check repeat behavior. The remaining chart-only cases operate on typed
  summaries in memory.

Case durations below are in milliseconds. Titles follow each runner's
proof record. Each file appears in both runs.

## `token-index-claude-coverage.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | Claude launches whose root or worker transcript is gone are partial with that gap and out of the rolling median, while launches with only the background-work limit stay measured | 2451.00 |
| Vitest | Claude launches whose root or worker transcript is gone are partial with that gap and out of the rolling median, while launches with only the background-work limit stay measured | 124.44 |

## `token-index-claude-population.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | retained, Done-marked and recovered Claude dashboard tasks are each their own point, and a running launch is not | 1946.00 |
| Playwright | the Claude Code rolling median spans its ten latest eligible tasks, leaving an unpriced fast task out | 29.00 |
| Vitest | retained, Done-marked and recovered Claude dashboard tasks are each their own point, and a running launch is not | 34.86 |
| Vitest | the Claude Code rolling median spans its ten latest eligible tasks, leaving an unpriced fast task out | 0.75 |

## `token-index-claude.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | Claude Code weighs its finished dashboard launches under the Claude tariff, workers at their own model, and leaves Codex's answer as it was | 1697.00 |
| Playwright | a one-hour cache write weighs more than the same five-minute write | 67.00 |
| Playwright | a fast speed or an unsplit cache write, even at an estimated model's rates, leaves its Claude task without a point, counted unpriced | 26.00 |
| Playwright | an unlisted Claude model is estimated at the reference model's rates, cache writes included | 15.00 |
| Vitest | Claude Code weighs its finished dashboard launches under the Claude tariff, workers at their own model, and leaves Codex's answer as it was | 17.37 |
| Vitest | a stored one-hour cache write weighs more than the same five-minute write | 28.60 |
| Vitest | a fast speed or an unsplit cache write, even at an estimated model's rates, leaves its Claude task without a point, counted unpriced | 0.43 |
| Vitest | an unlisted Claude model is estimated at the reference model's rates, cache writes included | 0.19 |

## `token-index-cohort.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | model and effort filter by root response counts, with ties unknown and options spanning workflows | 107.00 |
| Vitest | model and effort filter by root response counts, with ties unknown and options spanning workflows | 8.64 |

## `token-index-detail.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | each launch keeps its own detail and outcome; current reports, Done marks and retained history finish imported tasks | 1212.00 |
| Vitest | each launch keeps its own detail and outcome; current reports, Done marks and retained history finish imported tasks | 146.81 |

## `token-index-developer-reply-codex.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | a Codex reply turn's responses count in the launch | 2170.00 |
| Playwright | a reply turn that opens with host-injected context counts once in the launch on every import | 3134.00 |
| Playwright | a Codex worker spawned in the reply turn counts once in the launch | 2421.00 |
| Playwright | a reply turn's compaction response, recorded before its turn context, counts at that turn's model | 2330.00 |
| Vitest | a Codex reply turn's responses count in the launch | 40.93 |
| Vitest | a reply turn that opens with host-injected context counts once in the launch on every import | 66.78 |
| Vitest | a Codex worker spawned in the reply turn counts once in the launch | 21.69 |
| Vitest | a reply turn's compaction response, recorded before its turn context, counts at that turn's model | 13.06 |

## `token-index-developer-reply.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | a Claude Code reply's root response and the worker it starts count in the launch | 2850.00 |
| Playwright | a Claude Code reply after the launch's completion report still counts in the launch | 2536.00 |
| Playwright | a Claude Code workflow typed after an execution takes its own turns and later replies; no response counts twice | 809.00 |
| Playwright | a Claude Code slash workflow without arguments after an execution takes its own turns and later replies; no response counts twice | 1018.00 |
| Playwright | another dashboard launch's reporting context after a Claude Code reply takes its own turns and later replies; no response counts twice | 973.00 |
| Vitest | a Claude Code reply's root response and the worker it starts count in the launch | 145.73 |
| Vitest | a Claude Code reply after the launch's completion report still counts in the launch | 14.41 |
| Vitest | a Claude Code workflow typed starts its own attribution that survives repeated import | 114.34 |
| Vitest | a Claude Code slash workflow without arguments starts its own attribution that survives repeated import | 17.85 |
| Vitest | another dashboard launch's reporting context starts its own attribution after a Claude Code reply | 13.84 |

## `token-index-eligibility.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | standard and unrecorded tiers are priced; a fast worker leaves the entire task unpriced | 19.00 |
| Playwright | an unrated worker model is estimated at the reference rates beside its rated root, kept under the root's model | 46.00 |
| Playwright | a wholly estimated complete task plots without joining the ten-task rolling median | 25.00 |
| Playwright | only complete tasks, including a measured zero, fill the ten-task rolling median window | 18.00 |
| Playwright | median observations at a tied completion time each name their own eligible task, in task ID order | 65.00 |
| Vitest | standard and unrecorded tiers are priced; a fast worker leaves the entire task unpriced | 11.59 |
| Vitest | an unrated worker model is estimated at the reference rates beside its rated root, kept under the root's model | 0.41 |
| Vitest | a wholly estimated complete task plots without joining the ten-task rolling median | 0.73 |
| Vitest | only measured and priced tasks, including a measured zero, fill the ten-task rolling median window | 21.47 |
| Vitest | median observations at a tied completion time each name their own eligible task, in task ID order | 0.34 |

## `token-index-estimate-family.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | a GPT-6.2 Astra task is estimated from GPT-6 Astra, then reweighed once the November 19 card lists it | 127.00 |
| Playwright | the median first appears once the tenth task's estimate gives way to an explicit rate | 47.00 |
| Playwright | the GPT-6.2 Astra model filter still finds the reweighed task | 67.00 |
| Playwright | a mixed task sums each group at its own rates and keeps an outstanding substitution after the update | 66.00 |
| Playwright | unlisted claude-fable-5-3 is estimated at claude-fable-5-2 rates | 14.00 |
| Playwright | unlisted claude-fable-5-15 is estimated at claude-fable-5-2 rates | 17.00 |
| Playwright | unlisted claude-mythos-6 is estimated at claude-opus-5-5 rates | 14.00 |
| Playwright | unlisted gpt-6.10-sol is estimated at gpt-6.2-sol rates on codex-2026-11-19 | 16.00 |
| Playwright | unlisted gpt-6.2-astra is estimated at gpt-6.1-sol rates on codex-2026-11-15 | 54.00 |
| Vitest | a GPT-6.2 Astra task is estimated from GPT-6 Astra, then reweighed once the November 19 card lists it | 13.47 |
| Vitest | the median first appears once the tenth task's estimate gives way to an explicit rate | 1.54 |
| Vitest | the GPT-6.2 Astra model filter still finds the reweighed task | 30.68 |
| Vitest | a mixed task sums each group at its own rates and keeps an outstanding substitution after the update | 0.93 |
| Vitest | unlisted claude-fable-5-3 is estimated at claude-fable-5-2 rates | 0.59 |
| Vitest | unlisted claude-fable-5-15 is estimated at claude-fable-5-2 rates | 0.31 |
| Vitest | unlisted claude-mythos-6 is estimated at claude-opus-5-5 rates | 0.29 |
| Vitest | unlisted gpt-6.10-sol is estimated at gpt-6.2-sol rates on codex-2026-11-19 | 0.31 |
| Vitest | unlisted gpt-6.2-astra is estimated at gpt-6.1-sol rates on codex-2026-11-15 | 0.33 |

## `token-index-large-average.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | an isolated 65-million task leaves the ten-task median at one million | 1468.00 |
| Vitest | an isolated 65-million task leaves the ten-task median at one million | 1.92 |

## `token-index-period.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | calendar bounds select tasks and unpriced counts after the historical rolling median | 1534.00 |
| Playwright | malformed or incomplete period bounds are refused instead of broadening history | 1098.00 |
| Vitest | calendar bounds select tasks and unpriced counts after the historical rolling median | 7.95 |
| Vitest | malformed or incomplete period bounds are refused before reading usage | 1.49 |

## `token-index-provisional.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | a launch reported after the last check is provisional and out of the median until a Refresh after its end | 2855.00 |
| Playwright | a launch marked done after the last check is provisional and out of the median until a Refresh after its end | 2626.00 |
| Playwright | a launch that ended before the last check stays measured and in the median | 1943.00 |
| Playwright | a launch after the last check whose transcript lacks a cited worker stays partial | 2126.00 |
| Playwright | the rolling median reflects a launch's total corrected by a Refresh that reads its later turns | 3649.00 |
| Vitest | a launch reported after the last check is provisional and out of the median until a check after its end | 12.88 |
| Vitest | a launch marked Done after the last check is provisional and out of the median until a check after its end | 0.66 |
| Vitest | a launch that ended before the last check stays measured and in the median | 0.45 |
| Vitest | a launch after the last check whose transcript lacks a cited worker stays partial | 0.56 |
| Vitest | the rolling median reflects a launch's total corrected by a Refresh that reads its later turns | 94.18 |

## `token-index-refresh-claude-gaps.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | a Claude launch refreshed before its first response is partial until a later Refresh finds its response, then joins the rolling median | 6199.00 |
| Playwright | a Claude worker that answers after a Refresh clears its gap, while a worker it spawned whose transcript stays missing keeps the launch partial | 6197.00 |
| Playwright | a Codex session refreshed before its first response loses its no-response gap once a later Refresh reads its response | 4804.00 |
| Vitest | a Claude launch joins the rolling median after Refresh finds its first response | 141.73 |
| Vitest | a Claude worker's answer replaces its incomplete gap, and its missing descendant keeps the launch partial | 203.75 |
| Vitest | a Codex session loses its no-response gap when a later Refresh reads its response | 72.54 |

## `token-index-refresh-claude.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | Refresh brings in a Claude launch finished since the last check with its worker, each response once, ignores a session no launch names, and changes nothing when repeated | 5276.00 |
| Playwright | a Refresh while a Claude task runs brings in what its transcript holds so far, and a later one replaces it | 4772.00 |
| Vitest | Refresh imports the new Claude launch and its worker once and excludes unrelated sessions | 151.14 |
| Vitest | Refresh replaces a running Claude launch's stored contribution as its transcript grows | 81.65 |

## `token-index-refresh-developer-reply-codex.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | Refresh counts a Codex reply turn read late, the worker it spawns after the last check, each response once | 3625.00 |
| Playwright | Refresh leaves a typed workflow turn after a Codex reply out of the launch | 2514.00 |
| Vitest | Refresh counts a Codex reply turn read late, the worker it spawns after the last check, each response once | 130.56 |
| Vitest | a later typed workflow starts its own attribution when Refresh finds its kept launch | 69.59 |

## `token-index-refresh-developer-reply.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | Refresh counts a reply read late, the worker it starts after the last check, each response once | 4260.00 |
| Playwright | Refresh leaves a typed landing after a reply and its later replies out of the launch | 3227.00 |
| Playwright | Refresh gives another launch's reporting context after a reply its own turns | 2920.00 |
| Vitest | Refresh counts a reply read late and the worker it starts, once per response | 263.83 |
| Vitest | Refresh leaves a typed landing after a reply and its later replies out of the launch | 99.76 |
| Vitest | Refresh gives another launch's reporting context after a reply its own turns | 94.45 |

## `token-index-refresh-line-separators.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | a Refresh counts a Claude Code row whose text holds line separators and the response climbing through it | 3058.00 |
| Vitest | Refresh counts a Claude row containing line separators and the response descending from it | 89.79 |

## `token-index-refresh.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | Refresh reads changed roots and their older workers like a full import; repeats coalesce without rewriting or double-counting | 7431.00 |
| Playwright | an unreadable store fails Refresh without replacing its summary or check time | 3431.00 |
| Vitest | Refresh reads changed Codex roots and their older workers without double-counting | 291.94 |
| Vitest | concurrent refresh presses share the same run and leave the store and cache bytes intact | 661.32 |
| Vitest | an unreadable store fails Refresh without replacing its summary or check time | 326.61 |

## `token-index.spec.ts`

| Engine | Case | Duration (ms) |
| --- | --- | ---: |
| Playwright | configured dashboard tasks weigh roots and workers without modifying the store, even when rebuilding its summary | 2434.00 |
| Playwright | finished GPT-6.2 Sol and Astra tasks have a priced Token index point | 1603.00 |
| Playwright | a new tariff reweighs the same stored counters | 20.00 |
| Playwright | an unknown launch workflow is refused | 1151.00 |
| Playwright | an unknown tool is refused | 872.00 |
| Vitest | the default chart weighs roots and workers for all configured projects | 1.83 |
| Vitest | a stale summary rebuilds from usage history without rewriting the store | 244.88 |
| Vitest | finished GPT-6.2 Sol and Astra tasks have a priced Token index point | 14.62 |
| Vitest | a new tariff reweighs the same summary counters | 0.43 |
| Vitest | refuses GET workflow=planning before reading usage | 1.72 |
| Vitest | refuses GET tool=cursor before reading usage | 0.24 |
| Vitest | refuses POST  before reading usage | 0.21 |
