import assert from "node:assert/strict";

// A controllable poll sleep for a real observer worker. The worker records a
// poll's events and coverage before it reaches this sleep, so reaching it is
// the signal that the poll finished. Tests wait on that signal rather than on
// a wall-clock deadline: a poll runs dozens of synchronous git calls whose
// duration depends on machine load.
export function controllableSleep() {
  const sleeps = [];
  const arrivals = [];
  const sleep = (...[, , { signal }]) =>
    new Promise((resolve, reject) => {
      sleeps.push({ resolve });
      for (const arrive of arrivals.splice(0)) arrive();
      signal.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });
  const sleeping = () =>
    sleeps.length > 0
      ? Promise.resolve()
      : new Promise((arrive) => arrivals.push(arrive));

  // Binds the worker whose poll sleeps these are. `reached()` settles once
  // that worker is parked in a poll sleep; a worker that ends first
  // (observation lost) fails with `diagnostics()` rather than hanging.
  // `release()` ends the oldest pending sleep; `advance()` releases it and
  // waits for the following poll to reach its sleep.
  const of = (worker, diagnostics = () => []) => {
    const reached = async () => {
      const outcome = await Promise.race([
        sleeping().then(() => "polled"),
        worker.then(
          () => "ended",
          () => "ended",
        ),
      ]);
      assert.equal(
        outcome,
        "polled",
        `worker ended before its poll sleep: ${JSON.stringify(diagnostics())}`,
      );
    };
    const release = () => sleeps.shift().resolve();
    const advance = async () => {
      release();
      await reached();
    };
    return { reached, release, advance };
  };
  return { sleep, of };
}
