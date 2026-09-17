# Reconcile, prune, and prioritize retrospective findings

Internal maintainer runbook for Open Dough. This is a document, not a skill or
part of the installed payload. Run it when the owner requests this recurring
maintenance cycle; creating this document does not run the cycle or schedule it.

## Invoke the runbook

Use this request next time:

> Run docs/maintainer/retrospective-findings-runbook.md for Open Dough, Pygardon,
> and Doughnut. You may directly edit all three projects' DearDough.md logs,
> reconcile and adopt finding codes, remove clear noise, retire findings that
> have passed the one-week watch, and put the two highest-priority remaining
> problems first and second in Open Dough's product backlog.

An explicit request to run this document authorizes those writes without a
separate approval for each mapping, deletion, or selected story. Follow any
narrower instruction in the invocation. This run does not authorize implementing
the stories, changing product direction, editing runtime skills, releasing,
committing, or pushing.

## Locations and inputs

| Project or record | Canonical location |
| --- | --- |
| Open Dough | `/Users/terryyin/git/open-dough/DearDough.md` |
| Pygardon (also called PyGarden) | `/Users/terryyin/git/pygardon/DearDough.md` |
| Doughnut | `/Users/terryyin/git/doughnut/DearDough.md` |
| Active identities and evidence | [finding-names.md](finding-names.md) |
| Released responses under observation | [near-term-watch-list.md](near-term-watch-list.md) |
| Product queue and direction | [PRODUCT-BACKLOG.md](../../.planning/PRODUCT-BACKLOG.md) |
| Canonical story homes | [seeds](../../.planning/seeds/) |

Resolve relative links from this document. If a project moved, use the owner's
replacement location; do not substitute another clone or worktree by guesswork.
Read applicable repository instructions and current Git status in all three
projects. Record initial file contents or checksums and inspect existing edits
before writing. Preserve concurrent and unrelated work; recheck file contents
before saving. Report missing or unreadable inputs and continue independent
work without treating missing evidence as an empty log or a successful watch.

Use the current versions of
[reconcile-retrospective-findings](../../.agents/skills/reconcile-retrospective-findings/SKILL.md),
[dough-maintain-findings](../../.agents/skills/dough-maintain-findings/SKILL.md),
[triage-retrospective-findings](../../.agents/skills/triage-retrospective-findings/SKILL.md),
and [dough-product-backlog](../../.agents/skills/dough-product-backlog/SKILL.md)
for identity, evidence, story, and queue conventions. This runbook's owner
authorization explicitly extends their ordinary boundaries: harvest these three
logs, apply reconciled names, prune selected records, and select and queue two
responses in the same run. It does not waive evidence or identity checks.

## 1. Harvest and unify names

Read the three current logs, the active catalog, and the watch list. Match each
finding by concrete meaning and execution evidence, not by its number or title.
Qualify local codes by project. Reuse an existing identity for the same issue;
retain distinct causes even when symptoms look alike. Inspect relevant guidance
history when deciding continuity or recurrence after a claimed correction.

Retain missing evidence in the appropriate Open Dough entry before shortening
source logs. Count a source project plus execution identity once; another
retrospective or renamed code does not add an occurrence. Preserve reported
release, timestamp, tool, observation, and qualified inference. Unknown remains
unknown; today's installed version is not the version used by an old execution.

Allocate new ODF codes above the highest historically allocated number across
both records and their Git history. Never reuse a code removed by pruning.
Check relevant log history for a reappearing retired report so it is not mistaken
for new evidence. No separate retired-findings database is required.

Apply unambiguous mappings directly to each DearDough.md heading and retain one
`Former local code: DD-NNN.` alias. Preserve the finding's body. Do not merge
different findings merely to obtain one shared heading, or rename an entire
historical entry when only a later occurrence belongs to a new identity. Isolate
ambiguous mappings, explain the evidence gap, and proceed with clear mappings.

## 2. Remove clear noise

Select only findings for which there is no worthwhile corrective work to pursue:
successful practices recorded as problems, obsolete one-off administrative cases,
or narrowly local friction with negligible observed harm and no useful general
response. Consider occurrence count, impact, current relevance, and existing
responses together. One occurrence alone is not grounds for deletion; a severe
one-off remains important. Do not assert that a problem cannot recur merely
because it has not been reported again.

Remove selected noise entries from the active catalog, watch list if present,
and all three DearDough.md logs. Match headings and former aliases by identity;
never delete another project's same-numbered local finding. Keep the selection
and short reasons in the completion report, not in a new permanent noise list.
For uncertain low-priority cases, retain the finding and explain why it was not
pruned. Preserve useful practices in existing durable guidance when already
captured there; this run is not an instruction to author new runtime guidance.

Do not silently cancel queued or Taken work attached to a candidate. Such a link
is evidence that the finding may still be actionable; retain it unless the
owner has also authorized cancellation or the existing disposition establishes
that the work is complete.

## 3. Review claimed fixes and the one-week watch

For every claimed fix in either Open Dough list, establish:

- the concrete mechanism the response addressed and its implementation commit;
- the first release containing that response, verified from Git tags and the
  relevant diff rather than a changelog claim alone;
- each reported execution's actual guidance release or modified revision;
- whether supported later evidence demonstrates the same problem after that
  response, a distinct related problem, or an uncertain relationship.

Update stale “release pending” notes when the containing release is verified.
A report on an older release is not a failed fix. A report on the fixed release
or later is eligible evidence, but its mechanism must still match. Unknown
execution releases cannot establish post-fix recurrence. Compare the modified
guidance when a project reports a modified installation.

Move an eligible released response with no demonstrated post-fix recurrence
from the active catalog into the watch list, retaining its identity, source
mappings, response, and occurrence evidence. Remove the corresponding source
log entries to shorten the three DearDough.md files. Keep unreleased responses
and cases lacking enough provenance to begin a watch in the active catalog,
marked with the missing evidence; exclude them from age-based retirement.

Each watched entry needs a compact watch note recording:

- **Watch start:** the earliest verified date the fixed guidance was in use in
  a relevant project, with the release and adoption or execution locator;
- **Review after:** seven calendar days after that date;
- **Last assessed:** review date, relevant projects/executions checked, and
  known coverage or provenance limits.

Use the supplied timestamp and timezone when available; do not invent precision.
For a date-only start, review on or after that date plus seven days in the
maintainer's timezone. Do not backdate an existing watch from its file's age or
the release date alone. Recover a supported start from history, or leave the
start unknown until it can be established. Do not require a new run every day
or a minimum statistical sample, but a week with no relevant use is unexercised,
not evidence that the fix withstood use.

At the next run, retire a watched finding only when seven days have elapsed,
relevant use of the fixed guidance is evidenced, all three current logs have
been checked, and there is no supported post-fix recurrence or unresolved
report that could invalidate that conclusion. Remove its entry and obsolete
finding-specific notes from both Open Dough lists and all three source logs.
Leave no second archive list; ordinary Git history retains recovery. This is
an operational retention decision, not proof the problem can never recur.

If the problem recurs, it does not pass the watch. Bring the actionable evidence
back into the active catalog and include the failed response in triage. Follow
reconciliation rules: a claimed fix that did not remove the mechanism does not
by itself establish a new identity; a demonstrated correction followed by a
reintroduction may require a separate identity linked to the earlier one. Keep
uncertainty explicit. A later corrective release begins a new watch once its
use is verified; do not inherit elapsed time from the failed response.

“Remove everywhere” means the maintained finding records in these two Open
Dough lists and the three DearDough.md logs, including obsolete aliases and
finding-only cross-references. Preserve unrelated occurrence evidence, product
knowledge, release history, and Git history. Resolve any live story link before
retiring its finding; do not leave dangling links or erase unfinished work.

## 4. Select and queue the top two problems

Rank the remaining actionable problems using observed severity, distinct
execution frequency, confidence, and current product direction. Include
post-fix recurrences from step 3 explicitly: show the claimed fix release and
the releases on which it failed. Repeated failure despite a response is evidence
to reconsider that response, not an automatic priority score. A severe one-off
can outrank repeated minor friction.

A problem may synthesize several findings without merging their identities.
Explain the shared problem and the concrete outcome a response should achieve.
Deduplicate executions across supporting findings when stating a problem's
frequency. Distinguish exact recurrence from related mechanisms, and do not
count successful practices as failures.

Select the top two and create two evaluable stories, using suitable existing
seeds before creating new canonical seeds. Give each a beneficiary, intended
outcome, bounded scope, evaluation, supporting finding links, and a completion
criterion to record the actual response and containing release on addressed
findings. Keep execution evidence in the catalog rather than copying it into
the story. Do not perform story refinement, slice planning, or implementation.

Place the stories first and second under **Backlog list**, following the backlog
skill's exact-title and canonical-link conventions. Add reciprocal “queued, not
resolved” links on the supporting findings. Preserve the direction, Taken
entries, and the relative order of all other backlog items.

Reuse an existing queued story that already covers a selected problem and move
it to the appropriate position instead of duplicating it. If that response is
already Taken, surface it as ongoing and choose the next actionable unqueued
problem for the requested backlog slots; report the distinction. Do not fabricate
a second problem if fewer than two are supported. If an existing prerequisite
prevents the requested order, explain that specific conflict before changing
the affected ordering.

## 5. Verify and report

Check the saved files, not just successful write calls:

- Names and aliases identify the intended findings; no retained identity has
  been duplicated or reassigned.
- Selected removals are absent from all five finding records, except evidence
  deliberately retained in the watch list during the observation period.
- Watch entries have verified release information and honest dates or explicit
  unknowns; no recurrence was retired as a success.
- Both selected queue entries resolve to real story sections and their finding
  links resolve back. Existing stories and unrelated edits remain intact.
- Run focused diff and whitespace checks in each changed repository. Do not
  run application test suites for this record-maintenance operation.

Report the mappings applied, noise removed with reasons, findings still watched,
findings retired after a week, and confirmed or uncertain post-fix recurrences.
Give the two selected problems, severity/frequency rationale, and queue links.
Name any skipped project or incomplete write. State which files changed and
whether they are uncommitted. Verify new files are present even when untracked;
do not claim an uncommitted runbook or watch list is durable in Git.
