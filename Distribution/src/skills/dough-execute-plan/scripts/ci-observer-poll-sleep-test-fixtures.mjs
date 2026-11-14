import assert from "node:assert/strict";

// A controllable poll sleep for a real observer worker. The worker records a
// poll's events and coverage before it reaches this sleep, so reaching it is
// the signal that the poll finished. Tests wait on that signal rather than on
// a wall-clock deadline: a poll runs dozens of synchronous git calls whose
// duration depends on machine load.
export function controllableSleep() {
  const sleeps = [];
  const arrivals = [];
  let entered = 0;
  const sleep = (...[, , { signal }]) =>
    new Promise((resolve, reject) => {
      const entry = { resolve };
      sleeps.push(entry);
      entered += 1;
      for (const arrive of arrivals.splice(0)) arrive();
      // A pause ended by its signal (stop, or a registration waking the
      // observer) is no longer pending for the test to release.
      signal.addEventListener(
        "abort",
        () => {
          sleeps.splice(sleeps.indexOf(entry), 1);
          reject(signal.reason);
        },
        { once: true },
      );
    });
  // Settles once a pause entered after the first `after` pauses is pending.
  const sleeping = (after) =>
    sleeps.length > 0 && entered > after
      ? Promise.resolve()
      : new Promise((arrive) => arrivals.push(arrive)).then(() =>
          sleeping(after),
        );

  // Binds the worker whose poll sleeps these are. `reached()` settles once
  // that worker is parked in a poll sleep; a worker that ends first
  // (observation lost) fails with `diagnostics()` rather than hanging.
  // `release()` ends the oldest pending sleep; `advance()` releases it and
  // waits for the following poll to reach its sleep. `pauseAfterNow()`
  // returns a wait for the first pause the worker enters after the call, such
  // as the one after a poll that a registration wakes.
  const of = (worker, diagnostics = () => []) => {
    const reached = async (after = 0) => {
      const outcome = await Promise.race([
        sleeping(after).then(() => "polled"),
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
    const pauseAfterNow = () => {
      const after = entered;
      return () => reached(after);
    };
    const advance = async () => {
      const paused = pauseAfterNow();
      release();
      await paused();
    };
    return { reached, release, advance, pauseAfterNow };
  };
  return { sleep, of };
}
