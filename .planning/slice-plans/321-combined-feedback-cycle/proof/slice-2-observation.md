# Slice 2 native partial-cycle and recovery observation

Observed on 2026-10-20 with the same prepared execution checkout, Node `v24.21.0`
and native `codex-cli 0.163.0` as slice 1. The wrapper and phase contract hashes
in `partial-candidate-sha256.json` match the unchanged product candidate. No
additional wrapper rule or phase/Git policy was needed: slice 1's complete
composition already carries the interrupted boundaries. Slice 2 adds the
required recovery observations and temporary raw fixture helpers only.

## Inputs, authority and first native command

Literal setup command, terminal exit 0:

```sh
python3 .planning/slice-plans/321-combined-feedback-cycle/proof/setup-partial.py /tmp/dough321-combined-proof/partial
```

The builder calls the existing raw complete-input setup, adds independent beta
and gamma repositories and local bare origins, removes beta's source log into
an external recovery copy, and supplies alpha's unrelated local commit plus
separate staged and unstaged private bytes. These are starting conditions,
not classifications, selected responses or maintenance results. Alpha's hook
accepts the first maintenance publication and rejects later ones while an
external block file exists. Gamma initially exists outside the inventory.

The independent fixture actor command, terminal exit 0 (owned session 80455):

```sh
python3 /private/tmp/dough321-combined-proof/partial/inventory-actor.py
```

It adds gamma to the supplied inventory only after observing alpha's first
accepted publication. `partial-inventory-addition.txt` records the triggering
accepted SHA; the native trace independently reads the initial three entries,
then the changed four-entry list. The actor does no maintenance.

Proof command, terminal exit 0 (owned session 8918):

```sh
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/321-combined-feedback-cycle/proof/run-native.sh /private/tmp/dough321-combined-proof/partial
```

`partial-prompt.txt` supplies only invocation, authority, records, conventions,
isolation and actual unrelated-work conditions. It prohibits creating absent
logs, changing inventory/hooks or touching production. It supplies no expected
classification, occurrence/story count or priority. The unchanged runner uses
current native isolation/supervision, a 1,800-second deadline and 15-second grace.
`partial-exit.txt`, `partial-outcome.txt`, actual `partial-native.jsonl.gz` and
`partial-native-report.md` retain terminal evidence. No separate command watch
was created. Actor and native sessions both reached observed terminal exit 0.

Raw state capture command, terminal exit 0:

```sh
python3 .planning/slice-plans/321-combined-feedback-cycle/proof/capture-state.py /private/tmp/dough321-combined-proof/partial > .planning/slice-plans/321-combined-feedback-cycle/proof/partial-origin-state.json
```

The capture reads origin commits/record bytes and default checkout state; it
makes no pass/fail judgment. Assessment below is manual inspection of state and
actual native trace. No new assessor or replay framework was introduced.

## First return: gaps and independent delivery

- Trace item 0 names the invoked combined skill; items 1–14 read maintained
  local/shared/landing sources, actual inventory, evidence and target-installed
  helpers. Items 18/20 write and publish supported local results. Item 21
  discovers gamma; items 22/25 read its context, then create and publish its local
  result before item 29's shared work. Recovery item 2 explicitly reads the wrapper.
- Beta's canonical `DearDough.md` is actually absent in origin and default.
  Independently supplied `evidence/status.txt` supports its local DD-101 finding,
  but the final report's **Phase results and coverage** explicitly leaves
  unknown source contents unassessed. It does not manufacture the missing log,
  infer a beta shared occurrence or treat residual contents as entirely shared.
  The unchanged watch file has no exposure receipt, passed watch or retirement.
- All four accepted origins contain exactly one local DD-101 and one reciprocal
  `SEED-002#accurate-status`; existing Taken and unrelated queue membership are
  preserved. Open Dough's supported shared priorities lead its local story.
- Item 29 retains shared evidence before source adoption, then publishes later
  shared changes. Open Dough accepts `39730e245605b6b54f6d6bea47cfd208f54d9f08`
  and gamma accepts `90da84535b981d02251501103f1e28011f248c46` despite alpha's
  independent refusal. Each descends from its own accepted local result.
- Alpha's origin remains at local `ba4ba82bc6a5c522ed5f2bd1df4eb5f3a004d17e`.
  Its shared candidate `23c8776e38ebd18c40680d059a363244c6c5d50e` is retained
  at the same owned workspace/branch with suffix base equal to that local SHA.
  The target-installed publisher reports `persistent-contention`; the beforePush
  facts are in `partial-publication.jsonl`, exact handoff in
  `partial-publisher.mjs.txt`, and saved pending source in
  `partial-alpha-pending-DearDough.md`. The combined report says partial.
- Native item 33 uses installed refresh/retirement helpers. Clean accepted
  Open Dough/beta/gamma worktrees retire; alpha's failed candidate stays.
  Alpha's default refresh stops as `diverged`, separately from remote acceptance.

## Restoration input and rerun

The independent fixture-owner command, terminal exit 0:

```sh
python3 .planning/slice-plans/321-combined-feedback-cycle/proof/restore-partial.py /private/tmp/dough321-combined-proof/partial
```

It restores beta's original unavailable source bytes unchanged and publishes
only that raw input at `f4a3ae8eb050dad57031d31f65d26e269dcb7f0c`. It removes
alpha's external block file without editing its hook or retained candidate.
`resume-restoration.json` records this input provenance. This fixture input
commit is separate from native maintenance commits and counts.

Recovery proof command, terminal exit 0 (owned session 70830):

```sh
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/321-combined-feedback-cycle/proof/run-native.sh /private/tmp/dough321-combined-proof/partial
```

`resume-prompt.txt` adds the actual retained partial report/context and fixture
restoration facts to the original invocation. `resume-native.jsonl.gz` is the
actual fresh native stream. Item 14 executes the agent-authored
`resume-publisher.mjs.txt`: alpha resumes its original candidate, beta's restored
local duplicate is removed using the existing local finding/story, then its
previously unavailable shared execution is retained under ODF-001 before
adoption. The handoff imports each target's installed publisher/queued guard,
retains candidate/base before push, and uses installed refresh/retirement.
`resume-publication.jsonl` is the actual `resume-pushes.jsonl`, and
`resume-terminal-publication-output.txt` is unmodified item-14 output.

Independent raw capture command, terminal exit 0:

```sh
python3 .planning/slice-plans/321-combined-feedback-cycle/proof/capture-state.py /private/tmp/dough321-combined-proof/partial > .planning/slice-plans/321-combined-feedback-cycle/proof/resume-origin-state.json
```

Manual origin inspection confirms accepted ancestry and exact final records:

| Project/target | Final accepted SHA | Native maintenance commits / accepted pushes after fixture initial base |
| --- | --- | --- |
| Open Dough/main | `a7dd1840c22d44aea7c12fa5bdb79af16a459fb6` | 4 / 3 |
| alpha/master | `23c8776e38ebd18c40680d059a363244c6c5d50e` | 2 / 2 |
| beta/master | `b704a07b8663c54f96ea6a028ad11c43de491b22` | 3 / 3, plus 1 external restoration input commit/push |
| gamma/master | `90da84535b981d02251501103f1e28011f248c46` | 2 / 2 |

Alpha accepts its exact retained candidate, with no replacement workspace or
regenerated finding/story. Gamma's accepted shared tip remains unchanged on
recovery. Open Dough adds only beta's newly available execution to ODF-001.
There are four distinct checks occurrences (one per project), one od-publish
occurrence, one former-DD-102 alias in each shared log, one former-DD-103 alias
in Open Dough, and one local finding/covering story per project. Beta's restored
DD-101 does not produce a second occurrence or story. Canonical records retain
reciprocal links, unchanged Taken/direction/unselected order and the same shared
priorities. Every owned maintenance worktree/branch is retired after acceptance.
Alpha's separate default refresh remains stopped/diverged.

## Unchanged invocation and precise preservation

Proof command, terminal exit 0 (owned session 64517):

```sh
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/321-combined-feedback-cycle/proof/run-native.sh /private/tmp/dough321-combined-proof/partial
```

`unchanged-prompt.txt` supplies no new evidence, the latest correct native report,
and retained context. A capture mistake overwrote the exact native-complete
resume context with older partial facts before this invocation. It is explicitly
retained as `unchanged-supplied-stale-context.json`; `resume-capture-limit.md`
records the loss. No context was fabricated and no mutating recovery was rerun.
The actual recovery trace, report, publication pairs, output and origins remain
intact. This bounds the context-artifact claim, not those accepted Git facts.

The unchanged native report explicitly recognizes the older stopped JSON facts
and resolves them through the correct later report plus current fetched origins.
Trace items 7–12 read actual inventory, targets, accepted records, implementations,
local/shared evidence and existing stories. Item 13 writes only the requested
external report. Inspection of all executed commands finds fetch/reads and no
commit, publisher invocation, push or worktree creation. No receipt is inferred
from the native report or exit alone.

Final raw capture command, terminal exit 0:

```sh
python3 .planning/slice-plans/321-combined-feedback-cycle/proof/capture-state.py /private/tmp/dough321-combined-proof/partial > .planning/slice-plans/321-combined-feedback-cycle/proof/unchanged-origin-state.json
```

Its complete raw origin/default state equals `resume-origin-state.json`:
accepted SHAs, commit history, exact canonical record bytes, post-receive history,
default HEAD/status/index/private bytes and worktree lists. Accepted push counts
remain Open Dough 3, alpha 2, beta 4 (including external input), gamma 2. Both
`unchanged-earlier-publication.jsonl` and `unchanged-recovery-publication.jsonl`
are byte-identical to their pre-invocation counterparts, with 8 and 4 retained
beforePush records respectively. Trace plus unchanged beforePush evidence rules
out an attempted no-op repeat push that accepted history alone could miss.

Alpha's default HEAD remains `f7506ebdbf72a17b87f78094b111c8251a7ec28e`,
status `MM private-note.txt`, index blob OID
`3a7ec6a575b8d26e341eb3c0bf832c58c13de617`, raw index hex
`70726976617465207374616765642062797465730a` (the newline is preserved),
and worktree SHA-256
`732c11957e3a3e31b0f4f3f86c5b5949a983ee91e2de56370cfb2f4e5babccbf`.
`partial-private-before.json` preserves the original captured head/status/text
and separately labels exact expected OID/hex/hash computed from the builder's
explicit original byte literals; the early string helper stripped a newline and
is not the exact-byte evidence. Every later independent capture records matching
raw OID/hex/hash. `resume-private-ancestry.json` records exit 1, no stderr, for
private HEAD ancestry against alpha's actual accepted origin tip, independently
of refresh. Thus private commits and staged/unstaged bytes remain local/intact.

## Terminal checks, coverage and limits

Each exact stream command exited 0 and printed `complete`:

```sh
PATH=/opt/homebrew/bin:$PATH node tests/support/native-host-stream.mjs codex .planning/slice-plans/321-combined-feedback-cycle/proof/partial-native.jsonl.gz status
PATH=/opt/homebrew/bin:$PATH node tests/support/native-host-stream.mjs codex .planning/slice-plans/321-combined-feedback-cycle/proof/resume-native.jsonl.gz status
PATH=/opt/homebrew/bin:$PATH node tests/support/native-host-stream.mjs codex .planning/slice-plans/321-combined-feedback-cycle/proof/unchanged-native.jsonl.gz status
```

All three supervised native commands and the inventory actor reached terminal
results; their owned watches ended through the existing supervisor, with no
extra watch created. The coordinator's unrelated CI observer was not touched.
Partial item 15, recovery item 9 and unchanged item 6 hit the already-observed
write-isolation restriction on shell heredoc temporary files. The captured errors
name that restriction; subsequent direct `python3 -c`/tool writes completed each
affected operation. No product/isolation rule was changed and no replay replaced
the native continuation. Partial item 5's absent-log read is the intended beta gap.

G1 is observed by actual beta absence/qualified local assessment, independent
progress and no passed watch; exact unrelated private work is separately observed.
G2 is observed by the refused/retained alpha candidate, exact-candidate recovery,
no duplicate occurrences/aliases/stories, and the unchanged no-publication run.
G3's addition is observed natively; removal/retarget retention is the bounded
source walkthrough in `slice-2-walkthrough.md`. G4's combined reporting handoff
and receipt/attention path is also that source walkthrough. No reporting code
changed, so no isolated receiver was required; no fixture contacts production.
The missing-helper variant was reviewed in source, not run. Native behavior is
Codex only; the unchanged ordinary thin Claude pointer retains slice-1 review.
The original native-complete resume JSON is unavailable after the stated capture
mistake. No native success is claimed for removals, retargeting, reporting
receiver contact, Cursor or Claude. No selected improvement was implemented.

The extended raw recorder was also read against the unchanged two-project
complete fixture, without rerunning maintenance (terminal exit 0):

```sh
python3 .planning/slice-plans/321-combined-feedback-cycle/proof/capture-state.py /private/tmp/dough321-combined-proof/complete > /private/tmp/dough321-combined-proof/complete-recorder-check.json
```

Its `head`, `accepted`, `commits` and `records` match the accepted complete-input
capture for both projects; only newly recorded default-state fields are added.
Python compilation of the three proof helpers and `git diff --check` passed.
All three maintained contract hashes still match the captured candidate hashes.
Refactoring compacted the resume/unchanged raw JSON serialization only; parsed
values were checked equal before/after and the snapshots still match each other.
