# Start dashboard Claude Code sessions without the Artifact tool

**Identity:** SEED-345#start-implementers-from-a-role-sized-tool-set
**Source:** [Start dashboard Claude Code sessions without the Artifact tool](../../seeds/SEED-345-session-token-efficiency.md#start-implementers-from-a-role-sized-tool-set)

## Goal and scope

Every dashboard Claude Code launch passes `--disallowedTools Artifact`, so the
coordinator and the workers it starts carry no Artifact definition. Name,
model, effort and instruction stay as they are. Codex, Cursor and sessions
developers start themselves are excluded.

## Settled premises

| Premise | Observation |
| --- | --- |
| The flag removes the definition, not only calls, in a `claude --bg` session and its workers | 2026-11-23 probes, Claude Code 2.1.330: main tools 83.8k → 46.4k characters, worker 58.2k → 21.1k, Artifact absent in both |
| A session without Artifact accepts the flag | `claude -p --model haiku --disallowedTools Artifact -- "…"` answered and exited 0 |
| The variadic tool list swallows a following prompt | Same probes: without `--` the prompt was read as a tool name; with `--` it ran |

## Outside-in proof

| Promise | Owner | Observation |
| --- | --- | --- |
| Dashboard Claude launches withhold Artifact and still deliver the instruction | Slice 1 | `agent-launch-model-boundary.spec.ts` and `agent-launch-boundary.spec.ts` expect `--disallowedTools`, `Artifact`, `--`, then the instruction |

## Current decisions

- Add the arguments in `startClaudeInBackground`
  (`dashboard/server/hosts/claude/runtime.ts`), after effort, with `--`
  before the instruction. Update the expected argv in the existing cases;
  add no new case.
- Copies of those specs under
  `Distribution/evaluation/cases/guidance-checks/launch-command-tests/overlay/`
  are an evaluation fixture; update them only if their case runs against
  this runtime.
- Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Keep or stop from the next real dashboard-launched Claude Code execution's
  traces, as the story says; no paid comparison.

## Ordered slices

### 1. Dashboard Claude launches withhold the Artifact tool

Type: Behavior
Status: done

Pass `--disallowedTools Artifact --` before the instruction in every
dashboard `claude --bg` launch, and update the launch boundary cases.

**Proof.** The two launch boundary specs pass with the new argv and fail
without the flag.

**Accepted proof (2026-11-23).** `npm run test:dashboard:backend --
dashboard/backend-tests/launches/` exits 0. Against the pre-change runtime,
the `agent-launch-boundary`, `agent-launch-model-boundary` and
`agent-launch-ad-hoc-boundary` cases fail; with it they pass. Typecheck and
lint pass.

**Learnings.** The ad hoc boundary spec also pins the argv. The shared
`claudeLaunch` reader read `--` as an option and lost the instruction, so it
now treats `--` as the end of options. `scripts/test.sh` takes files only;
dashboard specs run through `npm run test:dashboard:backend -- <paths>`.

**Refactor follow-up.** Three follow-up launch specs
(`agent-launch-follow-up-boundary`, `-file`, `-identity`) read the
instruction as `argv.at(-1)`; reading it through `claudeLaunch` would drop
that position dependence. Settle at wrap-up.

## Execution complete

Product advice: no change. Judge keep or stop, as the story says, from the
traces of the first real dashboard-launched Claude Code execution after the
dashboard runs this revision. That execution's coordinator and workers should
start without Artifact, and its results should read as usual. This execution
was launched before the change, so it cannot show the effect.

## Plan review

Refinement not needed: one small slice in one function with existing proof.
No remaining slice-specific concern.

## Local gates

- On AC power, run tests under `caffeinate -s -i` with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes. Run
  `npm run test:dashboard:backend -- dashboard/backend-tests/launches/`, then `npm run typecheck:dashboard` and `npm run lint`. Keep default
  timeouts; never `test.slow()`.
