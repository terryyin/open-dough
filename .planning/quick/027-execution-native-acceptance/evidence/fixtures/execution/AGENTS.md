# Greeting client
This isolated client has one production subsystem, greeting, in src/. The CLI src/greet.mjs is its public entry point. Domain terms: name and greeting.
Use native Node directly, no wrapper. Focused proof: node --test test/greet.test.mjs. Whitespace check: git diff --check. No generated files or generation triggers. File limits: 150 lines for source/tests, 250 for plans; installed guidance exempt.
Executable plan: planning/plan.md, story: planning/seed.md. Status vocabulary: planned, in-progress, done. Slice target 5 minutes, hard limit 10 minutes, no exceptions. The plan is retained on completion; mark its story completed in the seed. No other summaries or state index.
Selective formatting: python3 scripts/format.py. It checks changed client text files and is a successful no-op when already formatted. Run directly once during coordinator wrap-up.
Commit hook .git/hooks/pre-commit owns check-only whitespace lint on staged files; no formatting or index mutations. Do not run its lint independently. git diff --check remains the refactor whitespace check.
Authorized push destination: origin main, a local bare acceptance repository. No GitHub workflow exists; CI monitoring is unsupported for this destination. Report that fact once and continue local delivery. Never use a network remote.
The user requests completing the existing story, including local commit and push. Installed skill behavior controls execution and independent refactoring. All project changes for this story are owned by this execution; no unrelated work is present.
