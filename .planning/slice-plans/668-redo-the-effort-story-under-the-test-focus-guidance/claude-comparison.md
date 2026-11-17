# Effort replay: Claude continuation and corrected comparison

The produced test code is better in identifiable places, but **neither B
supports an all-smells-gone verdict**. Claude narrows a wider E2E consumer set;
Codex narrows several backend observations more thoroughly. A later diagnostic
also finds an unchanged failing Codex consumer, which the first review missed.
The earlier smaller Codex edit count cannot establish lower coupling.

A stays frozen at product/test `4b75c2888..eda73008b`, completion `c741f265f`.
The accepted Codex phase is recoverable at `384713e45b7cf99110e5f7a506e5948248edb245`;
its original brief remains unassessed by Terry's instruction. This continuation
adds evidence and corrects conclusions; it never replaces or reruns A.

## Resulting tests, before counts

- **Meaningful narrowing:** Claude's actual-command reader replaces effort
  positions/defaults in instruction, naming, options and voice tests. Projected
  exact call lists keep one-launch, name, input and cwd proof. In A these cases
  mostly copy medium or shift positions. Codex makes the same useful change
  in its inspected backend subset, but misses affected E2E consumers.
- **Useful separate cases:** Claude's third refactor splits newly branched
  max/absent-effort tests. Absence first proves the intended details loaded;
  that positive witness deserves to stay. A conditional body chooses different
  assertions; both Bs finish with separate effort presence/absence cases.
- **Better proof ownership:** Claude's second pass keeps exact cost/default
  labels in the frontend owner while E2E availability checks just the levels.
  Its fourth pass reuses the existing builder for a normal saved choice,
  retaining raw bytes where malformed bytes are the behavior under test.
- **Residue:** Claude chosen-model boundary cases still copy literal medium;
  persistence/reload still compares three complete status strings; feedback
  still mixes effort with notification/deduplication. Two edited families
  retain case branches, plus the unchanged older model-display loop. Codex
  narrows chosen-model and acceptance cases further, but retains mixed
  feedback/status observations and the older display loop.
- **Claims need checking:** Claude's reader is useful without proving its
  return's claim that every other command shape is rejected. The new brief
  counts files/support as outside-subject tests, including direct/mixed effort
  cases. P overstates its consumer counts and completeness. A clean return,
  smaller diff or Structure label is insufficient evidence of a clean result.

Detailed [inventory](claude-test-inventory.md), [readable briefs/returns](claude-refactor.md),
[planning](claude-planning.md) and [measurements](claude-metrics.md) retain the evidence.
These comparisons support mechanisms and remaining hypotheses, not a guidance-only
causal estimate. One run per condition, context, CLI and proof differences remain.

## Corrected Codex conclusion: missed unchanged proof

At frozen Codex product/test cutoff `8b9005acc970c51503056e40aa66a668386b069b`,
`e2e/launches/agent-launch-ad-hoc.spec.ts:105` promises that an empty field
sends no instruction. Its unchanged :120 still asserts argv length three.
The original native gates cover selected model/effort E2E specs, not this case.
Shared `unattachedLaunchAssertions.ts` also still encodes the old command shape.

After **both** Claude sessions are stopped, one existing Codex test is run,
with no product/test edit, on AC, Node 24.21.0 and an owned awake wrapper:

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx --no-install playwright test --config e2e/playwright.config.ts --workers=1 --reporter=list e2e/launches/agent-launch-ad-hoc.spec.ts --grep 'starting with an empty field sends no instruction'
```

2026-11-17 02:07:57–02:08:01 UTC: exactly one selected test, one worker,
exit 1 in its assertion (test body 2.3 seconds):

> Expected length: 3
> Received length: 5

The recorded actual argv is `--bg --name <ad hoc label> --effort medium`.
Thus this path applies the new default; its old assertion is stale, rather
than the feature being absent. Git remains clean at completion `57f805ee2`,
whose product/test tree is unchanged from the cutoff. Native proof and
measurement windows remain frozen; this is a **post-trial diagnostic**.
Raw command/result: scratch `codex-unchanged-consumer-probe.json` / `.log`.

The supported correction is “edited backend observations improve, while the
whole Codex result has incomplete test migration/proof”. It is not “all E2E
consumers were decoupled”. The single diagnostic proves one missed failure;
other stale consumers are inspection findings, not unrun failure totals.
The first review was too generous about aggregate quality and is corrected here.

This historical result is not adopted or published product. The selected source
freezes the experiment and excludes outside repair/coaching; retain the negative
observation instead of silently repairing B. Current trunk already includes
`0724558d6`, the later actual-command reader repair excluded from trial inputs.
No current production defect or failed gate is waived on that historical basis.
The parent execution's separate mandatory CI repair remains accepted and excluded
from A/B evidence. The shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
still governs actual execution/delivery failures.

## Five guidance edits

Quotations refer to `934a51a30` in `Distribution/src/skills`, not current guidance.

| Edit | Observed evidence and recommendation |
| --- | --- |
| Shotgun surgery | **Keep the mechanism.** “loosen what it observes rather than update its value” is cited in Claude's first return and implemented across semantic backend/E2E observations. The inventory separates literal updates, configured-default consistency and strict format ownership. Neither refactor's clean return proves complete reach. |
| Named behavior / reader / cases | **Keep with limits.** “one domain-named reader” produces actual-input readers in both Bs; “A body that branches on its case parameter holds separate tests” explicitly drives Claude's third pass. Edited dismissal/kept-start branches and mixed cases remain; no universal clean claim. |
| Oversized named follow-up | **Not exercised in the returned outcome.** All four Claude refactor returns name no oversized remainder; no named smell/concept/reach follow-up is carried into completion. Existing scope notes do not exercise that conditional rule. No keep/revise/remove verdict is supported for it. |
| Facts-only brief | **Revise the counting clause; keep remedy-free direction.** “including the count of tests edited outside its subject” yields “27 test or support files… All are outside the product subject”, including direct/default and mixed cases. Specify unit and distinguish incidental/direct/mixed cases; the observed brief supplies no remedy. This is a recommendation from an inaccurate count, not proof wording alone caused it. Original Codex brief stays unassessed. |
| Structure before default | **Keep for written ordering only.** Claude P puts backend/E2E Structure slices 1–2 before default Behavior 3, quoting “assert the parts they prove… instead of the whole argv or argv positions”. Codex P also precedes its default with Structure. Neither plan is executed. Claude P's 286 lines, incomplete trace and permission-stopped readiness prevent an execution-ready claim. |

## Effective context and native boundaries

- Claude B: clean start `c629d0d938528e5ef0923b9ef041abb19b4c0751`; only
  patch 934a51a30 applied to both installed roots; local `b-remote.git` only.
  Exact prompt remains scratch `b-claude-prompt.txt`. `--skip-retro` is an
  explicit disclosed prompt difference from A, enforcing the intended stop.
- B starts 00:04:45 UTC, root `a46d7c72-ae04-4349-b60f-6f3f85545033`.
  Root/eight execution/refactor children are Opus/medium; source-only child is
  Sonnet/medium. CLI 2.1.326 versus A's 2.1.325; auto permission, no bypass.
  Product/test cutoff `d8efcf6fb42e0fb60f6c2b3e00bb2f41d7e54881`, clean
  completion `9cd8ee5f24ae11abeb185542aa775b35a33c4aa2`, official done.
  The completion commit adds four plan lines only, with retrospective skipped.
- Native B is stopped after done; its awake guard PID 24422 ends. No operator
  input follows launch. Its final suggestions about all-host details and
  existing model wording are observations; this trial adopts no product change.
- P starts `4d0bd15c4`, same tree as Codex P input, only local `p-remote.git`.
  Root `0604c3b5-f9ef-4a22-b5c8-166210980ab7`, Opus/medium, same CLI.
  It writes two Structure slices before the default, then stops at a native
  permission prompt. Readiness/clean completion are unconfirmed; guard 98700 ends.
- Both trust records were true before launch. P's 63 memory files match the
  independent pre-B snapshot. Actual setup-note reads, changed context since A,
  sibling artifact listing/dependency reuse and broad native-metadata search
  are disclosed in its report. No observed earlier outcome text is fed to P;
  this is not hermetic filesystem blinding. A's original memory use is unproved.
- A's hosted publication/CI, Codex default model/effort and extra retrospective,
  private local proof choices and missing provider bills limit attribution.
  Common transcript proxies are not actual active-work time. Claude's longer
  run and wider proof give no supported effort-saving estimate.

## Tentative follow-ups, no implementation or queue change

SEED-393 remains an unpublished review draft in this owned workspace. Its five
candidates address focused observations, honest residue, executing preparatory
narrowing, recoverable/blind native evidence and proof reaching unchanged
consumers. Each carries assumptions, provisional relative effort and a final
fresh B redo against **unchanged A**. A smaller manual cleanup/protocol is an
explicit alternative; do not add instructions or a platform without demonstrated
benefit. Recommend proof reach and test focus before the unexecuted planning
benefit; retain evidence capture only if the smaller protocol is insufficient.

Terry's trust step is finished; no command or new trust action is needed for
these observations. Further native trials belong to selected future candidates,
not an automatic retry to erase the current negative/partial evidence.
Retain scratch results for Terry to read and the unqueued draft for review.
