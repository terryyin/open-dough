---
id: SEED-221
status: active
planted: 2026-11-02
planted_during: Terry Yin's dough-test-optimization --resolve pass over the recorded candidates
trigger_when: A dashboard journey waits out the page's launch-records poll interval in real time
scope: story
---

# Dashboard journeys pass launch-records reads without real waits

<a id="launch-records-poll-waits"></a>

### Pass launch-records reads without waiting the poll interval

**Identity:** SEED-221#launch-records-poll-waits
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/448-launch-records-poll-waits/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a026bebe753260066fc13f95a3f2188ca3bc0d54a4631718dde4401ea1abcc34","plan":"7220f61ed5132f8d19dab446336aa3c0e3042f368a5ab953fe3fb93160e9146b"}}
```

**For / why:** Developers waiting on `npm run test:dashboard` lose about a
minute of summed test time to four waits that only sit out the page's 15s
launch-records poll (`checkIntervalMs`) in real time.

**Goal:** The attention journey in
`dashboard/tests/agent-completion-attention.spec.ts` and the two close/reopen
races in `dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts` drive the
page's next launch-records read with the existing page clock and one-read pace
instead of waiting for it, keeping every behavior they protect.

**Scope:**

- Reuse `pausePageClockAt` (`dashboard/tests/dashboardTest.ts`) and
  `watchRecordReads(page).passOnePace` (`dashboard/tests/sessionStatePace.ts`);
  add no new clock or pacing mechanism.
- Keep the protected behavior: a delivered report reaches the open page
  without a reload (attention journey), and a closed or reopened terminal stays
  as the developer left it once its session starts (both races).
- The races keep `withholdLaunchOutcomes` as it is; the clock change does not
  extend that response rewriting.
- Measured gain against a comparable focused baseline decides retention; a
  change without a measured gain is undone and recorded.

**Key examples:**

- After `release()`, the closed-terminal race shows the quiet actions row
  after one paced read, with the panel still closed and no new attach.
- After the reported completion, the attention card shows the message and
  later "Unfinished work" after paced reads, without a reload.
