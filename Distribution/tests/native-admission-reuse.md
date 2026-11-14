# Reviewing retained admission evidence

Use this procedure when deciding whether a retained
`publication/admission-investigation` result still covers a candidate. The
requirement is that an accepted investigation reaches remote **Taken** with
its owned story and claim before its first probe, preserves human edits, and
remains investigation-only. Eligibility belongs to this requirement on the
result's own host; it supplies no proof for another host or journey.

Run from the Open Dough checkout containing the comparison aid, with Bash 5
first on `PATH`:

```sh
PATH=/opt/homebrew/bin:$PATH node Distribution/tests/support/native-admission-reuse.mjs \
  --attempt /path/to/retained/attempt \
  --candidate /path/to/candidate/checkout \
  --context /path/to/comparison.json
```

The context describes the candidate conditions being compared. For example:

```json
{
  "host": "codex",
  "version": "unknown",
  "model": "unknown",
  "runtimeSettings": "unknown",
  "promptHash": "unknown"
}
```

Supply observed values with their provenance in the active plan. Do not fill
historical unknowns from today's installation. A model or runtime value must
describe what ran, including relevant permissions and host settings; a model
name alone need not settle those conditions. `promptHash` identifies the
candidate prompt bytes. If unavailable, leave it unknown and review the gap.
`version` compares the native tool version recorded with that attempt.

The command reports comparison facts and outstanding questions as JSON. It
uses the existing full admission identity writer and retained-stream reader,
and runs the current assessment against retained observations with stream
fields re-extracted. Compressed corpus streams are expanded into a disposable
attempt; original records and artifacts are not edited. No native session is
launched. The command does not certify semantic independence, decide reuse, or
skip a native run.
An unsuccessful identity read leaves `differences.complete` false; empty arrays
in that report do not establish unchanged inputs. `added` names the subset of
unrecorded current paths absent from the recorded Git source tree, when that
tree is available. It still supplies no missing installed provenance.

## Review the report

1. Establish the retained result's origin, host, source and fixture identities,
   execution outcome and original assessment. Inspect named artifacts and any
   capture, read, malformed-input or ambiguous-duplicate gaps. Repeated
   `input-hash` rows form the manifest; a scalar parser's first row is not the
   manifest. Preserve the full identity even when only some inputs affect this
   requirement.
2. Review every changed, added, removed and unrecorded input. A current input
   absent from the retained manifest does not prove it was absent from the
   historical installation. Source files recovered at a Git revision establish
   those source bytes, with that provenance; they do not establish unrecorded
   installed output or runtime consumption.
3. Inspect the actual effects on referenced admission guidance and helpers,
   skill descriptions and discovery, host registration and hooks, fixture
   behavior, installer output and release identity. Include discovery effects
   outside directly linked admission files. Inspect an installer change's
   installed output, and explain release metadata changes. A path group or
   reviewer-supplied ignore list cannot establish semantic independence.
4. Establish equivalent prompt intent and relevant runtime conditions on the
   same host. Check the current assessment and the evidence it consumes. A
   passing replay settles assessment compatibility only; hash equality alone
   settles neither applicability nor native behavior. A changed assessor
   requires review of what the current pass actually establishes.
5. In the active plan, record one reason for each affected group and explain
   why the unchanged requirement remains covered where reuse is proposed.
   Keep capture facts, current assessment and applicability judgment separate.
   Cite any recovered facts to the artifact or Git revision that supplies them.
   An unknown condition may be immaterial only with a supported reason; unknown
   is never equality.

Choose and explain one conclusion per retained attempt:

| Conclusion | Required judgment |
| --- | --- |
| Eligible for reuse on the named host | The retained result has sufficient provenance and passing relevant evidence; supported prompt/runtime correspondence and review of every affected group leave the admission requirement covered. |
| Fresh proof required | A supported change invalidates the requirement, such as admission after the first probe or an applicable hook changing that path. Name the requirement and changed effect. |
| Pending | Necessary provenance, artifacts, prompt/runtime correspondence, assessment compatibility or impact cannot be established. Name each unresolved fact; a passing replay cannot remove it. |

A host mismatch supplies no cross-host proof. Judge older and newer attempts
individually: one attempt's pass or richer provenance cannot repair another.
Stop provenance recovery when available artifacts cannot resolve a needed
fact. This comparison does not authorize a fresh native run; use the ordinary
native-publication workflow when such work is authorized. Apply the repository's
[failing and flaky tests policy](../../AGENTS.md#failing-and-flaky-tests) as written
to verification.

## Controlled review examples

These are deterministic examples of the comparison-and-review rule. They are
neither native runs nor demonstrated historical reuse. Start each from a
complete same-host passing record with supported prompt/runtime conditions,
and retain the command's full differences.

| Controlled change or gap | Effect review and expected conclusion |
| --- | --- |
| Release metadata and an unrelated skill-body detail change | Inspect what the release installs and the edited body, description and registration. If only the release identity and unrelated body changed, discovery and admission behavior remain covered by the retained evidence. Explain both groups; the result stays eligible on its own host. A different release number alone does not justify this conclusion. |
| Admission guidance moves admission after the first probe | The ordering promise changes even if the admission script is unchanged. Require fresh proof of remote Taken, owned story and claim before the probe. |
| An applicable host hook changes the admission path | Review the hook's actual trigger and effect. If it alters before-probe admission, require fresh proof on that host; another host's result does not cover it. |
| A skill description changes discovery before the probe | Review the new activation effect even outside directly linked admission references. An effect that invalidates the admission promise requires fresh proof; an unresolved effect leaves proof pending. |
| An input is unrecorded, malformed or ambiguously duplicated | Name the missing or conflicting provenance and its consequence. If needed for applicability, leave proof pending even with a passing current assessment. |
| The prompt or relevant runtime conditions cannot be established | Name the correspondence gap and leave proof pending. Today's values cannot fill the historical gap. |
| The assessor cannot run or cannot consume the retained evidence | Name the assessment gap and leave proof pending. A historical pass does not supply today's missing assessment. |

Keep controlled judgments separate from real pilot results. When evaluating
cost, compare the same selected attempts, candidate and conditions before and
after using the aid. Record executed checks, command elapsed time and review
effort; distinguish candidate opportunities from native runs actually justified
as avoided. Zero demonstrated avoided runs is valid and establishes no observed
improvement. Include implementation and future maintenance cost when judging
whether any observed benefit is worth keeping, under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

This procedure preserves the full payload and immutable release identity
([ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md),
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)). It follows
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md#5-assess-now-and-delete-spent-evidence):
keep active comparisons in the plan, assimilate lasting knowledge into maintained
tests and documentation, and remove spent execution evidence at wrap-up with Git
history available for recovery. This adds no permanent evidence registry and
changes neither ordinary installation nor native execution.
