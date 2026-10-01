---
id: SEED-075
status: active
planted: 2026-10-01
planted_during: Terry's dashboard terminal crash report
scope: story
---

# SEED-075: Resolve the dashboard terminal resize crash

<a id="terminal-resize-crash"></a>

### Resolve the dashboard terminal resize crash

**Identity:** SEED-075#terminal-resize-crash
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Establish and resolve why resizing an attached terminal crashes the dashboard server.

- **Scope:** Diagnose the terminal lifecycle and repair a confirmed bounded resize failure through the bug-fixing workflow.
- **Expected:** Resizing a terminal whose process has ended leaves the dashboard available and reports the terminal's ended state.
- **Observed:** The Vite server exited with `Error: ioctl(2) failed, EBADF` from `UnixTerminal.resize`, called by a WebSocket message handler.
- **Evidence:** Terry's screenshot shows Vite 8.3.0, Node 24.5.0, and the macOS arm64 node-pty package, while running `npm run dev:dashboard` in this repository.
- **Uncertainty:** Which session and interaction triggered the resize, whether the PTY had already exited, and whether the same lifecycle affects other terminal operations.
