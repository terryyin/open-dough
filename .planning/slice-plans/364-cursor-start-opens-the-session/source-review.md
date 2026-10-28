# Source review

Launch: fresh general-purpose reviewer, no project files, no plan, no product,
and no proof. Input: the Goal, Scope, key examples, and exclusions of
SEED-159#cursor-start-opens-the-session.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A person starting a Cursor refinement or a Cursor execution gets that Cursor session running. | slice 1 | observed: dashboard/tests/agent-launch-preparation-cursor.spec.ts and dashboard/tests/agent-launch-start-cursor.spec.ts, session stays up with the first prompt accepted |
| 2 | The start’s first prompt is delivered into that session. | slice 1 | observed: those specs, and dashboard/tests/boundary/agent-terminal-cursor-launch.spec.ts entered instruction |
| 3 | The start keeps cursor-agent attached to a terminal from the moment it decides whether to open a conversation. | slice 1 | observed: resume client stdinTTY and stdoutTTY in the launch boundary spec and both start specs |
| 4 | The start opens that conversation. | slice 1 | observed: saved session id and accepted prompt in the execution and refinement start specs |
| 5 | The dashboard types the first prompt into that conversation. | slice 1 | observed: dashboard/tests/boundary/agent-terminal-cursor-launch.spec.ts entered instruction equals the saved prompt |
| 6 | The saved session shows the prompt accepted. | slice 1 | observed: firstInput state confirmed in the execution and refinement start specs |
| 7 | The process is still running. | slice 1 | observed: processRunning in the launch boundary spec, and the open session on the execution and refinement cards |
| 8 | A workspace already trusted on its own, or already trusted through a parent directory, starts this way with no new trust question. | slice 1 | observed: execution and refinement start specs omit --trust and accept the prompt with no trust step |
| 9 | When Cursor still exits before the prompt is accepted, the dashboard shows the text Cursor printed. | slice 1 | observed: dashboard/tests/boundary/agent-terminal-cursor-exit.spec.ts explanation is the printed exit text |
| 10 | That shown text includes `No prompt provided for print mode`. | slice 1 | observed: that spec's explanation contains Error: No prompt provided for print mode |
| 11 | The dashboard records that the session ended. | slice 1 | observed: that spec's saved firstInput explanation and launch answer say The session ended. |
| 12 | Continue on that start does not create another session id. | slice 1 | observed: that spec's second launch adds no create-chat and keeps the same session id |
| 13 | This story leaves the trust decision with the person. | slice 1 | observed: execution and refinement start specs omit --trust |
| 14 | The start does not pass `--trust`. | slice 1 | observed: those specs' omitted flags include --trust |
