# Diagnosis: trunk-rename-wording

CI run https://github.com/terryyin/open-dough/actions/runs/45319588627 attempt 1,
SHA 8b8a4ea20 (merge of trunk into this story branch). Trunk's own CI on
ba51ccece (run 45317222619) failed the same two jobs, so both arrived with
trunk's "Default main" -> "Execution checkout" rename; this story's changes
do not touch the failing code. Logs: evidence `ci-45319588627-dist2.log`,
`ci-45319588627-e2e1.log`; shard 1 artifact `e2e-playwright-report-1`
(trace: failure at viewport 390x300, first constrained pass, before typing).

## Failure 1: Distribution Tests (2/3)

Signature: `feedback-maintenance-row.test.mjs:64` expects
`default main has existing changes`, product says
`execution checkout has existing changes`. Trunk renamed the product text
(`dashboard/src/feedbackMaintenanceState.ts:176`) on purpose; the test
expectation is stale. Reproduced locally 1/1 (evidence `repair-fmr-before.log`).
Fixed: expectation updated (lines 79, 83). Passes after (`repair-fmr-after.log`).

## Failure 2: e2e shard 1/6

Signature: `agent-launch-start-session-touch.spec.ts:92`
`tapWhereShown(instruction)` -> `touch target is not clipped`:
`[" is cut by what clips it"]` (the instruction textarea).
Local reproduction at HEAD, macOS, workers=2, load ~3.5: passed 1/1
(`repair-touch-before.log`) - does not reproduce with macOS fonts.

Hypothesis H1: the rename lengthened the bold footer summary
`Default main · Automatically land` -> `Execution checkout · Automatically land`.
At 390px wide the summary wraps to two lines in CI's Linux fonts, so the
footer grows and, at 300px high, the scrolling body (24px padding each side)
is shorter than the textarea (max(control-size, 20dvh) = 60px).
Experiment: temporary measurement at 300px (reverted), then forced
reproduction with a wider font. Stopping count: 1 decisive run each.

### Results (round 1)

- Measurement (temporary spec edit, reverted; evidence `repair-touch-diag1.log`):
  macOS fonts at 390x300: body 92.6px, footer 181.4px, summary on one line
  (20.9px), textarea 60px - 32px slack, so it passes locally.
- CI evidence: the failing trace's last screencast frame (390x300) shows the
  summary wrapped as `Execution checkout · Automatically` / `land`, with the
  body showing only part of the field.
- Forced reproduction, dialog font Verdana (wider, like CI's Linux font):
  summary 41.8px (two lines), footer 223px, body 50.9px < 60px textarea;
  failed with the CI signature `[" is cut by what clips it"]`
  (`repair-touch-diag2.log`, exit 1). H1 confirmed.
- Fix (product layout, `dashboard/src/launch-dialog.css`, short windows
  `height <= 30rem` only): the dialog takes the window's whole height
  (`100dvh`, form `100dvh - 2px`) and the footer's vertical padding drops to
  `--space-2`. Same forced reproduction after: body 82.9px, passes
  (`repair-touch-diag4.log`, exit 0). The clipping check is unchanged.
- Real spec after the fix, diagnostic reverted, `--repeat-each=3`, workers=2,
  load 6.2-6.5: 3/3 passed (`repair-touch-after-x3.log`).

Leading hypothesis: confirmed (H1). No unrelated defects found. Temporary
diagnostic edits: none remain (spec restored from a copy). Round 1 of 3.
- Further proof: Distribution share 2/3 passed (`repair-dist2.log`);
  frontend consumers of `launch-dialog` (11 files, 36 cases) passed
  (`repair-consumers-frontend.log`); e2e consumers (story card, story card
  problems, responsive session start, story card workspace, feedback
  maintenance settings) passed (`repair-consumers-e2e.log`); typecheck,
  eslint and prettier check passed. Cumulative active minutes ~5.
