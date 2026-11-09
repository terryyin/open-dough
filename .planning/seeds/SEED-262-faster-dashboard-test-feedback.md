---
id: SEED-262
status: active
planted: 2026-11-08
scope: epic
---

# Faster dashboard test feedback

Developers running dashboard checks should get a result sooner while keeping
the integration proof that makes each check worth running. Start with
[`agent-launch-attention.spec.ts`](../../dashboard/tests/sessions/agent-launch-attention.spec.ts).
Both cases passed in 12.02–13.01s wall with two local workers. That profile
separated run startup, shared hooks, and test bodies. Use it to find other
consumers of each cost and prove savings across the affected family.
[Profiling evidence](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

For each story, compare the same ordinary test selection before and after
under comparable conditions. Include the starting example where it bears the
cost and a second consumer or representative selection. Report elapsed time,
executed cases, and the phase or operation each story changes. Keep the
surviving proof explicit and include its runtime when coverage moves to another
tier. Follow the project's
[test automation rules](../../AGENTS.md#test-automation),
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests),
[macOS test gate](../../tests/local-test-resources.md#machine-sleep-on-macos),
and [definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="pilot-admission-native-evidence-reuse"></a>

### Pilot native evidence reuse for Git publication admission

**Identity:** SEED-262#pilot-admission-native-evidence-reuse
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/544-pilot-admission-native-evidence-reuse/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"be6603f67b062bc6b76561b7747da5ad34395ca061dfd92ae9e6636fd4023620","plan":"8f2b5c87fc7823caa020d0f80382f8a006ba09db67ce54f2b93749a1ee16f03f"}}
```

#### Goal

A maintainer deciding whether to rerun `publication/admission-investigation`
can tell whether a change to the installed payload affects the requirement
proved by a retained native result on that host. An unrelated skill edit or
release can leave that result eligible for reuse, saving a native rerun.

#### Scope

- Pilot `publication/admission-investigation` with a small comparison aid and
  an explicit requirement-impact review. Use existing per-file hashes and
  retained observations; preserve full installation provenance and historical
  record bytes. Explain changed, added, removed, and unrecorded inputs against
  the requirement: an accepted investigation reaches remote Taken with its
  owned story and claim before its first probe, preserving human edits and
  remaining investigation-only.
- Assess referenced guidance and helpers, host discovery and hooks, fixture
  and installer behavior, prompt equivalence, current assessment, and relevant
  runtime conditions. A justified review can leave a result eligible for
  reuse on its own host; an invalidated requirement needs fresh proof;
  insufficient provenance or uncertain impact leaves proof pending with the
  gap named. Hash equality and a passing replay alone establish neither
  applicability nor current native proof.
- Judge historical records individually under
  [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md#5-assess-now-and-delete-spent-evidence).
  Demonstrate the decision rule with controlled complete examples as well as
  available real records. Label those examples as deterministic proof of the
  aid, never as native runs or historical reuse.
- Compare the same selected attempts and changes before and after the aid.
  Record executed checks and elapsed comparison time, review effort,
  potentially avoidable reruns, and reruns actually justified as avoided.
  Zero demonstrated real savings is a valid pilot finding; it establishes no
  observed improvement. The
  [fixture family identities](../../tests/support/git-publication-native-fixture-identity.sh) own capture
  completeness; this story owns the sufficiency of each reuse judgment.

Deferred promises: fresh native baseline capture, automatic semantic
certification or skipping of native runs, other native journeys, a universal
dependency graph, and a permanent evidence registry. Keep ordinary installer
and native-run behavior unchanged. These are delivery limits, not reasons to
reject naturally supported inputs.

#### Key examples

| Pre-condition | Trigger | Result |
| --- | --- | --- |
| A passing result has sufficient provenance, equivalent prompt and assessment, and supported runtime conditions on Codex. | Compare a candidate changing only release metadata and a skill-body detail whose admission and discovery effects are inspected and unrelated. | Retain the full differences and reasoning; the admission requirement remains eligible for reuse on Codex. This supplies no evidence for Cursor or Claude Code. |
| The same sufficient result exists. | Admission guidance changes what happens before the probe, or an applicable host hook changes that path. | Identify the affected requirement and require fresh proof. An unchanged admission script does not hide a hook or discovery effect. |
| A historical result passed, but necessary installed inputs or runtime conditions cannot be established. | Reassess and compare it, even if today's assessor passes. | Leave reuse pending and name the missing facts. Do not fill historical fields from today's checkout or silently treat unknown as equal. |
| A sparse older record and a newer record concern the same host and journey. | Review both against one candidate. | Judge each record on its own evidence; one record's sufficiency or pass does not repair the other. Report actual savings separately from controlled eligibility examples. |

#### Investigation and alternatives

At `ebd6e8daa`, current admission identity generation succeeded with 406 unique
inputs. The November 8 records have 125 each: 282 current inputs are unrecorded,
12 retained hashes changed, and one old input is no longer listed. Today's
assessor passed all four retained admission-investigation attempts, which
settles assessment compatibility only. Their records say model and runtime
settings are unknown; stream recovery supplies some host facts, not complete
runtime equivalence. The plan retains the commands and observation boundaries.

Existing manual impact review is the simplest alternative, but repeated
comparison effort may erase its benefit. Recommend a bounded comparison aid
that exposes facts for that review. Automatic dependency fingerprints could
reduce repeated work, but the existing capture manifest is not a proven causal
graph and cannot certify semantic independence.

The borrowed mechanism is incremental builds: a retained result is an output,
its full provenance is the source manifest, and requirement-impact review
identifies relevant dependencies. Unlike a compiler dependency graph, skill
discovery and hooks can influence an agent without static imports. The
strongest doubt is that controlled examples could look successful while every
real record remains unusable; the pilot therefore measures zero real savings
honestly rather than treating replay or synthetic records as native proof.

#### Architecture

Keep full provenance capture separate from current applicability judgment.
Reuse the existing admission identity writer, retained-stream reader, and
assessor; add only the missing comparison responsibility. A skill description
or host registration change needs discovery-impact review even when it lies
outside admission's directly linked guidance.

[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) preserves
release identity; [ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
keeps whole-payload installation. This pilot changes neither.
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) requires
host-specific justified reuse and keeps replay separate from native behavior;
spent impact records follow its normal cleanup lifecycle.
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) requires
comparison against total review and maintenance effort. No Accepted-ADR conflict
or new product-wide decision was found.
