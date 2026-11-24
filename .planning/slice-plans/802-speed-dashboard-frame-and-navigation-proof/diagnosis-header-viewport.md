# Responsive header CI diagnosis

Run [45297113088, attempt 1, frontend shard 1/2](https://github.com/terryyin/open-dough/actions/runs/45297113088/job/138120195552) on `827f92532b4c8c65d50b14cdb64cfbbfa4f38df1`. At first notification 482 cases passed and one failed. The last four-width journey actions passed, then the Project radio group waited for viewport incidence at `dashboard-header-reading.ts` for about 14 seconds. Exact failure cause is open. The job summary had no recognized failure name and other jobs were in progress. The bounded diagnostic is in Git evidence `ci-failure-45297113088-1.json`. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

The macOS slice gates passed at two workers, including the four-width geometry
and ten reverse Tab checks per width. CI uses Linux with its configured browser
and fonts. Hypothesis for one discriminating experiment before any retry:
the project radio fits on macOS but compact mode appears at 700 CSS pixels on
Linux or the actual viewport dimensions did not propagate. Inspect exact CI width
and the failure record. Force the supported font/viewport conditions to observe
the production mode and the original assertion under that condition.

Slice 5 is parked with saved index and files using stash OID
`2f334969d3a539291b0678716d37fd6ba3eaba84`. It has no running proof.

## Round 1. Find the actual mode at 700 × 720

The full job log and artifact were retained as Git evidence `ci-header-job.log`
and `ci-header-artifact/`. The PNG is exactly 700 × 720. The ARIA tree exposes
`button "Project": Open Dough` and no Project radiogroup. The wide layout and
its ten reverse Tabs already completed. The fitted-tab contract in
`ProjectSelect.tsx` measures rendered font-dependent width against the slot.

Run the exact failing title once from an archive of the published revision in
an existing local Ubuntu 24.04, Playwright 1.65.0 image with two workers. The
local host is on AC, has 16 CPUs, 48 GiB of memory, and load 4.63. The local
Colima VM has eight cores and 16 GiB. Limit the isolated reproduction to four
cores. The container has ARM64 and Node 26.13.1, which differ from the CI job
(AMD64 and Node 24.21.0). The lockfile, Chromium build and Ubuntu distribution
match. Failure with the same missing radio and compact button distinguishes an
incorrect fit expectation from a lost viewport resize. A passing run calls for
an observed font-width probe, rather than repetition. This experiment uses a
separate dependency install and retains its terminal log in Git evidence.

The unmodified Linux container run passed 1/1 with the same lockfile and
Chromium build. It does not explain the Actions failure. Trace instead shows
the retired test used a Playwright Desktop Chrome context while the new Vitest
context enables touch. The dashboard's coarse-pointer media rule increases
several banner control widths. The Ubuntu runner image's installed font set
can further change the remaining fit. The production fit remains measured at
runtime.

One forced experiment in the disposable Linux copy widens only the rendered
font metrics at 700px with a monospace font and letter spacing. It prints the
actual viewport, project room, tab width, and coarse-pointer status before
checking the same original assertion. It should fail only after the tabs
outgrow the room and the Project button replaces them, reproducing the Actions
signature without relying on that runner's exact fonts. The instrument is
confined to the Git-evidence copy.

The forced Linux test measured 398px of room, 364.484px unmodified tabs and
561.422px after the font change with a coarse pointer enabled. It failed 1/1
at the original Project-radiogroup assertion and exposed the same compact
Open Dough button. This affirms the fit assumption as the reproducible failure
mechanism. The exact Actions font metrics were unavailable. The predecessor's
Ubuntu file proof (`ci-header-legacy-proof/`, [run 45294624330](https://github.com/terryyin/open-dough/actions/runs/45294624330))
records all five legacy header cases passing, including the statically checked
700px variant in the preceding desktop context. Diagnosis round 1 used 3.0
active minutes.

## Repair and planned validation

Keep the fitted-tab production rule. The mounted test keeps explicit modes at
1280, 520 and 320px. At 700px it independently reads the rendered tab and slot
widths, without reading the selection attribute or which control is shown.
The expected role must then be fully visible and the alternative absent.
Every width still verifies the actual viewport, the same banner and text
geometry and ten native reverse Tabs beyond the banner.

Run each local Linux condition once with the repaired test, ordinary fonts
and the same explicitly widened font probe. They should pass while exercising
radio and compact modes respectively. Run the three mounted header files at
two workers in the Mac checkout once and run typecheck, holding each command
to its terminal result. Before a CI confirmation, use one invocation on the
published repair. Expect frontend shard 1/2 to pass because a valid compact
render at 700px no longer requires a missing radio group. A new viewport or
focus failure would require new evidence before a repeat.

Both repaired Ubuntu runs passed 1/1. The forced run measured the same 398px
room and 561.422px tabs as the failing probe, and its compact control passed
the layout and reverse-Tab checks. The ordinary run traversed the radio case.
The macOS run passed all six mounted header, compact and connection-logo cases
with two workers. Dashboard typecheck and `git diff --check` also passed. Run
records, the trace and the full report are under `open-dough/evidence` in the
Git worktree directory. There is no diagnostic instrumentation in the repair.
The applicable hosted confirmation is still owed.
