# Invoke Dough Intent Coverage manually across test mixes

**Identity:** SEED-258#invoke-intent-coverage-manually

**Source:** [Selected story](../../seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually)

## Goal and boundaries

Deliver one manually invoked skill that returns a sourced assessment of a
selected story's test protection and the cost of obtaining it. The caller owns
persistence. Automatic wrap-up, done-record storage, dashboard rendering,
project-wide audits, and repairs to assessed projects are separate work.

The recorded supplier agreement governs when this work can start. Use the
method supported by the evidence and decision that satisfy it. The
[pilot's Narrow result](../../seeds/SEED-258-dough-intent-coverage.md#pilot-result)
supports one targeted scratch check in ordinary review. Its timing budget,
case selection, and probe procedure are evidence from that study. This plan
sets the manual skill's output and delivery boundaries while leaving the
choice of a supported method to the prerequisite. If the eventual decision
changes the promised output, reconcile the story and plan under the
[supplier procedure](../../../.agents/skills/dough-product-backlog/references/supplier-dependencies.md)
before Take.

## Current decisions

- Keep the assessment in one skill under `src/skills/dough-intent-coverage/`.
  [The retrospective](../../../src/skills/dough-execution-retrospective/SKILL.md)
  reviews product or process outcomes and may plan corrections.
  [Test optimization](../../../src/skills/dough-test-optimization/SKILL.md)
  measures test performance and publishes CI proof summaries.
  [Manual testing](../../../src/skills/dough-manual-testing/SKILL.md) plans
  exploratory observation. The manual intent assessment has its own job:
  relate maintained assertions to the selected story and return the evidence.
  Reuse project instructions and actual runners. Use one project-relative
  behavior across the examples, with no runner-specific assessment rules.
- Return findings and cost together under the
  [North Star cost direction](../../NORTH-STAR.md#intent-assessment-results-carry-their-cost).
  The scope of an assertion follows the path and conditions it exercises.
  A passing run, a gap, and evidence that could not be obtained each need
  their own explanation. A runner's measured runtime and elapsed assessment
  time describe different intervals. Attribute human and agent effort to
  their own observed or estimated bases.
- Follow [ADR 0003, Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
  and [ADR 0006, Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
  Author Proposed guidance for the executing project. Use a disposable local
  tagged candidate to prove the normal installer path. The maintainer selects
  promotion after review. Public availability follows the ordinary authorized
  versioned release of the whole payload.
- Under [ADR 0005, Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
  check the skill's behavior through fresh native invocations. Use the
  established shared mechanism and evaluate the existing host evidence for
  justified reuse on Codex, Cursor, and Claude Code. Exercise additional native
  paths where changed behavior or a host risk invalidates that evidence.
  Track any host-specific requirement that must continue separately in a
  linked native acceptance story before release.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Useful manual report for a browser and unit test mix | Slice 2 | A fresh session invokes the installed candidate in Open Dough with the selected story and revision. Read the result against the actual production path, fixture and assertions. It explains a verified protection and the independently verified combined-path gap. |
| Missing context and missing execution evidence | Slice 2 | The representative review covers a run the fixture cannot establish and a prompt without reliable story intent. The observed responses identify the missing evidence or request the missing source, without filling it from a different test or story. |
| Report and cost return to the caller | Slices 2 and 3 | Each returned report shows measured assessment elapsed time, separate test runtime where observed, and supported human and agent effort. Check unit, basis and label, explicit unavailable values, and absence of a skill-created saved assessment or done-record mutation. |
| The same invocation works with a different test stack | Slice 3 | Fresh native invocation of the same candidate in isolated Lizard. Check its pytest command, fixture and assertion citations, and the evidence boundary between the extension and the CLI. |
| The reviewed skill follows normal install and update | Slice 4 | The maintained deterministic install, update, and declaration checks exercise the promoted files through both native roots, with the release boundary described above. |

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 2's browser and unit assessment at Open Dough checkpoint `1359d6fb76b8ff2b4295e2b4febe0e467ec72be1` | Retained [focused runs and test trace](https://github.com/terryyin/open-dough/blob/72e0c2f318a4283bff32acd5767a27ecaa576ba8/.planning/slice-plans/498-compare-manual-intent-coverage/assessment-254.md#focused-runs) from the 2026-11-07 pilot. It used the locked Playwright setup, `npm run test:dashboard` for the cancelled-landing journeys and `bash scripts/test.sh` for the Node checks in an isolated checkout of that exact revision. The [verified comparison](https://github.com/terryyin/open-dough/blob/72e0c2f318a4283bff32acd5767a27ecaa576ba8/.planning/slice-plans/498-compare-manual-intent-coverage/comparison.md#verification-record) covers the combined path at the same checkpoint. | Seven selected browser cases passed, the focused Node selection exited 0, and the waiting-at-head assertion failed under a reaching scratch break and passed after restoration. The proofless-then-running Node fixture checked the stop and identity, leaving its dropped proof reason unasserted. The historical revision keeps both signals stable as trunk evolves. |
| Slice 3's pytest assessment in Lizard at `32b61f5eb9b2e8d72c5e748d02b074e18e9a9dc4` | 2026-11-07, temporary clone nested in the preparation workspace. After selecting that revision, ran `nix develop -c python -m pytest --collect-only -q test/test_extensions/testDuplicateDesignatedInitializers.py` under its project environment. | Pytest collected the enum and numeric designated-initializer cases. The proof run in Slice 3 executes those tests and inspects their extension boundary. The Nix shell's pip dependency warning did not prevent collection. |
| Candidate installation and fresh native session in Slices 2 and 3 | 2026-11-07, `--list` for the maintained `tests/dough-adr-awareness-{codex,cursor,claude}-delivery-to-use.sh` wrappers exposed each host's isolated install and fresh-use route. Native CLI versions resolved locally. On preparation revision `169b8b8ac`, the deterministic link, install, and added-skill update checks below passed. | The installer and native entry points are available. Slice 1 owns the authenticated fresh-session probe before authoring. This observes the existing mechanism only. The candidate's installation and returned results are proved separately in Slices 2–4. |

## Slices

### 1. Establish the native invocation route

Type: Behavior

Status: planned

Proof: A fresh authenticated native session in an isolated project invokes an
existing installed skill through the same mechanism intended for the candidate
and produces that skill's observable result.

After the supplier agreement is satisfied and work is Taken, use the
maintained [native delivery fixture and host adapters](../../../tests/native-adr-awareness-wrappers.md#delivery-wrappers)
or corresponding retained evidence for the same host profile. Start with the
native host selected for the first assessment. Where the selected profile's
trust, login or permissions need a fresh observation, launch one bounded
disposable check with the existing representative skill. If a selected
required route refuses, name the specific condition and stop dependent work
until an authorized route is shown. When only Terry can act, request the
needed sign-in or permission step for that disposable host and reuse its
result for the corresponding profile.

### 2. Return a sourced assessment in Open Dough

Type: Behavior

Status: planned

Proof: The installed candidate returns the browser and Node assessment with
cost evidence at the outside-in boundary above. Review its output against
the pinned sources and run results without putting the expected findings in
the invocation prompt.

Write the shared Proposed skill using the supported method and
[representative behavior review](../../../AGENTS.md#behavior-review).
Use a disposable candidate source and add its manifest entries only there.
Build an isolated tagged installer fixture with
[`tests/helpers/release-fixture.bash`](../../../tests/helpers/release-fixture.bash).
Install the candidate in an isolated Open Dough target at the pinned SEED-254
checkpoint with its recorded story and maintained tests. Invoke the skill in
a fresh native session with the story and revision. Review the report's
assertion boundaries, observed combined-path gap, unavailable evidence, and
cost against the retained evidence and the new run. Check the missing-intent
response in the representative behavior review. Keep the source Proposed
until the broader proof and maintainer selection.

### 3. Return the same assessment in Lizard

Type: Behavior

Status: planned

Proof: The same installed candidate returns the assessment for Lizard's
SEED-050 designated-initializer story using its Nix and pytest workflow.
Citations distinguish extension protection from any separately evidenced CLI
protection. The assessment reports cost and leaves result storage to the
caller.

Install the same candidate in an isolated Lizard checkout at the pinned
revision. Use a fresh native session, selecting a different host if it closes
a remaining material delivery risk. Include the focused designated-initializer
pytest file and inspect relevant existing CLI proof before crediting that
boundary. Evaluate evidence or justified reuse for each supported host.
Address a project-specific assumption in the shared instructions if this run
exposes one. Recheck the first example when the adjustment affects its
result.

### 4. Put the reviewed skill in the managed payload

Type: Behavior

Status: planned

Proof: After the maintainer selects promotion based on the representative
review and applicable native evidence, the focused installer checks pass
with the new declaration and fixtures. Installation and update deliver the
same standalone files through the existing Codex/Cursor and Claude roots.

Use `install.sh`'s `managed_files` declaration and align the maintained payload
fixtures, including the added-skill upgrade case. Verify the released-use
candidate has every runtime dependency locally. Promotion makes it eligible
for the normal release workflow. The maintainer owns the separate version
and tag decision.

## Gates and refinement review

Local gates for payload changes:
`npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/update-adds-new-payload-skill.sh`.
Use focused project tests in the isolated assessment checkouts. Start long
runs fully awake and use the maintained macOS
[sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
`caffeinate -s -i` on AC, or fully awake with the lid open under
`caffeinate -i` on battery, then inspect the sleep log. Broader hosted checks
follow the normal delivery path.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

Separate slice-plan refinement was unnecessary. Each slice has one
observation boundary: native access, the first report, its transfer, or
managed delivery. The two reports exercise the same assessment rule.
No remaining slice-specific concern was identified beyond the bounded native
probe. The supplier wait is recorded on the story.
