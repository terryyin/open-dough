// A bounded wait for an attempt observation to change. Another server's
// live worker can only be observed after the wait; this server's owner signals
// changes directly. The timer never settles or changes an attempt.
import { z } from "zod";
import type { ChangedAnswer } from "../src/agentLaunch.ts";
import type { LaunchAttemptOwner } from "./launchAttemptOwner.ts";
import { RefusedRequest } from "./localOrigin.ts";

// A wait as asked: the attempt, and how many changes the asker's observation
// of it counted.
export type AdmittedChanged = {
  readonly kind: "changed";
  readonly attempt: string;
  readonly seen?: number;
};

const waitSchema = z.object({
  attempt: z.uuid(),
  seen: z.coerce.number().int().nonnegative().optional(),
});

export function changedRequest(url: URL): AdmittedChanged {
  const wait = waitSchema.safeParse({
    attempt: url.searchParams.get("attempt"),
    seen: url.searchParams.get("seen") ?? undefined,
  });
  if (!wait.success) {
    throw new RefusedRequest(400, "The attempt request is malformed.");
  }
  const { attempt, seen } = wait.data;
  return { kind: "changed", attempt, ...(seen === undefined ? {} : { seen }) };
}

export async function changedAttempt(
  owner: LaunchAttemptOwner,
  id: string,
  waitMs: number,
  seen?: number,
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
        : await Promise.race([
            owner.changed(id, seen).then(() => true),
            waited,
          ]);
    const attempt = owner.observation(id);
    return attempt === undefined ? { changed } : { changed, attempt };
  } finally {
    clearTimeout(expired);
  }
}
