# Optional process retrospective for Dough Land and Story Wrap Up

**Identity:** SEED-105#land-and-wrap-up-process-retrospective
**Source:** [refined story](../../seeds/SEED-105-land-and-wrap-up-process-retrospective.md#land-and-wrap-up-process-retrospective).
**Prepared:** 2026-10-05. Planning only, in the established preparation workspace.

## Goal and boundaries

A developer who adds `--process-retrospective` to a Dough Land or Story Wrap Up
invocation gets a process review of that run, with supported findings published
in the same `DearDough.md` as the execution retrospective's. Unflagged runs are
unchanged.

Scope, decisions, and key examples are those of the source story. Material
exclusions, as the story defers them:

- Reviewing the steps after each review point (Dough Land's refresh and
  retirement; Story Wrap Up's final publication, integration, and retirement;
  dashboard reporting).
- Offering the flag from the dashboard, or passing it through another skill's
  keep, one-shot, or auto-land path.
- Any change to the execution retrospective's own selection
  (`skipProcessRetrospective`, `--skip-process`).

All edits are in `src/skills/` and `install.sh`'s payload declaration;
`CHANGELOG.md` records releases only (its first heading is `## 0.3.56`), so the
release that ships this adds the entry. This repository's installed copies under `.agents/skills/` and
`.claude/skills/` are not edited (AGENTS.md, Layout).

## Direction and PFE

Established structure supports the work; no North Star topic governs it and
none is added.
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
applies to all new wording: it addresses the agent working in its own project.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) applies
to proof: deterministic guidance checks run locally and in CI; a native-host
run of a flagged landing or wrap-up is paid, manual acceptance and is not a
slice here.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
applies to the one new payload file: it is declared in `install.sh` with the
skills that link it.
[ADR 0009](../../../docs/adrs/0009-git-branching-and-integration.md) is
Proposed and binds nothing; the plan is consistent with its “closure changes
publish before any local refresh”.

PFE findings and choices:

- **The review.** `dough-execution-retrospective/SKILL.md` section “Review
  process only from a real record” already defines the review, and its
  “Record supported process findings” with
  `references/process-finding-recording.md` defines recording. Reuse both
  unchanged by link.
- **Selection.** That skill's “Select reviews” reads `open-dough.json`. The
  flagged callers must not: they link the review section directly and state
  that the flag alone selects. No change to “Select reviews”.
- **The rule both callers share** (flag only; review and record by link in the
  run's own checkout; never undo or block the run; what the final response
  says; quiet when nothing is found) has no home today. Add one reference,
  `dough-execution-retrospective/references/process-review-of-a-run.md`, beside
  the recording rule it uses, the way Dough Land's
  `references/completion-attention.md` already serves both callers. Each caller
  adds only its own review point and publication path.
- **Write location.** The retrospective's “Write only in an owned checkout”
  names only an invoking execution's checkout. Extend that sentence so a
  landing or wrap-up that invokes the review supplies its own checkout; keep
  the wording `workspace-ownership-lifecycle.test.mjs` asserts.
- **Dough Land publication.** Its “Stop, rerun, and report” table already
  continues from uncommitted changes through “Commit everything” and
  “Publish”, and retirement already refuses unpublished or dirty work. The
  findings edit uses exactly that path; no new sequence or script result.
- **Story Wrap Up publication.** “Commit final closure” already commits owned
  closure changes, and Trunk Mode `finish` takes that commit as `--final`. The
  findings edit joins that commit; no script changes.
- **Reporting.** `completion-attention.md` and `dashboard-completion.md`
  already carry a reminder as the attention message. Add recorded findings and
  an unavailable or unrecorded review to the reminders it names.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| Guidance is proved here by `node --test` regex checks over `src/skills` prose, found by the runner without registration (both slices) | `ls src/skills/*/scripts/*guidance*.test.mjs` lists 11 files; `unset NODE_ENV; node --test src/skills/dough-story-refinement/scripts/dough-land-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs` → 21 passed. `grep -n "guidance.test" install.sh` → nothing, so tests are not payload. |
| Those four files are the existing checks that read Dough Land, Story Wrap Up, completion attention, or the retrospective's write-location wording (both slices) | `grep -rl "dough-land/SKILL.md\|dough-story-wrap-up/SKILL.md\|completion-attention.md" src/skills/*/scripts` names them; the other hits under `tests/` are install and paid native fixtures. |
| The write-location sentence is asserted literally (slice 1) | Read `workspace-ownership-lifecycle.test.mjs` lines 192–225: it matches “invoking execution supplies its execution checkout as the write location, write there” and the “Otherwise, immediately before the first write…” sentence. |
| A new linked reference must be declared or the link check fails (slice 1) | `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/payload-declaration-links.sh` → exit 0 today; `install.sh` lines 115–116 and 221 declare `completion-attention.md`, `dashboard-completion.md`, and `process-finding-recording.md` one path per line. System `/bin/bash` 3.2 cannot run the shell checks. |
| A flagged landing can publish a findings edit through existing steps (slice 1) | Read `dough-land/SKILL.md`: rerun table rows “Uncommitted changes → Commit everything” and “Branch tip not contained in the fetched target → Publish”; retirement results `unique unpublished work` and `dirty checkout` retain the worktree. |
| A flagged wrap-up's findings can ride final closure in every mode (slice 2) | Read `dough-story-wrap-up/SKILL.md` “Commit final closure” and `wrap-up-closure-publication.md`: `finish … --final <final-closure SHA>`, Story Branch integrates the published final-closure tip, current-branch publishes each closure commit. |
| Neither skill names any invocation flag today, so the flag's description has no existing convention to follow in them (both slices) | `grep -n -- "--" src/skills/dough-land/SKILL.md` shows only script arguments; `dough-execute-plan` describes its flags in its frontmatter `description`. |
| Next free plan number | `ls .planning/slice-plans` ends at 248; every `origin` branch's `.planning/slice-plans/` ends at `249-prove-mark-as-done-rule`. Allocated 250; the path was free. |

## Outside-in proof

Proof is one new guidance check,
`src/skills/dough-land/scripts/process-retrospective-guidance.test.mjs`, run as
`unset NODE_ENV; node --test <file>`, together with the four existing guidance
checks named above and the link check (Bash 5 first on `PATH`). Each slice also
runs `npm run lint` and walks its key examples through the edited source
guidance as the AGENTS.md behavior review: invocation context, required
context, useful outcome. The walk reads `src/skills/`; it observes no native
host, and the plan claims none.

| Story promise | Slice |
| --- | --- |
| Flag only; unflagged runs do no review and read no process log, whatever `skipProcessRetrospective` says | 1 (shared rule, Dough Land), 2 (Story Wrap Up) |
| Review and recording reused by link, written in the run's own checkout | 1 |
| Dough Land reviews after accepted publication; findings committed and published before refresh and retirement | 1 |
| Review, recording, or findings publication never undoes or blocks the run; a stopped findings publication keeps the worktree | 1 (rule, Dough Land), 2 (wrap-up closes) |
| Final response names finding IDs or the reason; no findings is quiet and adds no commit; dashboard reporting stays last | 1 |
| Story Wrap Up reviews after deletion, before the final closure commit; findings are part of that commit | 2 |
| Flag described where each skill describes its invocation | 1, 2 |

## Slices

### 1. A flagged landing reviews its own process and publishes the findings
Type: Behavior
Status: done
Proof: the new guidance check asserts the shared rule and Dough Land's review
point; the four existing checks and the link check stay green; behavior walk of
the story's three Dough Land examples and the no-findings and
history-unavailable examples.

Behavior: an owned worktree with a reviewed change → `/dough-land
--process-retrospective` → after the publication is accepted (and any consumer
visit), the agent reviews this landing from its real record; a supported
finding is recorded in the landing checkout's `DearDough.md`, committed and
published through “Commit everything” and “Publish”, then the default checkout
is refreshed and the worktree retired, and the final response names the
finding's ID. Without the flag, no review runs and no process log or
`open-dough.json` is read. With no supported findings there is no extra commit,
publication, or wording. When history is unavailable, the log location is
unresolved, the write is refused, or the findings publication stops, the
accepted landing stays accepted, the worktree is kept when it holds unpublished
findings, and the response gives the reason and the rerun.

Changes:

- Add `dough-execution-retrospective/references/process-review-of-a-run.md`
  with the shared rule, and declare it in `install.sh`.
- `dough-execution-retrospective/SKILL.md`: extend the write-location sentence
  to a landing or wrap-up that invokes the review.
- `dough-land/SKILL.md`: one sentence in the frontmatter `description` and the
  opening section naming the flag; a short section between “Visit consumers of
  completed selected work” and “Refresh the default checkout” giving the review
  point, the link to the shared rule, and the publication path. The rerun table gains no
  row: a recorded but unpublished findings edit is its existing “Uncommitted
  changes” or “Branch tip not contained” state.
- `dough-land/references/completion-attention.md`: name recorded findings and
  an unavailable or unrecorded review among the reminders.

The occurrence's execution identity follows the existing recording rule: the
work identity the landing serves when its context names one, otherwise the
accepted revision on the target. State this in the shared rule only as a
pointer to that rule, not a second rule.

Accepted proof: `process-retrospective-guidance.test.mjs` (shared rule, Dough
Land section order and publication path, completion attention, retrospective
write location) plus the four existing checks, 25/25; link check exit 0.
Learning: the shared rule's identity fallback (accepted revision) fits a
landing; a wrap-up normally names its work identity, so slice 2 needs no
identity wording.

### 2. A flagged wrap-up records its findings in the final closure commit
Type: Behavior
Status: done
Proof: the guidance check gains the Story Wrap Up assertions; the four existing
checks and the link check stay green; behavior walk of the story's wrap-up
example in Trunk Mode and Story Branch Mode, plus the no-findings and
history-unavailable examples.

Behavior: a completed story being closed → `/dough-story-wrap-up
--process-retrospective` → after spent history is deleted and before “Commit
final closure”, the agent reviews this wrap-up under the shared rule and
records supported findings in the execution checkout's `DearDough.md`; the
final closure commit contains that edit with the cleanup and reaches trunk by
the mode's own closure publication; the final response names the finding IDs.
Without the flag nothing changes. A review that is unavailable or cannot record
lets closure continue and is reported. A rerun that finds the final closure
already committed runs no second review and says so.

Changes:

- `dough-story-wrap-up/SKILL.md`: one sentence in the frontmatter
  `description` and the opening section naming the flag; a short section
  between “Delete spent history, including shared records” and “Commit final
  closure” giving the review point and the link to the shared rule; evidence
  locators in a finding use the before-cleanup commit for deleted sources, as
  that skill already requires for follow-ups.

Accepted proof: the guidance check's Story Wrap Up test (description, section
order delete < review < final closure, shared link, findings in final closure,
no second review on rerun) plus the four existing checks, 26/26; link check
exit 0. Findings travel with the final closure commit; each mode's existing
closure path decides publication, so local-only closure stays pending.

## Current decisions

- One shared reference owns the caller rule; Dough Land and Story Wrap Up hold
  only their review point and publication path.
- No script, dashboard, or `open-dough.json` change.
- Native acceptance of a flagged run is not planned here; under ADR 0005 it is
  a separate, manually run observation, and the plan's proof covers the source
  guidance only.

## Execution complete

Product advice:

- Queue ODF-200's follow-up ahead of routine work: in this execution
  `deliver --target-ref refs/heads/main` was accepted in Story Branch Mode and
  published slice 1 (`1be19216`) to trunk before integration.
- At wrap-up, clarify in `docs/installation-and-updates.md` that
  `skipProcessRetrospective` governs the execution retrospective only;
  `--process-retrospective` turns on the review for a landing or wrap-up.
- The release that ships this adds its `CHANGELOG.md` entry.
