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

Current browser proof is11 unique positives across10files: eight
unchanged positives from81d032e0, fresh cold Done, and latest two Project cases.
No single11-case green-command claim. Independent refactor and cross-tier
consumer dispositions are accepted below; the repaired publication's CI passed.

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

Guarded progress publication accepted3ef6abf40704755cb684a91c11f3b1f65e4a0a31
on the execution branch, suffix basea48ca574, with zero reconciliations. Formatter
and normal check-only hooks passed; all five source hashes still match accepted
proof. Exact await-revision receipt reports success for CI43065321086/1, with
source exact and the same accepted SHA/target. G16 is proved. This branch CI
success neither repairs G15 nor establishes trunk integration or closure.

## Review state

Outcome/product/test-architecture review inspected the selected original story,
all nine slices, related commits, current whole-product control owners and
independent expectations. One bounded structural follow-up is retained in
SEED-318/plan596: remove an unused Taken comparison route, without implementing
it here. Preparation remains not-ready because its preservation check timed out.
No backlog membership was changed. Process remains selected and deferred until
Wrap Up receives its automatic Intent Coverage report and dispositions.

The [failure policy](../../../AGENTS.md#failing-and-flaky-tests) applies as
written. G15 remains open; no execution-complete record or closure is claimed.
The active plan, follow-up draft, worktree and live branch observer are retained
for receipt of the already-owned repair and renewed affected validation.

## Resumed G15 component assessment

Supplier730543328235c2379303e7ec10f4e6e7f2d01124 now proves its G7 on its
current setup. PFE tested only its bounded selected-native-Git component here,
preserving the original Sort real CLI/Git/HTTP fixture and every loop/assertion.
It was insufficient for this original fixture: run81dcb8a4 timed out31.493s,
retry0/default30, runner37.761s/wall39.951s, load28.51→29.75, AC100/no sleep.
Before-hooks used12.273s (origin5.195s/dashboard5.519s); initial comparison/sort
started28.860s after start. First sort/drill passed, first story roundtrip began
at30.008s. This is budget exhaustion, not evidence of a row-value mismatch.
Evidence `/tmp/seed300-g15-selected-git-20261112/sort`.

The unvalidated global change was restored byte-for-byte to3ef6; SHA256
dc04b3b658e088271f5bd84e7af0f84dcd0f936590e01c799bf4f2d15b385205.
Its broader26 PATH/cleanup observations were not run and are not required for
the restored source. No global executable selection or declared-repository
fixture conversion is retained. Existing queued Claude preview readiness is
the narrower current owner for Sort's cold immutable origin/app/server inputs;
same private fixtures, real publication and both original roundtrips remain.

Readiness alone reduced private setup to0.718/1.588s but still timed out30.516s
at the second loop, run16e68a2c/retry0/default30. Worker readiness8.823s and
all cold artifacts were real and counted in runner46.503s; real publication
still took13.056s. Both first-loop sort/drill and first full roundtrip passed.
No independent layout error was established. Distinct negative candidates were
not retried unchanged; their stage evidence selected the complementary pair.

Current retained source combines only the exact bounded same-Git component
and Sort's existing queuedClaudePreviewTest import. All other Sort bytes,
private fixture/helper bodies, both loops and independent oracles are unchanged.
The original Git and selected direct Git have matching version/exec/doc/config
paths; earlier configured Git and later fixture prefixes retain priority.
The current literal inventory, including promisified exec calls, finds only
Git intersecting the selected developer-tool directory, across95 receivers.

Combined runfcd53e0b strictly passes24.790s/default30/retry0 with all four
original steps and both loops complete;5210ms case headroom. Real worker
readiness11.004s is included in runner53.421s/wall57.731s, not hidden work.
AC100/one worker; endpoint load52.76→68.41, not a controlled-load profile.
Current26 Git/PATH/cleanup controls run2c60cdab pass once/retry0, typecheck0.
25 use default30s; current countedGit recovery control retains its existing
individual120s allowance and passes21.392s. No new timeout or waiver is added.
All27 retained ZIPs have valid SHA/CRC/JSON; neither pass window has sleep.

Installed combined trace has1078 dispositions:31run,57reused,990 exclusions,
plus3 explicit supplemental rows and95 source-equivalent direct Git receivers.
Functional proof reuse concerns the same actual Git/arguments/config and
unchanged fixtures; old Mac timing-margin claims remain historical.
Complete evidence `/tmp/seed300-g15-selected-git-20261112/REPORT.md` and linked
trace/dispositions. No whole592 green-run or suite-speed improvement is claimed.

The separate cleanup preparation scratch now passes typecheck and the whole
Sort journey17.039s/default30/retry0, runa75e8a79/runner24.245s. It removed only
the unused export/imports, then restored helper SHAab796942...2f69 exactly.
`/tmp/seed300-unused-helper-ready-preservation-{result,proof}.json` retains it.
Its existing full story identity and unique plan path stay unchanged; the new
mobile story on main has a different full anchor, despite the shared318 prefix.
Plan596 now records ready without authorizing execution or queue membership.

Fresh independent refactor returned none — already clean/REFACTOR COMPLETE;
no source edit or invalidated proof. It independently verified all95 receiver
hashes, exact donor-component and original-Sort reconstruction. Nineteen record
overlaps were normalized before acceptance:16 Dashboard receivers correctly
run/reuse,3 independent Node rows exclude consistently; all1078 rows agree
across Markdown/JSON with zero blanks. No additional runtime test was needed.
Outcome/product review's affected conclusions remain: no production behavior,
test-tier conversion or loss of independent source oracles; one coherent
run-readiness owner and existing preview-input owner. Only the existing bounded
unused-helper correction is advised, now ready for Wrap Up's disposition.
