# Frozen Claude B test inventory

Read `c629d0d9..d8efcf6fb`; completion `9cd8ee5f2` changes planning only.
The [A/Codex inventory](test-inventory.md) defines cases, assertion units and
the historical plan's explicitly budgeted value updates. Those updates alone
do not count against guidance. This table extends its same case-family basis.

Claude B changes **45 nonplanning files: 28 specs, four code support files,
13 others**. A changes 43 (29/2/12); Codex changes 33 (15/5/13).
Markdown fixture guidance is “other”, not assertion support. Counts describe
changed files, not complete consumer reach or quality. In particular, the
Codex diff omits affected unchanged consumers; see [comparison](claude-comparison.md).

## Outside-effort cases and mixed cases

Paths below are exact Git paths, recoverable at `d8efcf6fb`. Case families
are those listed in full in the A table unless explicitly described here.
**L** narrows observations; **V** updates expected value/record. Reading the
configured default avoids copying its literal value but retains that field
in the observation; distinguish it from narrowing to the case's own fields.
Twenty-five spec files have outside/mixed families, including the two mixed
feedback files (23 incidental files when those two are excluded).

| Exact Git path | Case families and final disposition |
| --- | --- |
| `dashboard/backend-tests/launches/agent-launch-acceptance.spec.ts` | Kept before publication; receipt cannot be kept. V: exact kept request adds configured default. No literal medium copy; acceptance remains a complete-record consistency check. |
| `dashboard/backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts` | Text naming, blank prompt, long text, control character. L: semantic name/instruction; partial record; explicit instruction absence. |
| `dashboard/backend-tests/launches/agent-launch-boundary.spec.ts` | First launch/cwd/record: V, exact command format deliberately retained. Refinement/instruction: L, actual reader. |
| `dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts` | Three chosen-model cases. V: complete argv/records still copy medium and blank length 5→7; default-effort case is separate below. |
| `dashboard/backend-tests/launches/agent-launch-options-boundary.spec.ts` | Definition order, focus with model, no options, selected valid flag after refusal. L: actual instruction/model fields; exact option order remains. |
| `dashboard/backend-tests/launches/agent-launch-options-groups.spec.ts` | Free flag/group, alone/none, multiple groups. L: shared argv reader returns instruction; rejection cases unchanged. |
| `dashboard/backend-tests/launches/agent-launch-start-taken-refused.spec.ts` | Refused launch retains claimed workspace/start. V: kept-start object adds configured default. |
| `dashboard/backend-tests/launches/agent-launch-start.spec.ts` | Established Take/workspace and two model variants. L: semantic name/model/instruction; removes old conditional model/index assertions. |
| `dashboard/backend-tests/launches/feedback-maintenance-launch.spec.ts` | Attention/notification/no second launch, ended/deleted deduplication. V/addition: semantic effort compared with configured default; mixed lifecycle/effort promise remains. |
| `dashboard/backend-tests/sessions/agent-completion-input.spec.ts` | Native blank launch gets no reporting input. L: semantic instruction absence replaces argv length/prefix. |
| `dashboard/backend-tests/sessions/agent-launch-session-kept-start.spec.ts` | Execution/refinement continuation with own policy/workspace. V: kept start adds configured default; workflow-dependent record assertions remain. |
| `e2e/configuration/system-settings-feedback-maintenance.spec.ts` | Persistence/privacy/reload: V, three full strings gain medium. Malformed-file recovery: L, enabled-status prefix; file integrity/no-launch proof survives. |
| `e2e/intent/intent-story-follow-up.spec.ts` | Intent-line context reaches first input. L: actual instruction replaces positional read. |
| `e2e/launches/agent-launch-ad-hoc.spec.ts` | Blank input: L, explicit instruction absence; stable name slot remains. Text/project cases: L through support projection. |
| `e2e/launches/agent-launch-follow-up-session.spec.ts` | Missing workspace follow-up/context; whitespace-only follow-up. L: exact projected call list and semantic fields replace raw argv. |
| `e2e/launches/agent-launch-model.spec.ts` | Untouched Default dialog/no model case explicitly adds default effort. V/addition: strict effort tail replaces absence assertions; renamed combined contract. |
| `e2e/launches/agent-launch-options-exclusive.spec.ts` | Exclusive options/order and unavailable definitions. L: semantic instruction. |
| `e2e/launches/agent-launch-options-kept.spec.ts` | Refusal keeps selection; selection no longer offered. L: semantic instruction. |
| `e2e/launches/agent-launch-options.spec.ts` | Selected flags and no selection/reopen. L: semantic instruction. |
| `e2e/launches/agent-launch-start-session-isolated.spec.ts` | One isolated workspace/session with established block. L: semantic instruction; call count, cwd, block, reporting and developer sections survive. |
| `e2e/launches/agent-launch-start-session-landing.spec.ts` | Automatic landing intent with no developer text. L: semantic instruction; one launch, first-input sections and no extra developer text survive. |
| `e2e/launches/agent-launch-story-card.spec.ts` | Execution/refinement first input, folder and listed session. L: exact projected launch list; phone case unchanged. |
| `e2e/launches/session-instruction-voice.spec.ts` | Restart/voice review reaches Start; missing-key recovery preserves draft. L: exact projected launch lists retain input/name/cwd and cardinality. |
| `e2e/review/story-review-follow-up.spec.ts` | File context and instruction reach Start. L: actual instruction replaces positional read. |
| `e2e/stories/recently-done-follow-up.spec.ts` | Published facts/sessions reach follow-up. L: actual instruction replaces positional read. |

### Direct effort cases and support reach

- Backend model-boundary :156–166 owns default medium for story and ad hoc
  launches and retained records. Chosen max and invalid effort proof survives.
- Frontend model :48–80 owns option/cost/default wording and chosen max reaching
  one accepted request. Host switch and dismissed-dialog reset keep value checks.
  Native-effort :82 changes the expected opening effort to medium.
- Frontend model-entries :125–159 has separate max/none details tests through
  reload. None first observes a known loaded detail, then no effort text.
- E2E model :98–127 still selects high and checks its native command; option
  availability ignores cost-label suffixes already owned by frontend proof.
- E2E settings :124–134 adds a saved-Codex-choice case with no effort wording,
  using the existing builder-backed authorization helper.

Four changed code support files:
`dashboard/tests/support/claudeLaunchArguments.ts` (new reader/projection),
`unattachedLaunchAssertions.ts`, `voiceRecovery.ts`, `feedbackMaintenanceServer.ts`.
Each observes actual recorded calls; no expected/default answer is injected.
The first two projections preserve exact call-list cardinality. Reader grammar
and its overclaimed rejection guarantee are assessed in [refactor evidence](claude-refactor.md).
The reader rejects multiple trailing positional arguments, replacing the
isolated/landing cases' old one-instruction argv-tail count. It does not
prove every invalid command shape impossible.

The unchanged voice-key/provider-failure consumers named in A's support table
are reached by the narrowed `typedStart` helper. Feedback-maintenance and
terminal voice/readiness helpers also depend on the changed readers; the
first refactor reports those consumers in its 52 focused E2E passing tests.
Do not count unchanged helper consumers as changed specs.

## Assertion forms

Same “new/replaced site” definition as the A/Codex inventory; parameter
variants are not multiplied. New exact-object syntax is distinguished from
an existing exact-object comparison with a changed expected value.

| Form | Claude B sites and purpose |
| --- | --- |
| Positional | **3 new/replaced**: backend model-boundary :159,:164; E2E model :143. Strict default effort tails, including absence of an extra model option, at the explicit default boundary. |
| Count | **1 new**: frontend model :76, one accepted request after Start. No new disclosure count: strict shared locator and a visible detail provide the required witness. |
| Whole-list | **4 new/replaced**: the three positional tail lists above and frontend model :58, the complete ordered choices/cost labels. |
| Whole-object | **0 new**: existing accepted/kept records update their expected fields; new parsed/request assertions are partial. Exact projected call lists replace existing complete raw-call lists. |

Retained value-updated shapes: model-boundary :98 count and :103 sliced list;
the three chosen-model complete argv/record cases; first launch-boundary
complete raw call; kept-start/acceptance records; settings status strings.
New reader internals are parsing logic, not test assertion sites.

## Case-dependent test bodies

**Zero new branching bodies; two edited families retain case-dependent
branches.** Frontend model :110–138 adds effort setup/reset to the existing
Cancel/Escape loop, whose action body still uses `if`. Backend session-kept-start
:44 onwards adds configured effort to workflow-dependent record expectations
with inherited ternaries. The old backend start model/index ternaries are removed.

The newly implemented max/absent-effort disclosure loop initially branched;
the third refactor splits it into separate named cases. This is observed
response to the guidance. The older model-display loop in the same file
:54–88 still branches but is unchanged, so it is not attributed as introduced
or edited by this run. Title-only blank-input ternaries, helper disclosure
guards and parser option loops are not case-dependent test-body branches.

## Proof qualification

The execution's first full E2E run reports 816 pass / five fail after its
earlier 23 failures were repaired. Nine tests in those four last-fixed files
then pass; the other files are unchanged. After narrowing, 52 affected E2E
and 73 backend tests pass. This is accumulated focused proof, not a claim
that a final all-suite command ran on the final tree. Later slices record
their affected groups and focused refactor reruns in the participant's plan.
Its third pass also checks that removing the effort paragraph fails max proof.

Inventory uses Git diff/show at frozen revisions and the readable native
returns; no participant code/test was repaired by the operator. The later
Codex discrepancy check, if run, is post-trial assessment and enters neither
participant's original gate record nor its timing/token window.
