# CI runtime setup

Read this before launching observation. Use Node 20+ (standard library only),
Git, and authenticated `gh` with read access to the selected GitHub Actions
repository. Detached host adapters also require a POSIX host with `ps` and
signals. Apply the client tooling wrapper to launches if needed; hook commands
must find Node directly without entering a build environment.

Resolve the installed skill directory from the skill you loaded, independently
of the client checkout's working directory. It is normally
`.agents/skills/dough-execute-plan` for Codex/Cursor or
`.claude/skills/dough-execute-plan` for Claude Code. The runtime derives checkout
identity four levels above its `scripts/` module; preserve that layout. The
source checkout's `src/skills/dough-execute-plan/scripts/` has the same depth.
Use canonical filesystem paths, quote paths containing spaces, and replace
example placeholders before execution.

## Select CI

Resolve repository and branch from the authorized push destination. Verify the
branch has a push-triggered CI workflow. This observer handles one CI workflow
per execution; it does not support pull-request-only CI or observe deployment.
If the client needs an unsupported mode, report missing monitoring coverage and
continue execution without claiming CI observation.

Set these environment variables on the observer launch (and preserve them in
any client wrapper):

| Variable | Meaning |
| --- | --- |
| `DOUGH_CI_WORKFLOW` | Workflow filename or ID accepted by `gh run list --workflow`; default `ci.yml` must be verified |
| `DOUGH_CI_WORKFLOW_NAME` | Exact workflow display name; default `CI` must be verified |
| `DOUGH_CI_MAILBOX_ROOT` | Optional private shared mailbox directory; default `/tmp/dough-ci-$UID` |

The branch is a required positional argument, never an inferred `main`.
Record the verified workflow selector/name with the observer identity in the
active PLAN. Do not change configuration during an observer's lifetime. A
new coordinator must recover and close the old observer before replacing it.
When overriding the mailbox directory, provide the same absolute value to both
launcher and hooks; a per-process `TMPDIR` does not establish shared identity.

Example after resolving the values and applying the client wrapper if needed:

```sh
DOUGH_CI_WORKFLOW=checks.yml DOUGH_CI_WORKFLOW_NAME='Project checks' \
  node '/ABSOLUTE/RESOLVED/SKILL/scripts/ci-mailbox.mjs' \
  start --execution OWNER/REPO BRANCH
```

Use `stream` instead of `start` for the Codex yielded-cell bridge. Preserve the
same environment in its command. The optional final budget is milliseconds;
default is eight hours. Requests time out after 20 seconds, normal polls are
30 seconds apart, and three consecutive observation errors end coverage.
Discovery is bounded to 100 startup runs and 20 per later poll, retaining already
seen unfinished runs. This is not exhaustive history for a very busy repository;
report that limit when it affects required coverage.

## Register the current host bridge

For Cursor, merge the hook entries in
[cursor-hooks.json](../assets/cursor-hooks.json) into `.cursor/hooks.json`.
For Claude Code, merge
[claude-hooks.json](../assets/claude-hooks.json) into `.claude/settings.json`.
Preserve unrelated hooks, permissions, settings, and local preferences. Avoid
adding duplicate commands. Do not replace a whole settings file with a fragment.
The fragment paths assume the platform's installed skill root above; adapt only
that path if the client uses a different supported delivery location.

Registration requires the client's authorized configuration workflow; skill
invocation alone does not install hooks. Run the readiness probe through the
owning native host as described in [host notifications](ci-notify-hosts.md).
File presence or a direct terminal call does not prove native delivery. If
registration/trust is unavailable, report it once and continue without AI polling.
Neither hook wakes an idle session. Stop hooks deliver ready events only.

Codex uses [the yielded-cell bridge](ci-notify-codex.md) when available; the
bundled Cursor/Claude fragments do not register Codex hooks. Without the required
bridge tools, report monitoring unavailable. Do not assume a native hook exists
merely because a host supports hooks in some versions.

The hooks read local mailboxes only. They do not measure implementation time.
Track active slice/refactor elapsed time with the host clock; use the client's
slice budget and exclude an explicit repair pause. Observer deadlines and hook
execution timeouts are separate lifecycle bounds.
