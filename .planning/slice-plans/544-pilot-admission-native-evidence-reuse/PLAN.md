# Pilot native evidence reuse for Git publication admission

**Source:** [Pilot native evidence reuse for Git publication admission](../../seeds/SEED-262-faster-dashboard-test-feedback.md#pilot-admission-native-evidence-reuse)

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

Status: planned

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
