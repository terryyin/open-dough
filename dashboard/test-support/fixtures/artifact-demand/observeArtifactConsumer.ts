import { appendFileSync } from "node:fs";

// An inner worker reports what acquisition returned to the outer proof.
export async function observeArtifactConsumer<
  Server extends { close(): Promise<void> },
>(
  start: () => Promise<Server>,
  observe: (server: Server) => Promise<string | undefined>,
): Promise<void> {
  const record = process.env["OPEN_DOUGH_ARTIFACT_PROOF_CONSUMERS"];
  if (record === undefined) throw new Error("Missing consumer record path");
  const report = (
    result: { directory: string | undefined } | { error: string },
  ) => {
    appendFileSync(
      record,
      `${JSON.stringify({ pid: process.pid, ...result })}\n`,
    );
  };
  const server = await start().catch((error: unknown) => {
    report({ error: String(error) });
    throw error;
  });
  try {
    report({ directory: await observe(server) });
  } finally {
    await server.close();
  }
}
