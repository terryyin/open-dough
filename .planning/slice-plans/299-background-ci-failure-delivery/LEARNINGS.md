# Carried execution learnings

Supporting record for [plan 299](PLAN.md); slice status and current execution
ownership remain in that plan. This record grants no execution authority.

## Learnings

Carried from plan 224's execution; its own record keeps the per-slice detail.

- 2026-10-11: old plan's separate dashboard mailbox root would isolate hooks
  but not GitHub throttling or standalone wakeup. One request owner is needed
  and is now delivered.
- 2026-10-11: older accepted failure and current completion fence are different
  facts. Sorted SHA files and fetched target tips cannot decide completion.
- 2026-10-11: native input acceptance, handling and CI repair need distinct
  durable evidence. Existing attach/Recover actions are not acceptance proofs.
- 2026-10-11: the request owner is one process per API host and login, on
  demand, under `/tmp/dough-github-requests-<uid>`. The supervising runtime of
  slice 3 is a client of the request owner of its own login and cannot
  supervise or restart it.
- 2026-10-11: an endpoint directory holds `owner.*.json`, `hold.*.json` and
  `call.*.json`; anything that enumerates or transfers it must carry or
  tolerate them. A consumer of a killed owner gets `failed` and asks again.
- 2026-10-11: installs speaking different owner protocols share one endpoint
  directory, since its name carries only the API host and login. The later
  starter is refused at greeting and every read of its fails while the other's
  owner lives; for an observer that is three errors and lost coverage (G12).
  The dashboard reads the request source from its checkout while observers run
  the installed payload, so a protocol change can separate them. Decided at
  refinement: the directory name keeps host and login only, so there is still
  one owner per login; slice 3 makes a newer install replace an older owner.
- 2026-10-11: a change to CI acquisition or the request path needs full
  `npm test` and the whole dashboard suite; the dashboard completion specs and
  the native closure checks consume the installed CI engine through their own
  `gh` stand-ins. Every test with a `gh` stand-in needs a private request
  owner, and the stand-in must answer `auth` before it records or blocks.
- 2026-10-11: `install.sh` and `references/ci-monitor.md` sit at the 250-line
  limit; the next payload file or guidance line needs a structural move.
- 2026-10-11: any change to CI acquisition or the request path is accepted
  only on full `npm test` and the whole dashboard suite on the final state.
- 2026-10-11 (original slice 1, now 2, Claude Code): exit status 0 from `claude --bg --resume`
  does not mean the session received the text; it can start a copy, announced
  only on stderr. A sender must compare the printed id with the session's own,
  persist its token first, and reconcile from the transcript. Typing into
  `claude attach` can answer a pending permission prompt.
- 2026-10-11 (repair after slice 1): CI run 38146357255 on `cd35b4fa` failed
  `agent-launch-start-resume.spec.ts:128`, which read a launch attempt right
  after the launch's answer, before the separate write that keeps its
  outcome. Both such reads in that spec now wait through
  `dashboard/tests/settledAttempt.ts`. The revision changed no dashboard code.
