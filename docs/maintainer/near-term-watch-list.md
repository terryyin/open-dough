# Near-term watch list

```json dough-feedback-review
{"schemaVersion":1,"reviewed":"2026-10-28","reviewAfter":"2026-11-04"}
```

Reviewed 2026-10-28 (Asia/Singapore): Open Dough, Doughnut, Pygardon and
newly enabled Lizard post-local records reviewed; production inventory rechecked
unchanged. Terry Talks is outside shared collection because process retrospective
is off and has no local findings record. ODF-201's consequential unknown-release
contrary report remains unresolved; elapsed time does not pass this watch.
Lizard's missing observer-identity receipt is separately retained as ODF-376,
not an inferred failure or success of durable batch acknowledgment. No retirement.

<a id="odf-201"></a>

## ODF-201 — Codex stream leaves delivered failures unacknowledged
The Codex stream binding notifies CI failures without advancing the durable delivery cursor, so completion retains shutdown for failures already repaired.

- **Follow-up:** released in 0.3.57; under observation, not resolved.
- **Response / limit:** First released in 0.3.57: the documented Codex binding acknowledges each notified batch through `ci-mailbox.mjs acknowledge`; a record never notified still retains shutdown. Native Codex evaluation (paid, manual) not yet run. Before it: nine Open Dough Codex executions, latest 0.3.54.

- **Release verification (2026-10-09):** Relevant response diff inspected; the first containing tag for 8ac67735 is `v0.3.57` (`b7962d57`, released 2026-10-07T07:31:16+09:00). All three projects adopted 0.3.57 on 2026-10-07 (Open Dough `69f22b57`, Pygardon `f536bb693`, Doughnut `4a4900df07`). Installation alone does not establish effectiveness or a watch start.
- **New report:** Open Dough / DD-242, plan 262, describes the same missing durable acknowledgment, but execution release and modified revision are unknown. Inspection of the released binding shows the acknowledgment added by `8ac67735`; the report describes the old no-ack binding. Retain the report without inferring post-0.3.57 failure.

- **Watch start:** 2026-10-10 (date-only, Asia/Tokyo), release 0.3.57. Open Dough plan 281, first implementation `652036be`; `88fed85b:.planning/slice-plans/281-review-merged-one-shot-change/CI-REPAIR.md` records the matching Codex observer `watch-lAm58a` with `delivery.json` acknowledged through sequence 7, including owned failure records 1–6.
- **Review after:** 2026-10-17.
- **Last assessed:** 2026-10-25; complete selected-source coverage. Retain this watch conservatively: the provenance-limited plan 262 report still describes missing durable acknowledgment, and its execution release is unknown. The released binding contains acknowledgment, but that fact does not locate the reported execution before adoption. Resolve that consequential contrary report before retirement; no new occurrence or watch start is created by rereview.
- **Earlier assessment:** 2026-10-12; Open Dough, Pygardon and Doughnut current logs and the named execution records checked. Durable acknowledgment evidenced; raw original notify history/timing unavailable; later terminal transport loss belongs to ODF-121. No supported same-mechanism recurrence established; this is not proof the issue cannot recur.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-201 — Codex stream notifications leave handled failures unread at completion](https://github.com/terryyin/open-dough/blob/c76322764499936acd42328b5ef4f66f4df6bcf8/DearDough.md#odf-201--codex-stream-notifications-leave-handled-failures-unread-at-completion).

Former local code: DD-200.

Former branch-local code: DD-198; moved with this execution’s findings after the concurrent allocation collision.

The Codex stream binding delivered failure notifications, but neither its consumer nor the stream worker advanced the mailbox's durable delivery cursor. After both failures were repaired, completion returned green CI while retaining shutdown for those same unread events. The worker was live and the stale events were actual repaired CI failures.



### Occurrences

- Execution: `SEED-052#start-codex-refinement-from-dashboard` / plan 189, first related implementation commit `05f3e4a9fa018eba5be122b729f5b78f0e4cce70`
  - Timestamp: unknown (2026-10-01 execution completion)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-kA6yM3`, cell5. `complete-revision` for `cca873af2766128d3409db6c47c1a8beea39a7f6` returned exact success (run36793490950/attempt1) and shutdown retained/unread_actionable_failure for runs36750057215 and36790537801. Installed `readDeliveryProgress` returned deliveredThrough0; only sequences1/2 existed, matching those handled failures and published repairs a8c8d27/3fdae6f. `ci-notify-codex.md` consumer calls notify; `streamMailboxWorker` prints records; neither calls recordDeliveryProgress. Coordinator verified identity/event tuples and acknowledged exactly1/2 through the installed export.
  - Observed effect: Completion could not confirm shutdown despite green CI and previously accepted repairs; another records/recovery boundary was needed.
  - Inference: Durable delivery acknowledgment is missing in this adapter path. CI provider health and product behavior did not cause this retained shutdown.

- Execution: `SEED-052#use-codex-from-dashboard` / plan 192, first related increment `22ff91b009fb90311cf71230e63f760e0fefdedb`
  - Timestamp: unknown (2026-10-01 human-judgment stop and authorized resume)
  - Tool: Codex
  - Open Dough release: unknown; coordinator installed VERSION 0.3.51
  - Evidence: observer watch-kaShmz, cell19/session4531/PID3443, stopped receipt recordedThrough2/deliveredThrough0/unread2. Sequence2 was own run36813260082/attempt1 on slice4 8020eb2, already corrected by slice5 ca12038b; trace tied the timeout to raw HTTP awaiting a WebSocket upgrade. Root inspected both events and used installed recordDeliveryProgress to acknowledge exactly2 after the clean CI-repair save/restore returned resumed. [Execution account](https://github.com/terryyin/open-dough/blob/6dc872978d0ca93fc17a52f9893a6f2a55850b1e/.planning/slice-plans/192-complete-codex-dashboard-sessions/NATIVE.md#resumed-observer).
  - Observed effect: delivered historical failure still required durable acknowledgment after shutdown; no new repair was manufactured. The same binding was rearmed only after old PID exit.
  - Inference: this second execution reproduces the adapter cursor gap. Notification arrival timing alone does not establish a separate provider defect.

- Execution: `SEED-066#align-one-shot-callers-with-review-default` / plan 196, first related implementation commit `e4902583ce1e737a19f26ecd18bc437e3b68a751`
  - Timestamp: unknown (2026-10-01 execution)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-JOgwzs`, cell14/session82933/PID52346 delivered sequences1/2: run36839722302/attempt1 on bfec4af and run36841489154/attempt1 on 76969a1c. Repairs 76969a1c/6726e8c were accepted. Installed readDeliveryProgress still returned deliveredThrough0; readMailbox/readMailboxEvents confirmed exact checkout/repo/branch and only those two event tuples. Coordinator used installed recordDeliveryProgress after verifying both handled events; acknowledgment returned sequences1/2 and deliveredThrough2.
  - Observed effect: proactive recovery required an explicit durable acknowledgment before completion; no blocked completion or additional product repair is claimed in this occurrence.
  - Inference: the notification adapter's same cursor gap recurred; message delivery alone did not persist acknowledgment.

- Execution: `SEED-076#session-after-workspace-retirement` / plan 201, first related implementation commit `33eb0b69afbca8db3cc860f5d6ca2d9dd74aa17f`
  - Timestamp: unknown (2026-10-01 execution, three CI repair boundaries)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-qG1qAV`, cell42/session72248/PID16942 delivered sequences1–4: run36861023410/attempt1 on34fd7257, run36862248330/attempt1 on130e8a6d, run36865996491/attempt1 on84b26724 and run36866430369/attempt1 on9b982761. Repairs130e8a6d/bc98c4ac were accepted; the last two attempts had the same verified startup-fixture framing cause. The installed Codex binding extracts record.event and calls notify, without retaining sequence or advancing delivery progress. Root used installed readMailboxEvents/readDeliveryProgress to match the handled event tuples and recordDeliveryProgress to acknowledge exactly1, then2, then3/4; final deliveredThrough4, remaining[]. [Execution proof](https://github.com/terryyin/open-dough/blob/74b5f149edc174ba641e721b2b21d061d07ba891/.planning/slice-plans/201-session-after-workspace-retirement/PLAN.md) retains the diagnosed repairs.
  - Observed effect: each delivered, handled failure required explicit durable acknowledgment before completion. No blocked completion or additional product repair is claimed for this occurrence.
  - Inference: the same adapter cursor gap recurred. Process proposal remains ODF-201's existing unqueued acknowledgment-contract follow-up; this review does not change guidance.

- Execution: `SEED-077#ci-independent-of-package-mirror-stalls` / plan 207, first related implementation commit `e98441593f71e722b032ab08203c43b43a4c1d56` - Timestamp: unknown (2026-10-02 completion operation) - Tool: Codex - Open Dough release: unknown - Evidence: retained observer `/tmp/dough-ci-501/watch-Mcfmhh`, cell14/session97439/PID47835; exact-revision completion for `43226774216f8d4eb3de0ec516a898d86212749e` returned success (run36947886626/attempt1) but retained shutdown for unread sequence1, run36942598744/attempt1 on `e9844159`. That event's attention-journey synchronization failure was already repaired by `7ab0732b` with deterministic red/green proof and passing run36943286746. Installed readMailbox/readMailboxEvents/readDeliveryProgress confirmed exact checkout/repo/branch and only this handled tuple; coordinator used recordDeliveryProgress to acknowledge sequence1, deliveredThrough1. - Observed effect: one completion receipt retained shutdown and required explicit durable acknowledgment, then repetition of the completion operation. No new product repair was needed. - Inference: the installed yielded Codex adapter's documented binding notifies record.event without persisting the delivery cursor, reproducing ODF-201. Keep its existing unqueued contract proposal; this execution changes no guidance.

- Execution: `SEED-081#codex-session-model-and-effort` / plan 211, first related delivery commit `bcaabd99c5f24bcffc9393f53c203c74589f2b7e`
  - Timestamp: unknown (2026-10-02 execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed at established start `20580ea2`)
  - Evidence: yielded observer `/tmp/dough-ci-501/watch-x4nPTj`, cell19/session35356/PID69697 delivered sequence1, run36962208003/attempt1 on `9c0d6bb4`. After focused red/green repair and accepted `4a50e086`, installed readMailbox/readMailboxEvents verified checkout/repository/branch and that exact tuple; readDeliveryProgress still returned deliveredThrough0. Coordinator acknowledged only sequence1 through recordDeliveryProgress, then read back deliveredThrough1.
  - Observed effect: one explicit durable acknowledgment was necessary after notification handling; retained shutdown was avoided before completion. No unseen evidence was cleared.
  - Inference: the notification/cursor gap matches ODF-201. This occurrence does not claim a failed shutdown receipt; existing contract follow-up remains unqueued and guidance unchanged.

- Execution: `SEED-082#dashboard-development-and-production` / plan 213, first related implementation commit `4e076e11ea761a98f8c401e69102228cb8f0b693`
  - Timestamp: unknown (2026-10-02 CI repair and execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.54 (unchanged installed VERSION at established start `4fe8c7a4`)
  - Evidence: yielded observer `/tmp/dough-ci-501/watch-HB2kLV`, cell105/session35081/PID79031 delivered sequence1, run36978829120/attempt1 on `e5fe8a7c`. A fresh agent reproduced the startup test's disposed-response race and repair `0e88f0162b06f151444dd3588345d08279df6c62` passed held red/green, both original tests and typecheck; managed delivery reused the observer. Installed readMailbox/readMailboxEvents verified exact checkout/repository/branch and event identity; readDeliveryProgress remained deliveredThrough0. Coordinator acknowledged exactly sequence1 through recordDeliveryProgress and read back deliveredThrough1, remaining[].
  - Observed effect: one explicit durable acknowledgment was necessary after handling the delivered failure. No failed shutdown receipt is claimed. Execution completion for `96b67c5` returned exact CI success (run36980585327/attempt1) and confirmed shutdown; spent plan recovery: `96b67c5cd28230a3a2f822885bf2ba06a299953d:.planning/slice-plans/213-dashboard-development-and-production/PLAN.md`.
  - Inference: matches ODF-201's notification/cursor gap. Keep the existing unqueued contract proposal; this review changes no guidance.
- Execution: `SEED-041#deliberate-implementation-dependencies` / plan 216, first related implementation commit `8bb73be064a7778470389bd5a458fb70f5a96962`
  - Timestamp: unknown (CI repair after slice 2)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed execution guidance)
  - Evidence: `/tmp/dough-ci-501/watch-7PZYuD` delivered sequences 1–3 for run 36997893525/attempt 1 on `29bd2aa`; the Codex stream binding notified event payloads without advancing durable delivery. Coordinator inspected the exact SHA/run/attempt/job tuples and used installed `recordDeliveryProgress` to acknowledge only those handled notifications; repair `a049909` was published. Completion later retained sequence 1 in `watch-cWrqJu`, run 37003387678/attempt 1 on `ce8b9df`, job 110825968667; the coordinator inspected the responsive keyboard failure and acknowledged exactly that delivered sequence while its passing repair underwent independent review.
  - Observed effect: explicit durable acknowledgment was needed beyond stream delivery. No unseen failure was discarded.
  - Inference: same adapter acknowledgment gap; keep the existing unqueued proposal. Internal delegated reasoning is unavailable, so no broader process-cost claim is made.

- Execution: `SEED-083#persistent-dashboard-project-configuration` / plan 215, first related implementation commit `62c03b0083f1e6a65f42a2151c800eaa8923bc9f`
  - Timestamp: unknown (2026-10-02 execution)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at published start `db6b0da`; unchanged throughout this execution)
  - Evidence: `9c5b4fd8bb26e7f9bda1739199260d8c47928204:.planning/slice-plans/215-persistent-dashboard-project-configuration/PLAN.md`, Slice 4. Native observer `/tmp/dough-ci-501/watch-EQYhvD` notified sequences 1–2 for runs 36989187526/1 and 36993027579/1; installed readDeliveryProgress still returned deliveredThrough0. Coordinator inspected both exact identities and acknowledged only that handled prefix through recordDeliveryProgress; unseen events remained unread. Later inspected events 3–6 covered the same diagnosed failures on 9c5/dc8; after focused red/green repair and independent review, the installed export advanced only through sequence6. Wrap-up trunk observer lRHJqz later notified sequences1/2 for run37001581515/1 on 46b0431; readDeliveryProgress still returned0. After inspecting both failed-job identities and accepting focused repair/independent review, the installed export acknowledged only that handled prefix through2.
  - Observed effect: Delivered and handled failures still required separate durable acknowledgment before completion. No retained-shutdown failure is claimed for this occurrence.
  - Inference: The same notification/acknowledgment gap recurred; the installed export provided bounded recovery without changing guidance.

- Execution: `SEED-113#show-available-facts-promptly` / plan 260, first related implementation commit `cba2dedfe40de7bf9c7956e974b2021c279cd5fe`
  - Timestamp: unknown (2026-10-06 execution/CI handoff)
  - Tool: Codex
  - Open Dough release: 0.3.56 (installed guidance unchanged since accepted Take `ead6c3a6`)
  - Evidence: retained observer `/tmp/dough-ci-501/watch-5B7G8A`, cell138/session91572/PID66922. Completion for `f62292cd5748681bd54514e0c3fed49ddfe29024` used successful basis `eaa279dc026764cdb96d5abe54d7d8533163af08`, but retained shutdown/unread_actionable_failure for sequences1/3, runs37418870176/1 and37421684885/1, jobs112123517311/112132216439. Installed readMailbox/readMailboxEvents verified exact checkout/repo/branch and deliveredThrough0; the documented binding notifies record.event without retaining its sequence or recording delivery progress. Fresh diagnosis, independent refactor and deterministic proof produced accepted repair `7da9f1533316187860cb318dcac81238a6a538b6`; the clean repair restore returned resumed. Coordinator acknowledged only handled sequence1 through installed recordDeliveryProgress; deliveredThrough1 leaves sequences2/3 unread. Sequence2, cancelled run37420000326/1 on9baca4db, has thirteen unexplained preceding failures without a retained shard trace; its disposition remains open. [Execution evidence](https://github.com/terryyin/open-dough/blob/dc41662d1cc60505be39889aad511122907eb364/.planning/slice-plans/260-available-dashboard-facts/PLAN.md#ci-repair-and-unresolved-verification).
  - Observed effect: one successful-CI receipt retained shutdown and required diagnosis, repair and explicit durable acknowledgment. The first receipt did not establish that historical failures were already repaired. No final execution/CI completion is claimed.
  - Inference: same adapter cursor gap as ODF-201. This does not establish notification-arrival timing, worker loss, or a common CI-provider cause; internal delegated reasoning remains unavailable. Existing delivered/unreleased follow-up and guidance are unchanged.

**Source:** [open-dough / ODF-201 — The Codex observer binding has no durable failure acknowledgment step](https://github.com/terryyin/open-dough/blob/c76322764499936acd42328b5ef4f66f4df6bcf8/DearDough.md#odf-201--the-codex-observer-binding-has-no-durable-failure-acknowledgment-step).

Former local code: DD-242.

The prescribed yielded-stream binding forwards events with `notify` but never updates the mailbox's delivery progress. Completion separately treats unacknowledged failure events as actionable, even after a coordinator has classified and repaired them.



### Occurrences

- Execution: `SEED-114#session-column-membership` / plan 262, first related implementation commit `1f06b04d256536d55aa99670b8033b4fa1c09613`
  - Timestamp: unknown (after completion's failed receipt for `70b6f62a`, before its CI repair)
  - Tool: Codex
  - Open Dough release: unknown (execution-time installed guidance provenance not retained)
  - Evidence: retained observer `/tmp/dough-ci-501/watch-XLyt1z` had seven CI_FAILURE events for attempts `37427204231/1`, `37431359551/1`, `37432066761/1` and no `delivery.json`. The installed `ci-notify-codex.md` binding calls `notify` without `recordDeliveryProgress`; `ci-mailbox-complete.mjs` gates shutdown on `unreadActionableFailures`. After bounded log classification of all attempts, the coordinator used the installed exported store API to acknowledge exactly those seven events, preserving later events and the live repair observer.
  - Observed effect: one additional mailbox/source inspection and explicit acknowledgment outside the prescribed Codex binding. The first completion receipt itself correctly retained the observer for the failed revision.
  - Inference: Qualified. Source inspection shows that a later green completion would still retain this mailbox for unread failures without acknowledgment. That later refusal was prevented, not observed; absence of progress does not by itself establish that a notification was delivered to the model.
