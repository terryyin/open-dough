# Dashboard accepted-cost review

Sections 4, 7 and 8 of the
[dashboard test value and cost review](dashboard-test-value-review.md),
assessed on 2026-11-01 against `ae6479d3558b2e660e99d5b4839f0b6b064e7df5` on
its [decision basis](dashboard-test-value-review.md#decision-basis) and
[delivery and stopping rule](dashboard-test-value-review.md#delivery-and-stopping-rule).
Each accepted cost is now commented beside its test.

## 4. Completed review's Landed runs tail

**Coverage worth keeping: yes. Current marginal scope worth its cost: yes.**
The tail is the only inspected journey switching **Published completion →
Landed runs → Published completion** after a missing captured repository. It
proves the radio state and restoration of the published file list. The boundary
case in `boundary/story-review-completed-gaps.spec.ts` only proves server fallback
and the explicit gap answer. `story-review-nothing` proves a Landed-runs-only
gap; `story-review-story-branch-landed` proves retained runs, not this round trip.

**Action:** accept the integrated selection round trip as necessary cost. Do not
delete the tail on the assumption that server coverage proves those controls.
It adds no separate installed start or test fixture. Prior tail removal changed
approximately 9.69–10.00s to 11.07–11.51s and supplied no acceleration evidence.
Exact gap wording remains owned at the boundary; no new duplicate wording
variants should be added to this journey. Acceptance is scoped to the real
selection path, not a claim that all completed-review setup is irreducible.

**ROI:** no further local tail experiment justified now. Reopen with a concrete
cheaper proof or fresh setup-cost evidence; acceptance skips/excludes nothing.

## 7. Previously accepted launch poles

**Integrated coverage worth keeping: yes. Entire terminal input matrix: no.**
The second-server journey uniquely observes a non-owner server across reload,
project switch, real publication, and native creation, then asserts exactly one
session/worktree/claim. Existing boundary tests already own refusals and
change-wait timing. Keep this accepted integrated protection.

`agent-launch-ad-hoc-terminal.spec.ts` repeats the same full terminal, focus,
sidebar, scrolling, and detach journey for blank and nonblank instructions.
`boundary/agent-launch-ad-hoc-boundary.spec.ts` already proves exact nonblank
argv and no-prompt blank/whitespace launches. Keep one full auto-attachment
journey; retain a small page-level blank-submission assertion only if the
dialog's empty submission is otherwise unproved. Its two close/reopen races
have distinct purposes and must not be conflated with this input duplication.

**ROI:** worthwhile small narrowing; no second-server infrastructure rewrite
funded by these measurements. Existing close/reopen races alter launch HTTP
answers with `withholdLaunchOutcomes`; they do not prove the real settlement
window. Do not use that helper as no-mock replacement proof or extend it for
speed. Preserve those tests in this story; a real-race replacement needs its own
evidenced approach, not an invented production gate.

**Outcome:** one text auto-attachment journey remains; blank UI submission is
owned by `agent-launch-ad-hoc.spec.ts` "starting with an empty field sends no
instruction". The two races are unchanged.

## 8. Previously accepted attention and watcher chains

**Integrated coverage worth keeping: yes. Embedded HTTP admission breadth: no.**
The attention journey uniquely carries an installed reporting command through
workspace removal, server restart, retained attention, read state, and explicit
Done behavior. Preserve that chain. Its nine raw HTTP refusal requests neither
use nor assert the page. Move those variants, including nonmutation after
refusal, into the existing `boundary/agent-completion-identity.spec.ts` family
on its already-launched real state; do not create an additional launch fixture
merely to move assertions. Runtime gain is probably small; reduced orchestration
and clearer ownership are the independent benefit.

The production watcher files already share serial per-file lifecycles, perform
real installs/builds/activation, and assert distinct failure/recovery/shutdown
outcomes. `productionUpdatePolicies.ts` already puts policy variants onto that
existing chain, while `production-policy-test-timings.md` records prior boundary
consolidation. Keep them accepted. Reusing one prepared mutable deployment or
prebuilt candidate would bypass what they protect. A broader artifact cache or
deployment redesign has unproved benefit and materially higher complexity.
No such infrastructure work is justified by this review.

**Outcome:** the nine refusals form "refused deliveries keep the earlier
completion message" in
`dashboard/backend-tests/sessions/agent-completion-identity.spec.ts`; the
attention lifecycle and watcher chains are unchanged.
