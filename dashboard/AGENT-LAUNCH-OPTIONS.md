# Dashboard installed launch options

Refinement's options come from the selected host's installed
`dough-story-refinement/references/refinement-options.json`: `.claude/skills`
for Claude, `.agents/skills` for Codex. Execution and ad hoc have no options.
The workflow table names the definition file; `src/commandOptions.ts` owns its
schema and selection rules, and `server/launchOptions.ts` reads it afresh.
The machine answer carries offers qualified by project, workflow and host;
updates appear on the next machine read and changing hosts shows its own offer.

A definition names its command and entries (`flag`, `label`, one-line `summary`,
agent `instruction`), with options and focuses presented as one list. Duplicate
flags, undefined group flags, or a flag in two groups invalidate the whole
file. Empty or one-member groups remain valid. An exclusive group appears as
radios at its first member, with “No <group>”; other entries are checkboxes.
Options show labels, flags and summaries, with “Choose any combination; they
apply together. None means straightforward refinement.” The command hint adds
chosen flags in definition order and announces changes politely.

No selection means ordinary refinement even without a usable definition. The
dialog explains reading, empty, missing, unreadable, invalid or wrong-command
options. Selected flags are checked again before any native launch. Unknown
flags, unavailable definitions, exclusive-group conflicts, or options on another
workflow are refused with the flag/group/reason and “Nothing was launched”.
At most 32 single-line flags are accepted; empty means none. A refusal retains
selection for reopening, while cancellation drops it. Flags no longer offered,
including after switching hosts, are named as “Not offered any more, so not
sent”; they are visibly excluded from the prompt. Instruction/model are not
retained by a refused dialog. Records keep accepted flags in definition order.

See the shared [agent launch contract](AGENT-LAUNCH.md) for startup, history and lifecycle.
