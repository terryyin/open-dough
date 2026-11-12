# Run dashboard CI follow-up by default for GitHub Actions projects

**Identity:** SEED-330#make-ci-follow-up-automatic
**Source:** [Run dashboard CI follow-up by default for GitHub Actions projects](../../seeds/SEED-330-dashboard-ci-follow-up.md#make-ci-follow-up-automatic)

## Goal and scope

Every GitHub Actions project on the production dashboard gets the existing
one-rerun slowdown check for new qualifying landings with no setting. The
machine that records a landing receipt follows that landing up. The per-project
setting, its machine designation, its Settings UI and write path leave the
product, existing ledgers, tests and current guidance.

Unchanged: the 5% rule, saved reference, one-request allowance, deduplication,
evidence, Recently done cards, review route, the development-dashboard and
custom-adapter collection guards, and receipt admission recorded before the
upgrade. Excluded: custom CI triggers (the sibling story), cross-machine
coordination, configurable thresholds, backfill, and any negative or absence
test for the removed setting.

## Architecture and existing solutions

- **Reuse the receipt ledger as the authority.** `registerFollowUpReceipt`
  already runs only when this machine records a new receipt, and
  `spendRepeat` and `collectCiFollowUps` already spend only receipts in this
  machine's `~/.open-dough/dashboard/ci-follow-up.json`. Admit every newly
  registered receipt and drop the `hasRepeatAuthority` gate from registration,
  spend and collection. No replacement authority concept is introduced.
- **Remove, do not migrate.** Delete `projects` from the ledger schema and its
  empty document. Zod strips the obsolete key on read, and the next ledger write
  (every new receipt makes one) leaves it out. No compatibility flag, archive or
  migration step. The per-landing `eligible` admission stays: it is how a
  receipt recorded while follow-up was off stays unspendable.
- **Remove the write path and its UI.** Delete `saveFollowUpSetting`, the POST
  branch of `answerCiFollowUp` with its prior-receipt gathering, and the
  `enabled`, `machine`, `available` and `explanation` fields of the follow-up
  answer and `ciFollowUpAnswerSchema`. The GET read keeps cards and the retained
  review reading. Delete `CiFollowUpSetting`, its `SystemSettings` row
  placement and any CSS only it uses.
- **Accepted decisions.** [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  the ledger stays machine-local operational evidence and the published story
  state is untouched. No conflict.
- **Oversized expected edit.** `tests/support/ci-follow-up-ledger.test.mjs` has
  259 lines. Slice 1 deletes its two setting-dedicated cases and the `setting`
  helper, which removes the setting responsibility from the file and leaves it
  under 250 lines. No other expected edit exceeds 250 lines at this revision.

## Coordination with SEED-324

[SEED-324](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load)
is in Story Branch execution (`claude/make-landed-ci-repeat-checks-pass-under-moderate`,
slices 1–5 done, unlanded) and reshapes the same specs and support. Its done
slices hold setting coverage (the Settings case, coverage rows C1 and C16,
faults F13 and F18); its remaining slices touch no setting.

Execute against trunk as it stands at the Take. If SEED-324 has landed, its
reshaped specs are the ones this plan edits: rerun the consumer trace and apply
the same dispositions to the forms found there. If it has not, edit trunk's
forms; SEED-324's next trunk merge keeps this story's removal. Do not edit the
SEED-324 branch or plan. No blocking dependency is recorded: shared files alone
justify none.

## Outside-in proof ownership

| Promise (seed example) | Slice | Proof |
| --- | --- | --- |
| A never-configured project's qualifying Done receipt gets exactly one rerun, then the slow verdict (1) | 1 | The receipt journey in `landed-ci-automatic-repeat.spec.ts` (or SEED-324's one remaining receipt journey) with its setting steps removed |
| Receipts recorded before the upgrade keep their admission; a new receipt is admitted whatever the old ledger said (2, 3, 5) | 1 | Ledger case in `tests/support/ci-follow-up-ledger.test.mjs`: an earlier ineligible receipt stays unspendable and a newly registered receipt is spent once. Arrange the earlier receipt through the shared MakeMe ledger facts, without the retired `projects` shape |
| Spend deduplication, interruption and restart keep one request (unchanged) | 1 | Remaining `ci-follow-up-ledger.test.mjs` cases with their `setting(true)` steps removed |
| Existing requests stay observable and reviewable (5) | 1 | `landed-ci-follow-up-reading`, `landed-ci-repeat-reconciliation`, `landed-ci-repeat-receipt-boundary` and `landed-ci-repeat-verdict` specs with setting steps removed |
| Settings shows each project's row without follow-up content (4) | 1 | Existing System settings journeys stay green; the Recently done journey loses its Settings steps (one mixed case at this revision; a separate Settings case in SEED-324's shape, deleted). No absence assertion is added |
| Recently done shows progress, then the red slow warning, on a phone (unchanged) | 1 | The Recently done journey's warning case through `recently-done-ci-automatic-repeat.spec.ts` |
| Development dashboards and custom adapters request no rerun (6) | 1 | The existing `projectEnvironment()` and adapter guards in `collectCiFollowUps` stay byte-for-byte. Their only current tests observe the setting answer and are deleted as setting-dedicated; this story adds no new test for them |
| Current guidance describes default follow-up (scope) | 1 | `docs/dashboard-ci-follow-up.md` and `dashboard/PROJECT-CONFIGURATION.md` reviewed against the shipped behavior |

## Ordered slices

### 1. Follow-up runs for every new qualifying receipt with no setting

Type: Behavior
Status: planned
Proof: the receipt journey, the ledger cases and the Recently done warning
case above pass; the journey fails against the unchanged authority gate
(observed in preparation, below); the guidance review holds.

Behavior: a GitHub Actions project with no follow-up setting on the
production dashboard → a Done receipt lands at 105 s against five 100 s prior
builds → exactly one full rerun of run 71 is requested, the follow-up read
reports progress, then "Possible CI slowdown", and the Recently done card
shows the red warning on a phone. A receipt recorded with `eligible: false`
before the upgrade is never spent. **System settings → Projects** rows show
name, repository, local path, hidden state and Client configuration only.

One slice because the pieces cannot be delivered apart: removing the gate
leaves the Settings toggle meaningless, and removing the answer's setting
fields breaks the toggle and its Settings case in the same change.

- Server: remove `projects` from the ledger schema and empty document,
  `hasRepeatAuthority`, and its uses in registration, `spendRepeat` and
  `collectCiFollowUps`; register every new receipt as eligible. Remove
  `saveFollowUpSetting`, the POST branch with its prior-receipt gathering and
  setting-only imports, and the setting fields of the follow-up answer and
  `ciFollowUpAnswerSchema`. Keep the follow-up GET and the unreadable-ledger
  refusal, rewording its "settings or allowance" text to the allowance
  evidence it still guards.
- UI: delete `CiFollowUpSetting`, its `SystemSettings` placement and CSS only
  it uses. `useCiFollowUps` and the cards keep working.
- Tests: delete the setting-dedicated cases (`default off, pre-enable receipts
  …`, `disable between candidate read …`, `an unspent eligible receipt disabled
  …`, `development mode and unsupported providers …`, SEED-324's separate
  Recently done Settings case if landed, and any receipt-boundary or admission case whose only
  observation is enablement timing). Remove `setting(...)` and
  `followUpSettings(server, true|false)` steps and `enabled`/`authority`
  assertions from mixed cases, including the Settings steps of the Recently
  done journey at this revision. Remove the worker's `setting` action and the
  POST form of the `followUpSettings` helper; rename the GET helper to what it
  reads (cards). Add the upgrade ledger case named in the proof table.
- Guidance: rewrite `docs/dashboard-ci-follow-up.md` and the follow-up
  sentence in `dashboard/PROJECT-CONFIGURATION.md`: follow-up runs by default
  on the production dashboard for GitHub Actions projects, the machine that
  records a receipt follows it up, development dashboards and custom adapters
  request no rerun, and existing evidence stays reviewable. Remove
  off-by-default, enablement, disablement and designation text without
  describing the former setting.
- Consumer trace: `consumer-trace.mjs --base HEAD --term 'enabled'
  --term 'authority' --term 'followUpSettings' --term 'Automatic CI follow-up'
  --term 'Production action machine'`; disposition every listed consumer and
  run the System settings journeys it names.

Focused local checks:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-policy.test.mjs tests/support/ci-follow-up-reading.test.mjs
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts dashboard/backend-tests/intent/landed-ci-follow-up-reading.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-receipt-boundary.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts dashboard/tests/intent/intent-ci-follow-up.spec.ts <System settings journeys named by the trace> --reporter=list
npm run typecheck:dashboard
git diff --check
```

## Verification and local gates

The focused checks above cover the changed surfaces. No whole local suite is
required by this project for this change; hosted CI runs every check after
publication, and its failures stay owned under the policy below. Before
landing, run `npm run lint` and the typecheck.

**Local gate:** use the maintained
[macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos)
for any long run: start fully awake; on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs.
These dashboard specs time out above a one-minute load of about 33 (the reason
SEED-324 exists). Record the load beside each focused run; a timeout at high
load is still a failure to diagnose, not to rerun until green. Never wait for
wall-clock time, use `test.slow()` or override a timeout.

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written and accompanies every delegation and repair handoff.

## Decisive premises and observations

Observed on 2026-11-12 in this preparation's owned workspace at
`1620dfabbb787d6976af73cfafc2c5a045f36254`, Node 24.21.0, after
`node scripts/setup-native.mjs npm` and `browser`. Scratch edits were reverted
before the record writes. The scratch change removed `projects` from the ledger
schema and empty document and made `hasRepeatAuthority` return true; the
follow-up GET read the setting through an optional access.

| Premise | Consuming operation and observed form | Result and remainder |
| --- | --- | --- |
| The receipt journey requests the rerun with no setting step once the gate goes | `npx playwright test … landed-ci-automatic-repeat.spec.ts -g "exactly105 seconds"` with its two setting lines removed, scratch change applied | Passed in 13.2 s at load 28–30: one call for run 71, slow card at 106 s |
| That journey discriminates the change | Same command and spec edit, store reverted to the authority gate | Failed at the 30 s timeout waiting for the submission, at load 32 |
| An old ledger's setting is dropped and earlier admission kept | Scratch node test through `ledgerAction` worker processes (`bash scripts/test.sh`): ledger holding `projects` (another authority) and an `eligible: false` receipt; register a new receipt; spend both | File keys became `["landings"]`; the old receipt's spend answered false; the new one's true |
| Which ledger cases observe the setting | `bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs` with the scratch change | Only `default off, pre-enable …` and `disable between candidate read …` failed; the other five passed with their `setting(true)` steps still present |
| Removing the setting affects few real reruns | Read-only run of `repeatDecisionOf` over this machine's `landed-ci-history.json` | 5 of 22 exact open-dough builds qualify; none of 89 in other projects |

Unverified remainder: a development-dashboard case observing no rerun did not
complete in a scratch run (30 s timeout at load 57, cause not found). The
promise rests on the unchanged collection guards instead; see the proof table.

## Current decisions

- Authority is receipt capture; no hostname or machine field remains.
- The obsolete `projects` key leaves an existing ledger on its next write. No
  dedicated migration or startup rewrite.
- Per-landing `eligible` stays as the receipt's admission fact.
- No absence or negative tests for the removed setting, and no maintained test
  arranges the retired `projects` shape.
- Story Branch Mode; no trunk-only step. Execution authority comes from a later
  instruction.

## Plan concern assessment

Slice-plan refinement was not needed: one Behavior slice whose parts cannot be
delivered apart without a meaningless or broken Settings toggle, with one
proof loop over the follow-up specs, ledger cases and guidance. No
slice-specific concern remains. The SEED-324 overlap is handled by the
coordination section, not by a dependency.
