// Meeting a rate limit GitHub directs a wait for, which holds back every
// later read of the server that met it (github-request-admission.mjs).
// A case directs a short wait to see reading resume, and never waits out a
// long one.

import {
  developmentBoundary,
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
  const deadline = answeredAtMs + retryAfterSeconds * 1000;
  for (
    let left = deadline - Date.now();
    left > 0;
    left = deadline - Date.now()
  ) {
    await new Promise((resolve) => setTimeout(resolve, left));
  }
}

// Runs `use` on a server of its own, closed after: a case that meets a
// directed wait keeps it from every case sharing that server. A boundary
// server in the development environment unless the case asks otherwise.
export async function onServerOfItsOwn<T>(
  use: (server: DashboardServer) => Promise<T>,
  options: Parameters<typeof startDashboardServer>[0] = {
    ...developmentBoundary,
  },
): Promise<T> {
  const server = await startDashboardServer(options);
  try {
    return await use(server);
  } finally {
    await server.close();
  }
}
