# Publish an exact candidate to a new remote branch

Status: complete; all planned slices delivered; retrospective skipped at the
maintainer's direction.

**Identity:** quick/078-qualify-new-branch-push-ref/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"be5dc90def31d75eeaf89d1487167d979a175465b8a2afd353c4568236ab0653"}}
```

## Execution state

- Mode: Story Branch Mode.
- Owned workspace: `/Users/terryyin/.codex/worktrees/quick-078-publish-ref/open-dough`.
- Execution branch: `codex/quick-078-publish-ref`, created by this execution
  from `e4d9b24930b67198928a1b0eea8d36a6975d572f`.
- Integration checkout: `/Users/terryyin/git/open-dough`.
- Authorized targets: queue claim on `origin/main`; execution increments on
  `origin/refs/heads/codex/quick-078-publish-ref`.
- Published claim: `3001eca1e4b0805f440230b0e2b1567a73f8bf12` accepted on
  `origin/main`; CI coverage is intentionally unobserved because the claim
  changes only `.planning/**` and the Story Branch observer belongs to the
  execution target.
- Published implementation: `9a68e0f6653b3ad226d5e520322e9d6d8638a936`
  accepted on `origin/refs/heads/codex/quick-078-publish-ref` and registered
  with the Story Branch observer.
- Preparation: `npm ci` completed from the locked dependency state; the focused
  publication tests passed before implementation.
- CI observer: GitHub Actions workflow `ci.yml` (`CI`) for
  `terryyin/open-dough` branch `codex/quick-078-publish-ref`, mailbox
  `/tmp/dough-ci-501/watch-GDIKnw`, PID `41901`, Codex stream session `15470`.
- Replanning permission: preserve existing planning authority; no overrun
  replanning was requested.

## Source and outcome

Source execution: plan 075 at
`9336d64c612c1ae30ef9e8114f4e18acac4bce92:.planning/quick/075-use-canonical-backlog-take/PLAN.md`,
selected story at
`9336d64c612c1ae30ef9e8114f4e18acac4bce92:.planning/seeds/SEED-022-valid-backlog-writes.md#prevent-malformed-backlog-publication`,
published implementation `e77aead21cc3a05139d8000962059e29d283fc8c`.

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
Status: done

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

Accepted proof:

- `node --test src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/publication-resume-story-branch.test.mjs`
  passed 5/5. The existing deterministic publication boundary still creates a
  new Story Branch and preserves the fully qualified target through resume.
- `bash tests/git-publication-native.sh --native codex --case story-branch-increment`
  passed after one evidence-driven assessor correction: Codex reports a command
  at both lifecycle start and completion, so command counting now uses only
  `item.started` execution events. The accepted run observed exactly one
  candidate-to-`refs/heads/exec/story` push, no force or repair retry, the
  candidate on only that branch, and unchanged remote trunk and default
  checkout.
- `bash tests/execution-ci-runtime.sh` passed 205/205, preserving the wider
  publication and observer runtime boundary.
- `bash tests/product-backlog-payload-update.sh` passed, proving the changed
  shared guidance is delivered through the supported installed payloads.
- `bash tests/git-publication-native.sh`, the post-refactor focused harness,
  `bash -n` for its changed shell entrypoints, `git diff --check`, and the
  project formatter/linter passed.

Learning: native Codex transcripts repeat command payloads across lifecycle
events; assess actual executions from command-start events rather than counting
every copy of the payload. The existing shared publication owner remains the
only contract that needs the fully qualified destination.

## Concerns and readiness

No remaining slice-specific concerns were identified. The correction has one
cohesive behavior loop, reuses the existing target representation, and leaves
unrelated publication decisions unchanged. This plan records readiness review
only; it grants no execution authority.
