# SEED-332 execution evidence

Owner: philip-chan. Branch: `codex/answer-fake-gh-reads-in-process`.

## Status

The in-process reader is published to main as an early, opt-in integration.
The story stays Taken: its outcome is not complete, and no verification is
running.

## Observations

- Full diagnostic with the in-process reader: 2793 passed, 1 expected
  benchmark skip, no surviving processes.
- Stability: two strict timeouts in the first 33-case family repetition
  (origin preparation; Done default-answer selection) remain unexplained.
- Required acceptance not yet observed: three consecutive family passes in a
  natural one-minute CPU-load 30–50 window, every case within 25 s.

## Next

Explain the earlier timeouts and observe the natural-load window.
