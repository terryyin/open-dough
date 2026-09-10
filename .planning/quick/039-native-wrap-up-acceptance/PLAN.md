# Native wrap-up acceptance

## Source and outcome

[SEED-011 Story Wrap-Up](../../seeds/SEED-011-story-wrap-up.md#story-wrap-up).
Status: in progress. Slice 1 native Codex closure passed; Cursor and Claude
remain. Candidate exercised: worktree HEAD `de14017` plus the uncommitted
wrap-up documentation-step correction delivered with this slice.

The maintainer can establish that the existing wrap-up skill closes completed
work through Codex, Cursor, and Claude Code. v0.3.6 already shipped under an
explicit acceptance exception ([changelog](../../../CHANGELOG.md)); release is
not remaining implementation work. Assess current source, including the
seedless-correction changes, and identify the exact candidate used.

Included: native closure, preservation, follow-up and refusal behavior already
promised by the seed and [source skill](../../../src/skills/dough-story-wrap-up/SKILL.md).
Excluded: new capabilities, unrelated acceptance, installation/update retesting
without invalidated evidence, general host setup, new runner/assessment
frameworks, release/adoption, and cleanup of this story before retrospective.

## Execution and proof approach

Follow [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
shared cases once, native runs selected by risk, each affected requirement on
each host supported by fresh evidence or explicit justified reuse. Follow
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md): a
candidate is not a new release; do not edit installed managed copies here.

Before the first run, inspect applicable current or Git-recovered evidence.
Start with [prior native integration evidence](../027-execution-native-acceptance/README.md)
and [wrap-up recognition](../../../src/skills/dough-story-wrap-up/RECOGNITION.md).
Integration reuse does not establish wrap-up behavior. Compare relevant source,
adapters and runtime conditions; do not reuse a stale release-status claim.
Record a compact requirement/host mapping with evidence or a named pending gap.
Keep this assessment with active plan evidence, not in permanent product docs.

Use disposable Git repositories, local-only remotes if needed, fresh native
sessions and the existing payload delivery mechanism. Capture the candidate
revision and any uncommitted source diff/hash, host version, prompt, relevant
native actions and decisive before/after state. Prompts identify work and give
normal project context; expected answers belong in the evaluator's checks.
Require observed skill use plus independent state checks. Do not count an exit
code, self-report, script replay, or direct model API call as native acceptance.

Use existing native invocation examples and supervision where applicable;
inspect their current commands before running. One initial attempt per case;
retry once only after an identified fixture or product correction. Bound each
native session with an explicit timeout chosen before launch. Missing access or
inconclusive evidence leaves that requirement pending; do not rerun until green.

Check Git recovery with `git show <before-cleanup-commit>:<spent-path>` and
inspect tracked and untracked paths. Compare preserved fixture content, active
queue order, canonical-home uniqueness, provenance and remaining Markdown
links. Manually assess durable prose against the seed's explicit expectations.
Reuse shared boundary proof across hosts only with recorded applicability;
if a host-specific risk invalidates reuse, add only the required variant to its
owning slice before proceeding.

## Ordered slices

### 1. Close completed work through Codex without losing active context
Type: Behavior
Status: done
Behavior: A completed feature story has shared seed/log content, lasting product
knowledge and a completed empty retrospective; native wrap-up removes only its
spent history and queue entries, retains unrelated work and useful product
content, and leaves every deletion recoverable in Git.
Proof: One isolated native closure journey; filesystem absence, preservation
comparisons, link inspection and Git recovery establish the outcome. Repeat the
invocation to establish that it recreates no history and duplicates no edits.
Apply or explicitly justify reuse of the shared boundary observations for the
other hosts in the requirement mapping.

Outcome: pass on retry. Evidence: [evidence/slice-1/](evidence/slice-1/),
[requirement mapping](evidence/assessment.md). Native Codex 0.144.1,
deadline 3600s. Attempt 1 used wrap-up and deleted spent history but left
README unchanged because tests already encoded trim. Retry after a fixture
documentation-only fact plus a source clarification in
`src/skills/dough-story-wrap-up/SKILL.md` assimilated that fact into README
without story identity. Before-cleanup commit
`f797bd44f5821dc06db3e687ab18cc13bc2472cd`. Repeat hashes matched the closed
tree. Empty untracked `planning/plans/trim-names/evidence` directories with no
files remained; recorded as a limitation, not restored history. Shared
empty-review / durable-knowledge / shared-content / history-absence /
repeat-safety observations may be reused on Cursor and Claude (shared wrap-up
source, no wrap-up host adapter). This run does not prove those hosts' native
skill-use. Delivered on `worktree-quick-039-native-wrap-up-acceptance`. CI
observer: `/tmp/dough-ci-501/watch-IgmJt1`, workflow `ci.yml` / `CI`.

### 2. Carry follow-up work through Cursor closure
Type: Behavior
Status: done
Behavior: A completed predecessor has an existing seedless corrective plan and
compatible product advice plus an explicit human correction; native wrap-up
queues that plan once as its canonical home, applies the human decision, and
removes predecessor history while retaining executable correction context and
Git-addressed provenance. Once that correction is completed and retrospectively
reviewed, wrap-up closes it by plan identity without inventing a seed.
Proof: One continuous isolated lifecycle journey, explicitly unfinished until
both closures pass. Check queue uniqueness/order, active-plan contents, preserved
unrelated work, provenance recovery, then the correction's final absence and
recoverability. Repeat predecessor closure while the follow-up is still active
to check duplicate queueing and preservation. Reuse shared content/empty-review
proof from slice 1 only with an explicit applicability judgment.

Outcome: pass. Evidence: [evidence/slice-2/](evidence/slice-2/). Native
Cursor `2026.09.08-6caf4ff`, `--sandbox enabled`, deadline 3600s. No product
source retry. Predecessor before-cleanup `4fb462f`; correction
`139b655`. Follow-up queued once first as a plan-identity link; HUMAN.md beat
Formal titles advice; repeat did not duplicate; correction closed by plan
identity with no invented seed; Formal titles remained. Slice 1 shared
observations remain applicable (wrap-up source hash unchanged). Does not prove
Claude native skill-use.

### 3. Respect completion boundaries through Claude Code
Type: Behavior
Status: planned
Behavior: A selected plan or retrospective is unfinished; native wrap-up leaves
its material intact and reports the missing completion. After completion is
supplied, the same fixture closes the predecessor while retaining its existing
feature-story follow-up as the single canonical home.
Proof: One isolated boundary-to-closure journey. Exercise unfinished execution,
then unfinished retrospective, then completed inputs using fresh native sessions
where prior context could conceal a failure. Compare protected bytes at each
refusal; final state must preserve the feature-story/plan link and one queue
entry, remove spent history, and support Git recovery. These are stages of one
completion-boundary proof loop, not independently shippable implementation work.

## Proof ownership and stopping points

| Promise | Owning slice and observation |
| --- | --- |
| Native skill use and useful closure on each host | 1 Codex, 2 Cursor, 3 Claude; native actions plus state |
| Empty review, durable knowledge, shared-content preservation, absence of history, repeat safety | 1; shared expectations reused with per-host justification |
| Seedless follow-up, priority, human precedence, no duplicates, provenance and later correction closure | 2; shared expectations reused with per-host justification |
| Unfinished execution/review refusal and existing-story follow-up | 3; shared expectations reused with per-host justification |
| Recoverable deletion and valid remaining links | Each fresh closure |
| Complete, truthful coverage judgment | Each slice updates its host mapping; slice 3 reconciles remaining gaps |

After any slice, retain completed proof and leave unproven requirements pending.
A failing journey remains unfinished. Correct only defects in promised behavior;
if scope changes, record the finding and return to story refinement. For skill
edits, use source under `src/skills/`, the AGENTS.md representative behavior
review, focused relevant checks and the execution workflow's refactoring,
formatting, commit/push and review gates. Do not edit managed installed copies.
With evidence-only edits, check affected Markdown and references; do not rerun
unrelated product suites. Preserve all active review inputs for retrospective
and subsequent story wrap-up.

## Plan assessment

One common lifecycle rule governs all slices: completed work is recoverably
removed while active work stays self-contained. No Structure slice or new
framework is needed. Three slices, one native-host outcome each; the Cursor
journey is deliberately one bounded lifecycle proof, not separate feature work.
No numeric slice budget was supplied. The concrete execution uncertainties are
host access, current evidence applicability and native-session duration. Resolve
these within the owning slice; they do not require a product-scope decision.
No additional slice-specific concern was identified in this planning assessment.

## Learnings

- Tests that encode current behavior do not replace writing a spent-plan-only
  product fact into maintained documentation. Slice 1's first native run
  deleted history without that README step; the skill now states the
  documentation requirement explicitly.
- Git-untracked empty spent directories can remain after file deletion. They
  are not recoverable history; they are still a named-container trace. Not
  expanded into a second native retry.
- Codex `sandbox-exec` isolation is an invocation concern, not a wrap-up
  host adapter. Shared wrap-up observations may be reused on Cursor and Claude
  while source bytes stay the same; native skill-use still belongs to each
  host's slice.
- Cursor native wrap-up used the installer's `.claude/skills/` copy while
  `--platform cursor` also wrote `.agents/skills/`; both matched source. Treat
  either installed root as skill-use when bytes match.
