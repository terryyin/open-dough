# Claude refactor evidence

Supplemental observation of patch `934a51a30`; A and the earlier Codex result
remain frozen. Protocol and native identities: [continuation](claude-comparison.md).
Product/test cutoff: `d8efcf6fb42e0fb60f6c2b3e00bb2f41d7e54881`;
completion `9cd8ee5f2` changes only four plan lines. Final native record is
done with a clean checkout. No participant received follow-up input.

## First brief: readable facts, inaccurate classification

Root `a46d7c72…jsonl` :424, 2026-11-17 00:58:57.197 UTC, delegates
“Slice 1 post-change refactor” after reading the patched delivery paragraph.
Its actual prompt says:

> 27 test or support files were edited. All are outside the product subject,
> and every edit is an expectation update to an exact argv or record that
> now holds `--effort medium`.

It then lists nine backend launch specs, two backend session specs, fourteen
E2E specs and two support files, along with observed positional reads, a
250-line file and a long comment. It supplies accepted proof and limits;
it proposes no reader extraction, assertion remedy or other refactoring.

Thus the facts-only mechanism was exercised. The count is **files**, not
test cases. Its “all” classification includes the direct default-effort
case in `agent-launch-model-boundary.spec.ts` and the mixed feedback test.
Those are not all incidental consumers. The file total cannot substitute
for the requested semantic count of tests edited outside their subject.
The remedy-free direction is useful; the evidence does not support calling
the entire brief accurate. Original Codex brief remains unassessed, as agreed.

## First return: a useful refactor with a bounded reader

Child `agent-aed40aaf6bec5f4fc.jsonl` :326, 01:08:01.140 UTC:

> Following refactor-checks ("one domain-named reader for an output";
> "loosen what it observes rather than update its value"), I changed them
> to read only the part they test.

The resulting first code commit is `1c1e6f300bd7cb17fe399f9984ee3f920e07cffa`.
`dashboard/tests/support/claudeLaunchArguments.ts` reads actual recorded argv
into name/model/effort/instruction. `startedSessions` projects those actual
calls to name/instruction/cwd. Neither receives an expected result or injects
the host default. Exact equality of the projected call list still protects
cardinality, names, instructions and folders while ignoring unrelated options.

Ad hoc and instruction/option cases now use semantic fields; blank launches
retain `not.toHaveProperty("instruction")`. Shared unattached-launch and
voice-recovery assertions also use the reader, reaching unchanged helper
consumers. This is a wider correction than the inspected Codex backend pass.

The return also claims:

> It throws on any other shape, so "nothing else is passed" is still guarded.

That overstates the 47-line implementation. It validates the fixed prefix
and rejects more than one remaining positional argument, but a missing
option value becomes an empty string and repeated recognized options
overwrite earlier values. A lone unrecognized token can become instruction.
Its bounded grammar is sufficient to explain the inspected projections;
it is not a replacement for strict command-format proof at the owner.
Changing its comment or proof claim is smaller than inventing a general parser.

The return explicitly leaves strict format proof in the first launch-boundary
case and dedicated effort cases. Chosen-model boundary cases also still copy
literal medium into full argv expectations. Record-shape cases instead read
`hostDescription("claude").defaultEffort`; this checks consistency without
pinning the value again, while direct default proof retains literal medium.
Judge these by their promise rather than declaring every complete comparison
a smell. The feedback notification/deduplication case still observes effort
against the configured default and remains a mixed contract.

Proof reported: 73 focused backend and 52 E2E tests after the refactor,
typecheck and ESLint clean; the coordinator subsequently formats and commits.
The refactor fixed its own first-run mistake of parsing later `agents --json`
calls as launches. Broader accepted product proof preceded this pass; affected
consumer tests were rerun. Self-reported “about 25 minutes” is not used as a
comparable active-time measure.

## Second return: remove duplicated wording, keep the behavior

Child `agent-ab91e460b9c11f078.jsonl` :166, 01:24:43.548 UTC, removes duplicate
checked-option labels from the frontend default/reset cases and matches just
the effort levels in the E2E availability case. Exact cost/default labels
remain in their frontend owner. Start still sends the selected effort; the
dedicated E2E default case still checks that medium reaches the command.
Its focused frontend and E2E model specs each pass five tests.

This improves failure ownership without dropping the user-visible label proof.
The modified Cancel/Escape parameterized body still branches on its case,
however. A clean return does not establish literal compliance with every
refactor check. The older model-presence/absence loop also remains in the
implicated disclosure file; it was not introduced by this change.

Both returns name no oversized remaining candidate. Their scope/claims and
remaining code must be assessed separately from whether the conditional
oversized-follow-up rule was triggered.

## Third return: separate presence and absence, preserve a positive witness

Child `agent-a43d0393e01da67be.jsonl` :121, 01:41:45.258 UTC, reports:

> The new effort test was a `for (const effort of ["max", undefined])` loop.
> Its body branched on that parameter: a positive assertion for max, an
> absence assertion for none.

It splits the loop into two named tests sharing `storySessionDetails(page)`.
The absent-effort test first observes “Local: launched from this dashboard”,
then absence of “Effort:”. This is a useful positive witness: absence alone
could pass because the intended details never loaded. The max case asserts
the exact requested-effort text. Both observe through reload.

It removes a redundant count because the shared disclosure helper's strict
locator already requires one entry. That is a reasoned proof substitution,
not evidence that count assertions are generally wrong. Five focused tests
pass. Removing the effort paragraph makes the max case fail; the file is
restored. The none case passes that mutation, as its different promise should.
That check validates the positive case's sensitivity, not the absent case's
sensitivity to an unwanted effort line.

The return explicitly notes the older model loop still branches and calls it
pre-existing, rather than hiding it behind a whole-file clean claim. It names
no oversized candidate or follow-up. This is stronger scope reporting than
the original Codex “no unresolved gaps” return, without proving every residue
was appropriately disposed of.

## Fourth return: existing builder, narrower recovery observation

Child `agent-ab6e2522ca0f720d1.jsonl` :210, 01:48:14.970 UTC:

- The new saved-Codex-choice case switches from raw JSON setup to existing
  `authorizeFeedbackMaintenance`, which uses MakeMe. Malformed bytes remain
  explicit in the malformed-file test because they are its subject.
- Malformed-file recovery checks the enabled-status prefix rather than
  copying medium. The first persistence/reload test still checks complete
  Claude status strings including medium, and the Codex case observes no
  effort wording. Three focused E2E tests pass.
- It explains why the short default-selection rule need not become a shared
  abstraction: the default value already has one owner in host description.

All four refactor passes return no oversized remainder; completion learnings
record the reader and broader consumer reach. Edit 3's conditional named,
oversized follow-up and carry-forward remain **not exercised**. Existing
scope notes are useful evidence, not a successful test of that conditional path.
