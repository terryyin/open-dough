# Resolve consumers of a completed supplier

Use this shared procedure during a selected supplier's landing or wrap-up.
A generic checkout landing, an increment, a queue `complete`, disappearance from
Taken, or missing history does not establish completion. Without a selected
completed supplier, continue the ordinary caller without satisfying dependencies.
Refinement and planning remain possible while consumer execution is blocked.

## Preserve context before cleanup

Require the selected stable identity, canonical home, goal/outcome and proof,
its plan and status vocabulary when planned, a recoverable before-cleanup Git
revision, and authorized remote/integration target. All planned slices must be
done; planless work needs an evidenced outcome judgment from its instruction,
changes and results, including an evidenced no-change result. Never invent a
completion record because a supplier home is missing. Git history recovers
selected supplier evidence; it never invents live consumers.

Before deleting source or plan, commit the completed outcome and proof under the
calling workflow and retain its full revision and repository-relative paths.
Preserve that revision in accepted integration history. Recover with
`git show <revision>:<path>`; keep its anchor when the home is a story section.
The accepted integration SHA may differ from this revision and may no longer
contain those files. Preserve both facts honestly. If the evidence cannot be
preserved or recovered, leave the affected context intact and report the gap.

## Discover and judge each current consumer

Run from the established project using its installed backlog command and path:

```sh
node <installed>/dough-product-backlog/scripts/product-backlog.mjs discover-consumers --file <backlog> --supplier-identity <supplier identity>
```

Discovery reads current canonical homes, including queued, Taken, prepared
unqueued stories, sibling sections and canonical corrections. Its `consumers`
carry each current agreement and basis; `problems` identifies unreadable or
ambiguous homes. Inspect those problems and retain affected work; never claim
all consumers were handled when discovery is incomplete. No reverse store or
supplier card annotation is maintained.

For each consumer, read its goal, scope, recorded condition and current plan.
Condition satisfaction is agent judgment with evidence, not text matching.
A simple case needs no changed consumer assumptions: supplier completion and
its outcome directly prove the condition. Leave other cases unresolved and
explain what still needs reconciliation or a developer decision. Supplier
completion alone does not clear them, and consumer implementation needs its own
execution authorization. Handle independently justified consumers separately.

## Apply and publish a direct resolution

After accepted delivery of the completed supplier on the authorized integration
target, copy the exact observed agreement into an input JSON object. Set only
`state` to `satisfied`, remove an obsolete `decision`, and add `resolution`:
`revision` is the full recoverable before-cleanup supplier SHA; `path` is its
repository-relative canonical home including the selected anchor; `summary`
explains exactly how the evidenced outcome fulfills this consumer's condition.

```sh
node <installed>/dough-product-backlog/scripts/product-backlog.mjs resolve-dependency --file <backlog> --identity <consumer identity> --link <consumer home> --dependency-file <json path> --expect-dependencies <observed basis> --remote <authorized remote> --target <integration branch> --accepted-revision <accepted supplier SHA>
```

The command fetches the target, checks both revisions' ancestry, reads the
supplier's historical canonical identity and planned completion, and rejects a
stale agreement before writing. Supply `--plan <backlog-relative plan>` when the
supplier's established plan is not recorded in its preparation. A plan-homed
correction can use that home as its plan. For evidenced planless completion,
supply `--planless-complete --completion-file <repository-relative proof path>`;
the proof must be readable at the retained revision. These arguments carry the
agent's outcome judgment; a readable file alone does not prove the promise.

Each consumer retains the readable evidence locator, exact condition summary,
and separate accepted integration SHA/remote/target. Other suppliers and
preparation judgments are preserved. A stale refusal requires rereading and
rejudging; a repeat visit preserves the first satisfied record and its evidence.

Publish owned consumer changes using the caller's authorized publication
workflow after accepted supplier integration. Until that publication, published
consumers remain blocked. Wrap-up must finish this visit and publication, or
explicitly retain unresolved dependency work with its consumer agreements,
evidence and next action in the existing active context before retiring resources
or deleting needed material. Do not create a reverse registry, a substitute
completion artifact, or claim unresolved relationships were satisfied. Report
per-consumer outcomes, discovery gaps and retained context separately from
supplier publication and cleanup.
