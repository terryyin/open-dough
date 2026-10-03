# Production nerd avatars

<a id="production-nerd-avatars"></a>

### Production nerd avatars

**Identity:** SEED-090#production-nerd-avatars
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Make the git-ignored nerd cartoon avatars available in the production dashboard.

Copy the development checkout's local cartoon avatars into each isolated production build. Keep these assets git-ignored, keep original photos out of the production copy, and retain the existing portrait fallback when cartoons are absent. Production updates must receive the same treatment as startup builds.

The current instruction authorizes one bounded planless implementation. Verify a real staged production preview serves a supplied cartoon avatar and remains usable without local cartoons.
