// The installed `gh` itself, asked through the request source and its owner,
// against a provider on this machine: `gh` reaches `github.localhost` over
// plain HTTP, here through a loopback proxy that is the provider, with a
// placeholder token and configuration of the test's own. What the real
// `gh api --include` prints is read as GitHub's status, headers, body and a
// rate limit's directed wait. Skipped where no `gh` reaches the provider.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { enterEnvironment } from "./fixture-teardown-test-fixtures.mjs";
import { enterPrivateRequestOwner } from "./github-request-owner-test-fixtures.mjs";
import { GitHubRequests } from "./github-requests.mjs";

async function localProvider(t) {
  const asked = [];
  const server = createServer((request, response) => {
    asked.push(`${request.method} ${request.url}`);
    if (request.url.endsWith("/limited")) {
      response.writeHead(429, {
        "content-type": "application/json",
        "retry-after": "40",
      });
      response.end(JSON.stringify({ message: "slow down" }));
      return;
    }
    response.writeHead(200, {
      "content-type": "application/json",
      etag: '"local"',
    });
    response.end(JSON.stringify({ id: 7001, name: "CI" }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  return { asked, proxy: `http://127.0.0.1:${server.address().port}` };
}

test("the real gh's answer and rate limit are read as GitHub's through the request owner", async (t) => {
  const provider = await localProvider(t);
  const home = mkdtempSync(join(tmpdir(), "real-gh-"));
  const environment = {
    HOME: home,
    GH_CONFIG_DIR: home,
    GH_HOST: "github.localhost",
    GH_TOKEN: "placeholder-not-a-credential",
    HTTP_PROXY: provider.proxy,
    http_proxy: provider.proxy,
  };
  enterEnvironment(t, environment);
  t.after(() => rmSync(home, { recursive: true, force: true }));
  await new Promise((resolve) =>
    execFile("gh", ["api", "repos/owner/repo"], { timeout: 20_000 }, resolve),
  );
  if (provider.asked.length === 0) {
    t.skip("no installed gh reaches a provider on this machine");
    return;
  }

  enterPrivateRequestOwner(t);
  const failed = [];
  const github = new GitHubRequests({
    boundMs: 20_000,
    backoffBaseMs: 60_000,
    failed: ({ cause }) => failed.push(cause),
  });
  const never = new AbortController().signal;
  const route = "repos/owner/repo/actions/workflows/ci.yml";
  const answer = await github.request(["api", route, "--jq", ".name"], never);
  assert.equal(answer.status, 200);
  assert.equal(answer.headers.get("etag"), '"local"');
  assert.equal(answer.body, "CI\n");
  assert.equal(answer.failure, undefined);

  const limited = await github.request(["api", "repos/owner/limited"], never);
  assert.equal(limited.status, 429);
  assert.deepEqual(limited.failure, {
    kind: "rate-limited",
    status: 429,
    waitSeconds: 40,
  });
  const held = await github.request(["api", route], never);
  assert.equal(held.failure.kind, "held-back");
  assert.deepEqual(failed, ["rate-limited"]);
  assert.deepEqual(provider.asked.slice(1), [
    `GET http://api.github.localhost/${route}`,
    "GET http://api.github.localhost/repos/owner/limited",
  ]);
});
