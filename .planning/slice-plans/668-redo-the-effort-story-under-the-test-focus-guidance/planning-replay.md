# Slice 5 — blind Codex planning replay

P finished on 2026-11-16 UTC and wrote a six-slice plan. The plan was read,
not executed. Source commitment 2 is observed; slice 6 owns the judgment.

## Frozen input and isolation

P's main starts at `4189acd98288fdb6b728b543ef32c542f3a4731b`, whose sole
parent is `0e6b0f3dc2d2ef9cbde9b8c23a01abcf5db7c80b`. One setup commit
removes plan 664, resets the selected story state to
`{"schemaVersion":1,"refinement":"refined","approach":"unselected"}`,
and applies only the `934a51a30` guidance patch to both installed roots.
The ten changed paths and clean starting status are retained in
[construction receipt](/Users/terryyin/open-dough-scratch/seed-391/p-codex-construction.json).
The sole remote is the local bare `p-codex-remote.git`, whose only ref is
main. No later source, comparison result or B evidence was given to P.

The [exact prompt](/Users/terryyin/open-dough-scratch/seed-391/p-codex-prompt.txt)
contains only the slice-planning invocation for SEED-388, `Plan only.
Publish and announce nothing.`, and the installed scratch skill path.
No message was sent after launch. Literal command, with that prompt on stdin:

```sh
codex exec --json --output-last-message /Users/terryyin/open-dough-scratch/seed-391/p-codex-final.txt -
```

Its cwd was `/Users/terryyin/open-dough-scratch/seed-391/p-codex`.
No model, effort or trust override was supplied. CLI 0.169.0 warned that
untrusted project-local configuration was disabled, then ran normally.
The [launch receipt](/Users/terryyin/open-dough-scratch/seed-391/p-codex-launch.json)
records AC power and the owned `caffeinate -s -i` guard, stopped after exit 0.
The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
applied inside P; the outside launcher performed no test or repair.

## Written plan and decisive observation

P created its own nested planning workspace:
`/Users/terryyin/open-dough-scratch/seed-391/p-codex/.worktrees/plan-show-launch-effort`.
Its new plan is retained there at
`.planning/slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md`, and
as [frozen plan copy](/Users/terryyin/open-dough-scratch/seed-391/p-written-plan.md),
SHA-256 `b69c44cfd7e7b9616a27da51de6819ea6e8c23d691659ff02aaf4bb73cc1ca21`.
The coordinator read that final 250-line plan and the terminal proof.

Lines 115–129: slice 2, **Launch tests observe the command behavior they
own**, `Type: Structure`:

> Enable slice 3 without changing commands. Reuse/extend native-call readers
> so model, instruction, name, folder, workflow and options tests observe
> their own fields instead of incidental whole argv or index 3. Keep strict
> effort/order proof in the effort-focused boundary test. Preserve blank-input
> absence, one native launch, refusal-before-launch, and saved request intent;
> do not hide effort in fixture data or strip it from raw calls.

> Proof: affected backend and E2E consumers below stay green with unchanged
> production behavior. Inspect the full diff for weakened subject assertions.
> Keep this immediately before slice 3, which needs the changed observations.

Lines 131–147 then put the default in Behavior slice 3:

> Omitted Claude effort → new session receives `--effort medium` and stores
> requested medium. Explicit levels stay unchanged.

Lines 203–209 name the affected backend/session/E2E consumers and shared
readers. They are not budgeted as incidental mechanical value updates.
Slice 1 is a deferred native uncertainty probe: Structure precedes the
default change immediately, rather than being literally the first slice.
The patched planning paragraph appears in completed native reads at event
lines 24 and 27; P's `cat` command read `executable-proof.md` directly.

## Native result, usage and limits

Native thread `01a1e52e-e6ff-7132-a4f2-1a6035a6328a`:
`/Users/terryyin/.codex/sessions/2026/11/17/rollout-2026-11-17T00-26-58-01a1e52e-e6ff-7132-a4f2-1a6035a6328a.jsonl`.
Effective `gpt-6.1-sol` / `xhigh`, approval `never`, `danger-full-access`;
475,000 context limit, last input 206,467. Ordinary Codex instructions,
catalog, scratch AGENTS/environment and skill expansion were present; no
Claude memory was injected or represented as equivalent. No children ran.

Launch 16:26:55.565–terminal 16:39:07.544 UTC, exit 0 (731.979 seconds).
The retained timestamp method gives an 11.81-minute root orchestration
proxy, with 42 matched blocking tool spans and no unmatched calls. It is
not CPU or comparable active-work time; operator work was about five minutes.

| P root usage | Tokens |
| --- | ---: |
| Input | 5,690,799 |
| Cached input subset | 5,509,248 |
| Output | 28,095 |
| Reasoning output subset | 9,096 |
| Input plus output | 5,718,894 |

Native counters and CLI `turn.completed` agree. Provider USD cost is
**unavailable**: no recorded bill/rate; no Claude rate or credit balance
conversion. This one cross-host planning observation supports no effect size.

P made no commit or push. Its nested workspace retains only the selected
seed's planned/ready state and new plan; product/test experiments were
reverted. Real main stayed `d288b03f91096cef74c581fa1794f1f7cf3a748b`.
No new paid native probe ran. Scratch repositories, nested workspace and
logs remain until Terry reads the result. There was no stop question.

Recoverable sources: [terminal proof](/Users/terryyin/open-dough-scratch/seed-391/p-codex-terminal-proof.json),
[full return](/Users/terryyin/open-dough-scratch/seed-391/p-codex-report.md),
[event stream](/Users/terryyin/open-dough-scratch/seed-391/p-codex-events.jsonl),
[native final answer](/Users/terryyin/open-dough-scratch/seed-391/p-codex-final.txt).
