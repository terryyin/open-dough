# Prove installed launch options through typed backend requests

**Identity:** SEED-413#finish-backend-vitest-renovation-after-session-reads-and-alerts

**Source:** [Prove installed launch options through typed backend requests](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-session-reads-and-alerts)

## Goal and scope

Developers changing launch-option admission can check the requesting project's
installed definition in Node Vitest and see the flags Start sends and keeps in
the existing E2E launch journey. Move `agent-launch-options-boundary.spec.ts`
and `agent-launch-options-groups.spec.ts` off backend Playwright. Measure
feedback and account for all 16 former cases. The option schema and dialog
choice rules, generic launch admission, machine-session reading and runner
retirement retain their existing owners. The
[campaign remainder](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options)
carries the other backend families, including the separate rule spec that
currently serves as a Playwright runner specimen.

## Current decisions

- Follow the North Star for [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Follow [ADR 0002 on direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008 on machine-local launch records](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  and [ADR 0010 on comparing equivalent proof](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- Reuse [withSelectedOptions and readDefinition](../../../dashboard/server/launchOptions.ts).
  [Admission](../../../dashboard/server/agentLaunchAdmission.ts) already passes
  the typed request and its execution project's `LocalFolder` to that owner.
  The catalog uses the same reader for offered options. Use real temporary
  project folders with files at `installedSkillPath`. One test should make
  project selection observable with distinct files in two folders. The
  [shared option rules](../../../dashboard/src/commandOptions.ts) already own
  flag order, conflicts and unknown flags. The launch request schema owns the
  wire shape. The existing native-start journey proves the combined
  admission, dispatch and recording path.
- MakeMe owns launch requests, option entries, definitions and groups. Use the
  builder's `refining`, `withOptions`, `requestingModel` and
  `withInstruction` operations. Use direct file writes for installed state and
  deliberately invalid bytes. The selector at `93d26816e` enabled
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) on both backend files
  and [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) on
  the E2E files. Recheck selection if a path changes. No new test-support
  wrappers. Trace helpers to their remaining callers before deleting.

## Decisive premises

Observed at `93d26816e` in the preparation checkout on 25 November 2026 with
Node 24.21.0 and dependencies from the lock-identical integration checkout.
The 16-logical-CPU Mac was on AC power. Load average was about 35 before
verification, with about 40% CPU idle in the immediate sample. Run one
worker and run the two suites sequentially. Treat timings as a single loaded
sample. Use a new proof-record path each run.

| Premise | Consuming operation and observed result |
| --- | --- |
| The maintained backend command selects both legacy specs and runs their actual HTTP launch and refusal cases | The backend command below completed 16/16 strictly green. The boundary file ran 12 cases in 46.845 s summed, the groups file ran 4 in 22.026 s. Wall time was 83.61 s. Cases ranged from 1.656 to 9.814 s. Zero met 100 ms. |
| The existing handler can answer without starting a server | A disposable `launch-options-premise.spec.ts` run by the maintained backend command at one worker passed 1/1 on Node Vitest. The real Claude skill paths held different definitions. The typed request returned `--a --free` to the invocation and the kept request and preserved model and instruction. Conflicting and unknown selections returned distinct 400s. Malformed, missing and unreadable definitions returned separate reasons. An empty request passed through against the malformed definition. This probe checked entry feasibility, with an 18 ms case time. It did not measure the future cohort. The scratch file was removed. |
| Existing browser proof follows Start through the real adapter to user-visible outcomes | The E2E command below ran 4/4 strictly green in 54.95 s wall. The accepted path observed definition order in native input, the kept record and the reloaded card. The group journey observed an exclusive choice and launch with a free flag. The refusal journey observed a named stale flag and no native launch before the developer chose the updated selection. The default journey observed a native launch with no option in its request. Slice 2 brings the former combined focus, model and instruction observations into the accepted E2E case. |

## Ordered slices

### 1. Apply exclusive groups to an installed selection

Type: Behavior
Status: done
Estimate: 10–13 active minutes.
Proof: Focused backend command selects `agent-launch-options-groups.spec.ts`
on Node Vitest. Its assertions observe the returned request or typed refusal.

Given a project's valid definition, ask for one group member plus a free
flag, members of independent groups, or two members of the same group.
Return valid requests in definition order, and make the conflict name the
group and both flags. Cover the variant where choosing no member of a group
still permits an independent flag. Use `withSelectedOptions` with a MakeMe
refinement request and the real installed file. Preserve the group and free
choice browser case as the separate UI and native-input owner.

Accepted proof: the four Node Vitest cases passed strictly on the maintained
backend command with `launches/agent-launch-options-groups\.spec\.ts$` and
one worker. The typed requests proved order, independent free selection,
and named 400 refusals for both groups. The two groups kept their separate IDs
and shared label. All four cases met 100 ms, at 3.67–11.64 ms per case and
28.47 ms summed. The focused run took 2.49 s wall. The refreshed legacy group
cases took 1,391–6,292 ms each and 15,533 ms summed. The unchanged browser group
journey passed in the refreshed baseline. Review of the subject spec and its
callers found no refactor candidate. The run record is
`groups-typed-matchers.log.run.json` in the worktree Git evidence directory.

### 2. Deliver selected flags with the developer's launch input

Type: Behavior
Status: done
Estimate: 11–15 active minutes.
Proof: Direct typed assertions for flag order and no selection. The existing
accepted and default E2E cases observe the actual Claude input and record.

Given a refinement with a selected option and focus, a chosen model and an
instruction, Start sends the definition-ordered command with the chosen model
and the developer's instruction. Keep the same ordered flags in the record
and after reload. Extend the existing accepted options case using
`storyLaunchChoices`, `instructionField` and `expectInstalledClaudeStory`.
Assert the model on the native launch and keep the existing record/reload
observations. With absent or explicitly empty options, the typed request
passes through and the default browser Start keeps no flags. Give these
assertions their new owners before removing the corresponding mounted cases.
The existing machine-session read cohort still owns general listing of
machine-local records.

Accepted proof: three Node cases passed for installed flag order and omitted
and empty options. The import-based selector uses one runner per file, so
the nine unchanged refusal cases pass on Playwright under the temporary
`agent-launch-options-http-refusals.spec.ts` path until slice 3. The mixed
backend selection passed 12/12 strictly. Both accepted and default E2E
journeys passed strictly. The accepted case now observes Explore, Borrow
and UX/UI in the native invocation and kept record, Opus and the developer
instruction in native input, and the flags before and after reload. The
default case observes a flagless launch and omitted options in the record.
The focused run records are `slice2-backend.log.run.json` and
`slice2-e2e.log.run.json`. The two loaded browser samples had different
selections, and the unchanged default case also ran slower. Compare the
full matching selections in slice 3. Review confined to the changed subject
specs found no refactor candidate.

### 3. Explain why the target project refuses a selection

Type: Behavior
Status: done
Estimate: 11–15 active minutes.
Proof: Both selected backend files finish on Node Vitest. The typed request
gives the specific refusal. The stale-selection E2E retains the real adapter
and no-native-launch observation.

Given two projects' definitions for the refinement skill, the same flag can
be accepted in one and refused in the other. An unknown option names the flag.
Malformed JSON, a file for a different command, a missing definition and an
unreadable definition each keep their observable reason. An absent skill
directory and an absent file exercise the same missing-file decision. Check
execution and ad hoc requests with flags through the same handler for workflows
without options. The existing missing-definition browser cases retain their
offer and default-start proof. Finish converting
`agent-launch-options-boundary.spec.ts`, remove only the unused
`installedClaudeLaunch.ts` exports and verify the two legacy paths choose
Vitest. Preserve consumers of the remaining installed-launch fixture.

The maintained backend gate passed all 16 cases strictly in Node Vitest.
The typed boundary distinguishes the nine former mounted refusal cases.
The browser suite passed all 10 journeys strictly, including the named
stale-selection refusal before native start and recovery with a valid flag.
The maintained backend command also passed 48/48 cases across the four
remaining fixture clients and the separate Playwright rules specimen.
The run records are `slice3-backend-final.log.run.json`,
`slice3-e2e.log.run.json`, and `slice3-consumers.log.run.json`.
Independent refactor review confirmed the focused proof still applies to the
accepted diff and found no further edits.

## Proof ownership and local gate

| Former observation | Final owner |
| --- | --- |
| The four installed group cases, including defaults, ordering, compatibility and conflict | Slice 1. Typed answers and refusals, with the existing exclusive-choice E2E for the group selection crossing Start. |
| Native ordered flags, model, instruction, kept flags and default launch | Slice 2. Extend the existing `agent-launch-options.spec.ts` accepted journey, keep its default journey, and use typed input and the existing record-reading proof for independent observations. |
| Unknown flags, per-project selection, unavailable files, workflows that lack options | Slice 3. Typed status and reason for each unique decision, paired with the existing `agent-launch-options-kept.spec.ts` stale-selection E2E and `agent-launch-options-exclusive.spec.ts` availability cases. |
| Shared schemas and dialog-only selection logic; proof recorder and runner ownership | Keep `agent-launch-options-rules.spec.ts`, `proof-record-entry.spec.ts` and `runner-ownership.spec.ts` with the campaign's runner work. These checks keep the same specimen. |

Baseline and candidate, one worker and a fresh `$backend_proof` file:

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- 'launches/agent-launch-options-(boundary|groups)\.spec\.ts$' --workers=1
```

The preparation E2E selected the accepted, default, group and refusal cases:

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'launches/agent-launch-options(-exclusive|-kept)?\.spec\.ts$' --grep 'selecting Explore and Borrow|a dialog with nothing selected|a group is radios|a launch the boundary refuses' --workers=1
```

For final proof run the three E2E files with the same selection and no title
filter. That includes the installed definition's rendering, unavailable
definitions and recovery. Rerun the focused backend file for each slice.
Compare before and after count, per-case duration including the ~100 ms target,
summed case time and selection wall time. Name each moved or consolidated
observer and count any added E2E cost. Use a matching load profile or refresh
the baseline. Run the Dashboard typecheck and staged lint on changed sources.
Use the local AC and `caffeinate -s -i` gate from
[AGENTS.md](../../../AGENTS.md) for long macOS checks. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and the normal execution refactoring, affected-consumer proof, commit and CI
gates.

Slice-plan refinement was unnecessary. Each slice has its own observation of
the same installed-option rule, with one final removal per former proof.
No remaining slice-specific concern was identified.

## Execution evidence

The checkout at `7e3a27c5e` refreshed the baseline on Node 24.21.0. The Mac
was awake on AC power, with one worker per suite, sequential backend and
browser runs, and other worktrees running independent checks. These are
single measurements. Backend passed 16/16 strictly in 43.65 s wall, with
38.460 s summed case time and 0/16 at or below 100 ms. Browser passed 10/10
strictly in 63.14 s wall. The accepted launch journey took 7.369 s. Records
are `backend-baseline.json` and `e2e-baseline.json` in this worktree's Git
evidence directory.

The final backend gate took 1.57 s wall and 92.52 ms summed case time.
Every case took 0.74–40.22 ms. The full browser selection took 55.41 s wall
and 48.886 s summed case time. The accepted journey took 4.474 s with the
additional focus choice, model selection and instruction. The browser count
stayed at ten. The paired browser runs started at load 16.66 and 17.54, with
53.50% and 55.80% CPU idle. Individual browser durations moved in both
directions, so the wall delta gives no isolated estimate of interaction cost.

| Former backend observation | Legacy ms | Node ms | Current observation |
| --- | ---: | ---: | --- |
| Native flag order, instruction and kept options | 3,362 | 9.31 | Typed definition order and accepted browser journey through reload |
| Option and focus with chosen model | 2,187 | same case | The same typed case and native acceptance observe the focus, Opus and instruction |
| Default native launch and kept record | 4,228 | 2.00 and 2.71 | Omitted and empty typed pass-through, with default browser Start and record |
| Unknown option beside a known companion | 1,098 | 40.22 | Named typed refusal, with browser stale-selection refusal before native start |
| Definition varies by requesting project | 2,924 | 4.79 | The same flag is accepted and refused against two actual installed definitions |
| Malformed JSON | 1,058 | 4.76 | Typed invalid-file reason |
| Another command's definition | 1,303 | 2.26 | Typed command mismatch reason |
| Installed skill lacks a file | 1,383 | 1.77 | Typed missing-file reason with an installed directory |
| Skill is absent | 1,664 | 0.74 | Typed missing-file reason with an empty project |
| Definition cannot be read | 1,303 | 3.43 | Typed unreadable reason with a directory at the file path |
| Execution has no options | 1,390 | 1.08 | Named typed workflow refusal |
| Ad hoc has no options | 1,027 | 0.82 | Named typed workflow refusal |
| Group member with a free flag | 3,704 | 5.86 | Typed order and existing browser group selection through Start |
| Member alone and free flag alone | 6,292 | 7.65 | Both typed requests are accepted |
| Same-group conflict | 1,391 | 3.06 | Typed refusal names the group and both flags |
| Independent groups | 4,146 | 2.06 | Distinct group IDs coexist with a shared label and keep separate conflicts |

Story Branch Mode uses `origin/codex/prove-installed-launch-options-through-typed-bac`,
with `origin/main` as the trunk target and `7e3a27c5e8129f9d667718839b4cd7ead9be2f7a`
as the published claim and first publication base. Slice 1 was accepted at
`d9cf4c7761ce06d130e8b56ae1d533a72d75fbbc` and slice 2 at
`77a69f7c9a87580121530fe348461dc4419eebcb`. The CI workflow cancelled the
first slice's earlier attempt when the second slice was pushed.
The CI observer uses
GitHub Actions `ci.yml`, coordinator `kirara-839`, mailbox
`/tmp/dough-ci-501/watch-BbXkps`, PID `8873`, Codex stream session `48890`
and cell `g394:17` in this worktree.
