# Assess the first-report trial in ordinary work

**Source:** [Ordinary-work assessment, including its decision criteria](../../seeds/SEED-401-retrospective-finding-pilots.md#assess-new-retrospective-findings-pilot)
**Source review:** [Source-only review](source-review.md)
**Identity:** SEED-401#assess-new-retrospective-findings-pilot
**Split from:** SEED-401#pilot-new-retrospective-findings, whose plan 706 froze and replayed the wording in its slice 1 (`d6190e523`). Its slices 2–4 are this plan’s slices 1–3.

## Goal and scope

A retrospective reviewer can finish routine work quietly and still bring a consequential first observation to a maintainer who can use it. Expose the frozen question at the point where an enabled process review has evidence for a possible new finding, before the writer allocates an ID or gathers row metadata. Compare the writer’s work **and** what the next reader must inspect, reconstruct or decide.

Use the [shared comparison](../../seeds/SEED-401-retrospective-finding-pilots.md#pilot-comparison) for Doughnut and Pygardon. Terry Talks provides historical controls. Existing matching, repeat recording, required project reports, allocation, retention, triage authority and any immediate incident response keep their existing owners. Wider adoption belongs to a later decision.

## Frozen trial


- **Wording.** [trial-wording.md](trial-wording.md), Git blob `e114ab467d71183873dd4217e4ed52565785d781`. The exploratory replay of nine packets (seven seed cases and two controls, each in both arms) found no consequential miss, so the wording is unrevised.
- **Baseline.** Recording reference blob `49de76bfe`. Starting trunks are Doughnut `a23441f741486ea5bde7e892038ba33b408d78a4` and Pygardon `7da34fc73a4993ea6008e0966d42920476b79a4c`. These were read without fetching from the local `origin/main` of each clone on 18 November 2026.
- **Sampling.** As set out in the [ordinary-work protocol](#ordinary-work-protocol). The seven-day window starts when this wording lands on trunk.
- **Criteria.** As in the seed's [Decision](../../seeds/SEED-401-retrospective-finding-pilots.md#assess-new-retrospective-findings-pilot) and [shared comparison](../../seeds/SEED-401-retrospective-finding-pilots.md#pilot-comparison).
- **Route.** Both clients install the base blob. Doughnut installs it under `.agents/skills/`. Pygardon installs it under both `.agents/skills/` and `.claude/skills/`. In the developer's authorized session, the developer gives one instruction for that review only: apply the pinned trial wording in place of the sentence it names. The instruction goes at `dough-execution-retrospective` when process review runs there. When process review is deferred, it goes at `dough-story-wrap-up` "Complete a deferred process review", before that review's recording decision. Paste the wording, or cite it by this blob from the landed Open Dough trunk. Confirm exposure from the executing reviewer's transcript.
- **Replay result.** [Replay evidence](replay-evidence.md). Exploratory, on one model with 18 isolated reviewers. Both arms made the same decision in all nine packets: the six seed incidents and practices recorded, the quiet control unchanged, the matched control given one row under DD-246. Writer effort: current arm 474,280 tokens, 43 tool calls and 429.5 s; candidate arm 470,635 tokens, 41 tool calls and 452.2 s. Neither difference exceeds run-to-run noise. Six packets carry neutral notes rebuilt from the original entries’ evidence lines, and the wrong-mount packet had no execution identity, so neither arm could write a countable row.
- **Replay limit.** The candidate admitted the break checks under a use the reviewer named, which bears on the ODF-147 response. A routine entry was therefore not avoided. Slice 3 weighs this.

## Delegated pilot operation

- Terry delegated both client routes, this assessment and its follow-ups to the
  Codex thread that owns the [Taken claim](https://github.com/terryyin/open-dough/commit/e2fc81fd43727f4d3ee44a0dba0ff481c5bdf9de).
  The assessment runs from `.worktrees/seed-401-first-report-assessment`, on
  `codex/seed-401-first-report-assessment`. Its `ci.yml` observer is
  `seed401-assessment` at `/tmp/dough-ci-501/watch-0KlJHm`, rearmed for the
  Pygardon cohort checkpoint after the previous worker ended. The prior mailbox
  retained successful applicable CI for the last planning-only checkpoint.
- The window starts at integration `211360795b04901fca1eefd95e1b4256d411024c`
  on 18 November 2026 at 23:43:11 Singapore time. It closes on 25 November
  at 23:43:11 Singapore time. The client first-parent revisions immediately
  before that start are Doughnut `1d5aace35c3890daad54fc736c540d0546c01d66`
  and Pygardon `7da34fc73a4993ea6008e0966d42920476b79a4c`.
- Each client has a temporary project instruction that supplies the same
  pinned wording at the single review step above. Its availability starts at
  its own client trunk publication. The original window, cohort order and
  cutoff apply even to executions that did not see the notice. Confirm actual
  use and route from the transcript. Record whether the separate repeat pilot
  applied and hold that choice fixed within each comparison.
- Client deployment and removal belong to the Codex-owned backlog stories
  [Doughnut SEED-132](https://github.com/nerds-odd-e/doughnut/blob/main/.planning/seeds/SEED-132-route-first-report-trial.md#route-first-report-trial)
  and [Pygardon SEED-20261115](https://github.com/terryyin/pygardon/blob/main/.planning/seeds/SEED-20261115-route-first-report-trial.md#route-first-report-trial).
  Exclude both client pilot stories from the ordinary cohort. Their notices
  became available on origin/main on 19 November 2026 at 07:46:52 Singapore
  time in [Doughnut](https://github.com/nerds-odd-e/doughnut/commit/1ed33fda63fbcb70fb9346a4f0b2045da6ab7083)
  and at 07:47:27 in [Pygardon](https://github.com/terryyin/pygardon/commit/823d385bdce30368f19e4f3b0b7c06118d0c0d5d).
  Each contains the canonical temporary `AGENTS.md` notice and a `CLAUDE.md`
  pointer. Earlier sessions and branches may miss the notice. Client story
  slice 2 removes its two additions when its enrollment ends.
- Doughnut’s client rollout [CI attempt](https://github.com/nerds-odd-e/doughnut/actions/runs/44423649370)
  reported five CLI test timeouts. The fixture repair `47bf1d9532` passed its
  [hosted run](https://github.com/nerds-odd-e/doughnut/actions/runs/44425172032),
  including Other Unit Tests. Pygardon’s accepted rollout `823d385bd` passed
  the configured `pygardon-ci` check. These deliveries are pilot administration.
- The Codex heartbeat `complete-the-seed-401-first-report-pilot` resumes the
  work every six hours, checks for ordinary completions and closes the pilot
  at the cutoff. Stop the heartbeat after verified client cleanup and a landed
  disposition. The owner queues any follow-up justified by the disposition.

### Cohort recovery

In each client, fetch `origin/main` and list first-parent additions of
`.planning/done/*.json` at or after the pinned start and before the cutoff, in
oldest-first order. Use `--diff-merges=first-parent` with the path filter and
exclude `.planning/done/.catalog.json`. Read each added record at the adding
revision, preserving its identity, completed time and trunk revision. Ignore
pilot administration and deduplicate by execution identity before taking the
first two ordinary completion records. On 19 November at the first checkpoint,
neither project had added an eligible completion in the window.

### Ordinary cohort at 13:40 Singapore time on 19 November

| Project | First-parent checkout consulted | Selected completions in trunk order |
| --- | --- | --- |
| Doughnut | `cf47f219e9` | 1. `SEED-073#renew-waiting-question-when-note-changes`, Codex, recorded complete at 08:49:47, added by integration `d3db25bda0f0e3ff52c920b2655c8efc8a418e3e` at 09:00. |
| Pygardon | `7b526daf9` | None. |

Selected from done-record additions before opening any findings. Both temporary
routes are still present. Both clients installed Open Dough 0.3.107 after
these observations. It changes history recovery and numbering in the recording
reference (blob `31fe77694b7c1c94d7221c7d38ea20e8463ff759`), retaining the
sentence the notice replaces. Use the review's actual installed base in each
pair and keep history recovery and numbering identical across its two arms.

### Doughnut completion 1, waiting-question renewal

- **Actual route.** On Codex and Open Dough 0.3.106, the coordinator used
  ordinary recording in deferred wrap-up after the Intent Coverage report.
  Its checkout at `6f50812667` predates both project trials, and the review
  transcript shows the baseline reference and no candidate instruction.
  Hold ordinary repeat recording fixed in the comparison. The session
  `01a1ef49-41fe-75e2-a2ca-c69e714c8155` records the review at lines 4286–4325.
- **Execution evidence.** The [readiness diagnosis](https://github.com/nerds-odd-e/doughnut/blob/6f50812667ec9284bc6b55a54362dc21e24d27b9/.planning/slice-plans/111-renew-waiting-question-when-note-changes/diagnosis-startup-readiness-http.md)
  reports an unexplained 404 during a held migration. Three rounds consumed
  3.9 active minutes without exercising a competing responder. A controlled
  bind reproduced 404 in round four. Explicit loopback binding recovered
  the expected 503 and 200. The original listener remains unidentified.
  The independent proof check also located two narrower setup lessons in
  the package-source and mock-port repairs, and verified that the zero-case
  Cypress invocation had existing terminal proof in Ink.
- **Actual outcome and effort.** The ordinary writer added one new finding,
  [DD-517](https://github.com/nerds-odd-e/doughnut/blob/3b37cd28f0b1ad0b3da094038d0255df02184ea5/DearDough.md#dd-517--a-competing-listener-hypothesis-was-exercised-only-on-a-quiet-port),
  on testing address ownership earlier. No duplicate occurrence was added.
  The record remained on trunk at the checkpoint, with no verified later
  triage decision. The transcript exposes five tool-call envelopes over about
  42 seconds from the first process input through the finding write. The span
  and calls include other wrap-up tasks, so attributable active time, tokens
  and downstream effort are unavailable.
- **Isolated candidate replay.** A separate reviewer used the pinned
  execution plan, three diagnosis notes, and the same starting logs. The
  candidate admitted the readiness finding and would add first reports on
  package-feed scope, mock-port handoff and probing consumers before slicing.
  It would attach the CLI runner-selection observation to matched DD-496
  under ordinary repeat recording. It kept the confirmatory Intent Coverage
  result and ordinary ownership refusal in execution proof. The replay
  identified potential decisions without publishing countable occurrences.
  It used 89 seconds wall time, eight tool calls and 22 shell invocations.
- **Assessment limit.** Both arms surfaced the strongest reusable lesson
  found by the independent proof check. The audit used one tree listing and
  four file reads and also found evidence for the two setup lessons. The
  candidate replay selected more material for possible triage. Its reviewer
  received a bounded record, while the actual wrap-up had live session
  history and interleaved other work. Counts describe the two records. They
  cannot isolate the wording's effect or establish a combined cost change.
  This execution used the ordinary rule and supplies no live candidate use.

### Pygardon cohort closed on 21 November

Both ordinary completions were selected from first-parent done-record additions
before inspecting any review outputs. Trunk `b579e2b18` contains one later
ordinary completion, outside this project's fixed two-case sample.

| Order | Identity | Completion recorded in Singapore time | First-parent addition |
| --- | --- | --- | --- |
| 1 | `SEED-20261117#play-video-on-iphone-and-ipad` | 21 November 10:01:50 | [`5557e25a93`](https://github.com/terryyin/pygardon/commit/5557e25a93f4bb82dff9cb62111ad08542e39648), 10:01:59 |
| 2 | `SEED-20261117#webkit-jump-before-media-seekable` | 21 November 11:05:15 | [`fe431c5c9`](https://github.com/terryyin/pygardon/commit/fe431c5c9c532175788f79f333eee56b158bb50b), 11:07:13 |

- Terry set `skipProcessRetrospective: true` in both clients on 21 November at
  06:55:41 Singapore time. [Doughnut](https://github.com/nerds-odd-e/doughnut/commit/03d34cc353519af6eb1be5ee4041d4f981511356) ·
  [Pygardon](https://github.com/terryyin/pygardon/commit/374bc9a320912f58e773a50f62782817a1cd30b1)
- The Pygardon reviewers ran in Claude Code with Open Dough 0.3.109. The
  completion-time checkouts at `156728b0a` and `a314ddf33` both had the
  setting enabled. The playback session `87dc2327-98a4-4915-a090-9e1b88943d6e`
  documents its explicit skip at lines 1678 and 1735. The WebKit correction
  session `fbbf2697-1769-48f0-a040-3c6e464da395` documents its skip at lines
  677–685 and 814. Both included product or implementation review.
- Pygardon's fixed sample contains two ordinary completions, two skipped
  process reviews and zero first-report admission decisions. The separate
  repeat rule was available in project guidance. Neither review applied it.
  There is no writer or downstream effort comparison for the first-report
  rule, and no candidate replay was run for skipped reviews. The retained
  scope supports an evidence gap, not a verdict on omissions or savings.
- The temporary notice and its Claude Code pointer were removed on Pygardon
  main. The repeat guidance and process-review default were verified unchanged.
  [Pygardon withdrawal](https://github.com/terryyin/pygardon/commit/4d9470aef6e07fbd82a2869cbaad2dcdc780b732)

## Basis for the trial

| What execution needs | Preparation observation on 18 November 2026 |
| --- | --- |
| A common starting rule and a place to try one change | At Doughnut `a23441f74` and Pygardon `7da34fc73`, `git show <rev>:.agents/skills/dough-update/VERSION` returned 0.3.106. The installed Codex/Cursor recording reference in both and this checkout’s Distribution source at `db341470a` resolve to blob `49de76bfe`. Its text admits supported one-offs and practices. Both project configs enable process review. The [ordinary selection](../../../Distribution/src/skills/dough-execution-retrospective/SKILL.md#select-reviews) can skip it or [defer it to wrap-up](../../../Distribution/src/skills/dough-execute-plan/references/deferred-process-review.md). Check the actual host, revision, selection and route for every sampled execution. |
| A first reviewer’s evidence can be separated from later knowledge | In Doughnut, `git show 1a852ab455:.planning/slice-plans/071-agent-note-candidates-and-cited-reads/PLAN.md` reports the stale bundle and a possible silent false pass. Retirement at `9e98f0874d` adds the repaired behavior under stale and missing bundles. In Pygardon, `git show d82903415:.planning/slice-plans/382-production-native-crash-monitoring/REPLACEMENT-INCIDENT.md` reports a 174.31-second mount with possible writes unassessed. Later fixture proof does not resolve those writes. The seed links the records for both views. |
| A local number alone can select the wrong historical input | `git show a47436046:DearDough.md` in Pygardon identifies DD-269 as four restores in the pinned-script execution. `git show 23a91623e:DearDough.md` identifies another DD-269 about a changed function signature. Match each historical packet to its project, execution, mechanism and revision. |
| A sample can be drawn without starting from findings | At the seed’s pinned snapshots, `git log -1 --diff-filter=A --name-only <rev> -- '.planning/done/*.json'` located Doughnut `c8a19278f9` and Pygardon `3cfe47670`. Reading each newly added done record recovered a story, completion time and host. Reading the deleted plan in each closing commit’s parent recovered its execution-complete record. These demonstrate the selection and recovery route. A done record alone cannot establish that a process review ran or that it recorded everything. |

## Ordered slices

### 1. A Doughnut maintainer can assess what first reports reached triage

Type: Behavior
Status: planned

Use the ordinary-work protocol below in Doughnut. Follow the actual review through its first-report decisions to the first downstream read. Start with the execution records selected independently of the findings log. Include quiet and unavailable reviews in the accounting.

**Proof.** A second reader can recover the sampled identities from the recorded tranche of Git history, locate an observed decision or omission in the execution evidence, and trace what reached triage or stayed in ordinary proof. Show the two arms’ decisions and attributable effort under the same inputs. Record any missing route, exposure or downstream observation explicitly.

### 2. A Pygardon maintainer can assess what first reports reached triage

Type: Behavior
Status: planned

Apply the same protocol in Pygardon. Preserve this project’s starting log, guidance, execution identity and route. Each project supplies its own result even when it yields no eligible first observation. The two project samples can be enrolled together once the frozen wording is on trunk.

**Proof.** Recover the Pygardon cohort independently, compare what a maintainer could decide from each output with what happened in the execution, and account for writing, reading and checking omissions. A repair or transfer between project and shared records keeps the original execution count. Report the project’s actual exposure and any missing comparison.

### 3. The maintainer can decide whether the trial wording is worth keeping

Type: Behavior
Status: planned

Apply the seed’s predeclared decision to both project results. Give counts per project and arm for sampled executions, eligible reviews, consequential opportunities and misses, routine or duplicate narratives reaching triage, and decisions a reader could change. Identify which decisions actually changed and which remain prospective. Compare writer and downstream effort in like units, including recovery, checking skipped cases and pilot overhead. Keep active time, elapsed time, tool use and tokens distinct. Separate one-time evaluation cost from recurring work.

**Proof.** Cite the smallest recoverable evidence for each difference. Keep the candidate when the consequential reports survive, routine entries fall and the combined work falls. Revise on a consequential miss, including a useful practice or supported question lost because cost or remedy was unknown. If quality is equivalent but the candidate costs more, retain current practice. Mixed evidence, missing material costs, absent eligible events or unobserved use leave the corresponding claim open. Report the next ordinary observation that would settle it. End with the disposition, its limits and project-specific evidence in the pilot assessment.

## Ordinary-work protocol

- Use the first two distinct ordinary story executions completed in each project in the seven calendar days after the frozen wording lands on trunk. Pin each project’s starting trunk revision and the closing cutoff. Select from first-parent Git history of newly added story-completion records, in trunk order. Preserve the selected identities before opening findings. The sample includes silent runs. A skipped review, unavailable history, or no first observation consumes its place with that reason. These bounds limit pilot effort and imply no threshold for future reporting.
- For eligible ordinary reviews, supply the pinned candidate as a one-review instruction at the existing retrospective or deferred wrap-up recording step through the authorized project session. Record which wording the writer actually received and used. Compare a separate reviewer on the other wording using the same execution-time material and starting log in isolation. If the ordinary writer used current guidance, candidate application to that material is a replay. If the live route is unavailable, record that gap and use the independent sample to assess what is recoverable. Only verified ordinary use supports an ordinary-use claim.
- Establish what a future reader could have acted on from the execution proof before opening either arm’s output. Then check admitted **and skipped** observations against that evidence, the actual log at the relevant revision and any normal triage decision. A later discovery is grounds to judge an earlier miss only if relevant evidence was already available. Distinguish hypothetical triage in a matched review from observed triage. Retain counts, decisive locators and qualifications in the assessment. Use existing execution records to recover skipped cases.
- For comparability, hold the rest of the workflow fixed within each pair. Charge effort from first decision through ordinary recording and downstream review. Use available time, tool, token or concrete repeated-work evidence in the units each record supports. Label unavailable components. Log length, later retirement and percentage of findings that graduate do not measure total effort. [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md) · [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)

## Current decisions and gates

- The first-report decision belongs with the existing recording rule. The [bounded log](../../../Distribution/src/skills/dough-execution-retrospective/references/bounded-process-log.md) ranks material only when a supported write would exceed the ceiling or the log is already oversized. Project and shared triage act after the write. Reusing those downstream checks alone cannot save writing the original entry. Keep the project obligations and repeat decisions fixed in both arms.
- Use the [maintainer behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) for the candidate. The bounded trial uses existing execution proof and the pilot assessment. Preserve its disposition and decisive evidence at wrap-up. A shared release or client rollout requires a separate decision under [ADR 0003, Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
- Local gates are each slice’s representative review or evidence walk and `git diff --check`. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md). If a long full run becomes necessary on macOS, start fully awake on AC with `caffeinate -s -i`. On battery, plug in or keep the lid open with `caffeinate -i` and inspect the sleep log afterwards. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
- Budget 15 active minutes per slice. Elapsed exposure to ordinary work is a separate measurement. Slice-plan refinement was unnecessary. Each project’s independently useful observations and the combined keep decision have distinct proof. No remaining slice-specific design or proof concern was identified. Actual first-report opportunities and savings are outcomes the trial measures.

## Story obligations

### G1. Candidate admitted the break checks (first reported in slice 1 of plan 706)
Reported: slice 1 — "For DD-443, arm B named a distinct future use (evidence on the ODF-147 response) and admitted the entry, which later triage pruned. The routine entry was not avoided."
Story clause: "Keep the candidate if consequential first reports survive, fewer routine entries reach triage and combined effort falls."
Disposition: receiving slice 3
