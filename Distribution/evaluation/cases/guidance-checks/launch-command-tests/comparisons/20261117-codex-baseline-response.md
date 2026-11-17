Refactored the three requested specs and their shared ad hoc assertion helper to check named launch properties instead of argv positions, lengths, or whole commands. Model fallback and default effort now have separate cases. Product code is unchanged; nothing was committed or pushed.

Proof run:

- Dashboard typecheck, scoped ESLint/Prettier, and whitespace checks passed.
- Both targeted backend specs reached their final cases without command-assertion failures, then failed teardown at `processGroup.ts:185` because process-list stdout was undefined.
- The targeted ad hoc E2E run failed before launch because its GitHub-owner socket path was too long, then timed out during teardown.

Behavioral proof remains incomplete.