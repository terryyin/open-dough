# Mounted voice capture CI diagnosis

[Failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)

- Run 45345508896, attempt 1, job 138279083354, on published `dfb63b8b`.
- Ubuntu Chromium shard 2/2 reported 1 failed and 371 passed. In
  `mounted-instruction-voice.spec.ts`, the first round of the Cancel/Escape
  held-transcription case clicked Record and Stop in about 138 ms and made zero
  requests. Its first poll expected one. Local focused proof passed on macOS.
- The product guard changed the outcome when no data arrived. The ordinary
  launch clip helper clicks Stop without observing positive recorder bytes.
  The newly added retry already waits for positive bytes.
- Round 1 hypothesis: the failing case can legitimately stop before Chromium
  has supplied any bytes. Prove with one inspection of the CI evidence and a
  bounded focused reproduction. Then make normal-audio scenarios wait for
  native bytes before Stop, while keeping the explicit empty fixture distinct.
- The checkout was clean at `dfb63b8b`; no files were parked.
- The shard’s failure screenshot in artifact 14897628414 shows the original
  draft, Ready controls, and “No audio was captured. Record again or type the
  instruction.” This confirms the native zero-byte Stop happened in CI. The
  unchanged test polls the transcription call immediately after Stop and had
  not observed any recorded bytes. The pre-guard behavior forwarded empty
  data and therefore masked this missing fixture precondition. No additional
  local red trial is needed to reproduce the confirmed failure.
- The repair waits for native data in the shared mounted-launch clip action
  and at the separate direct Stop in the ended-terminal recovery test. The
  deliberately empty clip retains its explicit Stop without that wait. Other
  mounted note and terminal helpers and E2E helpers already await positive
  data. No assertions or timeouts change.
- Run the focused mounted voice readers once on local macOS Chromium. The
  expected result is that all positive cases send their expected calls with
  the new precondition and the explicit empty case continues to send none.
- Local macOS Chromium, default workers, one focused run at load about 4:
  all 21 tests across eight voice specs passed in 16.73 seconds. This includes
  both held-transcription dismissals and reopening, terminal end recovery,
  and the original zero-byte regression and real-audio retry. The proof run
  record is `ci-45345508896-voice-repair.log.run.json` in the worktree’s Git
  evidence directory. Scoped ESLint also passed.
- Hosted verification hypothesis: the repair revision’s normal CI should pass
  the formerly failing frontend shard because every positive mounted clip now
  waits for a native event before Stop. Observe that revision’s first push
  attempt and diagnose any remaining failure instead of rerunning blindly.
