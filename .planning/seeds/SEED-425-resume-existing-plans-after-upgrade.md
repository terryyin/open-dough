---
id: SEED-425
status: active
planted: 2026-11-23
planted_during: Terry's decision to retire the separate source review
trigger_when: A maintainer upgrades or resumes work prepared with the previous workflow
scope: one story
---

# Resume an existing plan after upgrading Open Dough

<a id="resume-existing-plans-after-upgrade"></a>

### Resume an existing plan after upgrading Open Dough

**Identity:** SEED-425#resume-existing-plans-after-upgrade
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/785-resume-existing-plans-after-upgrade/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"93474d8be5cf3a75772a23ebe210981ff3ee8411588f1911b491596d2087ae41","plan":"c2e76b762dd361357a75b8dae21ecdd2156ab431f4a3a85d11030d0c68b0768d"}}
```

**Goal.** A developer returning to a partially delivered story can continue from its plan with the accepted evidence, outstanding work and delivery conditions intact.

**Scope.** Convert the remaining Open Dough plan with a linked legacy record. Exercise a previous-release installation updating to the candidate in an isolated project. Keep project-owned work recoverable throughout the transition. New work uses the full selected story, explicit amendments and proof from the candidate being accepted. Existing delivery operations own their actual receipts.

**Key examples**

- Plan 607 resumes at slice 3. The phone and queued-repeat results from slices 1 and 2 are recoverable. G1–G6 still require correction. G7–G9 retain their qualified proof. Its remaining final CI and landing conditions still apply.
- Plan 692 resumes at slice 2 with three qualifying watches outstanding and no recommendation. Its existing plan already records the evidence and resume condition. This conversion was exercised during preparation.
- An update from v0.3.111 removes the retired managed files from both skill roots. A project-owned unfinished plan and its evidence survive the install. A developer can complete the conversion and list the next slice. An outstanding obligation continues to prevent completion.
- A fresh plan runs through planning, acceptance and closure using ordinary slice proof. A format conversion cannot authorize delivery or mark unfinished work done.

**Decisions and findings**

- The full story, including requirements under headings such as UI and architecture, and developer amendments govern scope. ODF-139 records a narrower plan taking precedence. ODF-520 records a chart relying on color after all 66 rows were accepted. Proof must exercise the claimed behavior on the actual candidate. ODF-413, 421, 530 and 537 cover premature observation, upstream ordering, missing assertions and another revision's result respectively.
- Remove the isolated reviewer, timed delegation, returned IDs, second file, writer, checks dedicated to the table, and parallel closure tracking. Plan-only proof and real obligations survive. ODF-326, 367, 374, 377, 339 and 434 concerned repeated reviews, timing, inherited context or incomplete launches. ODF-383, 391, 436, 447, 478 and 481 concerned remapping, grammar, blank cells and duplicated observations. DD-363 concerned whitespace in the retired file.
- ODF-510, 514 and 536 were genuine recorder defects. Two successful writes left invalid reverse links and another erased the owning slice. Removing the writer disposes of all three. Preserve ordinary obligation semantics and the existing final receipts.
- Independent review sometimes caught a real omission, and a historical Cursor run accepted a contradictory location even after the wording changed. Model capability and the cost-benefit of extra review remain open judgments. Other findings about engineering and delivery retain their own scope, including ODF-303, 314, 340, 354, 381, 390, 413, 420, 421, 428, 433, 449, 460, 469, 517, 530, 537 and 547.
- The historical implementation entered in v0.3.67, gained numbered records in v0.3.73, a writer in v0.3.80, later delivery owners in v0.3.84, earlier delegation in v0.3.88 and grouping in v0.3.102. The last change reduced one replay from 112 rows to 43. A deletion-only amendment had previously cost about 43,000 reviewer tokens. Historical evidence and original names are recoverable from the [catalog before cleanup](https://github.com/terryyin/open-dough/blob/88999346d263df2003faae7785af4994e999df14/docs/maintainer/finding-names.md) and [project findings](https://github.com/terryyin/open-dough/blob/88999346d263df2003faae7785af4994e999df14/DearDough.md). Current dispositions are in the [maintainer catalog](../../docs/maintainer/finding-names.md).
