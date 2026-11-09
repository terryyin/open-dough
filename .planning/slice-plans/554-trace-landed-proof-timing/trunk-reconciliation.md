# Published trunk contract reconciliation

[Plan](PLAN.md); [prior independent refactor](refactor-slice-1-before-trunk.md).

## Freshness context

The installed source-freshness check refused `not-taken-at-base` after fetching
trunk1c784a6d62d48bd845f50992775064fed6d8192f. Git reports two incomparable
common bases: published siblingdb8ca909986425b77080466a47ba4ff8079040b0 and
our accepted Take8554eb19e1b0944f7261120ff38af38de5f40ab0. The script chooses
the former, which predates this identity's Take. The actual Take and current
trunk both contain our Taken entry. This is publication-context refusal, not
evidence of a human source amendment.

Preserve owned reviewed work, integrate published trunk history on the owned
execution branch, then rerun the installed guard. Do not alter managed guidance,
invent an override, or bypass comparison. No landing context applies to an
execution-branch import. The first eventual trunk landing still needs the
user-supplied capture context.

Actual recovery: accepted mergefcf4c00410f737f0a396fb3c0bae95508a5d2671
contains published main1c784a6d62d48bd845f50992775064fed6d8192f and our
previous published50f4. Both histories remain. The same existing CI observer
registeredfcf4. Installed freshness then returned unchanged for both story and
plan, with trunk/base/from1c784a6d and no writes to source or managed guidance.

## Newly delivered proof model

Read-only PFE of published main found schemaVersion2 `CiProofEntry.evidence[]`,
with declared `case` and `file` units and unconfirmed `legacy` evidence. Existing
owners are `entryEvidenceOf`, `unitResultsAt`, `entryTimingOf`, `scopeTimingOf`
and `ciProofUnits`. Scope figures now expose paths. Existing views show units
beside one another; no setting selects a unit. Neither arbitrary preference nor
addition of cases and files is supported. Even equal legacy labels do not prove
comparable units.

The story continues to inherit these existing timing and matching rules. One
measured attempt remains one collected build observation, with independent
declared-unit readings. Present supported case/file readings separately, keeping
one point per build in each unit history and unique build counts; do not create
duplicate retained attempts or sum unlike units. Unit-specific gaps and segment
boundaries remain explicit. A missing selected unit leaves its terminal gap and
earlier independently supported segments. Legacy evidence supplies no declared
comparable unit, so history explains that gap rather than inferring cases/files.
Existing single-build proof can retain its absolute legacy reading.

Already-retained v1 summaries bypass artifact readers and would otherwise reject
the whole machine store under the new v2 schema. Normalize them locally using the
same shared contract validation/conversion as the published artifact and adapter
readers. Preserve subject identity and classify unknown units as legacy; acquire
nothing from browsing and invent no historical unit. Extend the canonical v2
proof/evidence builders. Keep deliberately v1 wire bytes for compatibility proof.

The previous51 Playwright and12 Node passes remain baseline evidence at50f4.
Their custom proof record contains51 selected,51 expected-passed executions and
51 passed attempts with no retries/skips. Product/refactor writers were quiescent.
After importing trunk, reconcile only actual conflicts and contract effects,
renew affected proof and independent refactoring, and recheck source freshness
before the slice's done mark. Folder/file and proof-resumption slices retain
their outcomes under the same declared-unit rule.

[Failure policy applies as written](../../../AGENTS.md#failing-and-flaky-tests).

## Queued evidence follow-ups

- `SEED-288#refresh-pending-landed-evidence` queues sharing the history's
  pending/final judgment with Done comparison; `SEED-288#reuse-adapter-equivalent-timing`
  queues adapter skip wall-time reuse without test proof. Neither is assumed
  delivered here, and neither supplies missing scoped proof. Reconcile their
  published outcomes if they land before integration; no start dependency is
  created by this amendment.
