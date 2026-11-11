// The public watcher refuses invalid input and an occupied production port.
import { once } from "node:events";
import { readdir } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { expect, test } from "../../tests/support/pageTest.ts";
import { dashboardCommand } from "../../tests/support/dashboardCommand.ts";
import { productionDeployments } from "../../tests/support/productionWatcher.ts";
import {
  productionFailureFixture,
  unpublishedWatcherFixture,
} from "../../tests/support/productionWatcherFixture.ts";

test("npm watcher refuses invalid options and an origin without published main", async () => {
  const fixture = await unpublishedWatcherFixture();
  try {
    for (const [args, reason] of [
      [["--port", "43127"], "distinct from development's 43127"],
      [["--port", "65536"], "Production port must be 0–65535"],
      [["--check-interval", "0"], "Check interval must be a positive number"],
    ] as const) {
      const invalid = dashboardCommand(
        fixture.development,
        fixture.env,
        "watch:dashboard",
        [...args],
      );
      expect((await invalid.exited).code).toBe(1);
      expect(invalid.output()).toContain(reason);
      expect(invalid.output()).not.toContain("Preparing production dashboard");
    }
    const watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
    );
    expect((await watcher.exited).code).toBe(1);
    expect(watcher.output()).toContain("Production dashboard could not run");
    expect(watcher.output()).toContain("has no published main branch");
    expect(watcher.output()).not.toContain("at http://");
  } finally {
    await fixture.cleanup();
  }
});

test("an occupied production port is refused rather than moved", async ({
  request,
}) => {
  const fixture = await productionFailureFixture();
  const listeners: Server[] = [];
  async function occupyLoopback() {
    const server = createServer((req, response) => {
      req.resume();
      response.end("UNOWNED LISTENER");
    });
    const listening = once(server, "listening");
    server.listen(0, "127.0.0.1");
    await listening;
    listeners.push(server);
    const address = server.address();
    if (address === null || typeof address === "string")
      throw new Error("The test listener did not bind a loopback port");
    return address.port;
  }

  try {
    await fixture.publish(fixture.markerChanges("Published"), "Published");
    const firstPort = await occupyLoopback();
    // Keep the first socket reserved if the OS chose the development port.
    const port = firstPort === 43127 ? await occupyLoopback() : firstPort;
    const watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
      ["--port", String(port)],
    );
    try {
      expect((await watcher.exited).code).toBe(1);
      expect(watcher.output()).toContain(`Port ${port} is already in use`);
      expect(watcher.output()).not.toMatch(/Production dashboard \w+ at http:/);
      const response = await request.get(`http://127.0.0.1:${port}`);
      expect(await response.text()).toBe("UNOWNED LISTENER");
      expect(await readdir(productionDeployments(fixture.home))).toEqual([]);
    } finally {
      await watcher.stop();
    }
  } finally {
    try {
      await Promise.all(
        listeners.map(
          (listener) =>
            new Promise<void>((resolve, reject) => {
              listener.close((error) => {
                if (error) reject(error);
                else resolve();
              });
            }),
        ),
      );
    } finally {
      await fixture.cleanup();
    }
  }
});
