# Diagnose mounted launch browser input in CI

GitHub run 44928062629 attempt 1, job 136918428519, failed at the exact
published Slice 3 revision `6b6583cd81cc81e117b3daafd731bf99a3fa7528`.
The raw job log and diagnostic are in the checkout Git evidence directory.
The Vitest shard completed 124 of 128 cases. All three
`story-card-launch-offers.spec.ts` failures entered the desktop pointer
setup, disabled touch, and timed out waiting for `(hover: hover)`. The
`ad-hoc-refinement-touch.spec.ts` failure is at the first Host tap after
filling the instruction. The repaired helper reported no trusted native
pointer hit on that control. This is at a different action from the original
failure on the options summary.

Slice 4 is paused with 5.6 active minutes used. Its five modified files and
three new specs/support files are in the managed CI stash with OID
`9a1f12fbcdc2cf2e715be087190fb3742e282753` and record
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-bfOAVz/record.json`.
Repair starts on a clean candidate. Round 1 begins at zero active minutes.
Use the cached Linux container to discriminate browser media and native
input behavior before making maintained changes.

## Round 1

Run one unchanged paired-platform reproduction of the exact launch-offer,
refinement-touch and Start session answer specs, beginning with the cached
Linux arm64 image on two CPUs and two workers. The Linux CI guard runs on
AC with load about 7.6 on 16 logical processors. No other test owned by this
repair runs concurrently. A matching failure establishes local
reproduction. A pass ends repetition and leads to a discriminating input
probe. The two signatures have separate hypotheses: Chromium can provide
no primary hover on Linux headless after touch emulation ends, and a
native SELECT can suppress the documented pointerdown observation or
receive the wrong view coordinates. Use logs and native event evidence to
distinguish those outcomes. The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
applies throughout.

The Linux baseline reproduced three hover failures in three story-offer
cases and passed five touch/session-answer cases. The local arm64 trial
does not explain the hosted first Host touch loss. A one-shot standalone
Chromium media probe tests the current default context and explicit Blink
hardware capabilities, with touch toggled both ways and CDP feature
overrides separately. This distinguishes absence of a Linux pointer from
an unsupported test fixture or a failed wait.

The standalone Linux probe measured a fresh hasTouch:false context with
primary and any hover plus a fine pointer. Starting with hasTouch:true
then using CDP to disable touch instead left all those queries false.
Neither CDP media-feature overrides nor browser Blink startup flags
recovered the lost desktop capabilities. The executable receipt is
`launch-browser-ci-linux-media-argv.log.run.json`. Inspect Vitest's native
browser instances so only this desktop test uses the verified context.

To separate a touch coordinate race from native SELECT event suppression,
run the refinement touch case once on Linux with a temporary probe. Queue
a real 80 px translate on the Host control just after the helper's
geometric hit check and before native dispatch. Capture the trusted
pointer destination. A matching failure requires the mounted case to
stop at the exact first Host tap and report that it did not reach the
control. The probe perturbs real layout and does not synthesize input.
Use the same shift at the browser command boundary in the candidate
comparison, then remove the probe completely.

The forced Linux case failed at the first Host tap under the old helper
in `launch-browser-ci-linux-late-host-before.log.run.json`. After a
successful current-DOM hit check the captured y=678.56 became stale. The
real trusted pointerdown hit the enclosing .launch-dialog-field rather
than the SELECT now at top=576.56. The shape reproduces the hosted failure
without proving that the hosted pointer had the same recipient. Round 1
ended after 4.4 active minutes.

## Repair contrast

The pinned Vitest browser provider exposes Playwright's FrameLocator to
browser commands. Use its real native tap rather than coordinates computed
before the browser command. Playwright computes and checks the current
iframe-aware hit point after actionability. The mounted helper still checks
for a trusted touch pointerdown on the semantic control. The same staged
Host shift passed once using the candidate. Chromium reached the translated
SELECT at y=598.56, and all eight selected cases passed on Linux arm64.
The three story-offer cases ran in a single isolated desktop instance and
the other five in the existing touch instance. The controlled receipt is
`launch-browser-ci-linux-late-host-after.log.run.json`.

Remove the shift and trace logs. Use one exact uninstrumented three-spec
run on Linux arm64, then the same three specs on macOS with two workers.
Use one ordinary frontend list selection to check discovery of affected
files and disjoint context assignment. The repository typecheck is the
static gate for the config, browser command type and clients.

The maintained two-worker runs passed all eight cases on Linux arm64
and macOS. The ordinary full collection passed and each affected test
was listed once. The dashboard typecheck and whitespace check passed.
A fresh hosted amd64 CI verdict is pending delivery of this candidate.

## Hosted confirmation

Use one automatic hosted CI attempt on the published repair. It should
exercise the desktop offers in a fine-pointer context, dispatch native
touch through the iframe locator, and collect each mounted case once.
A further failure returns to diagnosis with its new action and actual
environment. The independent check made no edits.
