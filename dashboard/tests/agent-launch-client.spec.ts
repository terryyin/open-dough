// The public request client keeps the selected host's recovery advice when
// no server answer can be trusted. This observes client behavior, not a native
// launch; the fetch substitute supplies only the failed HTTP precondition.
import { expect, test } from "./support/pageTest.ts";
import { requestAgentAcceptance } from "../src/agentLaunchClient.ts";

for (const [host, hint] of [
  ["claude", "Check `claude agents` for it."],
  [
    "codex",
    "Check the dashboard history and native Codex conversations for it.",
  ],
] as const) {
  for (const failure of ["fetch rejection", "malformed answer"] as const) {
    test(`${host} keeps its uncertainty hint after ${failure}`, async () => {
      const savedFetch = globalThis.fetch;
      try {
        globalThis.fetch = () => {
          if (failure === "fetch rejection")
            return Promise.reject(new Error("offline"));
          return Promise.resolve(Response.json({ kind: "unexpected" }));
        };
        const answer = await requestAgentAcceptance({
          source: "open-dough",
          workflow: "ad-hoc",
          host,
        });
        expect(answer).toEqual({
          kind: "uncertain",
          unacknowledged: true,
          explanation: `The local dashboard server ${failure === "fetch rejection" ? "could not be reached" : "answered in a shape this dashboard does not understand"}, so the launch may or may not have been accepted and its session may or may not have started. ${hint}`,
        });
      } finally {
        globalThis.fetch = savedFetch;
      }
    });
  }
}
