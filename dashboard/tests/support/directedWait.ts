// Meeting a rate limit GitHub directs a wait for, which holds back every
// later read of the server that met it (../../server/readAdmission.ts).
// A case directs a short wait to see reading resume, and never waits out a
// long one.

import {
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";

// Waiting as a boundary answer told: until the whole seconds it reported
// (`retryAfterSeconds`) have passed since it arrived, by the same machine's
// clock the server keeps its wait by.
export async function untilReported(
  answeredAtMs: number,
  retryAfterSeconds: number,
): Promise<void> {
  const left = answeredAtMs + retryAfterSeconds * 1000 - Date.now();
  if (left > 0) {
    await new Promise((resolve) => setTimeout(resolve, left));
  }
}

// Runs `use` on a server of its own, closed after: a case that meets a
// directed wait keeps it from every case sharing that server.
export async function onServerOfItsOwn<T>(
  use: (server: DashboardServer) => Promise<T>,
  options: Parameters<typeof startDashboardServer>[0] = { mode: "dev" },
): Promise<T> {
  const server = await startDashboardServer(options);
  try {
    return await use(server);
  } finally {
    await server.close();
  }
}
