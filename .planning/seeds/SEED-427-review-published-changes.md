---
id: SEED-427
status: active
planted: 2026-11-24
planted_during: Developer decision to review published changes
trigger_when: selected from the product backlog
scope: one story
---

# SEED-427 — Review published changes

<a id="review-published-changes"></a>

### Review published changes

**Identity:** SEED-427#review-published-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/802-review-published-changes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"35d10be5fa02800a1e8d6277169e69fc2571ddf4cd3f9f825d8b20b2a556d16b","plan":"cc51a2266fa1faeb38f1ac801b77e663e374487270c77c51c2328b18a88f4591"}}
```

**Goal.** A developer reviewing a story or session can open its published
changes directly and follow the same comparison from file list to diff, source
and available Proof. Publication to the recorded story branch on origin makes
work reviewable before integration on trunk.

**Scope.** For a Taken story, default to its attributed changes on the recorded
story branch or trunk. For a Done story, default to the published completion.
For a Done session, open its recorded published comparison. Preserve exact
accepted landings and independently attributable published ranges, including
landings already verified by the workflow. Preserve truthful attribution when
trunk work is interleaved or a merge has mixed changes. Explain an empty or
unavailable comparison at the point of use, including the missing evidence or
retry action when known.

Delete review of working-tree edits and unpushed commits end to end. Remove its
comparison modes, requests, snapshots, capture and retention, tests, setup,
fixtures, builders, page-object operations and obsolete documentation. Collapse
branches and duplicate proof exposed by the deletion. Delete tests devoted to the
retired paths and use the remaining cases to prove the published reader. Compare
code, test and support lines, executable case counts, and affected documentation
before and after. Keep recoverable history in Git. Preserve session execution,
workspace ownership, local files and branches, and established publication,
landing and recovery workflows.

**UI.** Keep Review changes and Intent as the familiar ways in. Open directly
into the published comparison with its scope and revisions visible. Offer one
comparison chooser when there are meaningful published alternatives, such as an
accepted landing or several recorded ranges. Keep the existing ability to show
incoming trunk changes where the story's published comparison supports it.
Refresh rereads the relevant published evidence and keeps the reader's file and
comparison when still available. Remove worktree status, the uncommitted toggle,
and the worktree commit chooser. File reading, Proof, notes and follow-up keep
the published comparison's context.

**Delivery boundary.** Use the dashboard's existing Git access to read published
history. Review uses durable story and session evidence and works independently
of the session worktree and local launch history. A legacy receipt can identify
an accepted landing when its exact pair is verified on the configured origin.
Use immutable endpoints and literal paths from the selected comparison. Keep
publication recovery and checkout safety with their workflow owners.
[Read published reviews from the Review repository](SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository)
owns moving these readers to the Review repository and proving they work without
an execution checkout.

**Key examples.**

- A Taken Story Branch story has published a change to origin. Opening its
  review from a reader's checkout shows the attributable comparison and its
  files. Publishing another commit and refreshing advances the comparison.
  In Trunk Mode the same action shows attributable changes on origin's trunk,
  excluding another story's intervening work.
- A story lands, its worktree and remote story branch are retired, and trunk
  advances. Review changes opens the same published completion. Choosing an
  accepted landing shows that landing's fixed comparison and corresponding Proof
  context when available.
- A Done session has a published record with two separate ranges and no launch
  history on the reader's machine. Opening it shows the first range. Choosing
  the second changes the file diff to those exact revisions. When a Done session
  has no attributable published comparison, show the reason without reading its
  former checkout.

**Related work.** This story owns review of verified published landings. A net
comparison across separated ranges stays with future
[combined session review](SEED-418-review-published-session-changes.md#review-selected-sessions-together).
The [touch review follow-up](SEED-321-match-touch-review-titles-to-viewport-coverage.md#match-touch-review-titles-to-viewport-coverage)
owns matching titles and steps to each viewport's published comparison journey.
Future session selection and combination within a story, bookmark and file
filter redesign, and expired-session history recovery remain in their own work.
