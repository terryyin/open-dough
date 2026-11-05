---
id: SEED-242
status: active
planted: 2026-11-05
planted_during: Terry Yin's report that a Cursor runner restart left previously running sessions stopped, and his request that a restart revive them
trigger_when: The Cursor runner that holds dashboard-launched sessions restarts or is replaced
scope: story
---

# SEED-242: Revive previous Cursor sessions when the runner restarts

For a developer with unfinished Cursor sessions the dashboard launched, a
runner restart that stops those sessions should leave them running again in
the new runner, without a separate recovery for each one.

<a id="revive-cursor-sessions-when-the-runner-restarts"></a>

### Revive previous Cursor sessions when the runner restarts

**Identity:** SEED-242#revive-cursor-sessions-when-the-runner-restarts
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and goal.** A developer whose unfinished Cursor sessions were
running under the dashboard's Cursor runner still has those sessions running
after that runner restarts. Each one continues its recorded chat in the new
runner. The developer does not recover them one by one.

**Evidence.** On 2026-11-05 the production dashboard moved to a new build and
the Cursor runner was replaced. The new runner held only the session whose
launch was the new work. Five unfinished sessions that had been running read
"The agent is not running." and had no `cursor-agent` process: Show CI status
and timing on the Intent homepage, Show lost freshness across repeated
revision-stream failures, Stop revision checks when a page leaves during
stream setup, Remove local proof from Donut, and Process FabioMalpezzi's open
PRs. Recovering each one resumed the chat and placed a continuation in the
composer, but the dashboard reported that Cursor had not taken that
continuation in time. The sessions were kept, and the continuation had to be
submitted before they read Working again.

Doing nothing leaves the next runner replacement in the same state. Recovering
each session by hand is the available workaround, and tonight it did not by
itself leave the continuation accepted.

**Scope.**

- *Required behavior.* When the Cursor runner restarts or is replaced, every
  unfinished session that runner was holding is running again under the new
  runner and continues its recorded chat.
- *Required behavior.* The developer can see those sessions as running in the
  dashboard, including in Running Cursor sessions, without using Recover on
  each one.
- *Kept behavior.* A session the previous runner was not holding stays as it
  was. A finished or marked-done session is not started again. Work that
  caused the new runner to start remains running.
- *Evaluation.* After a runner restart, each previously held unfinished
  session has a live agent in the new runner and the dashboard no longer says
  the agent is not running for that session.
