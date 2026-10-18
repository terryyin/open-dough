---
name: release-and-update-clients
description: Publishes an Open Dough release and updates, commits, and pushes its installations in every production-dashboard project, including Open Dough itself. Uses the next patch version unless another version or bump is requested. Use for a combined release and client rollout; use release-version for metadata-only preparation or local finalization.
---

# Release Open Dough and update dashboard projects

This is an internal Open Dough maintainer skill. Keep its source here, with only
a Claude Code discovery pointer under `.claude/skills/`. Do not add it to
`src/skills/` or `install.sh`'s released payload. Follow the
[maintainer guidance](../../../AGENTS.md) when changing or reviewing it.

Invocation requests the complete workflow: compose release notes, finalize and
publish the release, then attempt each project's ordinary update and commit and
push the resulting changes to its `origin`. A narrower current instruction
limits that scope. Creating or reviewing this skill does not invoke the workflow.

Use [release-version](../release-version/SKILL.md) for release mechanics and
[dough-update](../dough-update/SKILL.md) for installation mechanics. This skill
supplies the version, notes, finalization intent, and publication/rollout authority
that connect them; it owns the push after release-version's local stopping point.
Keep their existing validation and refusal behavior.

On a resumed rollout, recover the published release and completed client
receipts from the conversation and continue at the first unfinished boundary.
Do not choose a new patch or recommit current installations merely to resume.

## Establish the release and rollout targets

- Work on Open Dough's `main`, synchronized with `origin/main`. Fetch origin and
  release tags, inspect local-only commits, and fast-forward when safe. Do not
  release a feature branch or switch a shared checkout away from another task.
  Preserve unrelated edits and staging; a conflicting or uncertain source state
  stops release preparation.
- Read the machine's production dashboard project configuration. It currently
  lives at `~/.open-dough/dashboard/projects-production.json`; confirm the resolver
  in [projectConfiguration.ts](../../../dashboard/server/projectConfiguration.ts)
  and [machineHome.ts](../../../dashboard/server/machineHome.ts) if its location
  has changed. Do not use the development list, seed catalog, deployment copies,
  or a remembered list of repositories. Missing or unreadable configuration
  prevents claiming a complete rollout; do not create or rewrite it.
- Capture each project's repository identity, configured `ref`, and absolute
  `localPath` (expand `~`), deduplicating the same checkout. Include Open Dough's
  own main checkout even if it is absent from the list. Verify paths and origin
  identities before updating; report conflicting entries instead of guessing.
- Client updates belong on `main`, or the configured trunk when that project
  uses another name such as `master`. Confirm that target against the project's
  guidance and origin. Use an existing checkout of that trunk when available;
  do not update a feature branch, rename branches, or retarget the dashboard.
  An unavailable or ambiguous trunk blocks that project, not unrelated clients.

## Compose, finalize, and publish

1. Find the highest numeric release tag across fetched local and origin tags,
   comparing major, minor, and patch numerically. Honor an explicit version or
   bump. Otherwise the maintainer's standing choice for this skill is the next
   patch: `M.N.P` becomes `M.N.(P+1)`. With no prior release, use `0.1.0`.
   Do not derive the prior release from prepared `VERSION` or changelog entries.
2. Inspect the commits and aggregate diff since that tag. Compose concise notes
   describing resulting behavior, fixes, and material limitations. Distinguish
   changed source from the Promoted payload declared by `install.sh`; do not
   promote Proposed guidance incidentally. Resolve incomplete or contradictory
   release evidence before publishing. Follow
   [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
3. Follow the applicable behavior, delivery, and native acceptance requirements
   of [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
   An explicit skip in the current release request is a human-owned exception:
   record it, its date, and the remaining acceptance work in the release notes.
   A previous release's exception does not authorize another skip. Never
   describe payload checks or an earlier CI result as fresh native acceptance.
4. Invoke release-version with the selected numeric version, composed notes,
   and finalization intent. Its self-installation check must pass before release
   metadata, staging, commit, or tag writes. The intended payload must already
   be committed. Preserve previous changelog entries and immutable release tags;
   stage only the intended release metadata.
5. Publish `main` and the annotated tag to `origin`, preferably with one atomic
   push. Never force-push or move a tag. If publication is rejected or uncertain,
   inspect remote facts before retrying and preserve the local commit and tag.
   Verify that `origin/main` contains the release commit and that the remote
   tag's peeled commit equals it before any client update. Do not repeat release
   finalization to recover a push failure. A GitHub Release object is not required.

## Update and synchronize each project

Attempt projects independently after publication is confirmed. A client refusal
does not undo the release or prevent attempts on the other configured projects.
Keep each target separate from the fetched Open Dough source.

1. Read that project's applicable guidance, runtime wrappers, and commit hooks.
   Record its initial branch, status, installed versions, and local-only commits.
   Fetch `origin` and safely fast-forward the selected trunk. Preserve unrelated
   work, including edits made by other sessions during the rollout. Do not reset,
   blanket-stash, or publish unrelated local commits without existing authority.
   Divergence or an unsafe checkout blocks that project's synchronization.
2. Follow dough-update from the invoking tool's recorded `SOURCE`. Pin and
   inspect the latest numeric release with Git before executing any fetched
   script; use its inspected helper for the captured absolute target. A pinned
   snapshot can be reused for projects whose recorded sources resolve to the
   same release commit. Require that pinned latest tag and commit to match the
   just-published release before apply; a newer release or different source
   blocks that project's rollout. Each apply must still validate its own source
   and baseline. Do not run the source checkout's untagged installer or hand-copy
   managed files.
3. Let the helper update both physical roots, `.agents/skills/` for Codex/Cursor
   and `.claude/skills/` for Claude Code, plus its managed host-hook registrations.
   Preserve project settings and unrelated guidance under
   [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md).
   Missing records, edited payloads, unavailable sources, and collisions remain
   ordinary-update refusals. Do not force-reinstall, supply a substitute URL, or
   rewrite ignored files' tracking rules to get past them. Force requires explicit
   authority for the affected project. Do not silently mix release targets or
   turn the updater into a requested-version installer.
4. Verify the installed version and payload in both roots with the pinned
   helper's comparison, and check host-hook registration. Run the project's
   applicable required checks and honor its formatter/hook contract. Restore
   missing tooling from existing lockfiles when needed rather than bypassing
   hooks. Recheck payload bytes after any formatter; do not alter installed
   guidance to satisfy a project's formatting preferences. A repeat ordinary
   update should report current and leave installed files and settings unwritten.
5. Review the diff against the initial state. Stage only update-owned declared
   payload paths, installation records, retired payload deletions, and managed
   settings changes. Honor ignore rules; do not force-add ignored installations
   or include local skills and concurrent product edits. Commit a real update
   with a message such as `Update Open Dough guidance to X.Y.Z`; make no empty
   commit when already current. Push the selected trunk explicitly to `origin`.
   A racing rejection requires a fresh fetch and reconciliation of owned work
   under the project's Git policy, followed by revalidation; no blind retries,
   force-pushes, or rewriting another task's commits.
6. Confirm that the intended remote branch contains the update commit; a later
   remote tip is acceptable when ancestry proves containment. Separate installed,
   verified, committed, and pushed outcomes. Retain and report a local update
   when checks, reconciliation, or publication cannot finish.

Before finishing, rescan the production configuration for additions or changes
and account for every current entry. Report unavailable projects and the exact
boundary they could not complete; do not claim an all-project success from a
subset.

## Report the result

Give the release version, notes location, release commit and verified remote tag,
validation performed, and any native exception. For each project, report its
target branch, previous and resulting versions, source/tag/commit, native roots,
removed files, update commit and origin publication, or the specific blocked
step. A temporary detailed manifest can carry the full installed path list when
needed; do not add a permanent rollout registry to the repository.

Report CI as observed: an accepted push is not a green run, and pending CI stays
pending. Identify preserved unrelated edits. After replacement, tell the user
to start fresh sessions in the same tool and invoke `$dough-update` in Codex or
`/dough-update` in Cursor or Claude Code to use the updated guidance.
