// Read every native page without exposing configuration or credentials.
import { z } from "zod";
import type { LaunchHostOptions } from "../../../src/launchHostOptions.ts";
import { CodexRpc, daemonEndpoint } from "./rpc.ts";
const pageSchema = z.object({
  data: z.array(
    z.object({
      model: z.string().min(1),
      displayName: z.string(),
      description: z.string(),
      supportedReasoningEfforts: z.array(
        z.object({ reasoningEffort: z.string(), description: z.string() }),
      ),
    }),
  ),
  nextCursor: z.string().nullable(),
});
export async function codexOptions(
  signal: AbortSignal,
): Promise<LaunchHostOptions> {
  const rpc = new CodexRpc(await daemonEndpoint(signal), signal);
  try {
    await rpc.initialize();
    const models: LaunchHostOptions["models"] = [];
    const seen = new Set<string>();
    let cursor: string | null = null;
    do {
      const page = pageSchema.parse(
        await rpc.request("model/list", {
          limit: 100,
          includeHidden: false,
          ...(cursor === null ? {} : { cursor }),
        }),
      );
      models.push(
        ...page.data.map((item) => ({
          model: item.model,
          name: item.displayName,
          description: item.description,
          efforts: item.supportedReasoningEfforts.map((e) => ({
            effort: e.reasoningEffort,
            description: e.description,
          })),
        })),
      );
      cursor = page.nextCursor;
      if (cursor !== null && seen.has(cursor))
        throw new Error("Codex repeated a catalog page.");
      if (cursor !== null) seen.add(cursor);
    } while (cursor !== null);
    return { models };
  } finally {
    rpc.close();
  }
}
