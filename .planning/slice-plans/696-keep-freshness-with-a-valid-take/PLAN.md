# Keep source-freshness checks usable after a contributor merge

**Source:** [Keep source-freshness checks usable after a contributor merge](../../seeds/SEED-400-source-freshness-with-a-valid-take.md#keep-freshness-with-a-valid-take)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-400#keep-freshness-with-a-valid-take

## Goal and scope

A Story Branch execution whose branch and fetched trunk share several best
common bases passes the normal source-freshness check when one of those bases
holds its Take. The seed owns Goal, Scope, Key examples, the baseline and the
alternatives considered.

Excluded: matching `Claim-Publisher` to the running execution; any change to
comparison, `from` selection, absorb, exit codes or command inputs; how sibling
imports and contributor merges are made. The installed copies under `.agents/`
and `.claude/` change with the next Open Dough update, not in this story.

## Existing solution and direction

PFE at `15622b6d949ddd26f32fed4ea030adb515cf72aa`:

- [`source-freshness.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/source-freshness.mjs)
  (308 lines) is the CLI and `inspectSourceFreshness`. It takes one
  `git merge-base <trunk> HEAD` as `base`, refuses `not-taken-at-base` when the
  identity is not Taken there, then reads and compares the records. Its only
  importers are its own tests; the guidance calls it as a command.
- [`source-freshness-comparison.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/source-freshness-comparison.mjs)
  (168 lines) owns record comparison and stays as it is.
- `claimProvenance` in
  [`workspace-publication-ownership.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/workspace-publication-ownership.mjs)
  finds a claim commit on first-parent history. It is not reused: trunk
  `1c784a6d6`'s first-parent history does not contain the Take `8554eb19e`, and
  the check has no publisher input.
- `makeMe.aRepository` declares merge graphs through `parents`
  ([`repository-graph.test.mjs`](../../../Distribution/tests/support/repository-graph.test.mjs)),
  and [`source-freshness-test-fixtures.mjs`](../../../Distribution/tests/skills/dough-execute-plan/source-freshness-test-fixtures.mjs)
  (213 lines) supplies the Taken story, seed, plan and `run`.

Direction: change the existing check. The base becomes a best common base
(`git merge-base --all`) at which the identity is Taken; nothing else in the
comparison moves. No Accepted ADR or North Star topic governs this choice.

Oversized expected edit: `source-freshness.mjs`, 308 lines against the
[250-line check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
Its responsibilities are (a) the command: request parsing, exit codes and the
JSON line; (b) resolving the Take the comparison starts from: fetch, fetched
trunk, shared base, Taken entry, and their refusals; (c) reading each record
at base, trunk and branch copy and comparing it from its contained base; and
(d) absorb. Slice 1 moves (b), with `FreshnessRefusal` and `takenEntry`, into
a new sibling module, and, if the file is still over 250 lines, moves the
branch-copy helpers `workingText` and `withSection` beside it as their own
module. The command path, flags, output and the exported
`inspectSourceFreshness`, `absorbSourceFreshness` and `FreshnessRefusal`
names stay. Preserved proof: `source-freshness.test.mjs` unchanged and green.

[`source-freshness.test.mjs`](../../../Distribution/tests/skills/dough-execute-plan/source-freshness.test.mjs)
(489 lines) is not an expected edit: its refusal test asserts reasons, which
stay, and the new examples live in a new test file with their graph fixture.

## Decisive premises and preparation observations

Observed in this workspace at `15622b6d949ddd26f32fed4ea030adb515cf72aa` on
2026-11-18. Replays pushed the named trunk and branch revisions from each
retained graph into a scratch bare remote, cloned it, checked out the branch
and ran `node <script> check --workspace <clone> --identity <identity>
--remote origin --target-ref refs/heads/<trunk>`.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| The symptom reproduces on both retained graphs (slice 2) | Current script. Open Dough `50f4f4f1e` against `1c784a6d6`, `SEED-285#trace-landed-proof-timing`: `refused`, `not-taken-at-base` at `db8ca9099`. Lizard (`~/git/lizard`) `03695185` against `60b2fb59`, `SEED-058#process-pr-569`: `refused`, `not-taken-at-base` at `91603058`. `git merge-base --all` lists two bases on each; exactly one holds the Taken entry (`8554eb19e`, `e12c55f8`). | None. |
| Comparing from the Taken base gives the promised results (slice 2) | Scratch copy of `Distribution/src/skills` outside the checkout, base chosen as the first `merge-base --all` entry with the identity Taken; the copy differs from the checkout only in that hunk. Open Dough graph: `unchanged`, `base` `8554eb19e`, story `from` `1725298c7`. Lizard graph: `unchanged`, `base` `e12c55f8`. Open Dough graph after a scratch trunk commit adding a paragraph to the story section: `amended` for the story, plan `unchanged`. Branch at `db8ca9099`: `refused`, `not-taken-at-base`. | Absorb's write on a several-base graph was not run; it uses the same report. |
| The repository builder can arrange a two-best-base Story Branch fixture, and a test on it fails without the behavior (slice 2) | Scratch test (removed) with `makeMe.aRepository`: `before`; `take` (Taken backlog, seed, plan); `foreign` from `before`; trunk merge of `take` and `foreign`; workspace from `take` with an unpublished slice revision and an unpublished merge of `foreign`. `git merge-base --all origin/main HEAD` listed 2; the current script exited 3 `not-taken-at-base`, the scratch copy exited 0 `unchanged`. | Which base plain `git merge-base` lists first is Git's choice; here it was `foreign`. The proof asserts the result on the graph and must not rely on that order. |
| Two bases that both hold the Take and disagree on a record can be arranged, and choosing one of them can hide an amendment (slice 3) | Scratch test (removed) with the same builder: trunk `take` → `amend` (plan gains slice 3) → merge of `s1` (from `take`) → merge of `s2` (from `amend`); branch from `take` with a slice revision and unpublished merges of `s1` and `s2`. `git merge-base --all origin/main HEAD` listed `s2`, `s1`; both hold the Taken entry; only `s2` has plan slice 3. The scratch copy, taking the first Taken base, reported `unchanged` although the branch copy lacks slice 3. | In the builder a merge revision keeps its first parent's files, so the branch copy lacks the amendment by construction. |

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| One best common base: behavior and output unchanged | 1, 2, 3 | `source-freshness.test.mjs` green without edits. |
| Several best bases, one holding the Take: compares from it and reports `unchanged`, naming it as `base` | 2 | New test on the two-base fixture: `check` exits 0, `base` equals the Take. Replay of both retained graphs with the changed script: `unchanged` at `8554eb19e` and `e12c55f8`. |
| A genuine trunk amendment on that graph is `amended`, and `absorb` writes it | 2 | New test: amend the story section on trunk after the trunk merge; `check` exits 1 with the story `amended`; `absorb` writes the application and trunk does not move. |
| No best base holds the Take: `not-taken-at-base`, naming every base examined | 2 | New test: branch whose best bases all predate the Take; exit 3, reason `not-taken-at-base`, message names each base; working tree clean. |
| Several bases hold the Take and differ on a compared record: refused, naming them | 3 | New test on the disagreeing-bases fixture: exit 3 with a reason of its own, the bases and the record in the output; working tree clean. Same fixture with identical record text at both: proceeds. |
| Header comment and source-freshness reference describe the base as chosen | 2, 3 | Reading the reference's "Run the check" and refusal paragraph: they say the check compares from a shared base that holds the Take, and name the refusal for bases that disagree. |
| ODF-482 records the actual response | 3 | `docs/maintainer/findings/ODF-482.md` Follow-up names the implementing commits and the replay results. |

## Ordered slices

### 1. Take resolution in its own module
Type: Structure
Status: done
Proof: `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/source-freshness.test.mjs`
green with the test file unedited; `wc -l` of every touched script at or under
250.

Structure: move fetch, fetched-trunk lookup, base selection, the Taken-entry
reads and their refusals out of `source-freshness.mjs` along the seams named
above. External behavior is unchanged. Enables slice 2, which changes base
selection in that module alone.

### 2. A Take on one of several shared bases passes the check
Type: Behavior
Status: done
Proof: rows two to four and the documentation row above; new
`source-freshness-shared-bases.test.mjs` with its graph fixture, run with
`source-freshness.test.mjs` through `bash scripts/test.sh`; then the two
retained-graph replays from the premise table with the changed script.

Behavior: a Story Branch whose branch and fetched trunk share a base without
the Taken entry and a base with it → `check` → compares from the base that
holds it and reports `unchanged`, or `amended` when trunk amended a record,
with that base as `base`. When no shared base holds the entry → refused
`not-taken-at-base`, naming the bases. Interim: when several shared bases
hold the Take the check refuses, naming them, whatever their text; slice 3
narrows that to bases that disagree.

### 3. Shared bases that disagree about a record are refused
Type: Behavior
Status: planned
Proof: row five, the documentation row and the ODF-482 row above; the new
test file and `source-freshness.test.mjs` through `bash scripts/test.sh`.

Behavior: two shared bases both hold the Take and their plan text differs →
`check` or `absorb` → refused, naming the bases and the record, nothing
written. With the same text of every compared record at each such base → the
comparison proceeds from one of them. Replaces slice 2's interim refusal.
Then record the response at ODF-482.

## Verification and delivery

- Follow [the failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written; a base failure is attribution, never an exemption.
- Before test edits, apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md)
  selection; the graph fixture goes through `makeMe.aRepository`. Before
  editing the reference, follow
  [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md).
- Local gate per slice: the two freshness test files through
  `bash scripts/test.sh <paths>`, post-change refactoring, the delivery
  formatter and staged lint. No full local suite: the script's only importers
  are these tests, and its guidance consumers call an unchanged command.
  Hosted CI runs the distribution shards.
- Run under maintained `caffeinate -s -i` on AC, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos);
  on battery, `caffeinate -i` awake with the lid open and read the sleep log.

## Current decisions and plan review

- The base is any shared base that holds the Take, not the claim commit: see
  the seed's alternatives.
- The seed's Evaluation asks for the first containing release at ODF-482. No
  tag contains the response at wrap-up, so wrap-up records the response as
  unreleased and findings maintenance adds the release once a tag contains it.
- Slice-plan refinement was not needed: three slices, each one outcome and one
  proof loop, with the symptom, the remedy and both fixture routes observed.
  This review identified no remaining slice-specific concern.
- Slice 2's interim refuses every several-Taken-base graph because the premise
  table shows that choosing one of them can report a missed amendment as
  `unchanged`.
- Slice 1 delivered Take resolution as `source-freshness-take.mjs`
  (`resolveTake`, with base selection in its private `sharedBase` and
  `takenBase`) and the branch-copy helpers as
  `source-freshness-branch-copy.mjs`. A new distributed script is declared in
  `src/install/open-dough-execution-payload.sh`; its proof is
  `bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh Distribution/tests/installation/install-all-tools.sh Distribution/tests/installation/install-public-payload.sh`.

## Story obligations

### G1. Several bases that hold the Take are refused whatever their text
Reported: slice 2 — "Interim refusal: every graph with several Taken bases is refused, including ones whose records agree. Slice 3 must narrow it and reword the `ambiguous-base` part of the reference and header."
Story clause: "When several bases hold the Take and their text of a compared record"
Disposition: interim until slices 3

### G2. Absorb's test observes origin trunk, not every remote ref
Reported: slice 2 — "Promise 5, \"nothing pushed\": observed for origin trunk only; the execution branch ref on origin is not separately asserted."
Story clause: "The check still commits and pushes nothing."
Disposition: receiving slice 3
