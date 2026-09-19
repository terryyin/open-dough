# Simplify installation, host-hook fixtures, and trunk publication around domain responsibilities

Status: planned. No execution has started or been authorized.

## Source, beneficiary, and bounded outcome

Follow-up to the execution retrospective of SEED-008's gate-and-deliver
scripted backlog plan, reviewed 2026-09-19. Its eight delivered slices and
proof are recoverable at
`a3c732c:.planning/quick/060-gate-and-deliver-scripted-backlog/PLAN.md`,
with reviewed implementation range `dac740b..39e9b9e`. Wrap-up integrated
that work and removed its spent history; this correction does not reopen it.
The independent Bash-version masking correction is complete, recoverable at
`946015e:.planning/quick/063-prevent-bash-version-masked-test-failures/PLAN.md`.

For maintainers and agents inspecting releases, maintaining installation tests,
and publishing verified work, reduce the amount of duplicated knowledge they
must understand and keep consistent. Preserve installation behavior, test
coverage, and execution safeguards while bringing the three implicated files
and any replacement modules within the 250-line convention.

The owner's 2026-09-20 instruction authorizes replacing the earlier mandatory
splits and verbatim-content preservation with semantic simplification: retain
critical information, improve cohesion, and map directly to domain concepts.
It does not authorize implementation. Keep this plan identity and queue position.

## Current evidence and diagnosis

Inspected current source on 2026-09-20; sizes still match the retrospective.
Line count identifies pressure, but is not sufficient evidence of the cause.

| Surface | Evidence and real maintenance problem | Domain responsibility |
| --- | --- | --- |
| `docs/installation-and-updates.md` — 271 lines | The initial payload list repeats `install.sh`'s `managed_files`; inspection step 4 partly repeats it again. `tests/dough-update-guidance-payload.sh` requires every path to be copied into prose, perpetuating duplication. | A release declares its managed payload; an installation procedure explains how to inspect and apply that declaration. |
| `tests/helpers/host-hooks-fixture.bash` — 448 lines | Repeated Node heredocs reload the same JSON, resolve fragment paths, find managed handlers, and serialize settings. Scenario meaning is obscured by that plumbing. Commit `de7d819` had to add the optional Claude guard to both setup and assertions. | Host settings contain unrelated entries and release-defined managed registrations; scenarios establish a particular precondition, assertions observe an independently specified result. |
| `src/skills/dough-execute-plan/references/trunk-publication.md` — 276 lines | Claim, increment, closure, rejection, and resume repeat ownership, identity, proof, and failure rules. These are transitions of one publication lifecycle, not separate publication algorithms. | Publish an owned unpublished suffix onto the authorized trunk; distinguish local integration, confirmed publication, and CI registration. |

The installer guide grew from 233 lines during the originating execution;
the fixture was already 430 lines. Those observations establish cumulative
residue, not why an individual refactor pass missed it. No process-policy
change or general repository cleanup belongs to this correction.

The old link count is stale: current runtime Markdown has 19 incoming
`trunk-publication.md` references across five files, and the target has nine
section headings. Its two outgoing `../dough-product-backlog/...` links resolve
under `dough-execute-plan/`, where the target does not exist; the sibling skill
requires `../../dough-product-backlog/...`. Correct these affected links.
The fixture has five sourcing tests; the previous plan omitted
`tests/install-preserves-open-dough-json.sh` from its focused proof.

## Existing solutions and selected design

PFE assessment: reuse the following owners instead of moving duplicated
representations into new files.

- **Release payload:** `install.sh` owns the literal declaration;
  `src/install/open-dough-release-version.sh#read_managed_files_declaration`
  (a function, not a Markdown anchor) already reads current and historical
  declarations without executing the installer. The public-payload fixture
  already uses it. Replace prose inventories with an exact source link and
  instructions to inspect every declared path under the pinned snapshot's
  `src/skills/`. Retain the explicit installer call-chain inspection list.
  Do not add a manifest, generated documentation, or another payload list.
- **Host settings:** reuse the authoritative release fragment JSON as expected
  data. The production fragment loader and merge code solve installation,
  not independent test setup or observation: do not call the production merge
  or adoption classifier to construct or approve its own expected result.
  Keep the Bash scenario API; move repeated JSON operations into ordinary
  test-side JavaScript, with named scenario operations and separate assertions.
  Share reading/writing and native-shape traversal only where meaning matches.
  Keep Cursor's flat handlers and Claude's wrappers/matchers explicit.
- **Publication:** keep the existing document and heading anchors. Put shared
  ownership/stop rules in Preconditions, the successful transition in Publish
  the candidate, and exception-specific changes in rejection/conflict/resume.
  Use the existing resume table and links to proof, execution identity, CI,
  and backlog conflict owners. Shorten repeated statements and rationale,
  keeping conditions and obligations at their decision points.

Strongest smaller option: retain the files and remove redundant prose and
boilerplate. Select that for both documents. For the mixed Bash/JavaScript
fixture, a small language boundary plus independent observation is justified
by actual repeated operations. A seeding-versus-assertion cut alone would leave
most duplication intact. A new generic host registry, scenario framework,
publication state store, or universal conflict engine would add needless work.
Do not compress formatting or weaken assertions just to reduce line counts.

Relevant Accepted ADRs, checked against [the index](../../../docs/adrs/README.md):
[0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
require domain alignment, one conceptual representation, and cohesion;
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
preserve released payload identity, whole-payload installation, and standalone
use; [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) preserves
validation boundaries; [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one behavioral home without losing non-obvious invariants.
No conflicting decision or relevant North Star topic was found. No new ADR or
North Star topic is needed. Follow [maintainer guidance](../../../AGENTS.md).

## Ordered slices and proof ownership

### 1. Inspect a release through its authoritative payload declaration
Type: Structure
Status: planned

Owns the duplicated payload-knowledge correction. Replace both guide inventories
with the selected declaration-based explanation, preserving the existing guide
and useful anchors. Adapt the guidance test so it checks a usable route to the
complete declaration rather than requiring copied filenames. Keep the installer
and release selection behavior unchanged; no payload-declaration relocation.

Preserved promises: latest numeric tag and peeled commit selection using Git
before executing fetched code; pinned snapshot; inspect installer helpers and
every declared source before execution; captured target and both physical roots;
host-settings scope; byte verification; SOURCE/VERSION certification; explicit
force authority; unrelated/configuration preservation; failure reporting and
owned temporary-directory cleanup. Keep the custom-CI manual discoverable.

Proof: walk the revised procedure against the current declaration and a disposable
candidate with an additional declared dependency: every source is discoverable
without editing the guide, and a missing declared source prevents proceeding.
Inspect the test's observation, not just its exit status. Run
`bash tests/dough-update-guidance-payload.sh` and
`bash tests/update-adds-new-payload-skill.sh` for guidance and existing delivery
coverage. The latter proves installer behavior, not an agent's reading behavior;
the representative procedure review owns that distinction. Record the review
in this plan during execution. Check links and `wc -l` for all changed files.

### 2. Express host-hook test scenarios through settings and registrations
Type: Structure
Status: planned

Owns fixture duplication without changing installer behavior. Retain existing
Bash function names, arguments, optional release-root selection, exit propagation,
and sourcing path. Use a thin shell adapter and cohesive JavaScript scenario and
assertion modules; consolidate JSON loading, saving, and handler traversal.
Keep scenario differences visible as named changes to registration data, not
boolean modes or a configurable scenario language. Keep assertions independent
of scenario construction and production merge decisions. Do not move the entire
448-line body unchanged into one oversized JavaScript file.

Preserved promises: empty and mergeable settings; exact manual registration;
release-specific fragments and absent optional guard in older/synthetic releases;
missing-handler repair; edited timeout; space/tab/semicolon command suffixes;
unrelated similarly prefixed scripts; duplicates; Claude matcher restriction;
exact managed handler count/content and unrelated settings preservation. Retain
the existing weaker command-only assertion for an absent settings-file repair;
do not conflate it with the full registration assertion. Preserve all caller
refusal and no-write observations, including ordinary/force and unsafe settings.

Proof: run all five existing consumers with Bash 4+ selected on PATH:
`bash tests/install-ci-host-hooks.sh`, `bash tests/install-all-tools.sh`,
`bash tests/execution-payload-update.sh`, `bash tests/update-skip-verified.sh`,
and `bash tests/install-preserves-open-dough-json.sh`.
Before replacing setup, inspect these callers and retain representative current
fixture output for exact registration with/without the optional guard and a
Claude matcher mutation; compare the refactored setup's JSON semantically.
Confirm the new assertions reject a missing/duplicate/modified managed entry
and a lost unrelated sentinel in disposable settings. Reuse existing negative
proof where sufficient; add only missing assertion-sensitivity checks.
These checks prevent shared setup/expectation errors from passing unnoticed.
Count the complete replacement family and review that each module has one role.

### 3. Describe publication as one lifecycle with explicit recovery differences
Type: Structure
Status: planned

Owns repeated publication policy. Simplify in place using the selected ownership
model and keep every existing heading anchor. Make claim/increment/closure
entry conditions concise, referencing the common sequence. Retain the concrete
rejected-push commands and resume table; reduce repetitions around them. Repair
the two backlog-reference paths and check all current incoming and outgoing links.

Preserved promises: exclusive integration ownership and cleanliness only before
shared-checkout mutation; owned unpublished suffix and published base; no rewrite
of published/other-writer history or force push; unchanged-trunk fast-forward;
rebase onto fetched trunk and only affected-proof revalidation; exact candidate
identity and local checkout synchronization; retained published SHAs; registration
failure reported as lost coverage, no CI wait; claim before implementation;
wrap-up observation and publication before dependent cleanup; one rejected-push
retry then stop; uncertainty preserves refs/index/worktrees and human decisions.
Preserve the existing distinction between immediate successful-publication
identity agreement and resume recognizing a candidate ancestor of newer trunk.

Preserve backlog routing precisely: ordinary publication rebase uses the installed
adapter, including its `continue`/`validate` distinctions; rejected-push `--onto`
rebases retain their documented manual domain fallback because the adapter cannot
express them. Do not close that adapter gap or silently change Git semantics.

Proof: representative guidance review from each real caller (execute-plan startup
and resume, delivery wrap-up, story closure, CI registration, execution location).
Walk unchanged trunk, advanced trunk, rejected push/retry, unresolved conflict,
clean-but-disputed adapter result, lost push response, and missing registration;
map each preserved obligation above to its final passage/action. Run
`node --test src/skills/dough-execute-plan/scripts/trunk-publication-local-main.test.mjs`
for the existing Git synchronization cases and `bash tests/execution-payload-update.sh`
for delivery. Those tests do not execute prose; the guidance review owns the
remaining semantic proof. Resolve all affected paths and heading anchors in
source and both installed roots using the existing disposable installation setup.
No new runtime reference is expected; if one becomes necessary, include its
payload declaration and standalone installed-link proof in this same slice.

## Completion, sizing, and remaining concerns

All three previous Refactor slices were classified Refine and replaced by the
three Structure slices above. No completed slices or accepted proof were removed.
Each directly owns an evidenced correction and one preservation proof loop;
none prepares speculative behavior. They are independently safe stopping points.
No numeric target, hard limit, or sizing exception was supplied; no resplit is
recommended. Fixture implementation has moderate sizing confidence because its
shell boundary and five callers must remain coherent; the document slices have
higher confidence. Reassess the fixture design if it accumulates dispatch layers.

At each slice, compare before/after size across the entire affected family and
explain which duplicate knowledge or operation disappeared. Completion requires
semantic preservation and a smaller, clearer representation, not just smaller
individual files. Keep every implicated changed/new file at or below 250 lines.
If this cannot be achieved without losing a safeguard, retain the obligation
and return the concrete design issue rather than silently dropping it.

During execution use the established refactor/delivery gates, focused proof above,
and required broader checks `npm run lint` and `npm test` with Bash 4+ on PATH.
No native integration mechanism changes here; reuse applicable native evidence
under ADR 0005 rather than claiming static tests prove fresh native behavior.
The revised plan is ready for direct execution when separately authorized;
execution cannot resume in this planning-only request. Keep it queued, retain
proof in this plan during execution, and leave spent-artifact cleanup to wrap-up.
