// How long a launch waits for its start's script before it answers uncertain.
// The script itself is never aborted: it goes on running when the wait ends.

const defaultStartWaitMs = 120_000;

// A test may shorten the wait through the environment.
function startTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_START_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultStartWaitMs;
}

// What `attempt` settles to, or `expired` when the wait ends first.
export async function withinStartWait<Result>(
  attempt: Promise<Result>,
): Promise<Result | "expired"> {
  let timer: NodeJS.Timeout | undefined;
  const expiry = new Promise<"expired">((resolve) => {
    timer = setTimeout(() => {
      resolve("expired");
    }, startTimeoutMs());
  });
  const settled = await Promise.race([attempt, expiry]);
  clearTimeout(timer);
  return settled;
}
