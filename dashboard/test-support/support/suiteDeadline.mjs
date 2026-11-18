// CI records the epoch, in milliseconds, by which a group's browser run must
// have ended (`<prefix>_DEADLINE_MS`, `variable`, .github/workflows/
// browser-test-group.yml). This turns it into the run's remaining Playwright
// globalTimeout, so the run ends itself before the job's own bound. Unset
// leaves the run unbounded.
export function remainingSuiteTime(deadline, variable, now = Date.now()) {
  if (deadline === undefined) {
    return undefined;
  }
  const epoch = /^[0-9]+$/.test(deadline) ? Number(deadline) : NaN;
  if (!Number.isSafeInteger(epoch)) {
    throw new Error(`${variable}=${deadline} is not an epoch in milliseconds.`);
  }
  if (epoch <= now) {
    throw new Error(
      `${variable}=${deadline} passed ${now - epoch} ms before the browser suite started.`,
    );
  }
  return epoch - now;
}
