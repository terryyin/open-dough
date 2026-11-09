# Pilot native evidence reuse for Git publication admission

**Source:** [Pilot native evidence reuse for Git publication admission](../../seeds/SEED-262-faster-dashboard-test-feedback.md#pilot-admission-native-evidence-reuse)

**Source review:** [Source-only review](source-review.md)

**Identity:** SEED-262#pilot-admission-native-evidence-reuse

## Goal and scope

A maintainer can compare a retained `publication/admission-investigation`
result with a candidate and justify reuse, require fresh proof, or name why
proof remains pending on that result's host. Preserve the entire installation
identity and historical artifacts. Measure whether this saves total effort;
zero demonstrated historical reuse is a valid finding, not an improvement
claim. No implementation or fresh native run is authorized by this plan's
preparation.

Included: a bounded comparison aid, explicit impact review, current assessor
compatibility, controlled decision examples, and a measured pilot on available
real records. Deferred: fresh native baseline capture, automatic semantic
certification or skipping native runs, other journeys, universal dependency
graphs, and permanent evidence or impact registries. This does not narrow
installation or alter normal native execution.

## Current decisions and reuse findings

- Keep the full capture manifest owned by
  `tests/support/git-publication-native-fixture-identity.sh` and
  `git-publication-native-evidence.sh`. The sibling fixture identity guard owns
  capture completeness; this pilot does not require that future correction to
  judge today's incomplete records conservatively.
- Add the missing comparison responsibility near the native test support,
  with a small documented command accepting one retained attempt, a candidate
  checkout, and its host/runtime comparison context. Reuse the existing
  identity writer; do not reimplement its input enumeration or introduce a
  second installer manifest. Handle read failures as incomplete comparison,
  never an empty difference.
- Reuse `native-stream-retained-attempt.mjs` for fresh attempt parsing,
  `native-host-stream.mjs` for streams, and the existing publication stream
  fields/reassessment path. Preserve repeated `input-hash` rows separately:
  the retained-attempt reader intentionally exposes only the first scalar
  value, so its Map is not an input manifest. Detect ambiguous duplicate
  identities rather than silently losing them.
- The aid reports facts and outstanding review questions. Semantic impact
  remains an explicit review against the admission requirement. Display all
  changed/added/removed/unrecorded inputs, provenance and artifact gaps,
  prompt correspondence, assessment result, host/runtime facts and unknowns.
  Record one reason per affected group in the active plan, including why an
  unchanged requirement is still covered. Do not certify independence from
  path membership or a reviewer-supplied ignore list alone.
- Review discovery effects for skill descriptions and registration/hooks,
  including files outside admission's directly linked references. Review
  installer changes for their installed-output effect. Release metadata
  changes need an explanation; they are not automatically irrelevant.
- Original records remain byte-identical. Recover extra facts from streams or
  Git only with their provenance; source bytes at a revision do not establish
  what an unrecorded installation or runtime consumed. Unknown conditions may
  be immaterial with a supported reason, but unknown is never equality.
- Shared corpus streams are compressed while their historical records name
  `events.jsonl`. Materialize a disposable attempt with the original record,
  observations and response plus the stream expanded by `readStreamFile`.
  Do not edit the corpus record or weaken the fresh-attempt reader's contract.
- The borrowed incremental-build mechanism supports full provenance plus
  requirement-specific impact review. Its static dependency analogy stops at
  agent discovery and semantic influence. Manual comparison is the simpler
  baseline; automatic fingerprints add unsupported completeness assumptions.
- Follow Accepted [ADR 0003 — release identity](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  [0004 — whole-payload installation](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
  [0005 — native validation and evidence lifecycle](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
  and [0010 — evidenced worthwhile improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  No conflict or new product-wide decision was found. The existing
  [North Star](../../NORTH-STAR.md) has no topic governing this test-support
  responsibility; no new topic is needed.

## Outside-in proof ownership

| Story promise | Owner and observable proof |
| --- | --- |
| Sufficient same-host evidence survives an unrelated skill-body/release change. | Slice 1: run the real comparison command on controlled complete input, inspect all differences and their justified impact, and conclude eligible reuse. Label this deterministic proof, not native behavior. |
| Admission instructions or applicable host hooks invalidate the requirement. | Slice 1: change each relevant input in scratch; the command exposes it and the walkthrough requires fresh proof. Include a discovery-affecting description change so direct-import membership cannot conceal it. |
| Missing provenance, uncertain impact, prompt/runtime gaps or an unusable assessor leave proof pending. | Slice 1: command-level checks assert named gaps; reviewed walkthroughs conclude pending. A replay pass cannot override a gap. Host mismatch supplies no cross-host proof. |
| Full installation provenance and historical record bytes survive. | Slice 1: independently compare manifest entries and original attempt bytes before/after the command. Retain capture, assessment and applicability as separate facts. |
| Each old/new result is judged individually, with honest savings and effort. | Slice 2: same four real attempts before/after; per-attempt decisions, comparison elapsed time and review effort, candidate opportunities and actual justified avoided runs kept separate. |

## Local gates

Apply [test automation](../../../AGENTS.md#test-automation), the shared
[MakeMe API](../../../tests/README.md#test-data-architecture), and the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Captured evidence and independent expected outcomes stay outside
builders; extend MakeMe for new valid retained-result domain setup if needed.
Never sleep, use `test.slow()`, or change suite/group/hook timeouts.

Run checks through `bash scripts/test.sh` with Bash 5 first on `PATH`.
The maintained macOS sleep guard is `caffeinate -s -i` on AC power; on battery,
plug in or start fully awake with lid open under `caffeinate -i` and inspect
the sleep log afterwards, under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use focused checks below, not a full dashboard run: no dashboard or published
skill behavior changes. Run `node scripts/lint.mjs --staged` before commits;
the repository hooks retain their required checks. New checks obey
`tests/time-budget` and acquire an appropriate `tests/longest-first` entry.

## Slices

### 1. Review a retained admission result against the candidate

Type: Behavior

Status: done

Behavior: A maintainer supplies a retained attempt and current candidate → a
small comparison command exposes complete input differences and evidence
compatibility/gaps, and the documented review produces a justified eligible,
fresh-proof-required, or pending conclusion. Preserve original evidence and
full installation identity. Eligibility applies to this requirement and host.

Implement the comparison and its command-level tests together. Walk the first
three seed examples with controlled sufficient records: unrelated skill-body
and release changes, admission guidance and host-hook changes, discovery
effects, missing/malformed inputs, unavailable assessment, prompt/runtime
uncertainty, and host mismatch. These are applications of one rule: every
fact needed for this requirement's applicability must be supported. Do not
grow a path classifier per example. Put the repeatable review procedure in
`tests/native-host-streams.md` or its linked focused testing documentation.

Proof: a focused `node:test` or shell check drives the actual command using
MakeMe domain setup and independently expected differences, compatibility
facts and named gaps; compare original bytes before/after. Review walkthroughs
against explicit expectations establish eligible, fresh-proof-required and
pending conclusions. Automated tests do not turn semantic impact into an
automatic eligibility verdict. Existing `tests/native-stream-replay.sh` proves
the reused reader/assessor path, and
`tests/git-publication-native-admission.sh` protects the unchanged admission
journey through substitute hosts. Run these with the new focused check via
the runner. If implementation changes shared identities or readers, trace
their consumers and run their owning identity/reader suites too; do not
expand the product scope to avoid those checks.

Sizing hypothesis: one cohesive comparison-and-review proof loop, with reuse
of the existing capture and assessment operations. No preparatory framework
or separately delivered parsing layer is needed. Safe stopping point: the
maintained aid and controlled decision examples work; actual savings remain
unmeasured until slice 2.

### 2. Measure the admission pilot on the retained attempts

Type: Behavior

Status: planned

Behavior: The maintainer assesses the selected historical attempts against the
same candidate and controlled changes with the documented manual baseline and
the comparison aid → each has its own provenance-backed conclusion and the
pilot shows its review cost and genuinely avoidable reruns without claiming
native proof from replay.

Before implementing slice 1, capture the manual baseline for these four
attempts, with candidate revision and comparison conditions. Use the command
prefixes observed below for the baseline; record elapsed comparison time,
executed cases and review effort before the aid changes the process. Reuse
the same selection and conditions after slice 1. This early baseline is part
of this slice's proof, not an extra delivery slice.

Evaluation basis, set before that baseline: preserve the same justified
requirement coverage and conservative treatment of unknowns. Compare manual
review with assisted review for these attempts; judge whether lower total
review effort or better supported judgments justify the aid's implementation
and ongoing maintenance cost. Distinguish predicted rerun savings from an
observed gain; a negative or inconclusive result does not justify claiming
improvement or automatically extending the pilot.

Selected paths under `tests/fixtures/native-streams/`:

- `codex/publication/admission-investigation/20261108T072654-1f30`
- `claude/publication/admission-investigation/20261108T072449-17c1`
- `cursor/publication/admission-investigation/20260929T035934-4301`
- `cursor/publication/admission-investigation/20261108T073015-410d`

Proof: invoke the slice 1 command on disposable materializations, retain one
decision per result in this plan, and compare it with the manual baseline.
Record the effort to review changed inputs, runtime and prompt applicability,
as well as command elapsed time. Keep controlled examples separate from real
reuse. If no record becomes sufficient, record zero demonstrated avoided
runs and no observed speedup; do not launch a native baseline or invent a run
duration to make the pilot positive. Discuss any fresh-baseline extension with
the developer as a scope change. Preserve the maintained rule and its limits
in testing documentation; spent pilot measurements follow ordinary wrap-up.

Sizing hypothesis: four existing attempts, one journey, no new native
sessions. Stop further provenance recovery when available artifacts cannot
settle a gap; pending is the correct result. Safe stopping point: a measured
positive, negative or inconclusive pilot whose conclusions are bounded to
observed evidence.

## Decisive premises

Preparation observations below were made at `ebd6e8daaecd6d18bf3e5f321ef41934bddd7dc9`
on 2026-11-09 in this story's established worktree. No product files were
changed and no native host was launched. Execution reuses these unless the
consumed paths change.

| Premise | Consuming operation, observation and result | Remainder |
| --- | --- | --- |
| Today's admission identity can be generated without a native run. | `/opt/homebrew/bin/bash -c 'source_dir=$PWD; native_case_host=codex; source tests/support/git-publication-native-run.sh; git_publication_write_evidence_identity admission'` succeeded: 406 unique inputs. November 8 retained manifests have 125 each, with 282 current inputs absent, 12 changed and one removed. | This is a capture comparison, not proof of the missing historical installation bytes. |
| Today's assessor can consume the four historical observation profiles. | `/opt/homebrew/bin/bash -c 'for native_attempt in tests/fixtures/native-streams/*/publication/admission-investigation/*; do printf "%s\n" "$native_attempt"; bash tests/support/git-publication-native-reassess.sh "$native_attempt/observations.txt" "$native_attempt/response.md"; done'` returned four passes for admission before first probe. | It proves assessment compatibility only; historical/runtime sufficiency stays a pilot question. |
| The existing retained reader and stream/reassessment route can be reused, and losing admission evidence changes the verdict. | The literal Node observation below materialized the compressed Codex corpus stream into the fresh-attempt shape, reached `readRetainedAttempt`, extracted actual stream fields and ran `reassessVerdicts`. It returned pass with the observed field and fail with `admit-cli-observed=false`. | Directly feeding the compressed corpus directory to `readRetainedAttempt` refused `stream events.jsonl is missing`; use disposable materialization, not an altered historical record. |
| Current hashes/replay cannot by themselves establish runtime equivalence. | Read each record and host stream: all records say model/runtime unknown; Claude init recovers model/version and some settings, Cursor reports Auto, and Codex has no model/runtime init. `native-result-identity.sh` deliberately emits unknown. | Do not assume real eligibility or speedup. Controlled complete examples settle the aid's rule; historical applicability remains pending where evidence is insufficient. |

Literal reader/assessor observation, with Bash 5 first on `PATH`:

```sh
PATH=/opt/homebrew/bin:$PATH node --input-type=module <<'JS'
import { mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readStreamFile } from './tests/support/native-host-stream.mjs';
import { readRetainedAttempt } from './tests/support/native-stream-retained-attempt.mjs';
import { publicationStreamFields } from './tests/support/git-publication-native-stream-fields.mjs';
import { replayedAttempt, reassessVerdicts } from './tests/support/native-stream-publication-replay.mjs';
const dir = 'tests/fixtures/native-streams/codex/publication/admission-investigation/20261108T072654-1f30';
const scratch = mkdtempSync(join(tmpdir(), 'admission-reuse-premise.'));
try {
  for (const file of ['record', 'observations.txt', 'response.md']) cpSync(`${dir}/${file}`, join(scratch, file));
  const path = join(scratch, 'events.jsonl');
  writeFileSync(path, readStreamFile(`${dir}/events.jsonl.gz`));
  const attempt = readRetainedAttempt(scratch);
  const fields = new Map(publicationStreamFields(attempt.journey, attempt.host, path).map(([key, value]) => [key, String(value)]));
  const enabled = replayedAttempt(path, fields);
  fields.set('admit-cli-observed', 'false');
  const disabled = replayedAttempt(path, fields);
  process.stdout.write(JSON.stringify({host: attempt.host, caseId: attempt.caseId, verdicts: reassessVerdicts([enabled, disabled])}) + '\n');
} finally { rmSync(scratch, {recursive: true, force: true}); }
JS
```

## Concern evidence

Slice-plan refinement was not needed: slice 1 owns one comparison-and-review
rule and its proof, while slice 2 owns a separately useful empirical result.
The early manual baseline is explicitly obtained before the aid changes the
process. The sequence does not accumulate special-case eligibility rules.
This review identified no remaining slice-specific concern. Unknown historical
applicability and unproved savings are outcomes the pilot must report, not
premises that must be assumed true to execute it.

## Execution context

- Mode: story-branch; identity: SEED-262#pilot-admission-native-evidence-reuse.
- Originating/execution checkout: `/Users/terryyin/git/open-dough/.worktrees/pilot-native-evidence-reuse-for-git-publication` (established owned linked worktree).
- Branch: `codex/pilot-native-evidence-reuse-for-git-publication`; remote: `origin`; trunk: `main`.
- Starting revision: `98fd070b8f80c0cab24a2480f78c3377bc6538ad`.
- Accepted claim / first published base: `ca082e09ffec4b551a8389265305f469de2208a5`; publisher: `dashboard-territory.local-open-dough`; agent: `bas-chan`.
- Setup: `npm ci` succeeded for this checkout and unchanged package lock; `npm run --silent lint -- --staged` succeeded. Hooks are check-only staged lint plus dashboard typecheck when scripts are staged. Formatter: `node scripts/lint.mjs --fix` (only changed paths); staged lint remains the check-only hook gate.
- No numeric slice budget or exception is configured; use one cohesive proof loop. Replanning authority remains the selected plan's existing planning authority; no scope extension.
- Observer: Codex yielded cell `g9:10`, session `41549`, coordinator `pilot-admission-bas-chan`, directory `/tmp/dough-ci-501/watch-GaynL9`, PID `41212`; checkout as above; repository `terryyin/open-dough`; target `codex/pilot-native-evidence-reuse-for-git-publication`.
- CI source: GitHub Actions `ci.yml` (`CI`, workflow id `351271804`, active); local push trigger and workflow diagnostic verified after the initial directed wait. Observer retained its throttle through `2026-11-09T00:08:56.033Z`. Claim trunk CI is unobserved by this branch observer.

## Manual baseline captured before implementation

Evaluation basis remains the preselected basis above. The read-only baseline
agent captured these results before slice 1 implementation began, against
`ca082e09ffec4b551a8389265305f469de2208a5`. Command:
`PATH=/opt/homebrew/bin:$PATH node /tmp/admission-manual-baseline.mjs`.
The disposable script and raw `/tmp/admission-manual-baseline.json` remain
available during execution; retained history owns recovery after wrap-up.

Conditions: exactly the four selected attempts, each compared with that same
candidate's full admission identity on its recorded host, current assessor,
existing source Git objects and available stream/prompt artifacts. No controlled
candidate mutations or native sessions were executed in this historical
baseline; slice 1's controlled examples are separately labelled proof of the
aid. Slice 2 must preserve this historical selection and these conditions.

| Attempt | Retained/current inputs | Changed | Removed | Current inputs absent from record | Git source-added subset (not installation proof) | Comparison ms | Current assessment | Manual reuse decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| codex/publication/admission-investigation/20261108T072654-1f30 | 125/406 | 13 | 1 | 282 | 22 | 3445 | pass | pending: installed-input/runtime provenance incomplete |
| claude/publication/admission-investigation/20261108T072449-17c1 | 125/406 | 13 | 1 | 282 | 22 | 3499 | pass | pending: installed-input/runtime provenance incomplete |
| cursor/publication/admission-investigation/20260929T035934-4301 | 15/406 | 12 | 0 | 391 | 191 | 5875 | pass | pending: installed-input/runtime provenance incomplete |
| cursor/publication/admission-investigation/20261108T073015-410d | 125/406 | 13 | 1 | 282 | 22 | 4690 | pass | pending: installed-input/runtime provenance incomplete |

Comparison elapsed time includes identity generation, per-path Git existence
inspection and reassessment; it excludes semantic review. SHA-256 before/after
of every retained corpus file matched for all four attempts. Git path existence
at source revisions supplies source provenance only, never evidence of the
historical installed bytes. Each record names unknown model/runtime settings;
replay/current assessment cannot fill them. Potential opportunities: four
historical same-journey results to assess; justified avoided native runs: zero.
No observed native rerun savings or total-effort improvement is established.

Manual prompt/runtime review command:
`PATH=/opt/homebrew/bin:$PATH node /tmp/admission-manual-prompt-review.mjs`.
Review window: `2026-11-08T23:58:51Z` to
`2026-11-09T00:01:15.333Z`, 144.333 seconds inclusive wall elapsed across
commands and reading; not human active-effort time and not apportioned per
attempt. Comparison commands total 17.509 seconds. Four retained-result
opportunities span three hosts and are not four independently avoidable reruns.

- Codex Nov 8: pending. No original user prompt or model/runtime init is
  retained; its 125-input manifest omits necessary historical installation
  inputs. Current pass does not repair either gap.
- Claude Nov 8: pending. Stream init recovers `claude-opus-5-5`, version
  `2.1.319`, `bypassPermissions` and some settings, with stream provenance;
  original user prompt and sufficient installed/runtime equivalence remain
  unestablished.
- Cursor Sep 29: pending. Sparse 15-input capture cannot establish installation
  provenance. Original stream prompt hash matches its record and today's
  generator reproduces it at retained fixture coordinates. `Auto` and
  permission mode `default` do not establish resolved model/runtime equality.
- Cursor Nov 8: pending. Its own 125-input capture is independently insufficient;
  the older record supplies none of its missing facts. Prompt correspondence
  at retained coordinates is supported, with the same unresolved `Auto` runtime.

No candidate runtime context was supplied for any attempt. All name an absent
`stderr.log`; that artifact gap is reported without claiming it independently
invalidates admission. For Nov 8, 260 inputs existed at source but lack retained
hashes (237 payload, 17 installer, two release and four harness); source bytes
cannot establish the historical installation. The change count grew from the
preparation's 12 to 13 because `src/skills/dough-product-backlog/scripts/product-backlog-complete.mjs`
changed at `28dcc3384` since `ebd6e8daa`; the baseline agent confirmed that as
the only intervening change among the measured changed inputs.


## Story obligations

### G1. Observe a hook applicable to the retained host
Reported: slice 1 — "Coordinator inspection found the controlled applicable-hook case pairs Codex evidence with a Claude-only hook edit, so that setup does not establish the promised applicable-host-hook review."
Story clause: "Assess referenced guidance and helpers, host discovery and hooks, fixture and installer behavior, prompt equivalence, current assessment, and relevant runtime conditions."
Disposition: proved by slice 1: tests/support/native-admission-reuse.test.mjs Claude same-host PreToolUse/Bash hook case plus tests/native-admission-reuse.md affected pre-probe review; terminal focused check passed.
Commitment: C21


### G2. Use a valid release in the controlled eligible example
Reported: slice 1 — "Slice 1 implementation review found the controlled unrelated-release case changed VERSION without a matching dated CHANGELOG entry, leaving the example installation invalid; a valid version/changelog pair and independent release validation are required."
Story clause: "Compare a candidate changing only release metadata and a skill-body detail whose admission and discovery effects are inspected and unrelated."
Disposition: proved by slice 1: tests/support/native-admission-reuse.test.mjs complete same-host case validates VERSION and dated CHANGELOG via the actual release validator, exposes only release/body differences, and preserves all manifest and artifact bytes; terminal corrected check passed.
Commitment: C27

### G3. Historical source read failures keep differences incomplete
Reported: slice 1 — "Independent refactor review found differences.complete is set true before historical ls-tree; missing/malformed source revision or failed Git read leaves complete true and an empty added list despite an unresolved source comparison. The refactor agent made no edits and returned this behavior for implementation correction."
Story clause: "Explain changed, added, removed, and unrecorded inputs against the requirement"
Disposition: proved by slice 1: actual CLI historical-source failure cases in tests/support/native-admission-reuse.test.mjs observe missing revision, malformed revision and unavailable Git object each keeping VERSION unrecorded, passing reassessment separate and differences.complete false; all three failed true before the correction and terminal runner passed after it.
Commitment: C10
## Slice 1 accepted proof and controlled review

Implementation return: `/root/slice1`; coordinator inspected the CLI, builder,
all six command test setups/assertions and review documentation. Initial
verification defects (missing fixture helpers, assessor child argument offset,
and incomplete release-helper invocation) were repaired; no failed proof
remains. G1/G2 capture the independently found setup gaps and their corrections.

Commands (Bash 5 first; awake macOS on AC under maintained guard):

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/admission-reuse-slice1-times.txt caffeinate -s -i bash scripts/test.sh tests/support/native-admission-reuse.test.mjs tests/native-stream-replay.sh tests/git-publication-native-admission.sh tests/git-publication-fixture-identity.sh tests/native-evidence-identity.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/admission-reuse-final-check-times.txt caffeinate -s -i bash scripts/test.sh tests/support/native-admission-reuse.test.mjs
```

Both reached terminal pass. First command: new check 27.7s, replay 18.8s,
admission 87.1s, fixture identity 19.4s, native identity 33.5s. Final corrected
new check: 20.8s; the other four proof boundaries were unchanged.

Controlled examples are deterministic aid proof, never native runs or
historical reuse. In the complete Codex example, actual release validation
accepts VERSION `99.0.0` and its dated CHANGELOG; the command exposes exactly
those two files and the appended unrelated body. The description, admission
guidance, hooks, installer and fixtures remain unchanged; the nondirective body
detail affects no admission instruction. Full inputs and artifact bytes survive,
prompt/runtime correspondence is supported, and reassessment passes. Thus each
changed group is explained and remote Taken with owned story/claim before the
probe, human-edit preservation and investigation-only coverage remain supported:
eligible for Codex in this controlled example, no cross-host proof.

In the Claude example, actual command output exposes all three input changes:
admission guidance directs admission after probing; an applicable valid Claude
PreToolUse/Bash hook invokes `probe.js` before Bash; the unrelated skill's changed
description directs probing before admission. Each independently touches the
before-probe requirement, so fresh proof is required despite the retained replay
pass. G1's corrected same-host setup is essential to this conclusion.

Other actual CLI cases retain added/removed/unrecorded provenance; keep duplicate
manifest rows while naming malformed/ambiguous identities; name host, prompt and
runtime gaps despite a passing assessment; and report missing record/artifacts,
unreadable candidate inputs and unavailable assessor with incomplete differences.
Those necessary unknowns leave proof pending; no current pass or other record
fills them. The aid emits facts/questions and no semantic eligibility verdict.

Consumer trace: `/tmp/admission-reuse-consumer-trace.md`, generated by
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/pilot-native-evidence-reuse-for-git-publication --base ca082e09ffec4b551a8389265305f469de2208a5 --term native-admission-reuse --term aNativeEvidenceRecord --term NativeEvidenceRecordBuilder`.
Every located consumer has a disposition. The additive side-effect-free MakeMe
builder/getter leaves existing returned values unchanged; both identity suites
cover the expanded capture import closure. CLI command tests observe the new
surface. Other generic planning/local-name matches have no changed contract.

G3 correction proof: `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/admission-reuse-g3-times.txt caffeinate -s -i bash scripts/test.sh tests/support/native-admission-reuse.test.mjs` reached terminal pass (27.1s). Each missing/malformed/unavailable source case first failed specifically on the incorrect true completeness flag. The corrected command sets completeness only after successful historical tree comparison. Root inspected the branch and actual CLI assertions; `/tmp/admission-reuse-g3-consumer-trace.md` disposes all four located consumers. Existing four identity/reader/admission boundaries stayed unchanged.

Independent refactor accepted: `/root/refactor_slice1` returned `## REFACTOR COMPLETE`. Product seams are report orchestration, full input comparison and disposable artifact assessment; test harness and gap cases are non-discovered helpers behind one test entry. Root inspected the moved call paths, MakeMe setup and observing assertions. CLI/report/API and G3 semantics stayed unchanged; a surviving deepEqual covers every manifest row after removal of one redundant count assertion. The artifact-declaration loop predates refactoring (retained preimage `/tmp/native-admission-reuse-before-refactor.mjs`). Command `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/admission-reuse-refactor-times.txt caffeinate -s -i bash scripts/test.sh tests/support/native-admission-reuse.test.mjs` reached terminal pass, 12.7s. Other four accepted proof boundaries and MakeMe capture import closure stayed unchanged. `/tmp/admission-reuse-refactor-consumer-trace.md` disposes all 392 located consumers plus the moved entry paths. Planning/source-review changes are records-only; the maintained runner timing catalogue retains its required complete data contract. No generation or project-summary mutation applies. Source freshness was unchanged at `9f66f209949beaf12702980df2fe20141c74d0b9`; incoming changes since the claim affected only backlog/agent claims, with no accepted fixture-identity sibling product change.

First guarded fresh preparation stopped at formatting with nine lint errors; no commit or publication occurred. The same independent refactor owner corrected parameter mutation by returning local comparison/reassessment result objects with copied gap arrays, resolved path arguments into local constants, and removed an unused import. Root inspected the returned helper calls, gap propagation and G3 branch. Renewed `## REFACTOR COMPLETE` accepted. `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/admission-reuse-refactor-mechanical-times.txt caffeinate -s -i bash scripts/test.sh tests/support/native-admission-reuse.test.mjs` reached terminal pass (13.5s); all seven cases and three historical-source subcases remain selected. Other four boundaries stay valid. `/tmp/admission-reuse-refactor-mechanical-consumer-trace.md` disposes all three located consumers. Source freshness was unchanged at `f23b50e3d23ec150e4236c34d24bb84911229298`; subsequent incoming paths were planning/agent records, with no identity-sibling product change.
