# Native publication checks

`Distribution/evaluation/cases/git-publication/git-publication-native.sh --native HOST --case CASE --results-dir DIR`
manually runs a selected publication journey through Codex, Cursor, or Claude
Code. Put Bash 5 first on PATH. Paid sessions are opt-in; the default wrapper
and `npm test` use credential-free substitutes and counterexamples.

Accepting a paid run of any family adds it to the replay corpus in
`Distribution/evaluation/tests/fixtures/native-streams`:
`node Distribution/evaluation/tests/native-harness/support/native-stream-corpus-add.mjs <result-path>` takes the
retained attempt the run printed and adds it under its host and case
(`publication/<journey>`, `fresh-node`, `delivery-evidence/<case>/<scenario>`).
It refuses, naming what is missing, an attempt without a `record`, without
`observations.txt`, or with a stream that is missing or not complete; a record
naming no known host or no case; a publication case without a journey; and an
entry the corpus already holds. It gzips each stream, copies the retained
provenance, and writes a draft `expected`, printing a `review:` line wherever
the shared reader or today's verdict disagrees with the retained attempt.
Review the draft, add `corrected:` with the harness fault where the reader is
right, and delete its `# draft:` line; `Distribution/evaluation/tests/native-harness/native-stream-replay.sh` then
replays the attempt.

The one-shot escalation case asks for a settings-key rename in an owned
workspace. The notes tool preserves extension settings and released values.
Released data holds different active and archive directories under the old
core key and the proposed new key. Renaming the core key exposes a collision:
either alias precedence loses a saved value or selects archived notes. The
maintainer owns the representation of both meanings; the fixture supplies no
admission instruction or migration prescription.

`git-publication-native-one-shot-escalation-fixture.test.mjs` establishes this
product premise through the generated project's setup and actual command,
including both alias precedences and a consumer fallback. The native trace
must independently establish one-shot startup, edits before discovering growth,
ordinary admission, and restoration of those edits uncommitted in the same
workspace. Safe admission before editing leaves that transition unproved.
The fixture permits publication and withholds planning; stopping after admission
for the product decision is valid. The state assessor and transcript together
establish the verdict, with unrelated human changes preserved.

The one-shot session-policy cases phrase each request as the direct
invocation would (`dough-execute-plan --one-shot --default-main`, `--auto-land`,
`dough-story-refinement <identity> --one-shot --auto-land`) and embed no
expected outcome. `publication/one-shot-default-main` works in the originating
checkout itself, which holds staged, unstaged and untracked edits over an
unpublished local commit; the result must commit all of it there with nothing
pushed. In `publication/one-shot-auto-land-blocked`, the fixture sets
`remote.origin.uploadpack` to a wrapper that publishes another developer's
prepared Take of the queued story on the first fetch after the workspace
branch gains a commit, so a native session and the substitute meet the
competing owner between start and landing. `publication/one-shot-established`
runs the installed one-shot start itself and hands the session the installed
`established-start.mjs` block after the skill invocation, as a dashboard
launch does; the session must not start again.

The landing cases (`publication/one-shot-result`, `-queued`, `-auto-land`)
expect the owned workspace retired, except that guidance retires it only after
the CI completion gate passes. A host without a session identity gets a
delivery receipt with CI `unobserved`; keeping the workspace then passes when
no CI observation since covered the landed revision and the report names the
kept workspace or the CI gap. The stream fields `ci-observed-shas` and
`ci-unobserved-shas` carry that coverage from the delivery and observer
commands' own output.

The Trunk Mode closure cases (`trunk-closure/source`, `/ignored-only`,
`/owned-context`) give the closure's coordinator its CI observer as the
installed guidance does, and name no owner in the retained state beyond what
that guidance retains (`Distribution/evaluation/cases/closure/trunk-closure-native-arming.sh`):

- Claude Code and Cursor: the fixture arms no observer, because only the
  launched session's own Bash or Shell tool carries the coordinator's identity
  (`CLAUDE_CODE_SESSION_ID`, `CURSOR_CONVERSATION_ID`). The session's `finish`
  establishes its observer while publishing the final closure.
- Codex: the fixture arms `ci-mailbox.mjs stream --execution owner/project
  main --coordinator trunk-closure-coordinator` from the execution worktree
  and records the observer note (coordinator, stream directory, PID,
  checkout); the session passes that coordinator and directory to `finish`.
  The harness, not a Codex cell, holds that stream, so no CI event reaches the
  session.

The controller waits for `finish` to register the final closure on the armed
Codex stream; on Claude Code and Cursor it follows the observer that holds the
final closure's coverage record, wherever `finish` registered it. Run one case
per host, for example:

```sh
Distribution/evaluation/cases/git-publication/git-publication-native.sh --native claude --case trunk-closure/owned-context --results-dir DIR
Distribution/evaluation/cases/git-publication/git-publication-native.sh --native cursor --case trunk-closure/source --results-dir DIR
Distribution/evaluation/cases/git-publication/git-publication-native.sh --native codex --case trunk-closure/ignored-only --results-dir DIR
```

`Distribution/evaluation/tests/git-publication/git-publication-native-owned-context.sh` runs the owned-context closure
on each substitute host; the other two scenarios have no substitute.

Codex runs without `--ephemeral`, because spawning a subagent thread needs the
parent's persisted rollout. Those rollouts are kept in the developer's Codex
home with their other sessions, which also keeps the developer's sign-in in place.

`--case delivery-evidence/original` replays original-story acceptance with the
full selected readiness story from `2f56bd2a`, a narrowed plan and return, and
an inspectable reader. The prompt names the inputs without naming an omitted
promise. `Distribution/evaluation/tests/delivery-evidence/delivery-evidence-original.sh` first proves that the narrowed
product contradicts the source while its tests pass, and that a corrected
control satisfies the source. Native observations retain the original and final
product, proof commands, acceptance outcome and planning state for explicit
review; the wrapper's nonzero review-required result is not a semantic verdict.
Inspect detection, actual product behavior and withheld delivery or correction
ownership together. No prose recognizer certifies these facts.

`--case delivery-evidence/terminal` uses the same explicit-review acceptance
route for Pygardon's terminal result. The selected story comes from `cdc136edf`,
the narrowed plan from `cffbd3264`, and the precomputed summary fields and six
observed labels from `fe322751e`. This is a deterministic record-producing
boundary, not a rerun of the engine or research ledger. The focused check
mirrors the historical dynamic JSON/prose label comparison, with no fixed
label-count rejection. `Distribution/evaluation/tests/delivery-evidence/delivery-evidence-terminal.sh` exercises the
narrowed output and a corrected control preserving both arms and all numbers.
The native request names only source, plan and return; inspect the retained
command results, actual labels and acceptance/obligation state yourself.
Both original-story fixtures prepend their historical seed's actual H1 to the
verbatim selected story, so the installed obligation parser can resolve a
story home. The terminal cheap check exercises a real source quote through the
installed list/check commands; an empty listing would bypass that resolution.

`--case delivery-evidence/release` uses the selected story at `906631e26` and
status projection at `403d1fb1b`. Independent record facts exercise stage times,
latest measured capacity, healthy readiness and helper failure after coordinator
exit. The current-stage fact uses correction 361's later record contract; no
historical writer, Docker journey or supervision is rerun. The cheap release
check compares actual output with `9fffcee62`'s corrected projection, keeping
the parent's outcome null while exposing the helper's failure.
Terminal also has `corrected` and `amended-corrected` scenarios through the shared
scenario entry point. The latter's synthetic human amendment changes only the
verdict qualifier's display owner; cheap controls do not establish native acceptance.

`--case delivery-evidence/drift` replays plan 412's slice 4 acceptance with the
verbatim selected story from Pygardon `c50b14d6d^`
(`SEED-145#story-reviewable-entry-decision`), a plan excerpt carrying slice 4
and its historical Current decisions, and the slice 4 return, over a controlled
reconstruction of the decision's excluded list whose narrowed tests pass. Its
scenarios are `narrowed` and `amended-corrected`; the latter appends a synthetic
human amendment to the story and keeps the returned product. Set
`delivery_evidence_only_scenario=narrowed` (or `amended-corrected`) in the
environment to run one scenario. `Distribution/evaluation/tests/delivery-evidence/delivery-evidence-drift.sh` first proves
that the narrowed product contradicts the source while its tests pass, that a
corrected control satisfies it and the amended control carries the amendment,
and that the drift assessor rejects quote-only, plan-decision-as-exclusion,
unchanged-accepted and fabricated-amendment verdicts. The request names the
source, plan and return. Inspect the retained product observation and workflow
state to judge whether acceptance honored the story or its amendment.

`--case delivery-evidence/amended` replays [ODF-354](../../docs/maintainer/findings/ODF-354.md):
a coordinator delivering slice 3 of a Taken Story Branch execution after
trunk moved past the Take. The workspace is the owned execution checkout on
`exec/export-readings`, published with its trunk to a bare origin; another
writer's clone pushes the scenario's trunk commits. `story-amended` adds a
Decision-binding promise and example to the story section and a slice to the
plan, `plan-amended` tightens a planned slice's proof, `unrelated-advance`
edits a sibling story and adds a release and a trunk-only file, and `conflict`
rewrites done slice 2. The request, execution state and commit messages name
none of it; the request stops before staging. The assessor reads the
agent's own `source-freshness.mjs` results from the stream, the result
named in the final response ("amendment" names `amended`), each record's
branch copy against origin's Take and trunk texts, the candidate's check of
the final workspace, plan statuses and obligations, trunk content on the
branch, origin trunk before and after, and an `awaiting story review` stop
naming the plan and trunk revision. `Distribution/evaluation/tests/delivery-evidence/delivery-evidence-amended.sh`
proves each fixture's premise through the installed check, observes
controlled sequences and an unnoticed baseline, and rejects a silent
whole-trunk merge, overwritten statuses, absorption without a disposition, an
auto-resolved conflict and a false `unchanged`. Select one scenario with
`delivery_evidence_only_scenario=<scenario>`; a baseline round installs a
named revision's payload with `delivery_evidence_payload_revision=<revision>`,
which the observations record as `payload`, for example:

```sh
delivery_evidence_only_scenario=story-amended delivery_evidence_payload_revision=7fb2bf98 \
  Distribution/evaluation/cases/git-publication/git-publication-native.sh --native claude --case delivery-evidence/amended --results-dir DIR
```

## Unrun observer-ownership acceptance

No paid native run has yet observed how a coordinator keeps its own CI
observer. Under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md), substitute and
replay results are not native acceptance. Each run below is paid and needs the
developer's authorization.

- Cursor and Claude Code: concurrent `deliver`, repair, and completion with the
  ambient session identity; `resume` and `finish` with ambient identity or
  `--session-json`.
- Codex: arm the documented cell with `COORDINATOR` set, confirm
  `<directory>/owner` after the first yielded output, run `deliver` with
  `--coordinator` and `--observer-directory`, and expect
  `observation.state: "reused"` on that directory; repeat with a second
  coordinator's stream live on the same target. Then `resume` and `finish` with
  the same inputs.
- Claude Code subagent coordinator: whether its Bash tool carries its parent's
  `CLAUDE_CODE_SESSION_ID`, and whether it can state its own `agent_id`, are
  unobserved. The guidance and receipt state only that the variable names the
  session alone and that an observer claimed with an `agent_id` is named by
  `--session-json` with both.
- Every `--case trunk-closure/...`: on Claude Code and Cursor one `finish`
  without `--session-json` whose receipt's `notifies` names the tool's
  variable; on Codex one `finish` carrying the note's coordinator and stream
  directory with `observation.state: "reused"`.
- The retained trunk-closure and git-publication evidence identities predate
  changes to their hashed modules, among them `trunk-closure-observer.mjs` and
  `trunk-closure-settlement.mjs`; `native-harness-observation.sh`, whose
  fixture stop reads the recorded identity, is hashed into the
  story-branch-closure identity as well.
- With that run, the closure assessor gains a signal for an absent
  `--session-json` and one for `notifies`.


[Proof-scheduling scenarios and historical limits](../tests/git-publication/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch).
