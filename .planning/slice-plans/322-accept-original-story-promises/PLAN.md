# Accept slices against the original story promises

**Identity:** SEED-010#accept-original-story-promises
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#accept-original-story-promises)
**Finding:** [ODF-139](../../../docs/maintainer/findings/ODF-139.md)

## Goal and scope

Derive current applicable promises from original story and human amendments
before comparing plan, return and product proof. Omitted promises still need
correction, legitimate remaining ownership or a human decision before dependent
delivery. Preserve sufficient proof, genuine boundaries and all six examples.

No second obligation registry, semantic checker, historical product repair,
general reliability claim, rollout or sibling work. Unknown release/adoption
stays explicit at ODF-139.

## Current decisions and reuse

- Existing owner: [Accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof).
  Derive original applicable promises before comparing the return; named-gap
  checks alone cannot establish discovery of an omitted promise.
- Reuse [story obligations](../../../src/skills/dough-execute-plan/references/story-obligations.md),
  delegation, correction, delivery and completion. Keep source-to-slice/proof
  comparisons in this plan; no competing store or semantic quote checker.
- PFE: planning's proof mapping and retrospective's original-intent review help
  locate evidence, but neither replaces pre-delivery acceptance. Preserve these
  owners; inspect linked delegation/proof guidance only for consistent entry.
- Reuse `tests/support/delivery-evidence-*` native adapters, retention and explicit
  assessment. Existing gap fixtures disclose omissions; original-story probes
  need full source and neutral requests without supplying the missing promise.
- Follow [AGENTS.md](../../../AGENTS.md): edit `src/skills/`, never managed copies.
  Accepted ADRs: [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (cohesion/empiricism), [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  (source/release), [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  (native versus harness proof), [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  (one executing-project rule). No exception or North Star change is needed.

## Outside-in proof ownership

| Source promise | Owner | Observable result |
| --- | --- | --- |
| Example 1: readiness original example defeats narrowed plan sentence | 3 | Native acceptance identifies the contradictory supplier-resolution result, withholds it and returns original behavior/proof before delivery. |
| Example 2: terminal result labels absent from both plan and return | 3 | Acceptance independently finds both missing qualifications from Scope; green subset assertions do not clear them. |
| Example 3: release fields and both status journeys | 3 | Each original commitment reaches an applicable owner and actual product observation; an owner-decision label cannot erase an existing promise. |
| Example 4: legitimate later owner, exclusion, explicit human amendment | 3 | Controls keep the early slice bounded, cite the real owner/decision, and do not invent work or drop a remaining promise. |
| Example 5: sufficient reused proof and reported gaps | 3 | Sufficient case proceeds without blanket reruns or format-only changes; reported-gap correction retains existing ownership and independent accepted evidence. |
| Example 6: unavailable proof or disputed decision | 3 | Exact dependent promise remains incomplete with missing evidence/decision named; independent proof is preserved. |
| Representative native follow-through and honest limits | 1/2 establish baseline; 3 owns final outcome | Native trace and resulting acceptance/obligation state agree; quotes, records and helper exits alone cannot pass. |
| Response provenance, release/adoption and uncertainty at ODF-139 | 3 | Finding names actual response revision and observations; first release/adoption is evidenced or explicitly pending. |

Assess the three retained failures against the source revisions cited in
ODF-139, preserving their decisive contradictions. Reconstructed small fixtures
are controlled replays, not claims to rerun the historical products. Include
corrected/sufficient, later-owned, excluded/human-amended, unavailable-proof and
reported-gap controls; equivalent controls may share one fixture when they
observe the same boundary. Reject an assessor that passes a quote-only outcome,
a fabricated obligation, or accepting the narrowed product unchanged. Preserve
actual state and command evidence for review, not merely word recognition.

## Decisive premises and preparation observations

Checkout: `/Users/terryyin/git/open-dough/.worktrees/accept-slices-against-the-original-story-promise`;
base `a42e5a51b3063ace98f56c40f8055d57ac64f391`, 2026-10-20.

- Historical source/product revisions remain at ODF-139; they establish the seam,
  not reproduction on today's hosts. Inspected acceptance, obligations,
  executable-proof and gap helpers; their disclosed gaps do not prove discovery.
- Ran the existing obligation and assessor control operations with:
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-cross-slice.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-completion.test.mjs tests/native-assessor-counterexamples.sh`.
  Passed: mechanical control route only, not native semantic acceptance.
- The default shell is Bash 3.2; `/opt/homebrew/bin/bash` supplies Bash 5.
  Version commands completed:
  `codex --version` → `codex-cli 0.163.0`; `claude --version` →
  `2.1.304 (Claude Code)`; `agent --version` → `2026.10.18-ea085cb`.
  Version commands do not prove authenticated native follow-through.

## Execution context

- Established start (2026-10-20): publisher `dashboard-territory.local-open-dough`,
  agent `viktor-chan`, Story Branch Mode in the named checkout above, reused branch
  `codex/accept-slices-against-the-original-story-promise`. Claim
  `39256f40f54cbdccf1fc963fbffbcb06f56d4aea` accepted on `origin/main`, starting
  revision `27a67521159eec5dbb63d6af63a0205596c3b0f8`; no second start/claim.
  Increments publish that branch to `origin` (`terryyin/open-dough`).
- Setup: Node `24.21.0` matches `.node-version`; `PATH="/opt/homebrew/bin:$PATH"
  node scripts/setup-native.mjs npm`, `browser`, and `check` passed against this
  lockfile. Chromium `153.0.8010.12` launched/closed. Tests use Bash 5 and the
  runner. In-scope refinement is authorized; no numeric slice limit is supplied.
- CI `ci.yml` / `CI` verified by `node .agents/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs workflow terryyin/open-dough`.
  Branch observer: coordinator `viktor-chan-accept-promises`, directory
  `/tmp/dough-ci-501/watch-q1pFUs`, PID `29073`, session `77728`, cell `12`.
  The trunk claim's CI is unobserved. Slice 1 had zero obligations on entry;
  coordinator owns acceptance, refactoring, formatting, commits and publication.
  Slice 1 accepted on this branch at `02f53118f1da73de68c78485b559af130aa90b84`,
  suffix base `39256f40f54cbdccf1fc963fbffbcb06f56d4aea`; observation reused.

## Ordered slices

### 1. Establish a native acceptance replay that can expose an unreported promise
Type: Behavior
Status: done
Proof: A bounded native run reaches acceptance with original story, narrowed
plan and return, and inspectable product proof; its observed disposition is
compared with a corrected control without supplying the answer in the prompt.

Behavior: Given the retained readiness contradiction and current guidance,
when an isolated native session receives the ordinary acceptance task, the
maintainer obtains a supported reproduction or an explicit non-reproduction /
unavailable route result before investing in the remedy.

Recover historical inputs into delivery-evidence. Exercise product commands and
assessor counterexamples through the runner before paid use. The failing product
must contradict the source while narrowed proof passes; correction satisfies it.
Use current native CLI adapters and candidate installation. Select Claude Code
first because all three retained later failures name that host; use the existing
bounded supervisor and one initial attempt, investigating a failed or inconclusive
attempt before any retry. Retain candidate, host/runtime, source inputs and
observed acceptance/correction state in this plan during execution.

Stop dependent remedy work for answer leakage, unreachable/unobservable
acceptance or non-reproduction. Revise mechanism/proof on evidence; a passing
baseline cannot show improvement. Unavailable credentials/owner steps stay stopped.
The probe bounds the paid premise; it grants no separate launch authority.

### 2. Establish acceptance of a wholly omitted terminal qualification
Type: Behavior
Status: done
Proof: the original terminal Scope, a green narrowed record/check and a neutral
native acceptance request produce an inspectable disposition of both omitted
qualifications. A corrected deterministic control satisfies the source.

Behavior: Learn whether acceptance finds promises absent from plan and return.
Readiness's detected inverse does not settle silent omission; preserve that baseline.

Recover Pygardon's selected story at `cdc136edf`, plan at `cffbd3264`, and
`replacement.json` / `check_replacement.py` at `fe322751e` (paths at ODF-139).
Use the full selected source and the real six-label set; retain the missing
current/not-point-in-time and no-live-readiness qualifications without naming
them in the request. Reconstruct only the record-producing/acceptance boundary,
not the research computation. Preserve real later owners and exclusions.
Reuse the original-family native adapters/retention and explicit reviewer.
Exercise narrowed/corrected output and assessor controls before one bounded
Claude run. Inspect product, commands and acceptance; diagnose before retry.
Record reproduction, non-reproduction or unavailable route. Missing/disputed
source stops dependent work; passing baseline cannot establish improvement.
Select further proof and remedy from this result.

### 3. Accept applicable promises independently of the plan and return
Type: Behavior
Status: planned
Proof: applicable original promises reach real correction/ownership before
acceptance; readiness, terminal, release and unchanged controls discriminate the
common rule. Mechanical regression proof remains green.

Behavior: Derive promises from original Goal/Scope/examples/exclusions and human
amendments before comparing plan/return/proof. Slice 2 supports source-to-current-
output ownership; preserve readiness non-reproduction and historical counterevidence.
No-change retains evaluation limits; passing baseline cannot prove a fix. Reuse
acceptance and obligation/correction/delivery/completion; no parallel registry.

Evaluate all three historical cases and mapped controls through neutral prompts.
Preserve real later ownership, exclusions, human amendments, sufficient reused
proof, reported gaps and unavailable-proof stops. At least one trace must show
source discovery followed by a correction handoff or withheld dependent delivery;
a corrected native case must subsequently proceed. Inspect actual product/proof
and obligation state. Use representative native runs or justified reuse per
affected requirement on Codex, Cursor and Claude; no cross-host inference.
Missing native proof remains unfinished and blocks affected release.

After independent refactoring, run focused affected checks through `scripts/test.sh`
with Bash 5 first on PATH: the existing obligation/control checks, new fixtures/
assessors, shared routing/evidence/stream consumers. Run payload-declaration-links
if runtime links/dependencies change. Apply AGENTS.md's invocation/context/outcome
walkthrough including human conflict. Follow ordinary agent delivery and CI;
no whole-suite local gate is added. Update ODF-139 with actual response revision,
positive/counterevidence and limits; containing release/adoption remain pending
unless evidenced. No release or cross-project rollout is authorized.

## Sizing and safe stopping

Three loops: readiness counterevidence, silent-omission probe, supported acceptance.
All examples exercise one acceptance responsibility. No numeric limit is supplied;
stop only affected work for unavailable evidence or a source decision.

## Learnings

### Readiness baseline (2026-10-20; slice 1)

Recovered story/plan `2f56bd2a`. Narrowed legacy output shows the indicator while
four tests pass; corrected control removes it without losing legitimate flags.
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/delivery-evidence-original.sh tests/delivery-evidence-native-routing.sh tests/native-evidence-identity.sh tests/git-publication-native.sh`
passed after independent refactoring. Assertions inspect actual output, routing
and original/aggregate retained artifacts. Existing obligation/helper checks also
passed on unchanged boundaries. Reviewed corpus replay passed via
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/native-stream-replay.sh`.

Native command: `PATH="/opt/homebrew/bin:$PATH" native_case_deadline=300 native_case_grace=15 bash tests/git-publication-native.sh --native claude --case delivery-evidence/original --results-dir /tmp/open-dough-accept-original-promises-baseline-20261020`.
Candidate `39256f40`, Node24.21.0, Claude2.1.304/claude-opus-5-5 (raw init).
One attempt completed0; wrapper1 requests review. Evidence at
`/tmp/open-dough-accept-original-promises-baseline-20261020/claude/delivery-evidence/original/narrowed/20261020T003057-479a`;
reviewed outcome, calls/reads, original/final state, actual product and proof.
Current guidance found the inverse contradiction, retained three valid promises,
and withheld delivery pending plan/story resolution. Product stayed wrong and
4/4 tests stayed green: no corrected acceptance or obligation gate was observed.
A failed unquoted consumer search is bounded by the tracked file list/full reads.
Readiness did not reproduce; it is contrary evidence, not improvement proof.

### Terminal baseline (2026-10-20; slice 2)

Full selected story `cdc136edf59886605052ea309481cc4b9636ea23`, plan `cffbd3264732056b32727b2bfae655812d99e7de`,
record/check `fe322751e0d6ad84db218d878f44b1f99ade6399`. Full source body and
precomputed fields verified against Git. Check compares prose dynamically to JSON
labels; six is observed, not a rejection constraint. The controlled producer
publishes summaries, not a rerun of historical research. Corrected control adds
the two qualifications while preserving both arms, all numbers and other labels.
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/delivery-evidence-terminal.sh tests/delivery-evidence-original.sh tests/delivery-evidence-native-routing.sh tests/native-evidence-identity.sh`
passed, including real installed obligation list/check on a valid later owner.
Publication and assessor-guard proof passed before envelope-only edits.

First command: `PATH="/opt/homebrew/bin:$PATH" native_case_deadline=300 native_case_grace=15 bash tests/git-publication-native.sh --native claude --case delivery-evidence/terminal --results-dir /tmp/open-dough-accept-original-promises-terminal-baseline-20261020`.
Attempt `20261020T004835-43eb` accepted six labels without finding qualifications;
its unrelated G1/G2 gate refused because the extracted seed lacked an H1.
Diagnostic repair prepended actual historical H1s, preserved story bodies and
other inputs, and proved the installed gate reads the fixture before retry.
Retry: `PATH="/opt/homebrew/bin:$PATH" native_case_deadline=300 native_case_grace=15 bash tests/git-publication-native.sh --native claude --case delivery-evidence/terminal --results-dir /tmp/open-dough-accept-original-promises-terminal-baseline-envelope-fixed-20261020`.
Attempt `20261020T005224-6019` found both qualifications but assigned them to
later prose and accepted the current JSON unchanged. No obligation or gate ran.
Both sessions: candidate `02f53118`, Claude2.1.304/opus5.5, native0/wrapper1 for
explicit review. Under each results root, inspected `claude/delivery-evidence/terminal/narrowed/<attempt>/`
outcome, original/final product/planning, calls, actual output and final proof:
all precomputed fields and six labels unchanged; dynamic check passes. Neither
run proves correction. First has invalid-envelope limits; second demonstrates
false later ownership despite reading the source's labels-on-every-result clause.
Both raw streams are retained in the maintained corpus with reviewed expectations.
Independent refactor proof passed: `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/delivery-evidence-original.sh tests/delivery-evidence-terminal.sh tests/delivery-evidence-native-routing.sh /tmp/open-dough-refactor-2-before/observation-equivalence.sh`; generated prompts, inputs and observed product/proof state stayed equivalent.
Ordinary JSON formatting preserved the full decoded historical projection; terminal/original/routing checks passed afterward. Corpus replay passed with both terminal streams; slice-2 obligation gate passed with G1 owned by slice 3.

**Decision:** continue slice 3 with source-to-current-output ownership before
acceptance. Discovery alone is insufficient: later prose cannot qualify a
current result already subject to an original promise. Preserve genuine later
owners and the readiness counterexample. This refines the mechanism within the
unchanged source Scope; it is no general reliability claim.

## Story obligations

### G1. Original qualifications wrongly assigned to later prose
Reported: slice 2 — "Repaired-envelope run reproduces false later ownership: Claude found both omitted qualifications, assigned them to slice 4, and accepted the current six-label JSON unchanged."
Story clause: "Compare those promises with slice ownership and observed product proof before accepting delivery."
Disposition: receiving slice 3
