# Historical replay inputs

Use each case's starting entry and observed event independently. Seed a scratch
log for each case from its own starting entry. Earlier replay edits do not
carry forward into later historical snapshots. Read a case only when judging
it. The starting entry is a projection of the named section at the pinned
revision. It retains the mechanism, prior count and status relevant to the
decision. Existing rows can be opened at that revision when needed. Follow only
immutable locators explicitly supplied in this packet.

Event dates with missing times bound the evidence. Use `unknown` for a
recording field whose value the event does not establish. Git take and
implementation timestamps date the evidence window. They do not supply an
occurrence timestamp. For project-local sections, preserve the local identity
and use that section as the starting log for the scratch walk.

## Group A

### A1

- **Project and execution** Open Dough, `SEED-105#land-and-wrap-up-process-retrospective` / plan 250 / `1be19216`. 5 October 2026 after the slice 1 commit at 14:48:39 +09:00. Claude Code, 0.3.56.
- **Starting entry** Open Dough `4aea12b4efd74a448f805d8eb1d53af8ae5c93e0:DearDough.md`, ODF-200 (former DD-196). The managed delivery command expects a full branch ref, which the usage and step do not specify. The entry is open and unqueued. Its 15 rows report lookups or rejected forms followed by successful delivery.
- **Event** The established start named `main` as target. The coordinator read the Story Branch Mode section and command help, then passed `refs/heads/main`. The delivery receipt named remote main. The subsequent remote ref check showed main at the increment revision and the execution branch still at its Take. The increment reached trunk before branch review or integration. No forced revert was attempted. Slice 2 used the execution branch.

### A2

- **Project and execution** Open Dough, `SEED-113#recover-consistently-from-rate-limits` / plan 264 / `a2d43dde`. 7 October 2026. Claude Code. Startup used 0.3.56, then the installed guidance became 0.3.57 within the execution.
- **Starting entry** Open Dough `0edabd1c0f33d7ed77fdcfa6e83188d342373d44:DearDough.md`, ODF-200. Its 21 rows include lookup friction and the unreviewed trunk increment. The entry names a delivered response at `9a9e0a6e` and `a1bcad0d`: require explicit mode, refuse a Story Branch target other than its own full branch ref before any push, and show the mode-specific commands. The entry still has the release pending.
- **Event** Before the merge, the coordinator used two lookups to find the proper target; the first delivery was accepted. After merging main at `fefab16da1d7a9041191be67bfd1830ea5f83f9d`, the installed `.claude/skills/dough-update/VERSION` read 0.3.57. The next delivery refused the missing mode. An explicit Story Branch retry was accepted. The execution observed mode enforcement and the successful retry. It did not try publication to the wrong branch on the new guidance.

### A3

- **Project and execution** Open Dough, `SEED-010#trace-changed-behavior-to-existing-consumers` / plan 343 / `291995f1`. 22 October 2026 at slice 1 delegation before 11:10:51 +09:00. Claude Code, release unknown.
- **Starting entry** Open Dough `ed9ce3bca0a9652b47065356a147877b084b2fe1:DearDough.md`. No matching empty-waiting delegation entry in this snapshot.
- **Event** While implementation and source review were pending, the coordinator launched a third agent called “Placeholder wait check” solely to reply “OK”. The agent reported 36,526 subagent tokens and one tool use. It returned “OK” and supplied no evidence. The coordinator then waited for the original agents. Existing guidance prohibited empty waiting calls.

### A4

- **Project and execution** Clipboard, `SEED-001#bounded-x11-text-write`. 3 November 2026 after its 21:03:55 +07:00 Take, at slice 1 delegation. Claude Code, 0.3.82.
- **Starting entry** Clipboard `14142ed4377df5c66959ff2fd9c51d2f4b5ea25d:DearDough.md`. No matching entry in the execution snapshot.
- **Event** After launching the slice 1 implementer and source reviewer the coordinator issued a shell call labelled “No-op placeholder” to keep a pending action while it waited. It cost one call and had no effect on work or proof. Existing guidance prohibited empty waiting calls.

### A5

- **Project and execution** Clipboard, `SEED-003#host-independent-desktop-free-tests`. 3 November 2026 after its 21:30:58 +07:00 Take. Exact event time unknown. Claude Code, 0.3.82.
- **Starting entry** Clipboard `60ecd904f04c66a513267da5d4f6d29b083b5122:DearDough.md`. No matching entry in the execution snapshot.
- **Event** After a failed record-writing script and before rewriting it, the coordinator made a call labelled “No-op placeholder check” to inspect shell history and echo a skip marker. It cost one call and had no effect on work or proof.

### A6

- **Project and execution** Open Dough, `SEED-272#prove-recently-done-check-supersession` / plan 529 / `705a53c8`. 8 November 2026 during source review before 19:48:00 +08:00. Claude Code, 0.3.92.
- **Starting entry** Open Dough `c3d528a9beb20f0ac614e4e2bbfd4de982a990e3:docs/maintainer/findings/ODF-325.md`, linked from `DearDough.md` at that revision. No-op delegations or shell calls while real agents run are covered by existing guidance. Open, unqueued. The five retained executions include A3's 36,526-token launch, two Open Dough shell calls with wasted turns and notifications, and two Clipboard calls costing one tool call each.
- **Event** While the source-only reviewer ran, the coordinator made a background no-op shell call and launched a Haiku agent solely to reply “ok”. Two extra notifications and a hand-back followed. The agent reported about 38,700 subagent tokens. It supplied no evidence and the real review arrived independently.

## Group B

### B1

- **Project and execution** Doughnut, `SEED-066#keep-every-transcribed-sentence` / plan 008 / `d68937a0d2`. 4 October 2026 during slice 2 before `b233c0e7f3`. Claude Code, 0.3.56.
- **Starting entry** Doughnut `9ad1cedcc0e5379f59c0ca3f1f3af11d2bf51586:DonutRetrospectiveFindings.md`, resolved DD-202. Its summary names `18b99b6424` and `52460a4077` as the response in always-loaded guidance. The original local DD-202 at `74faffb1b2:DearDough.md` had one docs-only correction after a removal left a note describing the absent behavior. Principle 7 at the Take tells every role to remove traces, including absence tests. Use this local finding's identity.
- **Event** Plan 008 prescribed proof that the deleted rewrite made no Responses API call. The implementer added a negative assertion; the refactor removed it citing principle 7. The plan records the drop at `b233c0e7f3`. One assertion was written and removed, and the delivered tests no longer carry that proof item.

### B2

- **Project and execution** Doughnut, `SEED-069#reliable-development-stack-lifecycle` / plan 006 / `62035934b9`. 5 October 2026 during slice 3 before 14:54:01 +09:00. Claude Code, release unknown.
- **Starting entry** Doughnut `5838ccfeaf369be95ea0db0681c6e7910f8d7e8b:DonutRetrospectiveFindings.md`, local DD-202 and the reopened section headed “Plans prescribe absence checks that Donut’s removal rule forbids”. The section names the principle 7 response and displays the DD-205 row for B1. One prior execution row is displayed in the reopened section. Do not use its count sentence as an identity.
- **Event** Plan 006 prescribed a test that writes a leftover `dev.pid` with the test process's PID. The test ran red, then green, then was deleted when the product stopped reading that file. The coordinator cited principle 7. The planned permanent proof did not survive; the existing free-primary start test carries the replacement outcome.

### B3

- **Project and execution** Pygardon, `SEED-20261075#story-corrected-jobs-polling` / plan 492. 5 November 2026 19:30:00 +07:00. Claude Code, 0.3.86.
- **Starting entry** Pygardon `24e3e88ab485256709497db82892342ca92d419c:ProjectFindings.md` contains no DD-136 entry. Its recoverable contemporaneous retirement summary at `ab88d6e99:ProjectFindings.md` names the adopted `e2e-test` skill response. The one earlier DD-136 run, pinned at `4670dc538:ProjectFindings.md`, expanded a Jobs directory argument to all 124 scenarios. At the Take, `.agents/skills/e2e-test/SKILL.md` says a directory does not narrow the run and to name `.feature` files or a glob. The always-loaded `CLAUDE.md` lists a single-feature example without the directory caveat.
- **Event** The plan specified `pnpm exec cucumber-js --parallel 2 e2e_test/features/jobs` for targeted Jobs proof. That invocation ran 168 scenarios, with 165 passes and three unrelated Docker environment failures. The corrected Jobs glob selected 23 scenarios and 340 steps. The reported ~11.5 minutes covered the whole implementer task.

## Group C

### C4

- **Project and execution** Open Dough, `SEED-146#gate-local-prerequisites-before-commit-and-delivery` / plan 331 / `4a1fb686`. 20 October 2026 startup before 21:13:58 +09:00. Codex, 0.3.66.
- **Starting entry** Open Dough `2e26b32763bf0b3263305bfbd805ead2219c3e98:docs/maintainer/findings/ODF-264.md`. Batching whole references or unbounded metadata loses requested passages and causes repeated retrieval. The entry is open and unqueued, with eight retained source rows from Doughnut and Pygardon. It names the existing targeted-retrieval guidance and no adopted response.
- **Event** Two startup results reported 20,586 and 17,431 original output tokens and truncated. The coordinator retrieved the missing delegation, CI, delivery and ADR context in bounded calls before dependent work. The observed cost was repeated output and reading. No isolated effort, missed obligation or new effect was established.

### C1

- **Project and execution** Pygardon, `SEED-20261038#filter-and-copy-review-symbols`. 28 October 2026 startup. Codex, release unknown.
- **Starting entry** Pygardon `907a3c0ff09861e632b5ff42db87bf11e6e32a9a:docs/process-findings/context-and-diagnostics.md`, ODF-264 (former DD-242). Batching entire references or unbounded metadata loses requested passages and requires repeated retrieval. The local entry links to the shared owner, pinned there at Open Dough `32b5ae0b4414d755bcde4ef6cd822774d7450771:docs/maintainer/findings/ODF-264.md`. No local execution rows in the entry.
- **Event** The startup batch of workflow references and broad generated-code searches repeatedly truncated. The coordinator used narrower reads before delegation and recovered the required context. No separately measured elapsed cost or loss of proof was reported.

### C2

- **Project and execution** Pygardon, `SEED-20261055#story-python-unit-test-feedback` / `ef9e3b09`. 29 October 2026 startup. Codex, 0.3.76.
- **Starting entry** Pygardon `4db2fc5239da09829d8791107838a88e18612d8f:docs/process-findings/context-and-diagnostics.md`, ODF-264. Same local description and pinned owner as C1, plus three prior local rows from 28 October, all with unknown release. The pinned owner names the startup-retrieval table released in 0.3.69, one response boundary per result. Both the table and the 0.3.76 version file are present at the Take.
- **Event** The coordinator's first guidance batch reported 25,094 tokens and truncation. Later delegation/decisions and preparation/finish batches also truncated. Targeted rereads recovered required passages before the fixture optimization. No isolated elapsed cost was measured.

### C3

- **Project and execution** Lizard, `SEED-029#ocaml-support`. Original 4 November 2026 execution, before `e8ecf8a` and `59ddc71` acceptance. Claude Code, 0.3.82. The input event is a record review on 7 November, not an additional execution.
- **Starting entry** Lizard `1125cee3fd6713e4db6d14da55239e8584afb6bb:DearDough.md`, DD-010 and DD-012. DD-010 holds examples of coordinator probes finding what green parser tests missed. DD-012 concerns path-dependent outputs and already contains the original OCaml row, present since `e1f37ed46`. That commit message identified DD-010. The original OCaml finding did not yet exist at the execution Take `109a103c`.
- **Event** The reviewer has the existing OCaml row and its original evidence. A coordinator probe caught a green test that passed by a second rule and checked a missed one-line example. Two tests were tightened, with no product change. The record review has no new execution or observed probe outcome.
