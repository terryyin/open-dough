// Child processes report the production admission transition through a file
// owned by the test. The subscriber never controls the request or its result.
import { subscribe } from "node:diagnostics_channel";
import { appendFileSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const events = process.env["DOUGH_WATCHER_DRAIN_EVENTS"];
if (events !== undefined) {
  const record = (event) =>
    appendFileSync(events, `${JSON.stringify(event)}\n`);
  subscribe("open-dough:launch-admission-closed", () => {
    record({ kind: "closed" });
  });
  subscribe("http.server.response.finish", ({ request, response }) => {
    if (
      request.method !== "POST" ||
      request.url !== "/__agent-launch/drain" ||
      response.statusCode !== 200
    )
      return;
    const attemptsFile = path.join(
      homedir(),
      ".open-dough/dashboard/launch-attempts.json",
    );
    let attempts = {};
    try {
      attempts = JSON.parse(readFileSync(attemptsFile, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const settled = Object.values(attempts)
      .flat()
      .filter(
        ({ outcome, settledAt }) => outcome?.kind === "launched" && settledAt,
      )
      .map(({ id }) => id);
    record({ kind: "drained", settled });
  });
}
