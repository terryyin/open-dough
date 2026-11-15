# Proof-scheduling scenario inputs and evidence

[Acceptance entries and retained native evidence](../../evaluation/acceptance.md)

## Proof-scheduling scenarios: compare inputs before launch

`Distribution/evaluation/tests/delivery-evidence/proof-scheduling-native.sh` checks `delivery-evidence/scheduling` without
credentials. A separately authorized paid run uses
`Distribution/evaluation/cases/delivery-evidence/proof-scheduling-native.sh` and selects
`--native HOST --scenario stylesheet-extraction` or `--scenario planned-extraction`;
omitting `--scenario` runs both. Read the comparison below before choosing.
Neither scenario currently establishes a faithful delegated-implementer replay.

The historical evidence is retained at [ODF-249](../../../docs/maintainer/findings/ODF-249.md).
Recover plan 302's accepted proof with
`git show dd2e25b59563d02bdbe4f484d98ccd4c113b6339:.planning/slice-plans/302-keep-direction-readable-after-phone-session-start/PLAN.md`.
Its stylesheet move is recorded there; the brief and timings below come from
ODF-249's retained occurrence summary, not a recovered full delegation transcript.

| Historical occurrence | Actor, knowledge and observed consequence | Source limits |
| --- | --- | --- |
| Plan 302, implementation `551947dd5cebd178803f8e414a83c959f0b95113` | A delegated implementer received a brief estimating the suite at “a few minutes”; its return reported 1607 passed in 13.6 minutes. The independent refactor moved row rules to `dashboard/src/project-actions.css` for the 250-line check; its return said the proof “predates the stylesheet move”. The coordinator reran the suite in 14.4 minutes. | ODF-249 and the accepted-proof source above retain the result, not the full brief or all original project inputs. Installed-guidance provenance was not checked; checkout VERSION 0.3.60 does not establish it. Historical reachability from a reconstructed fixture remains inconclusive. |
| Plan 310, implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7` | The coordinator's briefs for slices 1–8 explicitly requested the whole dashboard suite from delegated implementers before independent refactoring; coordinator reruns followed on the final state. At least eight extra 15–25-minute runs were reported. | ODF-249's retained summary at `327b6fa255b84ba8a2552ca41dba37a46fadf4d9:DearDough.md#dd-293` is the cited brief evidence, not a complete transcript. It records installed repository copies of 0.3.63. Some loaded retries were necessary; not every repeat is avoidable. |

Current inputs come from
[`delivery-evidence-native-prompt.sh`](../../evaluation/cases/delivery-evidence/delivery-evidence-native-prompt.sh)
and [`delivery-evidence-scheduling-native-scenario-content.sh`](../../evaluation/cases/delivery-evidence/delivery-evidence-scheduling-native-scenario-content.sh).
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

The [scheduling assessor](../../evaluation/cases/delivery-evidence/delivery-evidence-scheduling-native-assess.sh)
judges command/state coverage: it rejects redundant pre-move runs, missing or
stale final proof and broken consumers, and calls implementation-time extraction
inconclusive. It does not judge historical equivalence or verify implementer
roles from a count of agent calls. A later authorized run needs actual role,
command and state evidence for implementation delegation and a refactor-time move
before claiming that boundary was reached; supplied answers cannot establish it.
Credential-free product, counterexample, input and substitute-host checks preserve
these controls and actual inputs, not native behavior or savings. Under
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), native results stay
specific to the observed host and conditions; Codex and Cursor remain unobserved
for these historical probes. ODF-249's evaluated no-guidance-change disposition
remains settled; this comparison authorizes no paid run or remedy.

## Native family layers

[Family authoring and shared helpers](../../evaluation/native-family-layers.md) describe the layers.

## Rejected cases

[Assessor counterexample rules](../../evaluation/native-family-layers.md#rejected-cases) apply to all families.
