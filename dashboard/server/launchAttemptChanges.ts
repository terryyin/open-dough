// A bounded wait for an attempt observation to change. Another server's
// live worker can only be observed after the wait; this server's owner signals
// changes directly. The timer never settles or changes an attempt.
import type { ChangedAnswer } from "../src/agentLaunch.ts";
import type { LaunchAttemptOwner } from "./launchAttemptOwner.ts";

export async function changedAttempt(
  owner: LaunchAttemptOwner,
  id: string,
  waitMs: number,
): Promise<ChangedAnswer> {
  let expired: NodeJS.Timeout | undefined;
  const waited = new Promise<false>((resolve) => {
    expired = setTimeout(resolve, waitMs, false);
    expired.unref();
  });
  try {
    const observed =
      owner.observation(id) ??
      (await owner.attempts()).attempts.find((attempt) => attempt.id === id);
    const changed =
      observed?.running === true && !observed.owned
        ? await waited
        : await Promise.race([owner.changed(id).then(() => true), waited]);
    const attempt = owner.observation(id);
    return attempt === undefined ? { changed } : { changed, attempt };
  } finally {
    clearTimeout(expired);
  }
}
