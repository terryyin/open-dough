I'll follow the project's Open Dough guidance for this startup-slowness investigation—reading the relevant skills first, then working only in the authorized execution workspace.Next I'll admit the mission per Open Dough, then follow the exploration workspace lifecycle before probing startup.The owned workspace isn't present yet—I'll inspect the repo layout and execution-start usage so we can admit the mission and create it.Drafting the investigation story seed in the integration checkout, then admitting it via execution-start.Admission published. Next I'll prepare the owned workspace and run the probe investigation.**Investigation complete.** Startup is slow because most of the time goes to loading configuration. No product code was changed.

### Findings
| | |
|---|---|
| **Expected** | Startup should not spend most of its time on avoidable work |
| **Actual** | `node scripts/probe.js` reports: `startup spends most of its time loading configuration` |
| **Evidence** | Probe run from the owned workspace; expected marker at `.probe-ran` outside the checkouts |
| **Gaps** | Exact configuration-loading path and whether a ≤10-minute repair is enough were not scoped further (investigation-only) |

### Disposition
Repair was **not authorized** — findings only. Claim **SEED-C#startup-slowness** stays **Taken** with approach **unselected**.

### Checkout / publication
- **Owned workspace:** `…/native-execution` on `exec/native-admission` (created for this claim; starting revision `0217abb…`)
- **Originating / integration:** `…/integration` (local human edits preserved; refresh deferred: `pending-edit`)
- **Remote trunk:** `origin/main` @ `67a0105` — *Admit accepted work: SEED-C#startup-slowness*
- **Publisher:** `native-admission-investigation`
