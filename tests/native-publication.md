# Native publication checks

`tests/git-publication-native.sh --native HOST --case CASE --results-dir DIR`
manually runs a selected publication journey through Codex, Cursor, or Claude
Code. Put Bash 5 first on PATH. Paid sessions are opt-in; the default wrapper
and `npm test` use credential-free substitutes and counterexamples.

Accepting a paid run of any family adds it to the replay corpus in
`tests/fixtures/native-streams`:
`node tests/support/native-stream-corpus-add.mjs <result-path>` takes the
retained attempt the run printed and adds it under its host and case
(`publication/<journey>`, `fresh-node`, `delivery-evidence/<case>/<scenario>`).
It refuses, naming what is missing, an attempt without a `record`, without
`observations.txt`, or with a stream that is missing or not complete; a record
naming no known host or no case; a publication case without a journey; and an
entry the corpus already holds. It gzips each stream, copies the retained
provenance, and writes a draft `expected`, printing a `review:` line wherever
the shared reader or today's verdict disagrees with the retained attempt.
Review the draft, add `corrected:` with the harness fault where the reader is
right, and delete its `# draft:` line; `tests/native-stream-replay.sh` then
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
that guidance retains (`tests/support/trunk-closure-native-arming.sh`):

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
tests/git-publication-native.sh --native claude --case trunk-closure/owned-context --results-dir DIR
tests/git-publication-native.sh --native cursor --case trunk-closure/source --results-dir DIR
tests/git-publication-native.sh --native codex --case trunk-closure/ignored-only --results-dir DIR
```

`tests/git-publication-native-owned-context.sh` runs the owned-context closure
on each substitute host; the other two scenarios have no substitute.

Codex runs without `--ephemeral`, because spawning a subagent thread needs the
parent's persisted rollout. Those rollouts are kept in the developer's Codex
home with their other sessions, which also keeps the developer's sign-in in place.

`--case delivery-evidence/original` replays original-story acceptance with the
full selected readiness story from `2f56bd2a`, a narrowed plan and return, and
an inspectable reader. The prompt names the inputs without naming an omitted
promise. `tests/delivery-evidence-original.sh` first proves that the narrowed
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
label-count rejection. `tests/delivery-evidence-terminal.sh` exercises the
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

`--case delivery-evidence/amended` replays [ODF-354](../docs/maintainer/findings/ODF-354.md):
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
naming the plan and trunk revision. `tests/delivery-evidence-amended.sh`
proves each fixture's premise through the installed check, observes
controlled sequences and an unnoticed baseline, and rejects a silent
whole-trunk merge, overwritten statuses, absorption without a disposition, an
auto-resolved conflict and a false `unchanged`. Select one scenario with
`delivery_evidence_only_scenario=<scenario>`; a baseline round installs a
named revision's payload with `delivery_evidence_payload_revision=<revision>`,
which the observations record as `payload`, for example:

```sh
delivery_evidence_only_scenario=story-amended delivery_evidence_payload_revision=7fb2bf98 \
  tests/git-publication-native.sh --native claude --case delivery-evidence/amended --results-dir DIR
```

## Unrun observer-ownership acceptance

No paid native run has yet observed how a coordinator keeps its own CI
observer. Under
[ADR 0005](../docs/adrs/0005-cross-tool-validation-accepted.md), substitute and
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

## Proof-scheduling scenarios: compare inputs before launch

`tests/proof-scheduling-native.sh` checks `delivery-evidence/scheduling` without
credentials by default. A separately authorized paid run selects
`--native HOST --scenario stylesheet-extraction` or `--scenario planned-extraction`;
omitting `--scenario` runs both. Read the comparison below before choosing.
Neither scenario currently establishes a faithful delegated-implementer replay.

The historical evidence is retained at [ODF-249](../docs/maintainer/findings/ODF-249.md).
Recover plan 302's accepted proof with
`git show dd2e25b59563d02bdbe4f484d98ccd4c113b6339:.planning/slice-plans/302-keep-direction-readable-after-phone-session-start/PLAN.md`.
Its stylesheet move is recorded there; the brief and timings below come from
ODF-249's retained occurrence summary, not a recovered full delegation transcript.

| Historical occurrence | Actor, knowledge and observed consequence | Source limits |
| --- | --- | --- |
| Plan 302, implementation `551947dd5cebd178803f8e414a83c959f0b95113` | A delegated implementer received a brief estimating the suite at “a few minutes”; its return reported 1607 passed in 13.6 minutes. The independent refactor moved row rules to `dashboard/src/project-actions.css` for the 250-line check; its return said the proof “predates the stylesheet move”. The coordinator reran the suite in 14.4 minutes. | ODF-249 and the accepted-proof source above retain the result, not the full brief or all original project inputs. Installed-guidance provenance was not checked; checkout VERSION 0.3.60 does not establish it. Historical reachability from a reconstructed fixture remains inconclusive. |
| Plan 310, implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7` | The coordinator's briefs for slices 1–8 explicitly requested the whole dashboard suite from delegated implementers before independent refactoring; coordinator reruns followed on the final state. At least eight extra 15–25-minute runs were reported. | ODF-249's retained summary at `327b6fa255b84ba8a2552ca41dba37a46fadf4d9:DearDough.md#dd-293` is the cited brief evidence, not a complete transcript. It records installed repository copies of 0.3.63. Some loaded retries were necessary; not every repeat is avoidable. |

Current inputs come from
[`delivery-evidence-native-prompt.sh`](support/delivery-evidence-native-prompt.sh)
and [`delivery-evidence-scheduling-native-scenario-content.sh`](support/delivery-evidence-scheduling-native-scenario-content.sh).
Both prompts address the coordinator, select current-branch work, request
implementation through independent refactoring and acceptance, and stop before
staging, commit or publication. They supply no preferred proof schedule.
Both projects have a 138/150-line stylesheet, a required `bin/suite.sh` and a
line-limit check; the representative suite actually takes seconds.

| Scenario and useful question | Actual inputs and recipient | Material mismatch and allowable conclusion |
| --- | --- | --- |
| `stylesheet-extraction`: known-cost control — how does a coordinator schedule proof when its cost is explicit? | The prompt authorizes one planless quick slice and states the action-row request. AGENTS.md tells the coordinator the suite takes about fourteen minutes, competes for memory, and each run should be treated as that cost. Its layout rule directs new stylesheets into `styles/`, linked from `index.html`, grouped by component. There is no selected seed/plan. | This supplies a cost estimate unlike plan 302's and an explicit layout rule not established by its retained summary; it reproduces neither the mistaken estimate nor plan 310's implementer brief. A scheduling result answers the known-cost control only; it establishes neither historical equivalence nor resource savings. |
| `planned-extraction`: qualified coordinator scenario — what happens for one selected plan slice without cost/layout hints? | The prompt authorizes only slice 1 of `.planning/slice-plans/001-project-card-actions/PLAN.md`, with its committed seed and unrelated slice 2 left unstarted. AGENTS.md requires the suite before delivery but states no cost and gives no new-stylesheet rule. The coordinator receives all these inputs. | One selected slice permits local implementation under the guidance used by the retained runs; this does not guarantee a delegated implementer. Missing cost is different from plan 302's “few minutes” estimate, and the prompt does not reproduce plan 310's whole-suite delegation briefs. Removing hints alone cannot establish historical reachability. |

Recover the first fixture/prompt from `788d817296adfc0b23a672489619b3ea8bbaf52a`
at the two input paths above; the planned fixture/prompt is at
`5484e053f5ac4ee21ea84391656a24953d3f3644`. Plan 323's retained execution record is
`6922dc3290ce2a4ce3429d505c007a06ae1d459a:.planning/slice-plans/323-schedule-proof-after-refactoring/PLAN.md`.
Those harness commits retain inputs after the runs; the record names live
candidates `c6b37d26` and `788d8172`, each with its then-uncommitted harness.
It records Claude Code 2.1.304, installed 0.3.66 guidance, and these observations:

- Quick: local implementation extracted the stylesheet immediately; the refactor
  brief said “Do NOT run `bin/suite.sh` — the whole suite costs ~14 minutes”.
  The refactor made no edit; one suite ran on the final state.
- Planned: local implementation also extracted early. An unrequested suite ran
  on the untouched baseline and another on the final state; the refactor made
  only a comment edit and ran focused proof. Neither reached a refactor-time move.

These are retained summaries, not newly observed native behavior. A refactor-agent
call proves no implementation delegation. The runner installs the selected source's
payload for the selected host; inspect each attempt's `prompt.txt`, `record` input
hashes, `installed-guidance.sha256`, stream, proof logs and final product before
reusing evidence. Present source, installed guidance and historical provenance
are separate identities; the unknown plan-302 provenance stays unknown.

The [scheduling assessor](support/delivery-evidence-scheduling-native-assess.sh)
judges command/state coverage: it rejects redundant pre-move runs, missing or
stale final proof and broken consumers, and calls implementation-time extraction
inconclusive. It does not judge historical equivalence or verify implementer
roles from a count of agent calls. A later authorized run needs actual role,
command and state evidence for implementation delegation and a refactor-time move
before claiming that boundary was reached; supplied answers cannot establish it.
Credential-free product, counterexample, input and substitute-host checks preserve
these controls and actual inputs, not native behavior or savings. Under
[ADR 0005](../docs/adrs/0005-cross-tool-validation-accepted.md), native results stay
specific to the observed host and conditions; Codex and Cursor remain unobserved
for these historical probes. ODF-249's evaluated no-guidance-change disposition
remains settled; this comparison authorizes no paid run or remedy.

## Native family layers

[Family authoring and shared helpers](native-family-layers.md) describe the layers.

## Rejected cases

[Assessor counterexample rules](native-family-layers.md#rejected-cases) apply to all families.
