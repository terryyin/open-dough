# Slice 3 execution observations

Partial/recovery proof for [plan 317](../PLAN.md). The plan retains statuses,
execution identity, obligations and the coordinator's CI observer. All native
activity here uses isolated local repositories and real local bare origins.

## Changed boundaries

The composing skill now accepts an explicitly invoked caller's supplied shared
phase authority/context, rechecks the actual discovery input before a full-coverage
decision and final report, and verifies a cited missing locator at its resolved
path. Its delivery still delegates to the maintained source Dough Land guide and
the target project's installed publisher. No Git algorithm, persistent phase
ledger, receipt database, or combined local/shared orchestrator was introduced.

`rg -n 'collect-client-feedback|findings-maintenance|validated maintenance'
.agents/skills src/skills docs/maintainer --glob '*.md'` found the single wrapper,
the runbook pointer and maintained Dough Land's existing handoff. Narrower child
triggers/authority and the source/installed-runtime boundary remain unchanged.

## Preserved initial incomplete observation

Literal commands, from the execution checkout with Node 24.21.0:

```sh
python3 .planning/slice-plans/317-collect-client-feedback/proof/setup-partial-use.py /tmp/open-dough-feedback-317-repeat /tmp/open-dough-feedback-317-partial
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-partial partial-first
```

Setup exited 0. Codex 0.163.0 reached terminal status 0/outcome `exited`; the native
supervisor and its actor were terminal before a fresh fixture was started. This
first run is **not accepted race proof**. Its original setup actor invoked
`git -C alpha-actor` from a pre-push hook while inheriting Git-local environment.
The actor therefore published the pushing worktree's candidate instead of its
independent commit. Its marker and the publisher's `reconciliations: 1` were
insufficient evidence: actual alpha origin `435bfee097729bd84b91704f147cedb9d2d87bc6`
does not contain the recorded actor `1941a5d0f1fe4eb51b31a0802b38fd90ca04c2bc`.
The fixture, terminal stream, marker, helper and report remain inspectable.

The same native report falsely says: “Current fixtures lack the evidence/usage.md
files and alpha adoption bytes cited by earlier retained assessments.” Actual
resolved files existed at
`/tmp/open-dough-feedback-317-partial/open-dough/evidence/usage.md`,
`/tmp/open-dough-feedback-317-partial/alpha/.open-dough/response-guidance.md` and
`/tmp/open-dough-feedback-317-partial/alpha/.open-dough/VERSION`; `ls -la` confirmed
them after the native run, and tracked history retains their supplied bytes.
That claim and its unnecessary owner/watch qualification remain in the original
`partial-report.md` and commits, rather than being repaired by the assessor.
The generic resolved-path check corrects the guidance gap; the next prompt names
the existing input paths without supplying a classification or expected result.

## Corrected fixture and native sequence

The corrected setup clears Git-local environment for the independent actor's own
repository. It starts from accepted slice-2 histories, supplies three new
project/executions under paired duplicate headings, and records the actual
starting refs and private checkout/index bytes. It does no maintenance judgments.
Open Dough and beta origins are renamed unavailable. Alpha's default checkout has
an unrelated local commit, staged and unstaged content and an untracked note;
its first push races a distinct prepared actor commit. The actor also adds gamma
to the inventory; gamma has a real origin/target but no canonical source log.

`advance-partial-use.py` changes only independently owned availability/source
inputs between invocations. The clients phase restores beta while Open Dough
stays unavailable. The finish phase restores Open Dough and lets gamma's owner
supply actual local-only feedback. A missing-config phase removes the supplied
discovery input. Reports and Git facts, rather than new product state, carry resume.

Expanded task-based prompts, literal native commands, terminal outputs, JSONL
streams and reports remain under `/tmp/open-dough-feedback-317-partial-v2`.
The launcher reuses `tests/support/native-codex.sh` and
`native-run-supervise.sh` with a 900-second bound per launch.

```sh
python3 .planning/slice-plans/317-collect-client-feedback/proof/setup-partial-use.py /tmp/open-dough-feedback-317-repeat /tmp/open-dough-feedback-317-partial-v2
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-partial-v2 partial-first
python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-partial-use.py /tmp/open-dough-feedback-317-partial-v2 first
python3 .planning/slice-plans/317-collect-client-feedback/proof/advance-partial-use.py /tmp/open-dough-feedback-317-partial-v2 clients
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-partial-v2 partial-clients
```

Corrected setup and the first native invocation exited 0/outcome `exited`.
The first assessor initially compared a newline-preserving read to a stripped
`git show` result and reported changed source bytes. A direct byte comparison was
true; `first-initial-assessment.json` retains that assessor-only failure. The
corrected assessor compares bytes and exits 0 with no gaps. No native output was
changed to pass assessment.

First accepted alpha/main is `0a51020ea12b8426d428cf1ff05f2be51e6d17ca`, containing
independent writer `54a2d0219e3b2eaa6132629e7a87d49be10a4448`. Actual pre-push log
records candidate `4cf7c1a593e22dbb4138528e7ab6ef32c9cc61aa` against original base
`eb403654d88660f1153f9a9c3be611d1f19cac3f`, then the accepted rewritten candidate
against the independent writer. `alpha-publication.json` confirms one maintained
reconciliation, original candidate, accepted SHA and deferred maintenance. The
accepted delta above that writer is only `DearDough.md`; `concurrent.txt` remains.
The assessor checks the actual origin ancestry, all unrelated source sections,
private commit/file exclusion, default HEAD/branch, raw index hash/entries, and
private/source bytes. Alpha's owned worktree was retired only after acceptance;
its dirty default checkout remains intact.

Open Dough retains committed evidence before compaction and unpublished suffix
ending `63041530e507326b1425fbf7ebb84cc731e8a5a2`; its unavailable origin remains at
input `76478888f33126902b7229bacf72624203c8f351`. Beta's unavailable master remains
at input `e17ee77ed88b544c0362ce732b69229ccf63d22f`, with committed candidate
`f9097d4aa657b0ad48a935b0f50700ef326a5ca5` preserved locally. Final native inventory
read verifies added gamma's repository/target and the actual absent canonical log;
report and watch qualify whole-set coverage instead of manufacturing a source or
retiring a watch. Native commands read `evidence/usage.md`, then alpha's actual
VERSION/guidance bytes; the report correctly verifies response/adoption, preserves
the October 26 review boundary and makes no false provenance-absence claim.

## Clients-only recovery

```sh
python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-partial-use.py /tmp/open-dough-feedback-317-partial-v2 clients
python3 .planning/slice-plans/317-collect-client-feedback/proof/advance-partial-use.py /tmp/open-dough-feedback-317-partial-v2 finish
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-partial-v2 partial-finish
```

The clients invocation reached terminal 0/outcome `exited`; independent clients
assessment exited 0 with no gaps. Beta/master now contains its exact previously
retained `f9097d4aa657b0ad48a935b0f50700ef326a5ca5`, with one new commit above its
input and one recorded push. Alpha origin SHA/tree/count and its push log remain
identical; Open Dough's retained local candidate is still exactly `63041530...`,
and its blocked origin remains exactly at the input SHA. No repository edits or
commits were needed to resume beta publication. Raw private index bytes and all
unrelated/default source bytes remain unchanged.

`clients-report.md` explicitly calls the cycle incomplete with both client
publications accepted: Open Dough publication is still unavailable, gamma lacks
its source, and alpha refresh remains separately deferred. Native inspection
continues to read the actual Open Dough receipt before reporting evidence limits.
This is an observed composed cycle result, not an inference from helper success.

## Final publication recovery

```sh
python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-partial-use.py /tmp/open-dough-feedback-317-partial-v2 finish
python3 .planning/slice-plans/317-collect-client-feedback/proof/advance-partial-use.py /tmp/open-dough-feedback-317-partial-v2 missing-config
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-partial-v2 partial-missing-config
```

The final recovery reached terminal 0/outcome `exited`; independent finish
assessment exited 0 with no gaps. Accepted Open Dough/main is
`afa5184b687fb827e6049bea7e5bdb34ed0eb57d`, containing all three retained unpublished
commits, plus one new coverage assessment because gamma's owner supplied an actual
source. `publish-maintenance.mjs` resumes the installed maintained publisher with
queued-closure and focused validation callbacks, explicitly skips already
accepted alpha, and records one Open Dough push and an accepted receipt with
`maintenance: already current`. It copies no Git algorithm.

Actual alpha and beta origins still have precisely the clients-phase SHA/tree/
commit count and push logs. The authoritative finding has exactly one of each
new project/execution, canonical seed/backlog bytes match the input, all unrelated
source entries survive, and gamma's local-only source is unchanged. The dirty
default checkout's raw index, entries, HEAD, branch and source/private bytes still
match setup. Alpha's owned worktree/branch are already absent; recovery creates
no replacement and correctly leaves default refresh deferred.

`recovery-report.md` distinguishes completed required maintenance/publication from
that deferred refresh. It verifies four readable logs, exact receipt/adoption
bytes and retained watch dates; superseding owner/watch assessments resolve the
earlier missing-gamma limit without retirement. The inventory wording was
subsequently clarified to say *unresolved* inventory changes/targets prevent
complete coverage; the observed resolved-addition recovery already establishes
that intended boundary. This wording clarification adds no new path or proof claim.

## Missing discovery input and final review

```sh
python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-partial-use.py /tmp/open-dough-feedback-317-partial-v2 missing-config
```

Missing-config native invocation reached terminal 0/outcome `exited`; independent
assessment exited 0 with no gaps. Every origin SHA/tree/count and all three push
logs exactly match the preceding accepted snapshot; private raw index/source/
file bytes still match setup. `missing-config-report.md` distinguishes verified
four known fixtures from unknown current selected-set coverage, records the
actual missing supplied path at entry/final reread, creates no inventory and
claims no new successful watch. It preserves prior accepted publications and
states this resume is incomplete only for current discovery assessment, with
alpha refresh separately deferred. `inventory.unavailable.json` retains the
independently removed input outside repositories.

All five owned native invocations (initial incomplete run plus four corrected
phases) reached terminal results; each supervisor retired its watchdog. No owned
actor remains live and no additional watch or CI observer was created. Terminal
states, prompts and expanded commands remain at the named temporary fixtures.
`PATH=/opt/homebrew/bin:$PATH codex --version` and
`PATH=/opt/homebrew/bin:$PATH node --version` returned `codex-cli 0.163.0` and
`v24.21.0` at the end of proof.

Representative AGENTS.md behavior review traces the changed description and
entry authority through supplied context, child boundaries, maintained Land,
failure, recovery and final report. The final inventory and cited-path rules
stay with the existing composing owner. An unresolved target, missing discovery
input or missing source limits only dependent work; resolved additions can regain
whole-set coverage. No conflicting ADR, product direction change or later-slice
removal is introduced. Recovery cleanup retires only origin-contained owned
resources; unrelated work and incomplete evidence stay recoverable.

Fresh Codex composition covers the changed conditional behavior. Canonical-source
mechanism reuse for Claude/Cursor remains as accepted in observations.md and
observations-2.md; no new tool-specific path or pointer was changed, and no fresh
Claude/Cursor recovery result is claimed. Inventory removals/retargeting receive
guidance review rather than separate native cases; native inventory addition,
missing log and missing configuration establish the selected risk boundaries.
No required slice-3 proof remains missing. Coordinator acceptance, refactoring,
formatting, hooks, commit and real-project delivery remain outstanding by role.

## Supplemental beta ownership observation

The final implementation return disclosed that the added clients-branch beta
owned-path assertion had not been rerun at the earlier stage. The coordinator
read that assertion and obtained its equivalent observation on immutable history:

```sh
git --git-dir /tmp/open-dough-feedback-317-partial-v2/beta.git diff --name-only e17ee77ed88b544c0362ce732b69229ccf63d22f f9097d4aa657b0ad48a935b0f50700ef326a5ca5
```

The Python-orchestrated Git command returned only `DearDough.md`; its assertion
passed. The same check verified clients-stage SHA equals finish-stage SHA and
current `refs/heads/master`. Thus the added ownership assertion is observed on
the exact accepted commit without reconstructing obsolete availability conditions
or rerunning a native session. This closes G7 while preserving the original
handoff limitation.

Coordinator acceptance inspected the named actual records, receipts, source/setup
and assertion paths; G2/G5/G6/G7 are closed in the canonical plan. Independent
refactoring reflowed plan prose only, preserving words and accepted boundaries.
`PATH=/opt/homebrew/bin:$PATH npm run format` exited 0 before staging slice 3.
