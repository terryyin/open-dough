---
id: SEED-424
status: active
planted: 2026-11-23
planted_during: Terry investigated unreliable Codex status in the production Sessions sidebar
trigger_when: first in the product backlog
scope: story
---

# SEED-424 — Keep open Codex session status current

<a id="poll-open-codex-sessions"></a>

### Keep open Codex session status current

**Identity:** SEED-424#poll-open-codex-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/784-poll-open-codex-sessions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c42847066210679589cedcc771efd1c30e1f4da3ef08f238c2ae66e0dc830c6d","plan":"f34131c81f20599140e73c1a459a94286c0fc9b48e423c7a3e1b5320642ba60b"}}
```

#### Goal

A developer watching Sessions sees current status for open Codex work even
when Recently done holds hundreds of saved conversations.

#### Scope

- The dashboard's recurring Codex observation reads the sessions it tracks as
  open. A Codex session marked Done reads from the saved Done record, including
  when the developer continues the conversation directly in Codex.
- Opening a Done session from the dashboard checks that conversation on demand.
  A successful terminal attach reopens the same session and brings it back into
  live observation. An unsuccessful attach preserves the Done record.
- Recently done still provides saved review and completion evidence, and final
  reports remain available through their dedicated read. This fix covers Codex
  observation and its dashboard presentation. The history payload and live
  transport have their own stories.
- Replace the retired Codex behavior and its dedicated assertions in the same
  slice. Keep one rule based on the dashboard's recorded Done mark. Describe
  the expected results through the visible states, the exact set of observed
  sessions, and the existing reopen outcome.

#### Key examples

1. Several older Done Codex records precede a newer open one. A recurring
   observation reads the open session and shows it Working. Recently done
   lists the saved Done entries, including a conversation working directly
   in Codex.
2. Open a Done session's terminal. A failed attachment leaves the same entry
   Done. A successful attachment restores that session's terminal history,
   returns its entry to the open list, and resumes live status checks.
3. Read the final report of a Done Codex session whose workspace has retired.
   The report opens read-only and the session stays Done.

#### Evidence

On November 23, production had 432 retained Codex sessions and 5 open ones.
Three fresh overview reads returned all five as unknown after about 10–12
seconds. The deployed observer read those five as Working in 78 ms when
queried on their own. An ordinary overview later returned all five Working
in about two seconds. The shared four-slot, nine-second observation
currently queues Done history ahead of open work.
