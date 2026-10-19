# Slice 2 execution observations

Repeat-use proof for [plan 317](../PLAN.md). Canonical statuses, execution identity,
obligations and CI observation remain at that plan; this is bounded proof detail.

## Setup and native sequence

The isolated inventory contains Open Dough/main, alpha/main and beta/master, each
with its own local bare origin. No production inventory or repository is written.
`setup-repeat-use.py` clones the accepted slice-1 source-Land fixture, preserves
its actual history and delivery conventions, and supplies tagged response bytes,
adopted bytes and timestamped execution receipts as inputs. It makes no maintenance
classification or output. The existing source-Land handoff and installed runtime
are reused; no release or installation of the product candidate occurs.

Literal commands run from the established execution checkout, with Node 24.21.0:

```sh
python3 .planning/slice-plans/317-collect-client-feedback/proof/setup-repeat-use.py /tmp/open-dough-feedback-317-source-land /tmp/open-dough-feedback-317-repeat
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-repeat repeat-first
python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-repeat-use.py /tmp/open-dough-feedback-317-repeat first
python3 .planning/slice-plans/317-collect-client-feedback/proof/advance-repeat-use.py /tmp/open-dough-feedback-317-repeat
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-repeat repeat-second
```

First setup exited 0; Codex 0.163.0 reached terminal status 0/outcome `exited`.
Initial assessment exited 1 for the actual obsolete retired-code summary left in
the maintained watch file. `repeat-first-independent-result.json` retains the
incomplete outcome, all actual accepted HEAD/tree/count snapshots and that gap.
A preliminary assessor's string-count assertion also counted a qualified mapping
locator as an occurrence; it was corrected to inspect occurrence lines. Actual
records had one failure occurrence throughout; no native output was changed.

## Observed current-slice gap and correction

The first native cycle removed ODF-004's owner/index/source entries after verified
relevant use on 2026-10-10T09:00:00+09:00, review due October 17 and complete review
on October 19. It left a plain-code retirement summary in the watch list. That
violates removal of obsolete finding-only references; a native exit 0 and accepted
publication do not waive this incomplete boundary (canonical obligation G4).

The single policy owner `retention-and-watch.md` now places retirement/pruning
reasons in the recoverable maintenance commit/report and explicitly disallows
retired stubs/summaries/obsolete references in maintained catalog/watch/source
records. The first failed evidence is preserved. `advance-repeat-use.py` copies
only that candidate policy into the isolated fixture; it does not repair output
records. It separately supplies actual v0.2.1 tagged transport correction,
matching alpha adoption bytes and relevant interrupted execution on October 19.
The already-required next native continuation owns both the new response/watch
assessment and removing the obsolete summary.

## Result-bearing first-cycle observations

| Promise | Actual observation |
| --- | --- |
| Response, release, adoption and exposure stay distinct | `aef29cc:docs/maintainer/findings/ODF-004.md` retains the recovered old execution version, actual response-guidance changes, v0.2.0 relevant use, watch start/review and full three-source coverage before retirement. The older `guidance.md` instruction is distinguished from the actually loaded response-guidance path. |
| Unused, unknown and unreleased cannot pass | ODF-014 records installation without relevant checklist use; ODF-015 preserves unavailable loaded revision; ODF-017 verifies the untagged formatting change and absence from v0.1.0/v0.2.0. All remain active without a watch. |
| Supported failure resurfaces without inflated recurrence | ODF-016's authoritative `New occurrence` retains one alpha-checklist-failed execution with the 30-minute rerun and distinct 3-minute comparison-tab effect. Both source narratives compact into one occurrence and keep DD-016/DD-116 traceability. The invalid normal-completion watch is removed because it never exercised interruption. |
| Historical identity survives pruning | ODF-019 is restored from allocation `80913be` and pruning `c9a746d`; v0.1.0/v0.2.0/current guidance show continuous implicit-preview behavior. It retains old and new distinct beta executions, with no replacement code. |
| Pruning is a disposition, not a fix | ODF-018's owner/index/beta source entries are removed following the explicit negligible-harm/no-response review; reason is in the maintenance commit/report and history remains recoverable. No noise archive is created. |
| Meaningful live work survives cleanup | ODF-020's queued and ODF-021's Taken records, source entries, reciprocal seed links and actual backlog membership survive despite similarly negligible impact. Existing Taken ODF-002 and severe one-off ODF-003 survive. |
| Preserve local/uncertain evidence and queue direction | Alpha DD-003 local-only bytes match the supplied baseline; ODF-011's uncertain attribution and ODF-013's qualified speculation remain. Canonical direction, existing selected responses and unrelated order remain. |
| Actual multi-repository publication | Open Dough/main `79c9dc63da70be8e40b95c0c795d7233d65753fc`, alpha/main `10da76a8fd1c1a3623b47d98b688dcedac6d33bd`, beta/master `3611e3f4e82cead7bda7a5bf7d7168011e85c544`. Independent assessment reads every tracked byte from each real bare origin and matches clean local contents. |

Open Dough retained evidence at `aef29cc` before dependent source shortening;
`od-publication.json` and `publish-maintenance.mjs` expose actual source-guide /
installed maintained-publisher use and queued-closure callbacks. Native prompts
are task based and supply no expected classification/ranking. Expanded commands,
streams, terminal states, reports and result JSON live at
`/tmp/open-dough-feedback-317-repeat`; they are temporary execution evidence.

## Corrective continuation

`advance-repeat-use.py` exited 0, creating v0.2.1 at
`8b5456543fa9273c1cc27101ec5d8c204ed93f02` and separately supplied input HEAD
`87aa08389bc3bd0e370e9ea32324a29b6bd80f29`. The fresh Codex continuation reached
terminal status 0/outcome `exited`. Independent assessment:

```sh
python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-repeat-use.py /tmp/open-dough-feedback-317-repeat second
python3 .planning/slice-plans/317-collect-client-feedback/proof/prepare-repeat-replay.py /tmp/open-dough-feedback-317-repeat
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-claude-replay.sh /tmp/open-dough-feedback-317-repeat
```

The `second` assessor exited 0 with `result: pass`, no gaps. It reads actual origin
files and asserts all current catalog/watch/source references to ODF-004/018 are
absent, with pre-removal owners recoverable at the input revision. This is the
positive observation for G4; first-cycle incomplete evidence remains retained.

Actual ODF-016 watch: **Watch start** 2026-10-19T09:00:00+09:00; **Review after**
2026-10-26T09:00:00+09:00. It cites v0.2.1, exact alpha adoption and the relevant
interrupted execution, full maintained-source coverage and the one-use evidence
limit. The active owner preserves historical failures and distinguishes outcome
from new recurrence. Neither the earlier October 8 normal use nor failed v0.2.0
response contributes age. No retirement before seven days is claimed.

ODF-017's actual new containing tag is v0.2.1: this release includes its previously
unreleased formatting change. The native continuation updates that fact but keeps
it active because checklist-interruption use does not exercise formatting checks.
The first cycle proves the unreleased refusal; the second proves that a containing
tag/adoption alone still does not establish relevant use. ODF-014 and ODF-015
remain respectively unexercised and unknown-version. Live queued/Taken links,
severe one-off, uncertain attribution and historical ODF-019 remain intact.

Accepted by independent origin-content comparison:

| Repository/target | SHA | Commit count |
| --- | --- | --- |
| Open Dough/main | `a54a95a45d79066129b5e6954a58f4db5648500c` | 21 |
| alpha/main | `f59bd4199ee949c55e8bdfac7f82f069c47b6cff` | 6 |
| beta/master | `3611e3f4e82cead7bda7a5bf7d7168011e85c544` | 4, unchanged |

Actual publisher: `second-cycle-publish.mjs`, maintained installed
`publishExecutionIncrement` with queued-closure checks and fetched-target callback;
receipt `second-cycle-publication-result.json`. Only ODF-016/017 owners and watch
changed in Open Dough's maintenance suffix; alpha compacts the repeated outcome
heading in DearDough.md after retention. Beta is unchanged. All checkouts are clean
and already current; source-Land/recovery implementation remains unmodified.

## Unchanged replay and acceptance boundary

Fresh Claude Code 2.1.303 completed the unchanged cycle with terminal status
0/outcome `exited`. Its actual stream invokes `Skill: collect-client-feedback`,
reads the canonical `.agents` source and current `retention-and-watch.md`, reviews
all selected logs/receipts/history, and writes only the external report. Independent
assessment command:

```sh
python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-repeat-use.py /tmp/open-dough-feedback-317-repeat replay
```

The replay assessor requires native terminal success, actual Skill/canonical/policy
reads, clean repositories and exact equality of each accepted HEAD/tree/commit
count to the preceding accepted snapshot. The second assessor was repeated after
adding exact baseline seed/backlog equality assertions; it exited 0. This added
structural proof required no native rerun or product change.
Replay assessment exited 0 with `result: pass` and `unchanged: true`.

Representative behavior review covers the changed conditional policy in its
invocation context: assessment/shortening requires qualified identity, actual
response/release/use, source coverage and live-link checks; reasons remain
recoverable in Git/report while maintained records shrink. No separate platform
handler or evidence archive was added. Current-policy Codex continuation and
Claude replay are fresh behavioral evidence. Cursor's unchanged canonical internal
skill mechanism reuses slice-1 integration evidence; no fresh Cursor lifecycle
behavior is claimed. No installation/update boundary changed.

G1's release/use/retirement/failure/reset/noise/link/history observations and G4's
obsolete-summary correction are supplied for coordinator acceptance. No further
current-slice implementation gap is known. G2's partial/concurrent delivery,
missing-source/configuration and dirty-checkout cases remain solely with slice 3.
All required commands reached terminal outcomes; owned native supervisors ended
their watches. The coordinator's CI observer is untouched. No product commit,
push, plan status/disposition edit, independent refactor, formatter or hook lint
was performed by this implementation agent.

Coordinator acceptance inspected the actual first retirement assessment, failed
watch summary, second watch/retained evidence, assessor and setup paths, and
independent origin/replay snapshots. The exercised retention policy matched
current source hashes. Independent refactoring changed plan whitespace only;
accepted proof stayed valid. `PATH=/opt/homebrew/bin:$PATH npm run format`
exited 0 before staging this slice.
