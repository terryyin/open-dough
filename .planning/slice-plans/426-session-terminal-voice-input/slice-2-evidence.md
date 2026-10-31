# Slice 2 acceptance evidence

The coordinator inspected useTerminalDictation pending-state transition and
final feedback/docs, the four new recovery tests, server-restart fixture,
completed-response hold, input-frame and native-line observations. Source review
rows now map the final recovery commitments and moved interim-retention proof
to the recovery spec. G2's original report remains, now proved by slice2.

Focused proof terminal exit0,12/12 retry0, strict+runner passed,88.7s:

```sh
env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed200-slice2-focused-proof.json npm run test:dashboard -- dashboard/tests/session-terminal-voice-recovery.spec.ts dashboard/tests/session-terminal-voice.spec.ts dashboard/tests/session-terminal-voice-lifecycle.spec.ts dashboard/tests/agent-terminal-lifetime.spec.ts --workers=1
```

The new recovery fixture starts real preview/server/native attachments on the
same machine and port; only a real completed transcription response is held.
Observations cover complete pending text and no frame on unavailable Insert;
reconnect with no automatic input; deliberate Insert one frame/focus; native
prefix/edit/no submit then exact line after Enter; later reconnect no replay;
Discard no frame then new capture; actual Close and switch clear before B and
reopened A. The >4000 pending text stays complete. No sender/recorder protocol
changed. Normal/lifecycle/lifetime proof retains keyboard, phone, no-limit,
no-submit, late-result and attachment semantics.

Consumer proof terminal exit0,4/4 retry0, strict+runner passed,43.9s:

```sh
env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed200-slice2-consumer-proof.json npm run test:dashboard -- dashboard/tests/agent-terminal-codex-page.spec.ts dashboard/tests/agent-terminal-cursor-page.spec.ts dashboard/tests/agent-terminal-theme.spec.ts --workers=1
```

Both Codex native pages, Cursor same-client reopen/microphone and healthy idle
status/theme assertions passed; typecheck and whitespace passed. Consumer records
`/tmp/seed200-slice2-consumers.md` (410 disposed) and
`/tmp/seed200-slice2-effects-consumers.md` (26 disposed) include required effects
and no unfilled rows. Launch adapter/recording/transcription/overflow proof stays
unchanged and is reused. The later coarse1px repair does not reach desktop
recovery/lifecycle/consumers; its full phone geometry was renewed with four
passing touch journeys at d1919b36 (see ci-geometry-evidence.md).

Independent fresh refactor_2 returned `## REFACTOR COMPLETE`. It shortened only
the newly changed recovery prose from251 to250lines, preserving every promise.
Coordinator inspected the resulting paragraph; eight documentation consumers have
complete dispositions at `/tmp/seed200-refactor2-doc-consumers.md`. No runtime,
test, setup, CSS or assertion changed, so12+4 and geometry4 proof remains valid.
Whitespace/index checks passed; no proof rerun or typecheck was needed for prose.
All changed files <=250lines; no gap or architectural conflict found.

 Two clean sanctioned restores preserve
the actual adapter/test setup above; no sender or recorder changes followed
these observations. Reuse compatible proof rather than repeating it.
