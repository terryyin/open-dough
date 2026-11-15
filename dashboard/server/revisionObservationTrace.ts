// An opt-in trace of revision observation on stderr: each branch-head listing
// asked and how it settled (`./revisionChecks.ts`), each revision stream
// opened (`./revisionStreamObservation.ts`), each event written and each
// stream ended (`./revisionStreamEvents.ts`), with the time it happened. Only
// a process started with `DOUGH_REVISION_OBSERVATION_TRACE=1` writes it, as a
// test's dashboard server does, so a stalled observation names the step it
// stopped at.

export function traceRevisionObservation(step: string): void {
  if (process.env["DOUGH_REVISION_OBSERVATION_TRACE"] !== "1") return;
  process.stderr.write(
    `revision-observation ${new Date().toISOString()} ${step}\n`,
  );
}
