# First increment CI repair

Registered revision: e352b41c20dc7dfb9655353a2a15cc5b967939f1, run41166733510,
attempt1, story branch. Final diagnostic `/tmp/seed200-ci-final-diagnostic.json`.
All delivered events are deduplicated by job; final failure inventory:

- dashboard5/12 job124435808877: dependency acquisition deadline before tests;
  affirmative source-stall infrastructure evidence, no product repair.
- dashboard2/12 job124435808908: retirement-claude-done Recently done absent.
- dashboard4/12 job124435809098: retirement-attach Recently done absent.
- dashboard8/12 job124435809061: retirement-done concurrent doneAt absent.
- dashboard11/12 job124435808867: retirement-claude Recently done absent.
- dashboard10/12 job124435808979: terminal-touch last title words not visible.
- dashboard12/12 job124435809108: sidebar-touch startup banner not visible.
- dashboard6/12 job124435809015: terminal voice lifecycle visual `typed retry`
  split by synthetic resize output; exact native submitted line remains required.

No known competing repair owner exists for these files. Fresh `ci_dates` owns
the four retirement fixture specs; fresh `ci_touch` owns touch/CSS and lifecycle
observations. They share this checkout with disjoint paths and sequential heavy
proof (dates first), preserving unrelated sessions. Slice2 returned
`## PAUSED FOR CI` with no live commands/watches. Sanctioned stash save confirmed
`stashed`: record
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-KpZKRd/record.json`,
OID `521352ce4f67a730486addefd10713ae1399dec8`. It retains slice2 product/test
edits and coordinator plan/evidence notes; do not hand-restore or drop it.

Repair publication uses the already-done slice1 without changing its status,
with previously published base e352b41c and the same CI stream. Publish and
register accepted repair before restoring the exact saved record.

Full failed-job logs (seven test jobs) retained at
`/tmp/dough-ci-failed-job-logs-zsiXI3/summary.json` account for every test failure,
including two absent from the short diagnostic tails: boundary/agent-terminal-codex
startup/done preservation (404 after stale retained record), and
cursor-session-recovery done/completed no-Recover (Recently done expected1 got0).
Both seed the same October1 date and belong to the same demonstrated retention
cause. Date repair ownership includes those two fixtures; intentional retention
expiration variants remain untouched.

## Date repair acceptance

Fresh ci_dates returned six uncommitted fixture-only specs: the four retirement
journeys, boundary/agent-terminal-codex, cursor-session-recovery. Coordinator
inspected all seven date substitutions and the exact captured concurrentDoneAt
assertion. Production retention and intentional expiration variants are unchanged.
Two pre-change probes through exported withinRetention failed the recent-record
precondition at age30.17 days while fresh controls retained1; literal commands
and results are `/tmp/dough-ci-dates-proof-DFXXhb/pre-change-commands.txt`. These
prove the stale setup cause, not the entire native behavior.

Full green native/UI/transport observations, exit0,22/22 passed retry0:

```sh
env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/dough-ci-dates-proof-DFXXhb/proof-fixed-env.json npm run --silent test:dashboard -- dashboard/tests/session-workspace-retirement-claude-done.spec.ts dashboard/tests/session-workspace-retirement-attach.spec.ts dashboard/tests/session-workspace-retirement-done.spec.ts dashboard/tests/session-workspace-retirement-claude.spec.ts dashboard/tests/boundary/agent-terminal-codex.spec.ts dashboard/tests/cursor-session-recovery.spec.ts --workers=1
```

Original observations preserve Claude done/rename/report state, Codex exact report
identity/passive calls/store bytes/focus, concurrent exact timestamp, host-specific
done-intent preservation/readiness clearing, and Cursor no-Recover for both
done/completed records. Complete consumer dispositions at
`/tmp/dough-ci-dates-proof-DFXXhb/consumer-trace.md`; shared helpers unchanged.
First13 assertions passed but strict output failed on inherited color-variable
warning; renewed run above clears both variables and passes strict/runner state.
Final source/trace inspection accepted this as fixture repair, not loss of the
existing native, retention or Recover behavior.

## Touch and voice observation repair acceptance

Fresh ci_touch returned three test-only changes; no runtime/CSS changes.
Coordinator inspected each diff against hosted source/trace and the original
observations, preserving their native/result boundaries. Hosted title trace
shows12 short gestures reached scrollTop89 of203px names content (header44px):
continue while measured scrolling advances, retaining exact final20 title and
whole UUID visibility. Sidebar screenshot shows correct title/ID/composer with
startup banner already in scrollback: explicitly reveal panel, touch-focus,
submit and observe matching session's exact native line. Lifecycle rows contain
resize output between prefix/transcript: observe each while preserving exact
`["typed retry"]` after Enter. First local sidebar attempt correctly rejected
a clipped target; adding ordinary panel reveal supplies only navigation setup.

Full final green, exit0,7/7 retry0, strict and runner passed:

```sh
env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed200-touch-ci-repair-fixed-proof.json npm run --silent test:dashboard -- dashboard/tests/agent-terminal-touch.spec.ts dashboard/tests/sessions-sidebar-touch.spec.ts dashboard/tests/session-terminal-voice-lifecycle.spec.ts --workers=1
```

Literal cause/proof/setup/observations and retained hosted traces:
`/tmp/seed200-touch-ci-repair-handoff.md`; complete consumer dispositions at
`/tmp/seed200-touch-repair-consumers.md`. Existing source/keyed-view/input
semantics and normalization proof remain unchanged. No source amendment or
architectural exception is required. Hosted Linux confirmation remains the
registered repair publication's CI responsibility.

## Independent refactor acceptance

Fresh ci_refactor returned `## REFACTOR COMPLETE`, none — already clean, no edits
or tests. Coordinator accepted the inspected correspondence of22date and7touch
proof, preserved exact native assertions, and complete39-consumer trace at
`/tmp/seed200-ci-refactor-consumers.md` (effect-specific exclusions; shared helpers
unchanged). Whitespace passed; formatter-projected maximum test length247.
No semantic proof was invalidated. Source freshness returned unchanged at d3a51816;
119-commitment/3-obligation slice1 check accepted.

## Repair publication and later infrastructure event

Accepted f999ae22a2d56f467953a434f7536587c5cebf54 on the story branch,
suffixBase e352b41c, same observer reused. Sanctioned restore returned
resumed/applied and dropped only saved OID521352ce; slice2 resumed unchanged.
Later run41168021650 attempt1 dashboard7/12 job124439701837 failed at Install
npm dependencies before tests: explicit npm source acquisition45s deadline
exceeded (diagnostic `/tmp/seed200-ci-repair-diagnostic.json`). Affirmative
infrastructure disposition, no pause or product repair. Further jobs need
separate classification; this is no claim that its tests passed.
