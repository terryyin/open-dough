# Final local gate and repair ownership

## Aggregate observation

At a48ca574df6df318f6d0708a109813c736aa2d45 the literal retained command
`/tmp/seed300-final-intent-command.txt` selected591 actual cases:
258 backend,17 frontend and316 browser. The tests/intent filter also selected
backend-tests/intent; these extra API cases were really run.

On AC100/lid open, caffeinate-s-i, one worker,16CPU/48GiB, initial load
33.85/40.49/41.38,47.55%CPU idle and52%memory free, the owned run finished
at16:35:42.881UTC. Runner duration3013.625s, strict failure:590 passed,
one timed out, all retry0. Proof `/tmp/seed300-final-intent-proof.json` and
`dashboard/test-results/2026-11-11T15-45-29.190Z-40659` retain exact selection.
This is not an all-green aggregate claim.
Bounded pmset log inspection found no Sleep/Wake event in the aggregate or
repair windows; `/tmp/seed300-final-gate-sleep-check.json` retains the windows.

## G14: Project history journey

intent-project-scope-timing-refresh timed out32.009s including teardown.
Its final body assertion completed31.253s after start, after after-hooks began
at30.022s. No earlier assertion failure establishes a wrong table value.
Trace `/tmp/seed300-final-scope-refresh-failure-trace.zip` is CRC-valid.
Actual stages included roughly8.5s publication,2.857s collection polling,
5.108s initial comparison UI wait (actual HTTP4.639s),2.457s controlled-clock
refresh and1.509s later response drain. The case already requested canonical
queued Claude preview readiness, so adding that again is no repair.

The first bounded attempt overlapped actual independent collection and initial
comparison. It removed2.026s serial collection wait but the real CI read took
6.672s under pressure; the case still timed out31.051s, retry0. It is not
accepted proof. Preserve all real CLI/Git/HTTP/history and independent checks;
do not extend default timeouts or rerun unchanged until green.

The accepted candidate separates two cohesive promises, keeping actual private
publication/collection/HTTP inside each default-budget case. First: middle Done
file Proof2rows/8.0s/11.0s and scroll → Project latest3rows/9.0s → same Done
file/Proof2rows and scroll, with drained reads/no old-artifact acquisition.
Second: Project latest file Proof3rows → Story → Project again without file/tab
reselection → actual new bare-origin main/fetch/controlled-clock refresh → new
endpoint/no matching observation, old latest104 Proof,3runrows, new timestamp,
no old acquisition → middle Done file Proof2rows. This retains the original
second-Project-visit continuation that the first split candidate had omitted.

Latest two-case renewal after that acceptance correction passed24.021/26.634s,
retry0, default budgets, AC100/one worker, load42.28/45.30/43.38,53%memory free.
Proof `/tmp/seed300-final-scope-retained-project-proof.json`. Shared facts remain
in the scenario module; setup uses existing MakeMe-backed real publishers.
Collection and initial live comparison overlap, then collector closes before
file history or acquisition baselines. Existing restart preserves its prebuilt
snapshot before close and delegates identical startup options to one owner.
One extra scenario repeats real setup: no suite-speed or line-count saving claim.

## G15: exact active repair owner

Preparation of the unused-helper follow-up scratch-removed only the dormant
Taken comparison export and its three private imports. Typecheck passed.
The complete Summary sort journey then timed out30.950s at its first A→B→A
return, before later observations. The original helper was restored exactly in
finally, SHA256ab7969422158b9adbdc084cd730d950f514e4395d9544b24122fd63ec71c2f69.
Evidence `/tmp/seed318-preparation-preservation-{result,proof}.json` and log;
trace in `dashboard/test-results/2026-11-11T16-38-13.570Z-44899`.

Chaifeng-chan's active SEED-287#fit-dashboard-journeys-in-default-timeout
already owns this exact first-return timeout in plan576 G7/G18, recording
31.110s and returning G7 to slice13. Its final-observation-evidence explicitly
retains required hosted/final acceptance and the unfinished whole7/C03 gate.
The owner is in worktree make-dashboard-journeys-fit-the-default-timeout.
Remote execution tip remains9739dd6eb603bf3f7a92d8593201d52f08044698.
Preserve its uncommitted repair and processes; no duplicate sort repair here.
Receive its completed published repair and renew affected preservation proof
before accepting stable final validation. Base attribution is no exemption.

## G16: cold Done reader readiness

The11-case/10-file reader-consumer run81d032e0 passed10 and failed the cold
Done wall-time reference case30.225s at its final reselection. Origin setup
used5.539s, dashboard1.215s, total before-hooks7.127s. The aggregate's same
case passed28.564s warm; that was insufficient cold-budget proof.

Only that case's fixture import now requests existing queuedClaudePreviewTest.
Its private fixtures and every action/assertion from test.use through EOF remain
byte-identical to a48, SHA2563ea0cb03388dfb88e460937175e81623bd0ce1a63ebc5cf069509b66bd81a5be.
Actual immutable origin/app/server preparation remains in suite elapsed under
the worker default budget. Fresh cold proof18ba39ca passed24.503s, retry0,
runner32.637s, at load54.53/48.93/44.05, AC100/one worker,51%memory free.
Proof `/tmp/seed300-final-done-readiness-proof.json`; actual preparation trace
`/tmp/seed300-final-done-readiness-artifacts.jsonl`. Formatting/typecheck passed.
No exact active Done repair owner was found; broad SEED287 scope was no exemption.

Current browser proof candidate is11 unique positives across10files: eight
unchanged positives from81d032e0, fresh cold Done, and latest two Project cases.
No single11-case green-command claim. Independent refactor, complete cross-tier
consumer dispositions and the repaired publication's applicable CI remain due.

## Consumer and lifecycle acceptance

Installed consumer trace at a48 has616 rows:584 effect-specific exclusions,
21 backend caller files reused (all30 matching aggregate cases passed, retry0),
and11 run rows for browser receivers/support owners. Complete per-row reasons
are in `/tmp/seed300-final-scope-consumer-{trace-disposed.md,dispositions.json}`.
Startup call bytes match exactly, SHA25689cb0345beadf6f6c16d4cd78e4d5f2bce946d4139a7c8bdfd6d54bcb8ca6846;
all other history exports remain byte-identical. Existing13 readiness aliases
keep unchanged consumers and retained proof; the new Done caller has fresh proof.

Independent source inspection confirms overlap ownership: collector Git reads
immutable published objects without fetch; only the reader fetches main.
This private machine has no enabled follow-up authority, so collection stops
before the follow-up completion/fetch path. Artifact/job/comparison caches and
fake-gh request-owner roots are per process/server. Shared machine JSON uses
identity-checked reads, cross-process locks and atomic replacement; reader is
collection-off and only reads receipts/history. Collector closes before the
later actual trunk movement and before acquisition baselines. No assumed
cross-server Git serialization or hidden writer is needed for this overlap.

Fresh independent post-change refactor returned none — already clean, with
REFACTOR COMPLETE, no edits and no invalidated proof. It independently verified
all30 backend matches and lifecycle ownership above. git diff --check passed;
no extra runtime run was needed. Five source files are221/183/240/25/82 lines.

G16 retains its return until applicable hosted proof of this repaired candidate;
guarded publication is a progress increment, preserving planned slice9 and G15.

## Review state

Outcome/product/test-architecture review inspected the selected original story,
all nine slices, related commits, current whole-product control owners and
independent expectations. One bounded structural follow-up is retained in
SEED-318/plan596: remove an unused Taken comparison route, without implementing
it here. Preparation remains not-ready because its preservation check timed out.
No backlog membership was changed. Process remains selected and deferred until
Wrap Up receives its automatic Intent Coverage report and dispositions.

The [failure policy](../../../AGENTS.md#failing-and-flaky-tests) applies as
written. G15 and hosted repair proof remain open; no execution-complete record
or closure is claimed.
