# Claude planning replay: observed ordering, unfinished readiness

## Input and stopping point

P starts clean at `4d0bd15c499c8f2e1d877654dd5f7f88bc9b627e`, the same tree
as Codex P's prepared input: refined historical source, old plan removed,
only patch `934a51a30` in both installed skill roots. Sole origin is local
`p-remote.git`. Exact prompt:

> /dough-slice-planning SEED-388#show-the-effort-a-launch-runs-with
> Plan only. Publish and announce nothing.

Launch 2026-11-17 01:50:28 UTC: `claude --bg`, requested Opus/medium;
effective `claude-opus-5-5` / medium, CLI 2.1.326, auto permission.
Native session `0604c3b5-f9ef-4a22-b5c8-166210980ab7`; transcript under
`~/.claude/projects/-Users-terryyin-open-dough-scratch-seed-391-p/`.
No children, no post-launch participant messages, no extra paid native probe.
Temporary product/test edits observe premises and are reverted; P never
executes its resulting six-slice plan. HEAD remains the prepared start.

It writes `664-show-the-effort-a-launch-runs-with/PLAN.md`, then records
planned preparation. At 02:04:15.126 it requests a combined command to
record `assessment ready`, remove its dependency symlink and read Git status.
Native permission pauses it because `p/node_modules` resolves to
`b/node_modules` outside its allowed working directories. No answer is sent.
The operator records that exact prompt and stops P at 02:06:54; official
listing confirms stopped, PID absent. The owned awake guard is also ended.

The plan is preserved as scratch `p-claude-written-plan.md`, SHA256
`cc86c6bdf2304b5e095c6f8f7fc0291309bc2e11e652b3be9c9d937fefa1d650`.
It has **286 lines**, beyond this project's 250-line limit. Readiness is
unconfirmed. Remaining Git changes are the seed's preparation, the new plan
directory and the dependency symlink, not product/test implementation.
Do not call this an execution-ready or cleanly completed planning session.

## Decisive written observation

The patched planning paragraph is read before the plan is written. Slice 1:

> Backend launch-boundary specs read a Claude Code launch by its parts

> Type: Structure

> the boundary specs assert the parts they prove (name, prompt, flag order,
> model) instead of the whole argv or argv positions. Enables slice 3.

Slice 2:

> End-to-end launch specs read a Claude Code launch by its parts

> Type: Structure

> the same reader used by the e2e launch, options, story card, follow-up,
> start-session and voice specs. Enables slice 3.

Slice 3 is Behavior, “An untouched Claude Code launch runs at and keeps
Open Dough's medium”. The other Behavior slices cover cost labels, requested
effort in details and feedback maintenance. Both Structure slices precede
the changed default; no mechanical consumer-update budget substitutes for
that preparation. Record-equality cases whose promise is keeping the request
are explicitly retained as updates in Behavior slice 3.

This is **keep for the written ordering mechanism**, beside Codex P's same
direction. It does not prove that executing the plan costs less or yields
better tests. Its over-limit size, stopped readiness and incomplete consumer
coverage constrain that judgment; none is repaired by the outside operator.

## Audit of the claimed consumer evidence

P scratch-applies the default, opens the dialog on medium, then runs selected
backend, frontend and E2E groups. Serial failures hide later backend cases;
P iterates with failing titles excluded. It restores scratch product/test
edits, then separately observes feedback maintenance's argv and restores again.

The plan claims 25 backend failures, one frontend and 28 E2E (54 total).
Its backend per-file figures actually sum to 26. Retained native results
support a different, lower-bound observation:

- `backend.log`: 9 failed, 46 did not run, 320 passed. The plan says 37
  skipped. `backend2.log` repeats five newly exposed failures.
- Root tool result :700 preserves the iteration output although `b3.log`
  is overwritten: successive batches are 5, 4, 3 and 2 failures, then 33
  passed. The first five repeat `backend2.log`; count them once.
- Initial nine plus 5/4/3/2 yields **23 observed backend failure cases**,
  not 25. Frontend log has one failure; E2E log has 28: **52 observed**.
  Broad title exclusions can exclude parameter variants without observing
  them, so the final green filtered run is not an exhaustive consumer count.

Recoverable excerpts: native :692 contains the loop command, :700 its
results; scratch `p-claude-backend-failure-inventory.json` retains the first
two full failure lists; the iteration results remain in the native transcript.
The outside audit corrects the report, not the blinded participant's files.

The plan's statement that its chosen directories hold every observing spec
is also too broad. Its E2E selection omits intent/review/recently-done
follow-ups; backend selection omits sessions. Those consumers were reached
in Claude B's wider execution. Thus there is useful Structure-first evidence,
but the trace is not complete. This motivates tentative proof-reach work
independently of whether the narrowing itself is good.

## Context and blinding limits

Before launch, all 63 P memory files match the independent input snapshot
made before B ran. No comparison findings are added to the prompt or sent
later. Native records show P reads the pinned-Node and focused-runner notes;
preserving all notes does not prove every note was loaded. A's memory was
not frozen at its original start, so exact context matching is unavailable.

P is not hermetically isolated. At root :37 it lists the parent directory,
revealing sibling comparison artifact names. At :375/:379 it compares
sibling lockfiles/revisions and borrows B's dependencies. No observed tool
read feeds earlier comparison outcome text to P, but fresh session and
separate memory alone are insufficient evidence of isolated filesystem input.
Its broad native-history search prints model/effort metadata to settle the
flag-precedence premise, another disclosed context difference.

The next comparison can use an input-only parent and checkout-owned setup,
without a new platform or permission bypass. Current evidence stays as
observed; no restart erases the permission stop or these limits.
