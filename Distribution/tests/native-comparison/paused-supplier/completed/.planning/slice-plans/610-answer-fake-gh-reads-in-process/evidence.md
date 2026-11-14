# SEED-332 execution evidence

Owner: philip-chan. Branch: `codex/answer-fake-gh-reads-in-process`.

## Status

Complete and published to main, with its required stability evidence.

## Observations

- The two earlier strict timeouts are explained: in-process answers were
  shared objects that one check could change for another. Each answer is now
  a copy (`src/fake-gh.mjs`).
- Full suite after that fix: 2793 passed, 1 expected benchmark skip, no
  surviving processes; real native CLI controls unchanged.
- Natural-load acceptance: three consecutive family passes in natural
  one-minute CPU-load windows of 34–41, every case within 25 s.
- Hosted CI passed on the published revision.
