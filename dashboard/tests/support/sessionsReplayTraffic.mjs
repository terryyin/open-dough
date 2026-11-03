// Trivial requests for the Sessions replay (./sessionsReplayMeasures.ts),
// from a process of their own so the replay's fake Codex app server, which
// answers in the test's process, never delays them: `node
// sessionsReplayTraffic.mjs <url> <everyMs>` prints `ready`, then sends a GET
// to `url` every `everyMs` on its own connection until a line arrives on
// stdin, and prints each answered request's latency in milliseconds as one
// JSON array once every request it sent has been answered.

import http from "node:http";

const [url = "", every = "10"] = process.argv.slice(2);
const target = new URL(url);
const latencies = [];
const pending = new Set();

function send() {
  const started = performance.now();
  const answered = new Promise((resolve) => {
    const request = http.get(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname,
        agent: false,
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          latencies.push(performance.now() - started);
          resolve();
        });
      },
    );
    request.on("error", () => resolve());
  });
  pending.add(answered);
  void answered.then(() => pending.delete(answered));
}

const timer = setInterval(send, Number(every));
process.stdout.write("ready\n");
process.stdin.once("data", async () => {
  clearInterval(timer);
  await Promise.all(pending);
  process.stdout.write(`${JSON.stringify(latencies)}\n`);
  process.exit(0);
});
