// One durable launch record in the machine HOME store that development and
// production servers share. Servers must discover it from that file; nothing
// here answers record HTTP.
import { expect, type APIRequestContext } from "@playwright/test";
import { launchRequest } from "../agentLaunchBoundary.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { keepLaunchStore, launchStoreFile } from "./launchStore.ts";

export function writeSharedLaunchRecord(home: string) {
  const record: LaunchRecord = {
    request: launchRequest as LaunchRecord["request"],
    session: {
      host: "claude",
      sessionId: "shared-before-switch",
      shortId: "shared",
      name: "Shared launch",
    },
    launchedAt: new Date().toISOString(),
  };
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
