# Base CI before an execution start

Before a new story execution start runs the installed start script, the
boundary judges the origin target's selected check
(`.planning/open-dough.json`'s `ciWorkflow`, default `ci.yml`, or nonempty
`ciAdapter` discover in the project folder): newest result at the target
head or its nearest ancestor that has one. History is the provider's
one-page commit listing for that head, not the project folder's Git;
adapter exit or invalid discover is could not be read with the reason.
Pass starts as today. Failed (including cancelled or timed out), still
running, or could not be read asks first, naming branch, judged revision
(short SHA and subject), later commits without their own result, state,
and run URL when given. Back/Escape restores choices and starts nothing;
Continue names the confirmed revision and state (re-ask on change; pass
starts without asking). Existing changes in Default main are asked first
when both apply ([Existing changes](LAUNCH-EXISTING-CHANGES.md)).
Refinement, Start session, and kept or established resumes are not asked.
Observation is per request and kept nowhere
([ADR 0008](../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
Intent's **CI status** tab shows the same judgment of the trunk
([Development and Intent](../docs/dashboard-development-intent.md#development-and-intent)). While Start waits:
“Checking base CI…” beside Starting… (acceptance still uses Starting…).

When the nearest judged check is still running, that judgment and its
confirmation remain. Alongside them, the dialog shows the nearest strict
ancestor of the running revision in the readable target history with a completed
attempt: short SHA, subject, passed or failed outcome, and run link when supplied.
Only actual ancestry of the running revision supplies this history; merged
siblings elsewhere in the target listing do not. At the selected ancestor,
the newest completed attempt wins, including when a newer rerun is pending.
A nearer completed failure takes precedence over an older pass. This context
does not confirm the current base or replace its running judgment. If no
completed ancestor result is found, the dialog states that readable-history gap.

Both lookups share the same bounded target history (up to 30 commits) and
selected-check evidence (up to 100 GitHub Actions runs, or the configured command
adapter's discovered attempts). Neither starts or takes ownership of CI.

The [launch start contract](LAUNCH-START.md#base-ci-before-an-execution-start)
owns the surrounding start and recovery behavior.
