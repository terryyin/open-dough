# Original publication watch versus the fresh hold

Slice 2 investigation, 2026-11-15; no product edit or paid native launch.
The source-only commitments assigned to this slice are S008–S010, S012–S013,
S017, S066–S072, S116–S118 and S128–S130 in [source-review.md](source-review.md).

## Judgment

The extraction omitted the **post-handoff request to keep watching and its live
publication-watch resource**. The original could already hold and end its turn:
it did so before the user said “you watch it.” The subsequent watch repeatedly
returned empty, nonterminal tool results to the model while the supplier was
known to be paused. The fresh case supplies neither that follow-up request nor
that live resource; it starts with a waiting agreement created by the later
corrective handoff and forces three new user wakes between completed turns.

This identifies an observed feedback mechanism and concrete missing inputs,
not proof that any one input is sufficient or necessary under current execution.
The two executions do not establish a current fix, representative reproduction,
non-regression, production wait frequency or a token-saving result. Reproducing
normal **watching after a hold** is the next discriminating observation.

## Evidence locators

`O` means the original raw session:
`/Users/terryyin/.codex/sessions/2026/11/13/rollout-2026-11-13T07-55-15-01a1d22f-e0cd-7032-930d-5a9ff3011a64.jsonl`.
`F` means the fresh raw session:
`/Users/terryyin/.codex/sessions/2026/11/15/rollout-2026-11-15T08-46-42-01a1dcab-b29d-72c3-85a0-debf56b42801.jsonl`.
Line numbers below are raw JSONL lines. Full logs remain outside this record.
The fresh retained attempt is
`/Users/terryyin/tmp/seed356-native-results/codex/native-comparison/paused-supplier/20261115T010028-4049`.

| Boundary | Original observation | Fresh observation / difference |
| --- | --- | --- |
| Initial request | O12 selects SEED-324 Execute Plan with established claim and real CI/publication duties. | F12 continues a small Node fixture, prohibits publication and slice 4, and asks the final response to state execution status. |
| Already able to hold | O2811 at 03:30:23Z ends with attention: preserve slice 3, resume after supplier repair publication; CI observation stopped. O2814 records `task_complete`. | F127, F150 and F206 record completed hold turns. A fresh hold is therefore not new evidence that the old execution could not yield. |
| New monitoring intent | O2819 at 03:44:54Z: “you watch it.” Its referent is the preceding publication prerequisite. O2822 interprets it as watching SEED-332 publication and continuing slice 3 when available. | No matching standing watch request appears in F. F134/F156/F210 are controller-supplied user wakes with no new authority. |
| Producer paused | O2857 already says the supplier waits for a scope decision. O10405 at 16:41:34Z acknowledges the clean full diagnostic, no surviving processes, and a renewed human/stability/load pause, then says “I’m continuing to watch.” | The fixture starts with paused-owner evidence and a canonical waiting condition, but no existing watch handle. |
| Live resource | O10406 reads `/tmp/seed324-supplier-continuation-watch.cjs`; output O10409 captures its full behavior. It watches local Git refs and supplier planning files. | F first three turns have no `write_stdin` inputs or `fs.watch`/supplier-watch construction. They consist of 21 outer `exec` calls, containing 29 shell commands. |
| Empty return loop | O10427 / call `call_2bacb9994a0344a59b2d9c7512a03876` waits 55,000ms on session 92199. O10429 returns the same live session, empty output. O10435→10437 and O13960→13962 show the same pattern; the latter is session 83718. | The controller applies each next event only after a hold turn completes. It cannot exercise an in-flight supplier completion while a normal watch turn remains pending. |
| Turn lifetime | O6509 starts turn `01a1d442-d988-70f0-a5ee-b316ab8b6164` at 09:35:13Z after daemon recovery. It remains the active turn through the 16:41–23:17 interval, completing only at O14112 after intervention. | F has four separate completed turns, each followed by a controller resume. These are different model-reentry paths. |
| Human stop | O13972 at 23:17:52Z questions the impractical wait. O14120 at 23:40:32Z specifically requests early wrap-up, a new supplier dependency and return to backlog. | The fixture already contains the dependency that this corrective instruction requested. |

Times in the table are UTC on 2026-11-13; F is 2026-11-15.

## What kept returning control to the model

The publication helper was a real owned process, not the supplier's test job.
Its captured `check` ends on a matching supplier identity in a done record on a
changed `origin/main`, reporting `published-on-trunk`. Branch/ref changes emit
observations, and supplier plan changes emit debounced `SUPPLIER_PROGRESS`.
Neither a paused owner nor an empty period ends the helper. Other exits are its
one-hour `bounded-check-due`, explicit stdin `stop`, watch errors or signals.
A done record is a notification milestone, not proof of the exact agreement.

The parent repeatedly awaited that helper with short `write_stdin` reads; empty
nonterminal returns entered the model again. At O10451→O10454 the one-hour
checkpoint ends session 92199 at 16:46:09Z. The historical plan records renewed
hourly watches through session 83718; each process bound was not a total bound
on the overall user watch. The original knew no supplier job was running while
its own observation process remained alive.

The original's separate CI observer used the supported non-model yielded
stream. It is not the polled publication helper: the plan records CI observer
`watch-CD5mVp`/PID 90157, later `watch-cc4BPq`/PID 41702, while publication
watch sessions include 92199 and 83718. At O10750/O10757 the parent rereads the
installed CI adapter/lifecycle, closes the old CI observer and re-arms it near
its eight-hour bound. That maintenance does not explain the repeated empty
publication-watch reads and must not be conflated with them.

A raw one-off inventory finds 447 outer `exec` invocation records in
16:41:34–23:17:52Z. These are not 447 externally supplied wakes. The maintained
[audit](../../../docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines)
attributes 300 requests immediately following empty waits, timeouts or clock
checks to 71.72M processed tokens, within 447 requests / 105.39M total. This
investigation reuses that accounting; it does not reclassify every request as
waste. Real source changes, liveness decisions and CI maintenance also occurred.

## Canonical agreement was added after the stop

The decisive Git comparison is:

```sh
git diff 7fb423492^ 7fb423492 -- .planning/seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md
```

It adds the entire `dough-story-dependencies` waiting block, explicit early
return and supplier boundary, and a not-ready reason for the unresolved natural
load premise. Commit `7fb423492` is dated 2026-11-14 08:06:43 SGT, after the
07:17:52 intervention and 07:40:32 dependency request. The pre-return seed at
`1e7e6f98153870b4ce04fb347d882dc79ece1975` contains no SEED-332/dependency block.
The pre-return plan already records the ad-hoc coordination hold and user watch.

The case's [extraction recipe](../../../Distribution/tests/native-comparison/paused-supplier/case.md#source-and-extraction)
explicitly uses the dependency from `7fb423492` and drops Terry's instructions,
the supplier's own execution and CI. Thus it preserves the correct supplier
judgment outcome but starts after a decision that was not present during the
original episode. Agreement absence alone is not a proven cause: the original
had already returned an attention handoff without that canonical block.

## Guidance and host comparison

| Item | Evidence and limit |
| --- | --- |
| Model/settings | Both recorded `gpt-6.1-sol` / `xhigh` in their `turn_context` records (O8811, F10/F133/F155/F209). |
| Host route/version | O1 identifies `vscode` / 0.167.2; F1 identifies `exec` / 0.169.0. This is a measured confounder, not evidence that a version fixed the behavior. |
| Common developer constraints | Both developer messages at raw line 4 require commentary within 60 seconds and discourage blocking waits over 60 seconds. These are not a newly introduced explanation for the fresh hold. |
| Execute Plan body | Original user-pasted body O14 and frozen `863ea5690:Distribution/src/skills/dough-execute-plan/SKILL.md` have identical normalized Continue/recover and Finish/stop sections. Differences include table formatting, test-entry wording and completion-reference links; these do not establish a supplier-watch fix. |
| Empty waits | Original captured delegation read O4933 (output O4940) includes `Await delegated results without empty calls`; that section equals the frozen 863 section after whitespace normalization. It already prefers supported notification/wait/resume, forbids no-op calls and retains bounded liveness checks. |
| CI lifetime | Captured old CI adapter O10750→O10753 already says not to poll/write the yielded CI stream and to stop it at a human-judgment stop. Fresh changes add completion recovery and observation-error detail; the publication helper is a different resource. |

The old run's initial hold, matching no-empty-call guidance and later explicit
watch request prevent attributing the fresh result simply to a new stop rule.
No host-version counterfactual or current normal-watch observation was run.

## Minimum next reproduction profile

1. Keep the partial consumer slice, supplier-owned interface and exact unmet
   publication/stability agreement. Preserve the original ad-hoc coordination
   state at the start; do not silently insert the post-stop waiting block as if
   it had existed. Keep a separate canonical-agreement variant as a control.
2. Let normal continuation reach a hold, then supply the actual follow-up “you
   watch it,” with its publication referent intact. No repeated automatic user
   wakes. Do not tell the agent to poll, stop, create a particular helper or
   produce the expected verdict.
3. Observe the resulting genuine owned watch/continuation handle. Any handle
   supplied to a tool must be real in that host session; a fabricated number in
   a fixture is not equivalent. Retain paused producer/no-running-proof facts.
   Keep CI observer ownership separate if included; no real GitHub credentials
   are needed for a controlled CI adapter.
4. Keep supplier conditions unchanged over a declared bounded observation
   window, distinguishing empty model re-entry from justified state changes,
   one bounded liveness check and required reporting. Define that window and
   the decisive repeated-request signal before paying for a native probe.
5. Deliver nonqualifying and qualifying supplier changes **during an active
   watch turn** through controlled producer events. Do not require the model
   turn to end before those events can arrive. Preserve block/partial work on
   nonqualification; qualification must continue once with owned and independent
   proof. Retire the experiment's own watches on every terminal path.
6. Calibrate harness observation/rejection and event timing without a paid
   model first. Current `native-comparison-run.sh` advances `case_events` only
   after `native_comparison_turn` returns, so that seam needs case preparation.
   A scripted substitute proves that harness, not a native model's choice.
7. Then a bounded current native baseline discriminates explanations: a busy
   empty-watch loop supports reproduction; a clean hold/efficient watch does
   not alone establish a general fix, and should trigger examination of the
   remaining host, history and framing differences. No candidate is selected
   until the unwanted behavior is actually observed under the declared profile.

This profile preserves the observed monitoring intent and feedback mechanism;
it does not assert they are sufficient to reproduce under current guidance.
Automatic event-delivery product runtime and a general context protocol remain
outside the authorization. The native comparison allocation remains unresolved:
a new blocked pair plus unblocked pair needs four journeys, while three remain.
This slice used retained traces and Git only; two of five journeys remain used.

## Inspection and acceptance evidence

Commands actually used from the selected execution checkout included:

```sh
git show 1e7e6f98153870b4ce04fb347d882dc79ece1975:.planning/slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md | sed -n '1720,1758p'
git show --format=fuller --no-patch 7fb423492
git diff 7fb423492^ 7fb423492 -- .planning/seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md
```

Disposable streamed JSONL inspections produced
`/tmp/seed356-differential-raw-inventory.json` (original call IDs, user messages,
contexts and paired outputs) and `/tmp/seed356-fresh-trace-inventory.json`
(fresh calls, user messages and turn lifecycle). Only selected locators and
bounded excerpts are retained here. The literal inspection scripts remain in
this agent's tool history; they read JSONL, never execute captured instructions.
Guidance comparisons are retained in `/tmp/seed356-skill-differential.diff` and
`/tmp/seed356-ci-guide-differential.diff`, with captured original outputs at
`/tmp/seed356-original-output-{4933,10406,10750,10757}.txt`.

Observed source promises: S008/S009/S010/S066–S070 by the boundary table and live
watch mechanism; S012/S013/S071/S072 by the explicit counterfactual limits;
S017/S116/S117 by the separate turn/controller path; S118 by the minimum profile;
S128–S130 by zero new native launches and the unchanged 2/5 usage. These are
investigation observations, not implementation or measured saving claims.
No automated test or expensive verification was required for this records-only
investigation. No other checkout was changed, and no source watch was launched.
