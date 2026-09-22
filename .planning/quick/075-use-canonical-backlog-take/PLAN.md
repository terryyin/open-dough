# Take planned work through the canonical backlog operation

Status: planned; not taken; refreshed against Open Dough `0.3.29` on
2026-09-22; no execution authorized by this plan.

## Source and outcome

Identity: `SEED-022#prevent-malformed-backlog-publication`

Source: [selected story](../../seeds/SEED-022-valid-backlog-writes.md#prevent-malformed-backlog-publication).
Terry asked to make the cause and purpose clear, keep the story narrow, refine
it, and write and refine a slice plan if no open question remained on
2026-09-22. This authorizes refinement and planning, not implementation.

Outcome: when an executing agent starts one queued feature story with a
resolved executable plan, it invokes the installed
`product-backlog.mjs take --identity ... --plan ...` operation. The writer, not
the agent, constructs and validates the Taken entry and its canonical
`([plan](...))` link. The affected runtime instruction is shorter than the
Open Dough `0.3.28` source and preserves the existing authority, workspace,
commit, publication, and preparation-readiness boundaries. Taking the item
does not create, renew, or infer readiness.

Cause: on 2026-09-21 and 2026-09-22, Doughnut agents read the installed
guidance and then used Python to construct a Taken entry as
`— plan: [...]`. The second recurrence already had Open Dough `0.3.28`.
Execute-plan currently points at a prose backlog workflow without naming the
owned take operation, while the direct-edit guard intentionally does not
intercept shell commands. The dashboard failure is the downstream symptom;
the ambiguous action boundary is the defect this story changes.

## Scope and current decisions

Required behavior:

1. An ordinary-language request to start a queued, planned feature story leads
   a fresh executing agent to call the installed `take` operation with the
   selected identity and plan path.
2. The resulting entry is moved once to the end of **Taken** with the canonical
   plan link and remains readable by the shared backlog reader.
3. That journey does not use Python, shell redirection, or a native file-edit
   tool to construct the backlog entry.
4. The affected take guidance has fewer lines than its `0.3.28` counterpart,
   with no new reminder or warning paragraph and no loss of the surrounding
   execution constraints.
5. The queued Take does not call `record-state`, change the story's recorded
   preparation/readiness, or infer readiness from queue membership.

The change is limited to the planned feature-story queue claim owned by
execute-plan. Planless quick work, bounded corrections, resume semantics,
other backlog verbs, parser acceptance, the dashboard, generic shell or Git
enforcement, installation mechanics, release/version work, and installed
managed-copy edits are excluded. Existing deterministic coverage continues to
own writer formatting, ambiguity, duplication, and refusal behavior.

Implementation changes runtime source under `src/skills/` only. It may shorten
both `dough-execute-plan`'s **Take queued work** section and
`dough-product-backlog`'s **Take queued work for execution** / direct-edit text
where removing duplication or the stale “scripts above” reference makes the
single action clearer. It does not add a second command wrapper, parser, hook,
format description, or readiness rule. The exact command remains defined by
the existing CLI usage and is invoked from the installed skill root in the
execution checkout selected before the claim, so the same source serves all
hosts. The current `record-state` / `read-state` contract remains owned by the
canonical story and is not folded into the backlog move.

## Existing solutions and architecture

PFE found a complete format owner already in the product:

- `src/skills/dough-product-backlog/scripts/product-backlog.mjs take` accepts
  the canonical identity and plan path and delegates rendering and validation
  to the existing backlog modules.
- `tests/support/product-backlog-take.test.mjs` already proves the planned
  transition writes `([plan](...))`, appends in Taken, resumes without
  duplication, and refuses unresolved or ambiguous input.
- `product-backlog.mjs record-state` / `read-state`, added after this plan was
  first written, now own preparation and readiness in the canonical story.
  Their deterministic tests already run through `tests/product-backlog.sh`;
  the take path must leave that state untouched.
- `tests/product-backlog-native.sh` and its installed-workflow helpers already
  provide fresh Claude Code, Codex, and Cursor sessions, transcript capture,
  and real candidate installation. Extend that harness with one bounded take
  journey instead of creating another native runner.
- The native direct-edit guard is not the owner of shell-mediated changes and
  stays unchanged. The dashboard and shared reader remain consumers of valid
  source, not repair mechanisms.

This follows Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
by correcting the repeated cause at its existing high-cohesion owner,
[ADR 0004](../../../docs/adrs/0004-shared-standalone-client-payload-accepted.md)
by changing shared source rather than host copies,
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for
native-evidence reuse, and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
by replacing indirect prose with one concise executing-agent action. No
Accepted ADR conflict or North Star change was identified.

## Proof strategy and execution gates

Add a `take` case to the existing native backlog harness. Its fixture contains
one queued story, an executable plan, and a current ready assessment recorded
through the installed backlog recorder, then installs the candidate payload. A
fresh Claude Code session receives an ordinary-language request to start that
plan, without a script name, command, Markdown syntax, or expected editing
method. Assert from both transcript and filesystem that it invoked the
installed `product-backlog.mjs take` operation with the identity and plan,
produced exactly one canonical Taken entry, did not construct that entry
through Python, redirection, or native editing, and neither invoked
`record-state` nor changed the canonical story-state block.

Claude Code owns fresh native evidence because both observed recurrences were
there. At execution, assess whether the unchanged shared installation and
skill-discovery path leaves the existing Codex and Cursor installed-workflow
evidence applicable under ADR 0005. Reuse it when applicable; if the change
invalidates a host-specific contract, that host's bounded take journey remains
pending rather than being inferred from file presence.

Focused execution commands are `bash tests/product-backlog.sh`, the new
`bash tests/product-backlog-native.sh --native claude --case take` journey,
`bash tests/product-backlog-payload-update.sh`,
`bash tests/install-all-tools.sh`, and `git diff --check`. Existing CI owns the
full test and lint suites. Before accepting the slice, compare the changed take
instruction line count with tag `v0.3.28` and with the `0.3.29` starting source,
and perform the AGENTS.md behavior review: invocation context, required inputs,
and the representative native outcome. Do not synchronize `.agents/skills/` or
`.claude/skills/` by hand.

## Execution state

- Mode: Story Branch Mode.
- Originating and integration checkout: `/Users/terryyin/git/open-dough`.
- Owned execution checkout: `/Users/terryyin/.codex/worktrees/use-canonical-backlog-take-075/open-dough`, branch `codex/use-canonical-backlog-take-075`, created from `21585f0c7d406544273aaf84a7fb95de8fb91659`.
- Authorized increment target: `origin/codex/use-canonical-backlog-take-075`.
- Published claim: `fee00b1c1c9749a17c4962d44f5f87bd31ded5b4` accepted on `origin/main`; its CI coverage is unobserved because Story Branch Mode observes the increment target.
- Checkout preparation: `npm ci` and `npm run lint` passed after claim publication.
- CI observer: Codex yielded cell `34`, session `42498`, PID `31488`, directory `/tmp/dough-ci-501/watch-kh6Ka6`; coordinator `root`; GitHub workflow `ci.yml` / `CI`; repository `terryyin/open-dough`; branch `codex/use-canonical-backlog-take-075`.

## Ordered slices

### 1. Planned execution claims the queue through the installed writer

Type: Behavior
Status: done

Proof: extend the installed-workflow native harness with the take fixture and
fresh Claude Code journey described above. Keep
`product-backlog-take.test.mjs` green as the deterministic contract for exact
formatting and refusal behavior, keep the story-state tests green as the
separate readiness contract, and keep the payload/update checks green as the
shared-delivery proof. Review the transcript for the installed `take` command,
absence of hand-built backlog writes, and absence of a `record-state` call;
review the result with the shared reader and confirm the story-state block is
byte-for-byte unchanged. Record the `v0.3.28`, `0.3.29` starting, and candidate
line counts for the affected take guidance.

Behavior: a developer starts a queued story's resolved executable plan through
Open Dough → the agent resolves the existing execution authority and workspace
preconditions, invokes the installed backlog `take` operation with the story
identity and plan path, and continues the existing isolated claim commit and
publication workflow → the queue has one valid Taken claim whose syntax the
agent never had to reproduce, while the canonical story's preparation/readiness
state is unchanged. Replace redundant or indirect take prose only as needed to
make that operation the unambiguous action; finish with fewer affected
instruction lines than `0.3.28` and no net instructional expansion from the
`0.3.29` starting source.

Safe stopping point: the observed planned queue-to-Taken path has one existing
format owner and fresh native evidence, while every excluded backlog and
execution path is unchanged.

Accepted proof (2026-09-22):

- `bash tests/product-backlog.sh` passed all 110 deterministic writer and
  story-state tests.
- `bash tests/product-backlog-native.sh --native claude --case take` passed
  with Claude Code 2.1.278 after a fresh ordinary-language session invoked one
  installed Take command carrying both the story identity and plan. Its
  transcript, shared-reader result, and canonical story comparison proved the
  canonical Taken link, absence of hand-built backlog writes and `record-state`,
  and byte-for-byte preservation of readiness state.
- `bash tests/product-backlog-payload-update.sh` and
  `bash tests/install-all-tools.sh` passed the shared payload, update,
  coexistence, and all-host installation boundaries. The shared
  installation/discovery mechanism did not change, so the existing Codex and
  Cursor native evidence remains applicable under ADR 0005; no additional
  host-specific Take run is pending.
- `git diff --check`, shell syntax checks, the project formatting pass, and the
  AGENTS.md invocation-context, required-input, and representative-outcome
  review passed.
- Affected guidance totals 100 lines, down from 103 in `v0.3.28` and 106 in
  the `0.3.29` starting source.

## Proof ownership

| Promise | Slice | Observation |
| --- | --- | --- |
| Fresh planned execution selects the installed take operation without a prompted command | 1 | Claude Code transcript from the native take journey |
| Taken entry has one canonical plan link and remains readable | 1 | fixture backlog plus existing deterministic take tests/shared reader |
| Agent does not construct the entry with Python, redirection, or native edit | 1 | native transcript and captured commands |
| Take does not create, renew, or infer preparation readiness | 1 | no `record-state` transcript call and unchanged story-state block |
| Guidance becomes shorter without losing execution constraints | 1 | `0.3.28` comparison and AGENTS.md behavior review |
| Shared delivery remains valid | 1 | payload/update and install-all-tools checks plus ADR 0005 host-evidence assessment |

## Learnings

- Open Dough `0.3.29` added canonical story preparation/readiness state after
  this plan was first written. The take action must preserve that state and
  must not turn queue membership into a readiness signal; this remains part of
  the same queue-claim proof loop rather than a second slice.
- Native command assessment must keep the selected identity and plan on the
  same installed Take invocation; aggregating arguments across separate calls
  would overstate the behavior proved.
