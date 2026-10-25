# Accept original source promises when a plan narrows them

**Identity:** SEED-010#accept-source-promises-after-plan-drift
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#accept-source-promises-after-plan-drift)
**Finding:** [ODF-139](../../../docs/maintainer/findings/ODF-139.md)

## Goal and scope

A developer whose plan narrowed an original story commitment during
preparation, without a human amendment, receives the promised behavior or an
explicit human decision before the slice is delivered. Acceptance disposes of
each commitment the fresh source-only reviewer returned, and that comparison
is retained where the existing delivery gate refuses an incomplete one. A plan
Current decision, slice text, proof row, implementer statement or
owner-decision label is no disposition.

Included: an addressable retained reviewer return per execution; one recorded
disposition per returned commitment before a slice's delivery (observed with
its location, receiving a named later slice, or excluded by a quoted story
exclusion or human amendment); the existing story-obligations gate refusing an
unallocated or plan-justified commitment; a controlled replay of the recorded
plan 412 drift and of a legitimate human amendment, credential-free first and
then native and developer-run; the ODF-139 record with the assessment,
response revision, replay outcomes per host, burden, release state and
first-use criterion.

Excluded (the story's deferred promises): a planning-side check of Current
decisions against Scope; a reviewer that reads product code; a semantic
completeness checker or second promise registry; repairing historical
products; release or cross-project rollout; any compliance or rate claim.

Assumptions: the reviewer's numbered return is the unit of comparison; the
coordinator still judges applicability and observation; native rounds are
paid and developer-run; a controlled replay establishes the seam under the
current host CLIs, not a rate.

## Existing solutions and architectural direction

PFE: the comparison the story needs already has every part except the record
and the gate.

- [Accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof)
  already obtains a fresh source-only reviewer, requires retaining its
  launch and returned commitments, and prescribes the trigger → expected →
  actual → owner comparison. The change makes the return addressable and the
  comparison a required record; it does not add a second reviewer.
- The [story obligations](../../../src/skills/dough-execute-plan/references/story-obligations.md)
  record, its [script](../../../src/skills/dough-execute-plan/scripts/story-obligations.mjs)
  (closed disposition set, quotes checked word for word against the selected
  story section, `check --slice N`, `check --completion`,
  `check --planned-completion`) and the delegation, delivery and completion
  gates that run it are the reuse point. A plan quote already fails
  `quote-not-in-story`; a receiving slice must be later and must resolve.
  The change teaches the check to read the retained return and require a
  disposition per commitment.
- Plan 335 retained its reviewer returns at `/root/source_review1` and
  `/root/source_review2`, outside the plan and unaddressable; plan 353
  retained its inputs beside the plan under `plan-350-inputs/`. The retained
  return goes beside the plan, published with it.
- The delivery-evidence native families `original`, `terminal` and `release`
  (`tests/support/delivery-evidence-*-native-{scenario-content,observe,assess}.sh`,
  registered in `delivery-evidence-native-cases.sh`, prompted by
  `delivery-evidence-native-prompt.sh`, listed in
  `tests/delivery-evidence-native-routing.sh`, documented in
  `tests/native-publication.md`) already replay a narrowed plan with a
  retained story, implementation return and green narrowed tests, retain the
  raw host stream, product observation and planning state, and judge through
  a declared-signal assessor with counterexamples. `terminal` already carries
  an `amended-corrected` scenario with an explicit human amendment. The new
  case follows that family exactly.
- Accepted ADRs: [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (empiricism, proportionate burden), [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  (edit `src/skills/`, release separately), [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  (native proof per tool, no cross-host inference), [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  (guidance addresses the executing agent), [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  (judge the response against the stated baseline with its costs). No
  exception and no North Star topic.

## Preparation observations and decisive premises

Observed in this workspace on 2026-10-25 (Darwin arm64, base `4f0bd829`,
Bash 5.3 via `PATH="/opt/homebrew/bin:$PATH"`, Node per `.node-version`);
the workspace holds no scratch edit.

1. **The seam is recorded, not inferred.** Pygardon preparation transcript
   `acbe4a07-d804-4326-806b-1c596d60ade1.jsonl` and execution transcript
   `d58b1268-37e4-45c0-afad-9b29bdf11f2c.jsonl` under
   `~/.claude/projects/-Users-terryyin-git-pygardon--worktrees-review-a-reproducible-entry-decision-with-clear/`:
   the planner wrote the six-reason Scope (12:00Z) and the narrowing plan
   (12:08Z) with no rationale and recorded `ready` with zero reasons; one
   story-level reviewer (`subagents/agent-afd89984b5e375432.jsonl`, launched
   at line 238) returned commitment 4a with all six filters as sub-bullets;
   the coordinator's retained summary (line 347) kept "held, ordered"; the
   slice 4 brief (line 989) forwarded the plan's narrowing as an instruction;
   acceptance (line 1022) was one sentence naming key example 3;
   `story-obligations.mjs check --slice 4` answered `entryCount: 0`. No human
   message amended the story. The coordinator never wrote a per-commitment
   comparison, and nothing refused its absence.
2. **The original inputs are recoverable.** Pygardon clone
   `/Users/terryyin/git/pygardon`: story section and plan 412 at
   `c50b14d6d^` (`.planning/seeds/SEED-145-entry-autonomation.md#story-reviewable-entry-decision`,
   `.planning/slice-plans/412-reviewable-entry-decision/PLAN.md`), correction
   plan 417 at `a586580f1^`, correcting commit `98aa51724`; slice 4
   implementer return at execution transcript line 1010; DD-354 at
   `d52a15b73:docs/process-findings/proof-and-acceptance.md`.
3. **The acceptance contract has not changed at the seam.**
   `git log v0.3.67..HEAD -- src/skills/dough-execute-plan/references/wrap-up.md`
   lists only consumer-trace, reused native proof, host-headroom and
   delivery changes; the comparison paragraph is the 0.3.67 text. Installed
   `.claude/skills/.../wrap-up.md` equals `src/skills/.../wrap-up.md`.
4. **The reviewer's return is not addressable as returned.** The returned
   list numbered commitments (4a) but listed compound items as unnumbered
   sub-bullets; the reviewer instruction must ask for one id per item.
5. **The plan reader tolerates an added slice line, except after `Proof:`.**
   `readPlanSlices` on a scratch plan text with `Commitments:` after `Proof:`
   folded it into `proof` continuation (`"proof":"p\nCommitments: …"`); a
   line placed before `Proof:` is ignored. The comparison record therefore
   lives in the retained return file, not in slice entries.
6. **Credential-free routes run here.**
   `bash scripts/test.sh tests/delivery-evidence-original.sh` passed quietly
   in 2.0 s; `bash scripts/test.sh tests/delivery-evidence-native-routing.sh`
   passed in 3.8 s (fixture creation, installer, unknown-case refusal exit 2).
7. **Host CLIs are present:** `claude` 2.1.310, `codex` 0.163.0,
   `cursor-agent`, at `~/.local/bin`. Presence settles nothing about paid
   follow-through; slice 1's developer-run round is the probe.
8. **Payload declaration.** `install.sh` declares
   `dough-execute-plan/scripts/story-obligations.mjs`,
   `story-obligation-reader.mjs`, `references/story-obligations.md`,
   `wrap-up.md` and `delegation.md`; test fixtures and `tests/` are not
   payload. `tests/payload-declaration-links.sh` checks relative links.
9. **Guidance tests pin navigation, not wording.**
   `story-obligations-guidance.test.mjs` asserts the Accept proof section
   links `story-obligations.md`, the delivery step runs `check --slice N`,
   and completion runs `check --completion`; wording edits must keep those.

Remaining paid premise, bounded by slice 1: that the controlled `narrowed`
fixture reproduces the plan-scoped acceptance under the current guidance on
the observed host. Its cheap prefix (fixture, discriminator, dispatcher) is
observed above; the round itself is developer-run.

## Outside-in proof ownership

| Promise (story) | Owner | Observable result |
| --- | --- | --- |
| Example 6: baseline reproduces (or records non-reproduction) | 2 (pre-change prerequisite) | One Claude `drift/narrowed` attempt at the slice 1 candidate before slice 2's delegation; retained stream, product observation and acceptance outcome inspected; a non-reproduction stops slice 2 and reassesses this plan |
| Controlled discriminator: narrowed product contradicts the source while its tests pass; corrected and amended controls satisfy it; assessor rejects quote-only, plan-decision and unchanged-accepted outcomes | 1 | `tests/delivery-evidence-drift.sh`, `tests/delivery-evidence-native-routing.sh`, `tests/native-evidence-identity.sh` green through `scripts/test.sh` |
| Example 1 (gate): 4a's held and ordered items lack a disposition → delivery refused | 2 | `story-obligations.mjs check --slice 4` on the reconstructed plan 412 record exits 1 naming the commitment ids; after `return` or `receiving slice N` it passes |
| Example 4: a plan statement is no disposition | 2 | `excluded "<Current decisions text>"` is refused `quote-not-in-story`; the refusal names the commitment |
| Example 3: later owner | 2 | `receiving slice 7` accepted at slice 1; `check --slice 7` refuses while open |
| Example 5: sufficient reused proof | 2 | An id observed at slice 2 keeps its recorded location; `check --slice 4` requests nothing for it |
| Delegation carries allocated commitments; completion refuses an unobserved id | 2 | `list --slice N` returns the slice's allocated ids; `check --completion` refuses an id with no observation or closed disposition |
| Example 1 (native) and example 2: correction catches the drift, preserves the amendment | 3 | Claude `drift/narrowed` withholds or returns the two reasons with the retained comparison and gate refusal, product unchanged; Claude `drift/amended-corrected` proceeds with the quoted amendment; Codex and Cursor `narrowed` rounds recorded per host |
| Example 7: completion record | 3 | ODF-139 names the assessment, response revision, outcomes and limits per host, records and rounds added, release state and first-use criterion; no effectiveness claim |

Each slice runs its focused checks through `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh <paths>` (DD-330: env and quiet-pass rule), the consumer-trace record for changed contracts, and `tests/payload-declaration-links.sh` when guidance links change. No whole-suite local gate is added; CI runs after publication.

## Ordered slices

### 1. A controlled replay of the plan 412 drift discriminates narrowed from amended acceptance
Type: Behavior
Status: done
Proof: `tests/delivery-evidence-drift.sh` proves the narrowed product's excluded list lacks `already_held` and `already_ordered` while its narrowed tests pass, the corrected and amended-corrected controls list them or quote the amendment, and the assessor rejects each declared counter-signal; routing and evidence-identity tests stay green.

Behavior: Given the recovered SEED-145 story section, a plan excerpt carrying
slice 4 and the Current decision "held and ordered symbols stay in history",
the slice 4 implementation return, and a small product whose decision assembles
`excluded_candidates` from filter outcomes only (five dimensions) with green
narrowed tests, when a coordinator applies the installed acceptance workflow,
the retained evidence shows whether acceptance compared commitment 4a's held
and ordered items or accepted the plan's scope.

Register `drift` in `delivery-evidence-native-cases.sh` with scenarios
`narrowed` and `amended-corrected` (basis "explicit review of original-story
acceptance"); add `delivery-evidence-drift-native-{scenario-content,observe,assess}.sh`,
the prompt branch, fixtures under `tests/fixtures/delivery-evidence/drift-*`
(story section verbatim from `c50b14d6d^`, plan excerpt, return, amendment
text deferring the two reasons to the history story), the routing-test entry
and the `tests/native-publication.md` paragraph. Observe the product through a
JSON observation of the excluded list per scenario; declare assessor signals
for review completion, native acceptance, product and workflow inspection,
reviewed disposition (`withheld`, `corrected-accepted`, `amended-accepted`)
and the retained per-commitment comparison, with counterexamples for
quote-only, plan-decision-as-exclusion, unchanged-accepted and fabricated
amendment. Neither prompt nor fixture names what is missing.

### 2. Acceptance disposes each returned commitment through the obligations gate
Type: Behavior
Status: done
Proof: focused `story-obligations*.test.mjs` cases cover the addressable return, allocation, observation, `Commitment:` reference, refusals (unallocated id, plan quote, open receiving at its slice, unobserved id at completion) and the listing; a reconstructed plan 412 record refuses slice 4 until the two reasons are returned or received and accepts the amended control; `tests/payload-declaration-links.sh` and the guidance test stay green; the `drift` fixture installs the candidate guidance; the pre-change baseline round below is retained and inspected before delegation.

Behavior: Given a retained reviewer return in which every commitment and list
item has an id, when the coordinator runs the obligations check before a
slice's delivery, every id allocated to that slice has a recorded observation
location or an obligation entry with a valid disposition, every id has an
allocation, and a disposition quoting the plan is refused; delivery proceeds
only then.

Pre-change prerequisite, before this slice's delegation (developer-operated
observation; question: does the current guidance reproduce the plan-scoped
acceptance on the slice 1 fixture?). One round, Claude Code, the observed
host, at the slice 1 candidate:
`PATH="/opt/homebrew/bin:$PATH" delivery_evidence_only_scenario=narrowed native_case_deadline=300 native_case_grace=15 bash tests/git-publication-native.sh --native claude --case delivery-evidence/drift --results-dir <ROOT>`
(without the `delivery_evidence_only_scenario` prefix the dispatcher also runs
a paid `amended-corrected` attempt). The developer runs it because it is
paid; retain host, command, attempt id, raw stream, product observation and
acceptance outcome in this plan. Reproduction (accepted plan-scoped result, or
detection without a retained comparison or gate) keeps this slice as planned;
detection with a retained per-commitment comparison is non-reproduction: stop
this slice and reassess this plan. An unavailable route or credential stays
stopped with its owner.

Baseline observed 2026-10-25 (developer-authorized in session, run by the
coordinator): Claude Code, the command above with
`--results-dir ~/.claude/jobs/ad4cfde7/tmp/drift-baseline`, candidate
`d9b6b835`, attempt `20261025T110320-4c3b`, one round, harness judgment
`review-required` (exit 1, as the family requires). Retained beside this plan
at [baseline-claude-narrowed-20261025T110320-4c3b/](baseline-claude-narrowed-20261025T110320-4c3b/)
(`events.jsonl` raw stream, `product-observation.json`, `acceptance-outcome.md`,
`final-product/.planning/acceptance-evidence/slice-4-source-review.md`,
`final-product.diff`). Coordinator inspection: the host's own source review
returned item 21 naming "already held, or already ordered" among the listed
filters, yet `acceptance-outcome.md` accepts "Already held and already ordered
… stay in `history` … matching the plan's Current decision"; the product's
excluded list still lacks both and no obligation or gate names them. The
outcome is `incomplete` only for an unrelated discovered gap (G1: the
excerpt's slice 4 frontend `Record` labels have no product surface).
Result: **reproduction** (plan-scoped acceptance of the narrowed commitment
without a per-commitment comparison or gate); this slice proceeds as planned.

Edit `src/skills/` only. In `wrap-up.md` Accept proof: instruct the reviewer
to number every commitment and each item of a listed compound commitment;
retain the return beside the plan as `source-review.md` linked from the plan
by `**Source review:**`; at the first acceptance allocate each id to the slice
whose output owes it, or record its obligation (receiving, excluded with a
story quote, owner changed); at each acceptance record the observed location
per id or an obligation; state that a plan Current decision, slice text, proof
row, implementer statement or owner-decision label is no disposition. In
`delegation.md`: the listing carries the slice's allocated ids. In
`story-obligations.md`: the record form of `source-review.md` (one line per
id: text, allocated slice, observation or obligation id), the optional
`Commitment:` field on an entry, and the new refusals. In
`story-obligations.mjs` and the reader: read the linked return, check
allocation, per-slice observation, `Commitment:` references and completion.
Keep the three existing fields and dispositions; plans without a linked
return keep today's behavior. Update `planning.md` only where it links the
record format. Run the AGENTS.md behavior-review walkthrough (invocation,
required context, useful outcome including the human conflict) on the edited
acceptance text.

### 3. Native replay proves the correction catches the drift and preserves the amendment, recorded at ODF-139
Type: Behavior
Status: done
Proof: retained attempts show Claude `drift/narrowed` withholding or returning the two reasons with a retained per-commitment comparison and actual gate refusal while the product stays unchanged; Claude `drift/amended-corrected` proceeding with the quoted amendment and no invented work; Codex and Cursor `narrowed` rounds recorded per host; stream replay green; ODF-139 updated.

Behavior: Given the slice 2 candidate installed into the `drift` fixtures,
when the developer runs the named rounds, each retained attempt's raw reviewer
launch and return, `source-review.md`, obligations, gate result, product
observation and acceptance outcome are inspected by the coordinator, and the
finding records the actual response and its limits.

Developer-operated observation. Rounds, all named now: Claude `narrowed`,
Claude `amended-corrected`, Codex `narrowed`, Cursor `narrowed`, each one
attempt with the slice 1 command template, candidate `HEAD`, deadline 300 and
grace 15; diagnose a failed or inconclusive attempt before any retry, and
retry only with a stated explanation. The developer runs them because they
are paid; the coordinator inspects every retained attempt before accepting it
and adds the maintained streams to the corpus for `tests/native-stream-replay.sh`.
A missing host round is a recorded limit, not a claim. Then update ODF-139:
the recovered assessment (plan 412 facts above), the actual response revision,
the containing release (pending unless evidenced), each attempt's outcome and
limit per host, the burden observed (records written, rounds added, coordinator
inspection), the first ordinary-use criterion (first eligible acceptance after
adoption whose plan narrows a returned commitment), and no effectiveness claim.
Run `tests/payload-declaration-links.sh` and the focused checks. No release or
rollout is authorized.

## Execution complete

Product advice: execute correction plan
[356](../356-source-review-record-lifecycle/PLAN.md)
(SEED-010#source-review-record-lifecycle) before releasing this response, so
the shipped gate refuses an omitted or mislinked source review and allocation
timing no longer blocks delegation; then release and watch the first-use
criterion recorded at ODF-139. Keep the planning-side Current-decisions check
deferred until that first ordinary use, as the story states; the Cursor limit
needs no new story now.

## Current decisions

- One retained comparison record per execution: the reviewer's numbered
  return at `<plan dir>/source-review.md`, linked from the plan as
  `**Source review:**`, carrying per id the source text, allocated slice and,
  once accepted, the observation location or the obligation id. It is the
  existing retained return with the comparison columns the contract already
  prescribes, not a second registry; obligations keep the gaps.
- Dispositions stay the existing closed set. A plan quote fails the existing
  `quote-not-in-story` refusal; the new refusals are `unallocated-commitment`,
  `unobserved-commitment` at the allocated slice or completion, and a
  `Commitment:` reference to an unknown id.
- Allocation happens at the first acceptance that has the return, usually
  slice 1, and is corrected at any later acceptance; a false later-slice
  allocation is caught at that slice.
- Hosts: Claude Code is the observed host and runs both scenarios; Codex and
  Cursor run `narrowed` as representative follow-through under ADR 0005; no
  cross-host inference.
- Paid native rounds are developer-run with their question, rounds and steps
  named in the slice (memory: paid tests are manual only); the coordinator
  never launches them.
- Guidance edits in `src/skills/dough-execute-plan/`; installed copies are
  not hand-synchronized (AGENTS.md). Tests run through `scripts/test.sh` with
  Bash 5 first on `PATH`.
- Fixture texts are verbatim recoveries from the Pygardon clone at the SHAs
  above; the product is a controlled reconstruction of the excluded-list
  boundary, not the historical product.

## Learnings

- Preparation: the plan reader folds any line after `Proof:` into the proof
  text, so slice entries are not the place for a commitments line.
- Slice 1: guarded delivery marks the delivered slice `done`, so the paid
  baseline round moved from slice 1's proof to slice 2's pre-change
  prerequisite (it is the baseline slice 2's change invalidates); its
  question, command and stop rule are unchanged.
- Slice 1: `tests/git-publication-native.sh` has no scenario flag; the
  `delivery_evidence_only_scenario=narrowed` environment prefix selects one
  scenario (route confirmed by inspection, not executed).
  `delivery_evidence_source_acceptance_prompt` now takes the slice number
  (default 3, other families' prompts byte-identical); `drift` passes 4.
- Slice 1 accepted proof (reusable while the harness files are unchanged):
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/delivery-evidence-drift.sh tests/delivery-evidence-native-routing.sh tests/native-evidence-identity.sh tests/delivery-evidence-terminal.sh tests/delivery-evidence-original.sh tests/delivery-evidence-release.sh tests/native-stream-replay.sh tests/proof-scheduling-native.sh tests/payload-declaration-links.sh`
  passed quietly; observations are the assertions in
  `tests/delivery-evidence-drift.sh` and
  `run_delivery_evidence_drift_assessor_counterexamples`.
- Baseline: the `narrowed` fixture's plan excerpt keeps slice 4's frontend
  `Record` label behavior, which the reconstructed product has no surface for,
  so a native acceptance can withhold slice 4 for that unrelated reason. Slice
  3's review must judge the disposition basis per commitment (held/ordered),
  not the overall withheld outcome; the fixture stays unchanged for baseline
  comparability.
- Slice 2 acceptance (source review reused, story unchanged), per returned
  id → observation: S4a–S4c, S5, S6 → `wrap-up.md` Accept proof (numbering,
  `source-review.md` beside the plan, reuse, fresh review after amendment);
  S7, S7a–S7c, S8a–S8e, S9a–S9b → `wrap-up.md` comparison paragraph and
  `story-obligations.md` "Record the source review";
  S10a, S11 → `unallocated-commitment` / `unobserved-commitment` in
  `story-obligations-source-review.test.mjs`; S10b, X1, K4 →
  "the plan's Current decision is no exclusion for the returned items"
  (`quote-not-in-story` naming 21.5, 21.6); S12a–S12b → unchanged
  existing tests; S13a–S13b → no new store or checker (record is the
  return file); S14a, K3 → "a named later receiver …" and "the traceability
  commitment is received at slice 1 …"; S14b, K2 → "the amended control …";
  S14c, K5 → "a commitment observed at slice 2 needs nothing at slice 4";
  K1a–K1e → "slice 4 is refused for the held and ordered items …" (all in
  `story-obligations-drift-replay.test.mjs`, built from the slice 1
  fixtures). S20a–S20b native follow-through is slice 3's. Limits accepted
  under S13b: `observed:` text is not quote-checked; a stale return after an
  amendment is caught by guidance only; row/`Commitment:` consistency is not
  enforced.
- Slice 2: plan 354 does not link its own `source-review.md`; this
  execution's gates run the installed (released) script, so the link would
  change nothing until release. Published-guidance example links to
  non-payload files must be prose (`tests/payload-declaration-links.sh`
  reads fenced links too).
- Slice 3 (developer-authorized in session, run by the coordinator at
  `795a01a7`, `--results-dir ~/.claude/jobs/ad4cfde7/tmp/slice3`): Claude
  `narrowed` caught the drift (gate `open-obligation` naming 3.1.5/3.1.6,
  human-judgment stop); Claude `amended-corrected` disposed the two items
  `owner changed` with the quoted amendment; Codex `narrowed` caught it
  (returned to slice 4, gate refused); Cursor `narrowed` timed out at 300 s
  (stream truncated, no outcome), was retried once at 900 s on the stated
  workload explanation, and did not catch it: `observed: … in history` cells
  passed the structural gate. Each attempt's outcome, source review, plan,
  gate checks and product observation are retained in
  [slice3-attempts/](slice3-attempts/); streams joined the replay corpus.
  ODF-139 records outcomes, limits, burden and the first-use criterion. The
  Cursor result is a recorded limit of the story's no-semantic-checker
  boundary; changing guidance in response is a new decision, not this plan's.
- Slice 3 G1 (developer decisions in session): first "strengthen and rerun":
  `story-obligations.md` Observe and `wrap-up.md` now say an observed location
  must show the commitment's own expected result; Cursor (`20261025T125143-579f`,
  900 s) read it and still recorded `observed: … (history per plan Current
  decisions)`; Claude (`20261025T125133-5458`, 300 s) still caught it but its
  stream truncated before an outcome file (not added to the corpus). Then
  "accept as Cursor limit": the story carries the developer's amendment and
  G1 is `owner changed`. Both runs installed the working tree on top of
  `795a01a7`; their `installed-inputs.sha256` matches the committed
  `wrap-up.md`, and the coordinator's launch-time hash of the working-tree
  `story-obligations.md` (`0309cc10…`) matches `4fd5aac5` (the capture does
  not include that file; correction plan 356 adds it).
- Slice 3 acceptance against the fresh review: S5f/B4 → all rounds
  developer-authorized; S5g → caught on Claude (`20261025T121735-5d5d`, gate
  refusal) and Codex (`20261025T122722-3426`), H1a–H1c → Cursor recorded not
  caught (`20261025T123854-77a9`, `20261025T125143-579f`), G1 `owner changed`;
  S5h, K2 → Claude amended-corrected `owner changed` with the quoted
  amendment; S6a–S6g, K7, H1d → ODF-139 section "Bounded response — numbered
  commitments through the obligations gate"; D5, S6g → no rate or
  effectiveness claim. `native-stream-corpus-add.mjs` drafted
  `last-start-line: 635` for the Cursor `125143-579f` entry because its
  repeated identical gate commands matched an earlier line; corrected to 1050
  by inspection (replay green).
- Execution start: the fresh source-only reviewer's return is retained at
  [source-review.md](source-review.md) (ids S1–S26, X1–X6, A1–A5, K1–K7);
  slice 2 gives it its linked record form.

## Story obligations

### G1. Cursor accepted the narrowed replay through a contradicting observation
Reported: slice 3 — "Discovered in acceptance of Cursor attempt 20261025T123854-77a9: source-review rows 13.5/13.6 (already held/ordered) were recorded observed in history, the gate passed and slice 4 was accepted with the plan-scoped product."
Story clause: "The correction catches the former and proceeds on the latter."
Disposition: owner changed "Cursor follow-through is a known limit of this structural response."

## Plan concern review

Slice-plan refinement was not needed: each slice owns one proof loop, slice 1
is the authorized early probe for the one paid premise, slice 2 is the
behavior it bounds, and slice 3 is the native proof and record of the same
outcome; no slice combines independent postconditions. This review identified
no remaining slice-specific concern. Interim behavior: none; slice 1 adds
tests and fixtures only, slice 2 leaves plans without a linked return
unchanged.
