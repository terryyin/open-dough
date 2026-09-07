# Cross-tool validation research — 2026-09-07

**Recommendation:** keep the full inexpensive suite in normal CI and reserve
real Codex, Cursor, and Claude Code sessions for a dedicated backlog
acceptance story. Select its batch by uncovered behavioral claims and changed
dependencies, retain evidence, and automate execution and assessment with
minimal human intervention.

This is research supporting [Accepted ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
and [SEED-007](../seeds/SEED-007-cross-tool-validation.md), not an execution plan.
The [post-acceptance assessment](adr-0005-migration-assessment.md) identifies
concrete migration work; SEED-007 now contains its stories. Read Accepted ADR
0005 for current constraints; earlier options below do not add requirements.
No model-backed tests, credential provisioning, workflow changes, or GSD changes
were performed. The existing acceptance guard remains in force.

## Backlog ownership clarification

The owner refined the recommendation: native behavioral acceptance belongs in
separate product backlog stories, usually outside implementation-story criteria.
An acceptance story can validate several finished stories or answer a feasibility
question before implementation. Keep pending native claims linked to that story;
completion of implementation does not claim native acceptance. The proposed
release boundary remains resolution of required native claims before releasing
the affected behavior. ADR 0005 contains the concise execution constraints; this
report retains research detail rather than defining a separate workflow.
The owner subsequently removed the separate execution-approval process and
runner-placement policy from the ADR: authorization belongs to backlog
prioritization, and automation minimizes human intervention rather than
prohibiting it. Detailed approval and unattended-run recommendations below are
historical options, not additional architectural requirements.

## Method and limits

Inspected Open Dough at `28b153ea31c3337fe1b7466adace83201152990a`, including
working-tree planning material, and the clean sibling GSD Core checkout at
`0be5bf865a6ca8ca6cee5fa9344c35b19d8623ee` (`@opengsd/gsd-core` 1.12.0).
Read runner implementations, selected assertions, retained native evidence,
GSD's CI and relevant test architecture, and current official platform docs.
GSD source links below require the sibling checkout; the commit identifies the
inspected version. Its ADRs are examples, not Open Dough policy.

Ran Open Dough's existing `npm test` once without `--native`: exit 0, 26 shell
scripts, 28 PASS messages and 6 PENDING messages, 15.88 seconds elapsed on this
local machine. Counts are runner messages, not a coverage percentage. The log is
temporarily at `/private/tmp/open-dough-seed007-baseline.log`. This is neither a
CI timing measurement nor a native cost benchmark; no speedup is claimed.

Read-only version/help checks returned Codex CLI `0.144.1`, Cursor Agent
`2026.09.02-c22c1a3`, and Claude Code `2.1.263`. Codex reported a PATH-alias
permission warning while exiting 0. `cursor --version` returned editor
`3.19.13`, whereas `cursor agent --version` returned the agent identity. These
checks establish installed command interfaces, not authentication or native
behavior. No provider credentials were read.

## What Open Dough already has

| Existing mechanism | Evidence | Implication |
| --- | --- | --- |
| Separate default and native modes | [CI](../../.github/workflows/ci.yml), [runner](../../scripts/test.sh), [context checks](../../tests/dough-adr-awareness-context.sh) | Normal CI invokes real shell operations and fixture checks, with no model requests. Its success does not close pending native claims. |
| Real delivery operations in disposable projects | [version/update matrix](../../tests/update-when-needed.sh), [installation boundaries](../../tests/install-refuses-unsafe-topology.sh), [delivery support](../../tests/support/dough-adr-awareness-delivery-to-use.sh) | Preserve these rather than replacing the installer with mocks. Version, copy, refusal, retirement, preservation, and failure cases belong here. |
| Shared behavior plus native launch adapters | [Codex](../../tests/dough-adr-awareness-codex-delivery-to-use.sh), [Cursor](../../tests/dough-adr-awareness-cursor-delivery-to-use.sh), [Claude](../../tests/dough-adr-awareness-claude-delivery-to-use.sh) | Extend the existing shell architecture with small shared orchestration and assessment helpers; no new agent framework is necessary. |
| Multiple sessions inside a single script | The three delivery wrappers launch legacy refusal, update, and fresh use separately | Count sessions, not script invocations. These wrappers currently replay the chain when rerun; independent scenario entry points would avoid unrelated work. |
| Uneven evidence retention | Context checks remove their temporary directory on all exits; delivery wrappers normally remove successes; the Claude delivery wrapper retains failures | Capture results outside scratch storage before cleanup, for passes as well as failures. |
| Stronger proof already demonstrated | [Plan 014 evidence](../quick/014-prove-codex-adr-use/EVIDENCE.md) | It records independent native loading, semantic outcomes, and complete unchanged snapshots on all hosts. Saved traces allowed stronger Cursor/Claude assertions without new sessions. |
| Prompt and assertion weaknesses | Delivery refusal/use prompts state expected contracts, conflicting statuses, and response phrases | Useful for exercising a specified workflow, but weak evidence of independent interpretation. Acceptance prompts should omit the answer; graders own expected facts. |
| Platform-specific isolation | [Codex runner](../../tests/support/native-codex.sh) uses macOS `sandbox-exec`, runtime-path assumptions, and explicit write allowances | It is not a portable Ubuntu CI runner. Its external profile allows more than the fixture root and is not a read-isolation proof; review permissions and discovery contamination before reuse. |

The current context runner is stronger than simple phrase matching: it also
inspects host-specific loading events and snapshots. Nevertheless, matching
expected words cannot by itself distinguish a correct recommendation from a
sentence rejecting that recommendation. Grader validation is part of coverage.

The earlier [agnix evaluation](agnix-evaluation.md) is also relevant. It found
useful syntax defects but substantial noise, plus a zero-file successful scan
of symlinked skills. Prefer narrow format/reference checks and assert a nonzero,
complete inventory. Do not make broad writing heuristics a required gate or
equate successful lint with native discovery.

## GSD Core: what to borrow and what to avoid

| Mechanism inspected | Actual coverage | Adaptation for Open Dough |
| --- | --- | --- |
| [Codex inheritance smoke](../../../gsd-core/tests/codex-inherit-smoke.test.cjs) | Runs the real installer, inspects emitted TOML, checks GSD's posture validator and repair dry run. Does not run Codex on a task. | Test emitted files and install/update behavior thoroughly without provider access. A test's “Codex” name is not native semantic evidence. |
| [Install-tree snapshots](../../../gsd-core/tests/golden-install-tree.test.cjs) | Compares installed relative path sets across runtime layouts; deliberately skips this test on Windows. | Maintain a small explicit expected file set for each supported layout, including forbidden internal payload and coexistence sentinels. OS coverage and agent-platform coverage are separate. |
| [Emitted attribution](../../../gsd-core/tests/emitted-attribution.test.cjs), [provenance](../../../gsd-core/tests/emitted-provenance.test.cjs) | Real emitted changes must be attributable to changed source/transformation inputs; rules are checked for uncovered, overlapping, dead, and nonexistent sources. | Track source → adapter → installed output dependencies for evidence invalidation. Test the mapping itself. Start with explicit few-file mappings, not GSD's 19-runtime machinery. |
| [ADR 2719](../../../gsd-core/docs/adr/2719-emitted-artifact-attribution.md) and [baseline helper](../../../gsd-core/tests/helpers/emitted-baseline.cjs) | Replaced noisy committed content-hash snapshots with computed comparisons; rejects mismatched baseline revisions. Retains readable file-set snapshots. ADR §3 is superseded; do not copy its old acknowledgment-file mechanism. | Avoid maintaining three large duplicated golden content trees. Keep reproducible computed manifests, compact evidence summaries, and explicit input identity. |
| [Windows process test](../../../gsd-core/tests/review-lane-windows-spawn-resolution.test.cjs) | Stages fake `codex.CMD` and exercises the real reviewer process launcher/output path on Windows. Other cases test binary resolution. | Fake only the external agent process for argument handling, missing binary, timeout, permission denial, malformed/truncated streams, failure status, and artifact retention. |
| [Plugin-manifest test](../../../gsd-core/tests/plugin-manifest.test.cjs) and [dedicated CI job](../../../gsd-core/.github/workflows/test.yml) | Installs Claude CLI and invokes `claude plugin validate ... --strict`, with deterministic fixture-shape checks. This job provisions no model credentials. | Native format validators can run cheaply when applicable. Open Dough ships project skills, not GSD's plugin, so this command is not a direct acceptance test for its present payload. |
| [CI scope selection](../../../gsd-core/scripts/ci-test-scope.cjs) | Uses additive rules, checks referenced test names, falls back to unit tests when recognized code changes select nothing, and treats unknown workflow files conservatively. | Borrow explicit reasons and conservative fallback for selecting paid cases. Do not copy a blanket “Markdown = docs” exclusion: guidance is executable product content. |
| [CI suite placement](../../../gsd-core/.github/workflows/test.yml) | Shards larger suites and runs auxiliary suites on only one full-scope shard; expensive install smoke has its own workflow. | Remove duplicate execution first. Open Dough's measured cheap suite does not yet justify sharding or selective cheap CI. |
| [Test rigor ADR](../../../gsd-core/docs/adr/456-test-rigor-architecture.md) | Advocates observable structured results, deterministic time seams, properties, and mutation checks rather than tests that merely find strings in source. | Test policy boundaries and assessors with independent expected outcomes and deliberately broken inputs. Do not copy its blanket source-text ban: in Open Dough, installed Markdown is part of the product. |

The earlier seed's reference to a content-parity companion needs qualification:
`golden-install-parity.test.cjs` is retired at this checkout; current content
propagation coverage is emitted attribution plus provenance. Some comments in
the tree test still mention the retired file. Likewise, old plugin-test comments
describe native validation as local-only, but the current workflow installs the
CLI. Prefer actual test wiring to names and historical comments.

Scope selection has a maintenance cost: GSD source documents past gaps caused
by excluding `skills/` from product classification and retaining renamed test
paths. Its classifier's fallback applies when the overall selected set is empty;
this is not proof that every individual changed path has been classified. Open
Dough should require a disposition for each relevant path and claim. An unknown
dependency broadens the proposed batch; it must not silently pass or launch paid
tests without approval.

No model-backed Codex/Cursor/Claude acceptance job was found in the inspected
GSD workflows. No GSD tests or remote CI runs were executed. GSD demonstrates
useful cheap layers, not a replacement for Open Dough's three-host native proof.

## Native automation feasibility

All documentation below was opened on 2026-09-07. Commands are capabilities to
use when implementing the runner, not a verified new invocation recipe.

| Host | Documented automation support | Discovery and cost limits |
| --- | --- | --- |
| Codex | `codex exec` supports noninteractive operation, JSONL events, final-message/schema output, explicit sandbox settings, and ephemeral sessions. Saved CLI auth can supply access; CI can use an explicitly provisioned identity. [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [authentication](https://learn.chatgpt.com/docs/auth). | Repository skills are discovered under `.agents/skills`; user/admin roots can also contribute. Isolate those sources without disabling the project skill. [Build skills](https://learn.chatgpt.com/docs/build-skills). Use the actual CLI model/provider and permissions profile as evidence inputs. |
| Cursor | Print mode supports headless work; `--force` permits modifications, and JSON/stream-JSON output supports machine assessment. [Headless](https://cursor.com/docs/cli/headless), [output formats](https://cursor.com/docs/cli/reference/output-format). Login and API-key routes exist. [Authentication](https://cursor.com/docs/cli/reference/authentication). | Project permission rules and explicit denials remain relevant; force is not evidence of isolation. [Permissions](https://cursor.com/docs/cli/reference/permissions). Skills are discovered at startup. [Skills](https://cursor.com/docs/skills). Record **agent** version and require fresh use after update. |
| Claude Code | `claude -p` supports structured output. CLI options include tool selection, preapproved tools and an API spend limit. [CLI reference](https://code.claude.com/docs/en/cli-reference). `dontAsk` denies unapproved operations. [Permissions](https://code.claude.com/docs/en/permissions). Login/provider authentication remains necessary. [Authentication](https://code.claude.com/docs/en/authentication). | Ordinary print mode loads project context. `--bare` skips normal discovery, including skills and CLAUDE.md, so it is unsuitable for the discovery proof. [Programmatic operation](https://code.claude.com/docs/en/headless). `allowedTools` preapproves tools; use tool restrictions/deny policy as well when limiting the available surface. |

These are genuine native agent processes, not direct model API calls. They are
appropriate for the current CLI-based installation/use contract. They do not
prove editor menus, desktop rendering, or a rule that is only applied by an IDE.
If a future claim depends on such a surface, give it its own automated native
case; do not silently substitute the CLI and mark it complete. Uniform support
for arbitrary desktop-only behavior is not established by this research.

There is no verified common dollar-cap interface across all three CLIs. Use
session-count and wall-time limits everywhere, host-native spend controls where
available, and observed usage where reported. Time limits do not guarantee an
exact billing cap or immediate provider-side cancellation. Unknown usage is
unknown, not zero. Model choices should match the supported profile; using an
unrepresentative cheaper model weakens the claim rather than eliminating cost.

The [Agent Skills reference validator](https://agentskills.io/specification#validation)
checks frontmatter and naming. It is a candidate for a cheap format layer, not a
native loader or behavior test. No equivalent credential-free validator for all
of Open Dough's existing artifacts was verified. Do not change packaging merely
to obtain a validation command.

## Coverage design

| Claim | Main inexpensive proof | Residual native proof |
| --- | --- | --- |
| Correct payload and host layout | Run real installer for all three layouts; verify full file inventory, source/installed content, references, versions, permissions where contractual, and omitted internal material | Agent finds the intended installed entry point; copied files alone are insufficient |
| Version/refusal/update policy | Table-driven real helper operations for older/equal/newer, edited/missing/unverifiable files, failure injection, force, and retirement | Agent chooses and executes the right workflow with ordinary user intent; one representative per changed decision boundary and affected host |
| Discovery and activation | Parse actual metadata, check adapters and required resources, detect duplicate candidates | Fresh native explicit invocation and/or implicit application as promised; no body pasted into the prompt and no expected answer supplied |
| Meaning of guidance | Check resources and contract invariants; replay retained traces against assessors | Agent identifies fixture-specific facts and follows the rule, including a representative conflict/refusal where that behavior changes |
| Coexistence | Full before/after snapshots, other-host sentinels, local guidance preserved | Used skill comes from the intended installed root; unrelated/old copies do not supply the observed behavior |
| Runner reliability | Substitute executable produces success/failure/timeout/truncated events; fixture clocks and state make outcomes deterministic | Small adapter characterization under the real host; transport success alone is insufficient |

Substitutes can cover most enumerated delivery and orchestration cases, but
cannot establish most natural-language interpretations without a model. Do not
publish a semantic-coverage percentage inferred from shell test counts.

Prefer executable outcome assertions plus native loading evidence. For example,
an undisclosed ADR status mismatch should produce citations to both actual
sources, withhold completion, and leave the complete adopter unchanged. A
successful update should change the intended bytes and recorded version, retire
only managed obsolete files, preserve neighbors, and load the new skill in a
fresh process. These are stronger than asking the agent to repeat “I used it.”

Validate assessors offline with counterexamples: correct words in a negated
answer, forged PASS text, absent skill events, a failing command followed by a
confident summary, missing terminal results, changed protected files, and unknown
event schemas. If a response remains ambiguous, record it as inconclusive;
automated acceptance must not depend on a human silently interpreting each run.
Where a future criterion truly needs a model judge, calibrate it on reviewed
examples, approve its cost separately, and retain hard outcome assertions.

Anthropic's [agent-evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
distinguishes task attempts, transcripts, and actual environment outcomes, and
describes code, model, and human grading trade-offs. This supports checking both
trace and state. Its use of repeated trials also exposes a limit of a small
acceptance batch: one pass is an observation, not a statistical reliability
estimate. Repeated robustness trials should have a separate approved purpose
and budget, not become automatic retry-until-green.

## Efficient batching and valid reuse

Define a batch as cases sharing a stable candidate, fixture family, and approval;
it is not one long agent conversation. Choose cases by uncovered obligations,
deduplicate the same case across stories, and combine compatible assertions in
one session. Keep explicit versus automatic activation separate when a prior
hint would contaminate automatic discovery. Keep successful update followed by
fresh use as separate sessions, linked by verified installed state.

For the seed's example of five helper-policy refusals on three hosts, test all
five deterministically on every applicable layout. If they share the same
agent-facing refusal path, a representative native refusal per host reduces the
proposed 15 sessions to 3. That reduction is valid only for that boundary; it
does not cover successful update or fresh discovery. If three other stories
need the identical refusal proof for the same inputs, link those stories to the
same three results rather than launching nine more sessions.

Evidence reuse is claim-level. Track relevant guidance, entry point/adapter,
helper, source tag/commit or candidate digest, fixture, prompt, assertions,
native runtime, selected/reported model, permissions, and configuration. A new
commit unrelated to these inputs need not rerun a model. A new grammar/behavior
instruction invalidates affected semantic claims on all three hosts. A change
only to Cursor's adapter invalidates Cursor claims, plus deterministic parity
and coexistence checks. Any changed shared dependency expands that set.

Reassessing retained raw output with a corrected grader can avoid a live rerun
if it contains every newly required observation. Record a new assessment linked
to the original run; never describe replay as fresh runtime execution. If the
trace lacks an observation, queue a new case. Old evidence lacking enough
identity for comparison remains historical, not automatically reusable.

Pin/record the tested runtime profile and review qualification when upgrading
the CLI/model, changing permissions/discovery context, observing regressions,
or preparing a release. Hosted model aliases can drift without file changes;
record model identity and observation date, and have the developer choose any
needed refresh batch. There is no perpetual guarantee and no calendar-triggered
paid suite implied by this proposal.

## Initial execution and approval options (not adopted as ADR requirements)

Produce a dry-run report before requesting paid execution. It lists stories and
claims, new/reused/pending cases, selection reasons, exact candidate identity,
host/model profiles, fixture/network/write boundaries, maximum sessions, timeout
and spend controls, allowed retries, artifacts, and the completion deadline.
The developer approves this concrete scope once. Existing explicit approval
continues to cover the batch and its authorized retries; runner/delegated steps
must not ask again for the same operations. New scope or cost requires amended
approval. Approval of this ADR would not itself approve any paid batch.

Separate outer execution permission, child tool permissions, and authentication.
Preflight versions/flags, fixture access, identity availability without printing
secrets, and required network routes. A model-backed connectivity probe consumes
the approved budget; it must not be hidden inside “free preflight.” Unexpected
permission/auth/schema failures become explicit results, never unattended login
dialogs, permissive relaunch loops, or success-by-skip.

Once authorized, a single deterministic runner should prepare fixtures, launch
cases, supervise child process groups, enforce bounds, assess outcomes, preserve
artifacts, clean scratch state, and report per-host completion without human
intervention. Use one case per host at a time initially. Cross-host concurrency
is optional within the approved budget; it reduces wall time, not model usage.
Preserve successful independent results and retry only the failed/inconclusive
case with valid setup. Do not resume a failed conversation as a fresh test.

Default to the existing authenticated local environment for paid execution,
with reproducible fixture/config isolation and explicit launcher permission.
This is already available and avoids introducing a secret-bearing CI service.
The same runner should be portable to a deliberately provisioned trusted runner;
public pull-request CI continues to run the credential-free layers only.

If hosted native execution is later useful, a manually dispatched workflow with
a reviewed candidate/manifest and environment approval can implement the same
boundary. GitHub supports reviewer-gated jobs and withholding environment secrets
until approval; availability depends on repository visibility and plan.
[Environment controls](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments),
[review availability](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments).
This is an optional transport, not a requirement to copy local sessions into CI
or to expose credentials to untrusted PR code. Do not add both a conversational
approval and an identical per-host environment review for the same batch.

## What remains to establish before implementation acceptance

- Characterize the three runner profiles with developer-approved model sessions,
  including noninteractive permission failures and actual project discovery.
- Determine the exact boundary behind the earlier permission interruptions;
  current scripts and help output cannot reconstruct that incident.
- Validate automated semantic graders against reviewed good/bad evidence and
  prove the harness cannot pass when native activation is absent or corrupted.
- Measure native elapsed time, usage, failure and retry rates during those
  necessary runs. Set subsequent budgets from observations, not invented prices.
- Choose artifact location/retention and how CI verifies the candidate's native
  evidence without placing temporary absolute log paths in the acceptance record.

These are unresolved design prerequisites and acceptance concerns, not new
stories or an authorized implementation. For this documentation change, Codex,
Cursor, and Claude Code native discovery/use remain unexecuted: no distributed
skill, rule, installer, or runtime adapter changed. Prior evidence is historical
context only; the proposed runner's native verification is pending on all three.

| Platform | Evidence obtained in this research | Proposed runner acceptance |
| --- | --- | --- |
| Codex | CLI 0.144.1 help/version; existing deterministic layout checks passed; Plan 014's historical native observations reviewed | Pending native discovery, activation, behavior, and affected delivery/coexistence checks |
| Cursor | Agent 2026.09.02-c22c1a3 help/version; existing deterministic layout checks passed; Plan 014's historical native observations reviewed | Pending native discovery, activation, behavior, and affected delivery/coexistence checks |
| Claude Code | CLI 2.1.263 help/version; existing deterministic layout checks passed; Plan 014's historical native observations reviewed | Pending native discovery, activation, behavior, and affected delivery/coexistence checks |
