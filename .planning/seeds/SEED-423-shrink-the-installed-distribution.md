---
id: SEED-423
status: active
planted: 2026-11-22
planted_during: Terry Yin requested a dead-code and simplification audit of the Distribution scripts
trigger_when: selected from the product backlog
scope: Distribution simplification stories
---

# SEED-423 — Shrink the installed distribution to code that serves a purpose

## Why this matters

A developer who installs or updates Open Dough receives everything under
`Distribution/src/`, and every agent working in that project can find, read
and run it. On 2026-11-22 that was 414 files: 282 `.mjs` scripts, 111 guidance
files, 12 shell files and 9 assets. A script earns its place when guidance, a
hook, the installer, the Dashboard or a maintained repository script reaches
it. Its own unit tests do not count.

The audit built the import graph of all 282 scripts, listed every export with
no caller outside tests, and read each script area against the guidance that
invokes it. The first pass removed the unambiguous cases and left 412 files
and 280 scripts. The findings below are what remains. Line counts are
estimates from that reading at `8a9643c0f`.

## Alternatives and decision

Remove code by purpose, not by file count: merging files to pass a count
leaves the same code installed. The remaining stories each remove a capability
or replace a mechanism, so each needs either a decision about who still uses
it or a measured comparison.

Effort bands are relative. S is one script area with its tests. M crosses
script areas or changes guidance agents follow. L changes a mechanism the
Dashboard and installed scripts share.

## Story decomposition

<a id="publish-to-trunk-through-one-loop"></a>

### Publish to trunk through one loop

**Identity:** SEED-423#publish-to-trunk-through-one-loop

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/820-publish-to-trunk-through-one-loop/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c89f0c3b2ceb610d25c04ec79acc056becb6dc3e4d87414d5c14f9a3ea513d35","plan":"559455e189d2b37c67c7a378082cc61673f013bedaf689131175f7d453a48d6c"}}
```

**Goal.** Give developers consistent exact-revision publication and recovery
with less installed code, less guidance for agents to read, and fewer tests
for the same behavior.

**Scope.** Share one fetch, publication, confirmation and bounded recovery
loop across execution delivery, history-preserving landing, interrupted
resume, execution startup claims and session-record publication. Keep each
caller's ownership checks, way of preparing a candidate, proof, and receipt
and stop contracts. Delivery consumes the publisher's result directly while
preserving its own output contract. The Dashboard's first-landing comparison,
CI handoff, maintenance and retirement retain their existing owners.

Fold the shared procedure into existing installed guidance. Remove repeated
instructions and keep the combined guidance no longer than before. Use direct
instructions that select the correct action from the context and observed
result. Remove superseded scripts, unused exports and test-only production
paths once their callers are accounted for. Reduce both script lines and test
lines, including helpers, and run fewer cases by removing duplicate coverage.
Keep independent proof at the normal entry points. The preparation assignment
protocol, other Distribution cleanup stories and public interface changes are
outside this scope.

**Key examples.**

- A competing writer advances trunk during publication. Delivery replays only
  its owned suffix and rechecks affected proof. A reviewed landing preserves
  the published history. Startup rechecks claim ownership and selected source
  before rebuilding or replaying its claim. Each applicable path gets at most
  one retry. A conflict, failed recheck or second rejection leaves recoverable
  work and returns the caller's existing stop.
- A push loses its answer. Resume recognizes the retained candidate on the
  authorized target even after that target advances. If the retained candidate
  is absent, resume can try its exact SHA once without rewriting it. A
  first Dashboard landing retains the candidate and base before each attempt
  and reuses them to record acceptance. Capture failure can be retried without
  another Git push.
- A session close lands its work and publishes its sealed record separately.
  Recovery after the record push is interrupted finds the same record or
  reports a conflict without publishing the work again.
- An agent using the shorter installed instructions can select the correct
  publication and recovery actions for a fresh increment, a published-prefix
  landing and a retained candidate. The delivered script and test reductions
  are visible in the before-and-after counts.

**Depends on.** None.

<a id="read-test-leads-from-a-smaller-reader"></a>

### Read test optimization leads from a smaller reader

**Identity:** SEED-423#read-test-leads-from-a-smaller-reader

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer optimizing tests gets the same ranked leads
  from a reader small enough to maintain.
- **Evaluation.** The eleven scripts behind `ci-proof-leads.mjs`, about
  1,780 lines for one printed table, choose the attempt, read the summary and
  print the slowest entries per unit with a short gap list. Interpretation
  stays in `evidence-and-leads.md`. A test-optimization run on this
  repository reaches the same first leads.
- **Effort hypothesis.** M, low to medium confidence; 600 to 900 lines. The
  audit read `leads`, `gaps` and part of `ranking` only.
- **Depends on.** None.
- **Safe stopping point.** Removing the roll-up and remedy prose.

<a id="ask-github-without-a-shared-request-owner"></a>

### Decide whether GitHub requests need a shared owner process

**Identity:** SEED-423#ask-github-without-a-shared-request-owner

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A maintainer knows, from measured request counts, whether
  the detached request owner earns its 2,730 lines.
- **Evaluation.** A comparison on this repository's Dashboard and one CI
  observation shows GitHub request counts and rate-limit behavior with the
  owner and with each process calling `gh api` itself while sharing only the
  rate-limit hold file. The result is either a removal plan for the socket,
  wire protocol, endpoint and orphan reaping, about 1,400 to 1,600 lines, or
  a recorded reason to keep them.
- **Effort hypothesis.** M for the comparison, L for removal; medium to low
  confidence. Cross-process sharing of identical reads and the machine-wide
  concurrency cap are what removal gives up.
- **Depends on.** None.
- **Safe stopping point.** The recorded comparison.

<a id="report-a-missing-exact-run-without-inferring-coverage"></a>

### Report a missing exact run without inferring coverage

**Identity:** SEED-423#report-a-missing-exact-run-without-inferring-coverage

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer whose revision has no CI run of its own gets a
  plain report in place of an inference built from workflow path rules.
- **Evaluation.** `ci-path-applicability`, the hand-written workflow path
  parser in `ci-workflow-path-policy`,
  `ci-revision-applicability-classification`, `ci-integrated-state*`,
  `ci-mailbox-queue-progress` and most of `ci-mailbox-revision-coverage`,
  about 1,100 lines, shrink to the rule this repository relies on. A
  documentation-only or superseded commit still completes.
- **Effort hypothesis.** L, low confidence; 500 to 800 lines. This
  repository sets `integratedStateCompletion` and the Dashboard imports the
  path policy.
- **Depends on.** None.
- **Safe stopping point.** Keeping only the integrated-state rule.

<a id="check-shipped-script-imports"></a>

### Catch imports missing from the shipped skills

**Identity:** SEED-423#check-shipped-script-imports

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A maintainer moving a module during Distribution cleanup
  learns in CI if a shipped skill would fail to load it in a client checkout.
  The payload inventory and Markdown link checks can pass while a script
  imports a file available only in the Open Dough repository.
- **Evaluation.** The Distribution check passes for relative `.mjs` imports
  whose targets are shipped under `Distribution/src/skills/`. It fails and
  names the importing script and specifier when a literal relative `.mjs`
  import resolves outside that directory or its target is absent. Prove the
  boundary with an import that resolves in the source checkout and fails in
  an installed checkout.
- **Effort hypothesis.** S. The native evaluation tool already walks literal
  relative imports for evidence hashing.

## Ordering and scope reduction

Sharing setup, observation and completion logic across the three hosts
remains a candidate for a separate story.

Start with CI reuse removal, the smaller custom CI interface, retirement of
legacy formats, and payload derivation. The notification, backlog command,
Git adapter and publication stories change mechanisms agents use daily and
carry medium confidence. The leads reader, request owner and coverage
inference are last: largest uncertainty, and the last two could cost
reliability. They are the first to drop.

Not proposed: merging files that the 250-line limit split. It removes no code.
`execution-start*` is ten files for one command and is the clearest case for
a redesign by responsibility when that area is next changed.

## When to surface

Whenever a release adds files to the installation.

## Breadcrumbs

- Removed in the first pass: `ci-observer-stream.mjs`,
  `dough-bug-fixing/scripts/retained-artifacts.mjs`, the unread `delivered`
  marker check, `request.sha`, and the `origHead` and `headName` fields.
- Checked and live, so not listed: every `dough-story-refinement`,
  `dough-story-wrap-up` and `dough-land` script and flag; both backlog merge
  drivers; the guard hook; the done catalog; and every other
  `product-backlog.mjs`, `ci-mailbox.mjs` and `execution-start.mjs` verb and
  flag that guidance names.
- `ci-mailbox.mjs register-push` has no guidance recipe, and two references
  say not to run it separately; it is used by hand after integration, so it
  stays.
