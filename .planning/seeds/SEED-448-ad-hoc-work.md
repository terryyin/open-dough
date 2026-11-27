---
id: SEED-448
status: active
scope: one story
---

# SEED-448 — Reach Intent frontend cases without frame-bound input waits

<a id="ad-hoc-work"></a>

### Reach Intent frontend cases without frame-bound input waits

**Identity:** SEED-448#ad-hoc-work
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Developers changing Project Intent get mounted frontend feedback near 100 ms per case by reaching preconditions and activating controls without frame-bound trusted input.

- **Request.** A follow-up to
  [browsing the project at a revision](https://github.com/terryyin/open-dough/commit/51a2dc8de3e9370624aecedb0061d4ad89197dfa)
  (SEED-420#browse-the-project-at-a-revision) reported that the new
  `intent-project-browse` cases and the other Intent frontend specs that
  execution touched run at close to a second per case.
- **Evidence (2026-11-27, local, load ~12 on 16 cores).** The 15 touched
  Intent specs have 42 real-timer cases. They took 20.8 s summed, 13.4 s of it
  inside Playwright `userEvent` calls. Mounting took ~3 ms, and rendering after
  an activation ~1 ms. Headless Chromium here produces one frame every
  ~50–80 ms (headed: ~11 ms), and no launch flag tried changed that.
  Trusted input waits on frames, so each click costs ~100–400 ms, while
  in-page activation (`activateButton`) costs ~4 ms. CI retains no proof
  summary at that revision.
- **Scope.** Intent page objects and touched specs that reach preconditions
  or activate controls through trusted input, plus the consumers of the shared
  page objects they change. Real keyboard input stays where a case's own
  behavior is native keyboard handling.
- **Saving worth keeping.** At least 30% of the touched cases' summed time,
  measured like-for-like (same spec selection, back-to-back runs), toward
  ~100 ms per case.
