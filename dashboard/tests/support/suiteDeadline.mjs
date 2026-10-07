// CI records the epoch, in milliseconds, by which the browser suite must have
// ended (OPEN_DOUGH_DASHBOARD_DEADLINE_MS, .github/workflows/ci.yml). This
// turns it into the run's remaining Playwright globalTimeout, so the suite
// ends itself before the job's own bound. Unset leaves the run unbounded.
export function remainingSuiteTime(deadline, now = Date.now()) {
  if (deadline === undefined) {
    return undefined;
  }
  const epoch = /^[0-9]+$/.test(deadline) ? Number(deadline) : NaN;
  if (!Number.isSafeInteger(epoch)) {
    throw new Error(
      `OPEN_DOUGH_DASHBOARD_DEADLINE_MS=${deadline} is not an epoch in milliseconds.`,
    );
  }
  if (epoch <= now) {
    throw new Error(
      `OPEN_DOUGH_DASHBOARD_DEADLINE_MS=${deadline} passed ${now - epoch} ms before the browser suite started.`,
    );
  }
  return epoch - now;
}
