# Source review for SEED-341#keep-attention-completion-journey-within-timeout

The coordinator launched a fresh general-purpose reviewer (agent `72170936-0723-4b50-bf7e-3bf7a914cbd3`) on 2026-11-22. Its only input was the story Goal, Scope, Key examples, and Baseline from `.planning/seeds/SEED-341-simplify-session-tests.md` (`Keep the attention completion journey within its timeout under load`). It was told to use only that text, read no project files, and change nothing. The launch input and returned commitments are in this execution's conversation.

## Unnumbered source context

- Reason for the bound: "Developers get the same `agent-completion-attention` result locally and in CI whatever the machine load, so a red run names a real regression."
- Journey being split: the journey in `e2e/sessions/agent-completion-attention.spec.ts` ("installed attention report stays open, durable and readable through column change, retirement, restart, Mark as read and Mark as done"). The title names column change and retirement; the story states no separate expected result for either event.
- Quiet-journey pattern this split follows: "`agent-completion-quiet.spec.ts` keeps the installed closure and reporting without the `page` fixture; `agent-completion-quiet-done.spec.ts` reads a record composed through `retainedReport.ts` `retained()` and a recent MakeMe completion receipt; under load 40–71 its cases took 27% less time, and `DEBUG=pw:browser` shows whether a worker launched a browser."
- Retention rule the reviewer applied to C7–C42 and did not number separately: "Keep every current observation, each at the owner named above. Remove no observation unless another test already proves the same rule for a Codex attention completion."
- Scope limits: "Scope limit: no other completion spec (`-quiet`, `-cursor`, `-execution`, `-quiet-claude`) changes; no dashboard behavior changes. Fixture cost stays inside the test budget, the lever the quiet journey's developer rejected. Refused deliveries stay in `dashboard/backend-tests/sessions/agent-completion-identity.spec.ts`."
- Baseline: "On 22 November 2026, during the preparation observations for the quiet completion split, the case timed out at 30 s once under 86 CPU burners plus the four sibling completion specs on `--workers 4` (load 52 → 59). The developer had already chosen the journey split over moving fixture cost or overriding the timeout."

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Each case finishes inside the default 30 s test timeout. At load about 50 on 16 cores, each case in both owners passes inside 30 s. | slice 7 |  |
| C2 | Keep the default timeout. Add no timeout override. The goal names that default the default 30 s test timeout. Applies to the attention completion journey after the split. | slice 7 |  |
| C3 | Closure and reporting proves, without a browser page, that the real launch's installed attention report records a completion and leaves the session open. | slice 7 |  |
| C4 | Page proves, from a composed Codex record that already carries the attention completion, what the story card shows. It runs no launch. | slice 1 |  |
| C5 | The page owner runs no installed closure, proving from a composed Codex record that already carries the attention completion. | slice 1 |  |
| C6 | The page owner runs no installed reporting, proving from a composed Codex record that already carries the attention completion. | slice 1 |  |
| C7 | Installed completed-with-attention: the receipt records the message (the receipt and stored completion). Real launch's installed attention report, closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C8 | Installed completed-with-attention: the receipt records the Codex session. Real launch's installed attention report, closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C9 | Installed completed-with-attention: the store keeps that completion. Real launch's installed attention report, closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C10 | Installed completed-with-attention: `doneAt` is absent (no `doneAt`). Real launch's installed attention report, closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C11 | Installed completed-with-attention: the native session receives no interrupt (no native steering). Real launch's installed attention report, closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C12 | Installed completed-with-attention: the native session receives no rename (no native steering). Real launch's installed attention report, closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C13 | Installed completed-with-attention: the native session receives no new turn (no native steering). Real launch's installed attention report, closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C14 | A later installed unfinished report returns unfinished and still leaves `doneAt` unset. After the installed attention completion, closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C15 | After that later installed unfinished report, the store keeps that message. Closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C16 | After that later installed unfinished report, `doneAt` is still absent. Closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C17 | After the workspace directory is removed, the installed command still returns a receipt. Closure-and-reporting owner, on the installed path. Retention sentence applies. | slice 7 |  |
| C18 | After the dashboard process restarts, the stored receipt is that retained receipt. Closure-and-reporting owner. Retention sentence applies. | slice 7 |  |
| C19 | A composed attention completion's story card shows the message as text (the script tag is not an element). The record already carries that completion, page owner. Retention sentence applies. | slice 1 |  |
| C20 | That story card shows Working. Composed attention completion, page owner. Retention sentence applies. | slice 1 |  |
| C21 | That story card shows "Unread report: Completed with attention". Composed attention completion, page owner. Retention sentence applies. | slice 1 |  |
| C22 | That story card shows Mark as read. Composed attention completion, page owner. Retention sentence applies. | slice 1 |  |
| C23 | After the stored completion is unfinished, the open card shows "Unfinished work". Page owner. Retention sentence applies. | slice 2 |  |
| C24 | When the published backlog moves that story from Backlog to Taken, the message is on the Taken card. Page owner. Retention sentence applies. | slice 2 |  |
| C25 | Removing the workspace path does not clear that message on the Taken card. Page owner. Retention sentence applies. | slice 2 |  |
| C26 | The final report panel shows the native report. Composed attention completion journey, page owner. Retention sentence applies. | slice 3 |  |
| C27 | The final report panel does not show the reminder. Page owner. Retention sentence applies. | slice 3 |  |
| C28 | The final report panel offers no Mark as read. Page owner. Retention sentence applies. | slice 3 |  |
| C29 | Mark as read clears the button. Page owner. Retention sentence applies. | slice 4 |  |
| C30 | Mark as read records `reportRead`. Page owner. Retention sentence applies. | slice 4 |  |
| C31 | Mark as read leaves `doneAt` unset. Page owner. Retention sentence applies. | slice 4 |  |
| C32 | Mark as read adds no panel control. Page owner. Retention sentence applies. | slice 4 |  |
| C33 | Mark as done closes the panel. Page owner. Retention sentence applies. | slice 5 |  |
| C34 | Mark as done removes the message from the story card. Page owner. Retention sentence applies. | slice 5 |  |
| C35 | Mark as done sets `doneAt`. Page owner. Retention sentence applies. | slice 5 |  |
| C36 | Mark as done sets that with no done problem. Page owner. Retention sentence applies. | slice 5 |  |
| C37 | Mark as done renames the native session. Page owner. Retention sentence applies. | slice 5 |  |
| C38 | Mark as done interrupts the native session's in-progress turn. Page owner. Retention sentence applies. | slice 5 |  |
| C39 | The Done entry shows Done. After Mark as done, page owner. Retention sentence applies. | slice 6 |  |
| C40 | The Done entry shows the new name. After Mark as done, page owner. Retention sentence applies. | slice 6 |  |
| C41 | The message stays collapsed under "Unfinished work" until expanded. After Mark as done, page owner. Retention sentence applies. | slice 6 |  |
| C42 | The final report is still the native report. After Mark as done, page owner. Retention sentence applies. | slice 6 |  |
