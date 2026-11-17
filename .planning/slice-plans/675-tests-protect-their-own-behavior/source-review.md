# Source-only review

Reviewer launch: `collaboration.spawn_agent`, task `/root/source_review`,
`fork_turns: "none"`, on 2026-11-17. The launch and returned commitments are
retained in this execution conversation. The input supplied only the selected
story’s original Goal, Scope, key examples, evaluation and architecture
context, with instructions to read no project files and change nothing. It
contained no plan, implementation, proof, suspected omission or slice scope.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The existing refactor-check wording makes a test’s subject “what its own name promises,” rather than allowing its file, header or plan row to determine that subject. | slice 1 | observed: Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md: Write observable cases own-name sentence; PLAN.md Slice 1 accepted evidence examples 3–4 |
| 2 | A promise added by a change gets its own test, sharing setup. It is not added as an assertion in another behavior’s test or accommodated by widening that test’s name or header. | slice 1 | observed: Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md: added-promise sentence; PLAN.md Slice 1 accepted evidence examples 1–2 |
| 3 | An edited test body that branches by case is split. The specific example is the Cancel/Escape model loop receiving effort setup: separate named tests share setup. The evaluation criterion also allows “or the return names them”; that qualification is weaker than the required-scope wording and should remain visible. | slice 3 |  |
| 4 | Strict default proof remains at its existing owner. The model-boundary default case retains exact `--effort medium`. | slice 3 |  |
| 5 | Strict command-format proof remains at its owner. The first launch-boundary case retains the complete argv, including the default. | slice 3 |  |
| 6 | Meaningful positive witnesses remain, including an absence test’s proof that the details loaded. | slice 3 |  |
| 7 | The feedback launch default effort is proven in a test whose name is about that effort. | slice 3 |  |
| 8 | The status line’s effort is proven in a test whose name is about it; the example phrase is “medium effort.” | slice 3 |  |
| 9 | Notification/deduplication tests do not observe effort. Changing the launch default leaves the unchanged “an attention report notifies once …” test green. | slice 3 |  |
| 10 | The notification test still detects its own defect: a second notification fails it. | slice 3 |  |
| 11 | Persistence/reload tests do not observe effort. They observe the saved host and model, and a changed default leaves them green. | slice 3 |  |
| 12 | The persistence/reload test still detects its own defect: a model lost on reload fails it. | slice 3 |  |
| 13 | A chosen-model case does not copy the default’s value, argv length or record field. | slice 3 |  |
| 14 | The chosen-model case still proves its own behavior by observing `--model` and its value through the reader. | slice 3 |  |
| 15 | Naming cases do not copy the default’s value, argv length or record field, so changing that default does not require repairing those unrelated cases. | slice 3 |  |
| 16 | Blank-input cases do not copy the default’s value, argv length or record field. An effort change leaves the empty ad hoc field case green. | slice 3 |  |
| 17 | The empty ad hoc field case proves through the actual argv reader that no instruction was sent. Sending an instruction still fails that test. | slice 3 |  |
| 18 | In the bounded scratch counterexample, setting the default to another valid level fails only the default’s owners. The examples include using `high` and retaining a dedicated default test that detects a wrong default. | slice 3 |  |
| 19 | A deliberate fault in each loosened test’s own promise still fails that test. The notification, reload and blank-input examples above are explicit instances; this requirement also covers other loosened tests. | slice 3 |  |
| 20 | The final return names retained residue, such as the older unedited model-display loop. | slice 3 |  |
| 21 | The final return makes no “all-clean” claim unsupported by inspection. | slice 3 |  |

## Unnumbered source context returned by the reviewer

- The guidance is changed within existing refactor-check paragraphs, preferably by deleting, merging or replacing words. The source excludes a new section, rule list, helper, reader or template there; it separately permits a new shared reader when it simplifies and never requires one.
- Consumer reach, planning-side proof placement, a guidance perturbation step, the delivery brief’s counting clause and repairs to today’s product tests are excluded.
- Frozen A, frozen existing B runs, a fresh final B redo, fixed criteria, pinned candidate settings, participant blindness and bounded counterexamples describe the comparison and proof method. Effort is secondary; a single replay does not isolate a guidance effect.
- Host/context differences, unknown measurements and stops must be disclosed. Simplified tasks cannot replace the historical comparison or treat A as matched evidence.
- Refactor checks retain their architectural home; changes are limited to `Distribution/src/skills`, with client delivery later. Further native runs require selected-story authority.
- No mandatory report template, counters, parser framework or blanket full suite is promised. Existing sufficient instructions may warrant investigating their application without expanding the wording.
