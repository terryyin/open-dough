// One durable launch record in the machine HOME store that development and
// production servers share. Servers must discover it from that file; nothing
// here answers record HTTP.
import { expect, type APIRequestContext } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { identity, title } from "../agentLaunchBoundary.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { keepLaunchStore, launchStoreFile } from "./launchStore.ts";

// The story's execution in a `claude` session, launched now.
export function writeSharedLaunchRecord(home: string) {
  const record = makeMe.aLaunchRecord
    .executing({ identity, title })
    .inClaudeSession({ sessionId: "shared-before-switch", shortId: "shared" })
    .launchedAt(new Date().toISOString())
    .please();
  const stored = keepLaunchStore(home, { "open-dough": [record] });
  return { record, store: launchStoreFile(home), stored };
}

export async function expectSharedLaunchRecord(
  request: APIRequestContext,
  url: string,
  record: LaunchRecord,
) {
  const response = await request.get(`${url}/__agent-launch`, {
    headers: { Origin: url },
  });
  expect(response.status()).toBe(200);
  const answer = (await response.json()) as { records: unknown[] };
  expect(answer.records).toEqual([expect.objectContaining(record)]);
}
