# Publish an exact candidate to a new remote branch

Status: planned; bounded retrospective correction; not queued; no execution
authorized by this plan.

**Identity:** quick/078-qualify-new-branch-push-ref/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a37434340aa3ec8f2dd0a83cc29134b532aff03c8be54ce6404e56647a5851f8"}}
```

## Source and outcome

Source execution: plan 075,
`SEED-022#prevent-malformed-backlog-publication`, published implementation
`e77aead21cc3a05139d8000962059e29d283fc8c`.

Beneficiary: a developer whose executing agent publishes the first validated
increment of Story Branch work.

Outcome: the shared publication guidance gives Git an exact candidate SHA and
a fully qualified authorized branch ref, so the first push creates the remote
story branch and later pushes retain the same exact-target contract. The
executor reaches remote acceptance without interpreting Git's refname hint or
retrying with a different destination spelling.

## Current finding and scope

During plan 075 delivery, the installed publication reference prescribed:

```text
git -C <owned-workspace> push <remote> <candidate>:<target-branch>
```

The first Story Branch increment used a raw candidate SHA and a remote branch
that did not exist. Git refused the short destination as not a full refname;
publication succeeded only after changing it to
`<candidate>:refs/heads/<target-branch>`. An earlier zsh interpolation mistake
was separate operator error; the second refusal directly exercised the
documented command.

Change the existing publication contract and its proof, not Git behavior or a
second publication path. Cover initial Story Branch creation and preserve the
same fully qualified target on later pushes, rejected-push recovery, resume,
Trunk Mode, claim publication, observer registration, and remote-confirmation
paths. Keep candidate selection, reconciliation, proof reuse, publication
authority, branch protection, retry limits, and default-checkout maintenance
unchanged.

Excluded: changing branch-mode selection; adding a push wrapper solely for
this correction; implementing an automatic retry for malformed refspecs;
changing backlog, CI-observer, or wrap-up semantics; and release/version work.

## Existing solution and architectural direction

PFE found the correct representation already used by publication runtime and
proof: `pushExactRef` in
`src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs` accepts a
`refs/heads/...` target, and
`execution-increment-publication.test.mjs` plus
`publication-resume-story-branch.test.mjs` prove first Story Branch publication
and resume against a fully qualified ref. Align the installed prose owner with
that contract; do not introduce another writer or target representation.

This correction follows the **Remote publication and default-checkout
ownership** topic in `.planning/NORTH-STAR.md`: publication keeps one authorized
destination and one accepted revision. Accepted ADR 0002 favors the systematic
fix at the existing owner and reduced executor judgment; ADR 0004 requires the
shared installed source; ADR 0005 treats the runtime Markdown and its native
outcome as product behavior; ADR 0006 requires one precise actionable
instruction. No Accepted ADR conflict or new consequential architecture choice
was identified.

## Key examples and proof ownership

- Given a validated candidate SHA and an authorized Story Branch destination
  absent from the remote, when a fresh executing agent follows the installed
  publication guidance, then it pushes exactly
  `<candidate>:refs/heads/<target-branch>`, the remote creates only that branch,
  and the accepted revision equals the candidate.
- Given an existing authorized target, the same target representation continues
  through normal publication and recovery; no short-destination fallback or
  force push appears.
- The default checkout and remote trunk remain unchanged by a Story Branch
  increment.

Extend the existing Git publication native harness with one bounded first
Story Branch increment journey. Its ordinary-language prompt supplies the
authorized destination but no refspec syntax. Inspect the transcript for one
exact candidate-to-`refs/heads/...` push, and inspect a disposable bare origin
for the candidate on only the story branch. Keep the focused deterministic
runtime suites green:

```text
node --test src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/publication-resume-story-branch.test.mjs
bash tests/git-publication-native.sh --native codex --case story-branch-increment
bash tests/execution-ci-runtime.sh
bash tests/product-backlog-payload-update.sh
git diff --check
```

The native journey owns the executing-agent behavior and first-branch creation;
the deterministic suites own normal/resume target preservation; payload proof
owns shared delivery. Reuse current Cursor and Claude installation/discovery
evidence under ADR 0005 when those mechanisms remain unchanged; any changed
host-specific command path keeps that host's evidence pending.

## Ordered slices

### 1. First Story Branch publication uses a fully qualified target

Type: Behavior
Status: planned

Proof: extend the existing native Git-publication fixture, prompt, and assessor
with the first Story Branch example above; keep the focused deterministic
publication, runtime, payload, and whitespace commands green.

Behavior: a developer publishes a validated first Story Branch increment → the
agent follows one installed publication contract with the exact candidate SHA
and fully qualified authorized branch ref → the remote accepts that candidate
on the new branch without changing trunk or requiring a refname-repair retry.

Safe stopping point: every publication mode still uses one exact-target
contract, and the newly created Story Branch is proven through the real Git
boundary and a fresh native agent journey.

## Concerns and readiness

No remaining slice-specific concerns were identified. The correction has one
cohesive behavior loop, reuses the existing target representation, and leaves
unrelated publication decisions unchanged. This plan records readiness review
only; it grants no execution authority.
