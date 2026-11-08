// The bounded launch wait Start, Recover, and last-held revival share:
// `DOUGH_LAUNCH_TIMEOUT_MS`, default 30s; test configuration may shorten it.
// A test may also name a file (`DOUGH_TEST_LAUNCH_WAIT_END_FILE`): a running
// wait then also ends when that file appears, and removes it, so the test
// ends one wait once it has observed what that wait must not race.
// Production names no file.
import { unlinkSync } from "node:fs";

const defaultLaunchWaitMs = 30_000;
const endFilePollMs = 20;

export function launchTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_LAUNCH_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultLaunchWaitMs;
}

// True once this call removed the end file.
function takeEndFile(file: string): boolean {
  try {
    unlinkSync(file);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

// Calls `end` once when the wait ends. The returned function cancels it.
export function launchWait(end: () => void): () => void {
  const file = process.env["DOUGH_TEST_LAUNCH_WAIT_END_FILE"];
  const finish = (): void => {
    cancel();
    end();
  };
  const timer = setTimeout(finish, launchTimeoutMs());
  const poll =
    file === undefined || file === ""
      ? undefined
      : setInterval(() => {
          if (takeEndFile(file)) finish();
        }, endFilePollMs);
  function cancel(): void {
    clearTimeout(timer);
    clearInterval(poll);
  }
  return cancel;
}
