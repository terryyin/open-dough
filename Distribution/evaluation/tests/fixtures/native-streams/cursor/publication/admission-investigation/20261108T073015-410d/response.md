I'll follow this project's Open Dough bug-fixing guidance and investigate the slow startup from the authorized execution workspace without changing product code.Next I'll admit the mission and open the exploration-workspace lifecycle references this skill requires.I'll pull the admit/start command details, identity allocation, and seed format next.The authorized workspace path isn't present yet; I'll inspect project planning layout and the start/admit command surface next.I'll draft the admission seed with a verified unused identity, then run the start command against the authorized workspace.Admission published. Next I'll run checkout setup in the owned workspace and gather probe evidence.Probe confirmed configuration loading as the slowdown. I'll record that evidence on the Taken story without changing product code.Investigation confirms the slow-startup report; repair was not authorized, so product code is unchanged.

### Disposition
**Confirmed discrepancy — repair withheld.** Probe output attributes most startup time to **configuration loading**. `SEED-C#startup-slow` stays **Taken** with that evidence; no fix and no `## BUG REPORT RESOLVED`.

### Report
| | |
|---|---|
| **Expected** | Startup completes promptly for normal local use |
| **Actual** | Slow startup confirmed |
| **Evidence** | In owned workspace, after setup/`command.js` (exit 0): `node scripts/probe.js` → `startup spends most of its time loading configuration`; marker `../.probe-ran` written as expected |
| **Gaps** | No product timing budget; dominant config path and smallest safe repair still open |

### Admission / workspace
- **Published claim:** `2b5cdb2` on `origin/main` (publisher `native-admission-investigation`)
- **Owned workspace:** `.../native-execution` on `exec/native-admission` (`created: true`, for `SEED-C#startup-slow`)
- **Originating / integration:** `.../integration` — local human edits preserved; refresh deferred (`pending-edit`)
- **Evidence draft:** uncommitted update on `.planning/seeds/C.md` in the owned workspace only
