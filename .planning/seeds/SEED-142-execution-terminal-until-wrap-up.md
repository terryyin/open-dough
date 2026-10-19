---
id: SEED-142
status: active
planted: 2026-10-19
planted_during: Terry's report of a missing execution terminal before wrap-up
trigger_when: Execution completion hides terminal access before story wrap-up
scope: small
---

# SEED-142: Keep execution terminal access until wrap-up

## Selected Stories

<a id="keep-execution-terminal-until-wrap-up"></a>

### Keep the execution terminal available while awaiting wrap-up

**Identity:** SEED-142#keep-execution-terminal-until-wrap-up
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Execution completion does not hide the execution session's terminal
while its story is still awaiting wrap-up.

**Scope:** Repair automatic quiet-completion handling for an execution session
whose story is still awaiting wrap-up. Preserve deliberate Mark as done,
ordinary completed work, and wrap-up completion. Keep the completion report
distinct from story closure. No changes to the notification story's own work.

**Expected behavior / examples:** An execution session on a Taken story reports
`completed` with no message; its story card keeps Open terminal through refresh
and reload so wrap-up can continue. Wrap-up completion may mark the session
Done. Explicit developer Done remains authoritative.

**Actual behavior / evidence:** SEED-140#open-notified-story-from-macos-notification
retained its story branch, complete plan 318, and Taken membership at 21:34 JST
on 2026-10-19. Its execution session sent `--outcome completed` without a
message. The saved completion receipt and automatic `doneAt` have the same
timestamp, moving the session to Recently done and removing its card terminal.

**Remaining uncertainty:** Select the existing stable story/closure evidence
that can distinguish execution completion from final wrap-up without weakening
manual Done or completed session behavior. Confirm the repair through the
dashboard's existing completion and terminal journeys.

**Depends on:** No known blocking prerequisite.

**Safe stopping point:** The terminal stays reachable during the transition
from execution completion to story wrap-up, with completed and manually closed
sessions retaining their expected behavior.
