# Keep internal and external finding code names consistent

## Source and outcome

[SEED-010 Story 3](../../seeds/SEED-010-learn-from-execution-retrospectives.md#act-on-local-retrospective-mail),
including the release/history clarification. Status: executing on
`worktree-quick-040-consistent-finding-names`. Slices 1–2 delivered; slices 3–6
remain.

The Open Dough maintainer receives a stable internal finding identity and a
chat-only rename recommendation justified by meaning and relevant revision
history. A continuing issue keeps its code across releases; a later issue after
an evidenced correction receives a new code. The execution's guidance release
is recorded in the source project's `DearDough.md`.

Excluded: a cumulative internal feedback log, recurrence counts, response or
fix workflows, backlog edits, ongoing effectiveness tracking, automatic source
renames, migration/merging, remote collection, new database or history tooling,
release/adoption, and synchronization of managed installed copies. Story 7 owns
responses; Story 4 owns ongoing effectiveness. Source occurrence recording
remains the retrospective's responsibility.

## Current decisions and implementation boundary

- Author the internal skill at `.agents/skills/reconcile-finding-names/SKILL.md`.
  Use one shared behavioral source; add only a thin Claude discovery pointer if
  needed under the repository's existing internal-skill convention.
- Use `docs/maintainer/finding-names.md` as the maintained naming record and
  `ODF-NNN` as its namespace. A minimal entry contains the code, concrete meaning,
  source project/code mappings qualified by revision when needed, and compact
  evidence/change references. No execution history rows or count fields. These
  are the planning selections for the seed's proposed defaults, not new product
  restrictions. Empty initial scaffolding is not a finding; allocate real codes
  only from supported supplied feedback. Use isolated records for proof.
- Extend only the public source
  `src/skills/dough-execution-retrospective/SKILL.md` for provenance and mixed-name
  compatibility; keep internal history analysis out of public runtime guidance.
  Update its maintainer recognition record with actual evidence during execution.
- Record `Open Dough release: <version | unknown | unreleased | modified>` per
  occurrence; attach an available revision and base release where applicable.
  Existing installation locations are `.agents/skills/dough-update/VERSION` for
  Codex/Cursor and `.claude/skills/dough-update/VERSION` for Claude. They establish
  the current installation only, unless execution provenance ties them to the
  work being reviewed. Neither source `VERSION` nor today's installation proves
  the execution's release. No installer changes are needed.
- One identity model: concrete issue plus evidence of continuity or an intervening
  correction. Release numbers locate history; they do not partition identities.
  Use relevant local Git history, tagged content and current guidance; a changelog
  helps locate a change but does not prove its effect. Do not fetch other projects
  or audit all guidance. Explicitly identify the current revision assessed.
- Source aliases are qualified by project and, when necessary, revision/evidence
  locator. A source code spanning an old and a new issue must not overwrite an
  earlier mapping. Rereading an old report cannot establish a current regression.
- Unknown continuity is qualified and conservatively separate, consistent with
  the seed; an unreadable record or unresolved source identity prevents a safe
  write. Do not turn a limitation into a claim that a fix or recurrence occurred.

The maintained naming catalog is current product data needed for reuse, not an
archive of retrospective judgments. Disposable execution proof stays with this
plan until normal retrospective/wrap-up.

## Constraints and verification approach

Follow [AGENTS.md](../../../AGENTS.md)'s invocation, required-context, and useful-
outcome walkthrough for each affected skill. Apply
[ADR 0003 — Release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
for immutable release identity and source-only public changes,
[ADR 0006 — Executing-agent audience](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for the public/internal boundary, and
[ADR 0005 — Native acceptance](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for distinguishing authoring proof from native delivery evidence. The consulted
index and these records agree on Accepted status; no supersession or conflict
was identified.

Proof enters through an ordinary retrospective or internal-skill invocation
with supplied feedback and a disposable project/record. Assess emitted Markdown
and the chat recommendation against concrete pre/postconditions; do not use
keyword assertions as evidence of semantic matching. Use a small disposable Git
history with A/B/C revisions for continuity/correction cases. This tests use of
existing Git evidence, not a new history engine. No infrastructure experiment,
framework, or separate test harness is required.

For each slice, retain compact inputs, decisive output, relevant candidate
revision, and assessment under this plan's `evidence/` when executed. Compare
source-log bytes before/after every internal invocation. Use the existing
Quick 036 cases for local log preservation and skip behavior only where unchanged
rules justify reuse. Novel release and mixed-code behavior needs fresh proof.
Do not claim any walkthrough has already run.

Public release-field and mixed-code native requirements belong to the existing
[Story 2 acceptance](../../seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).
Record these changed requirements in the source recognition record during
implementation, linked to that acceptance owner; do not claim old-release proof
covers them. Internal authoring follows AGENTS.md without routine per-tool
rediscovery. No installation mechanism changes are planned. Extend the existing
`tests/install-omits-internal.sh` case for the new internal skill and naming
record, and run `bash tests/install-omits-internal.sh` in slice 2 to prove the
unreleased boundary through an actual installation. Do not add a parallel
installer suite or modify payload declarations to ship internal material.

Execution uses `dough-execute-plan`. Selective format for Markdown-only slices
is `git diff --check`; `npm run format` is a repository-wide JS/JSON/shell
fixer and is not used as a Markdown formatter. There is no `core.hooksPath` or
repository pre-commit hook; do not invent one. The check-only gate is
`git diff --check` on the staged diff. Authorized push destination during this
execution is `origin worktree-quick-040-consistent-finding-names`. CI observer:
`/tmp/dough-ci-501/watch-DCr7nh` (`ci.yml` / `CI`). Merge to `main` and drop
the worktree after all slices. Retain this plan through retrospective and wrap-up.

## Ordered slices

### 1. Report the guidance release used by an execution
Type: Behavior
Status: done
Behavior: Given supported process feedback and execution provenance, invoking
retrospective writes the occurrence with the actual guidance release or an
explicit unknown/unreleased/modified state.
Proof: Walked used-A-under-B (`0.3.4` retained, not review-time `0.3.6`),
unknown, and modified with revision `4f8a1c2` / base `0.3.4`. Existing
Tool/Model-era rows stayed byte-identical on identical rereview
(`920da4b3947d84deecf08b02f64d4bf70d3798eb23f7174b31868957435914e4`). Skip /
no-finding / preservation reused from Quick 036 as unchanged. Unreleased uses
the same state-plus-revision rule as the modified case.
Evidence: [evidence/slice-1/WALKTHROUGH.md](evidence/slice-1/WALKTHROUGH.md);
`git diff --check`. Delivered on `worktree-quick-040-consistent-finding-names`.
Safe stop: Release-bearing logs are useful independently of internal matching.

### 2. Recommend a stable internal name for an unseen finding
Type: Behavior
Status: done
Behavior: Given one interpretable source finding and no known internal match,
invoking the internal skill creates one minimal naming entry and returns a
source-code → ODF-code suggestion without changing source feedback.
Proof: Isolated first-use allocated `ODF-001` and recommended
`Open Dough/DD-001 → ODF-001` with meaning, mapping, and references; source
SHA-256 `fea3a65ae043b9115275ee63c38e2edfd276606f8b678e9c4d73028b884d5f6a`
unchanged. Replay kept catalog hash
`2fe80bfae32ec31bc796a5430aa6ede2e2bd2542c1f5e0850e1ce33f6d9350f2` with no
counts. Missing feedback and a malformed catalog stayed byte-identical.
Unsupported cross-revision matching was reported pending at checkout `962b4e7`.
`bash tests/install-omits-internal.sh` passed.
Evidence: [evidence/slice-2/WALKTHROUGH.md](evidence/slice-2/WALKTHROUGH.md).
Safe stop: First identities and replay work; history-dependent decisions remain
explicitly unresolved.

### 3. Reuse a code for an issue that persists across revisions
Type: Behavior
Status: planned
Behavior: Given an existing identity and feedback from release A, current B still
contains the same issue → the skill recommends the existing internal code with
supporting continuity references.
Proof: One A/B Git fixture has unrelated intervening changes and the concrete
problem still present. Inspect the relevant historical/current guidance and
verify reuse with the assessed revision and decisive reference. Different release
numbers and an alias spelling change must not produce another identity. Source
bytes remain unchanged.
Safe stop: Demonstrated continuity is supported; correction/uncertainty cases
remain explicitly unresolved until their owning slices.

### 4. Give a later issue a new identity after an evidenced correction
Type: Behavior
Status: planned
Behavior: Given an old code, a demonstrated correction in B, and supported new
feedback in C, the skill allocates a new code and explains the break in continuity.
Proof: Extend the Git scenario with a correction and a later reintroduction.
The recommendation contains a new code and the earlier-code/change relationship.
Replaying only the historical A report retains its old identity and does not
invent a C issue. When one source code spans both sides of the correction,
qualify the new recommendation by revision/locator instead of renaming the
entire entry. Preserve original mapping and source bytes.
Safe stop: Supported continuity and breaks share one revision-aware naming rule.

### 5. Keep uncertain relationships explicit in naming recommendations
Type: Behavior
Status: planned
Behavior: Given similar symptoms or insufficient release/history evidence, the
skill records an interpretable finding separately with qualified uncertainty,
without asserting continuity or correction; unsafe identity/record writes stop.
Proof: One matching walkthrough varies decisive evidence: similar rereading
symptoms with a different unresolved cause; unknown execution release; a claimed
fix whose relevant change cannot be verified. Inspect separate identity and
uncertainty, absence of an invented fix/current recurrence, and identical source
bytes. Replaying uncertain input reuses its recorded identity. Missing source
identity or malformed catalog produces a stated limitation and no unsafe edit.
Safe stop: Removes the history-dependent interim limitation from slices 2–3;
all matching decisions use the same evidence rule, with uncertainty preserved.

### 6. Continue retrospective logging after a project adopts an internal name
Type: Behavior
Status: planned
Behavior: Given a source log whose human has adopted an internal name, the next
retrospective reuses it for a supported match and gives new issues unused local
DD codes, preserving release-bearing occurrences.
Proof: One mixed-name end-to-end scenario: obtain a rename suggestion, let fixture
setup represent the human rename, and invoke retrospective with a matching and
an unseen issue. Assert the adopted ODF code is reused, the new DD code does not
collide or fill an old gap, and releases/old notes/occurrences remain correct.
Run the internal skill on the resulting input: it reports no rename for the
already aligned issue and suggests an internal name only for the new finding.
The internal invocation leaves source bytes unchanged and collects no occurrence
history. The public skill requires no access to the internal record.
Safe stop: Full naming round-trip works; no response, automatic rename, release,
or feedback-collection workflow is introduced.

## Proof ownership

| Final promise | Owner |
| --- | --- |
| Execution release, unknown/unreleased/modified states, old-row preservation | Slice 1 |
| Minimal internal record, fresh code, project separation, replay, no feedback | Slice 2 |
| Internal skill/catalog omitted from installation | Slice 2 existing installation case |
| Same concrete issue persists despite revision change | Slice 3 |
| New issue after correction, stale report, revision-qualified aliases | Slice 4 |
| Uncertain similarity/history, safe-write limitations, uncertain replay | Slice 5; initial record safety in slice 2 |
| Chat-only renames, source preservation, no internal counts/history | Slices 2–6 at each internal invocation |
| Mixed codes, local allocation, adopted-code reuse, no internal public dependency | Slice 6 |
| Public native behavior acceptance remains separately owned | Story 2; requirement links recorded during slices 1 and 6 |

## Cumulative design and sizing assessment

Six Behavior slices, no preparatory Structure. Each owns one externally visible
result and one bounded walkthrough loop with relevant boundary variants.
The common model is evidence-qualified identity continuity, source aliases, and
release provenance. Correction and uncertainty are evidence outcomes within that
model, not separate registries or matching engines. The final round-trip exercises
that model through the existing public logger.

No numeric target or hard limit was supplied; none is invented. Sizing includes
focused authoring, walkthrough and local cleanup. The history scenarios are
bounded by supplied decisive changes, not a repository-wide investigation.
If relevant history cannot resolve identity, use slice 5's explicit uncertainty
rather than enlarging the investigation. Scope-changing evidence returns to
story refinement; slice-only sizing concerns amend this same plan.

Assessment found no remaining slice-specific decomposition concern. The
execution formatting/hook contract noted above remains an execution-context gap,
not a reason to split the story or claim that execution has been authorized.

## Learnings

Slice 1: occurrence template now records `Open Dough release`. Review-time
updater VERSION files are decoys unless tied to the work. Unreleased and
modified share one state-plus-revision form; the walkthrough used the modified
case. Native acceptance of the field remains Story 2.

Slice 2: internal skill and empty catalog are source-only. Isolated catalogs
are the writable proof target. `assert-public-payload-install.sh` remains a
payload-completeness helper; omission of the new skill is owned by
`tests/install-omits-internal.sh`. Cross-revision matching stays pending.

CI repair of slice 2: ShellCheck SC2312 on `tests/install-omits-internal.sh`
(`find` inside `[[ -z "$(...)" ]]`). Capture-then-assert. Run
https://github.com/terryyin/open-dough/actions/runs/34448748798 job `lint`.
Interrupted slice 3 remains in progress.
