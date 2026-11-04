// Vite's dev server for this dashboard (`../../vite.config.mts`), started
// through Vite's API so a test can restart it in place, in the same process,
// as Vite does when a file its config imports changes: on SIGUSR2 it calls
// `server.restart()`, which loads the config and its server modules again,
// and then prints `Restarted`. Run from the repository root with the listen
// args Vite takes (`--port 0`, or `--port <n> --strictPort`); it reports its
// address the way Vite does. A chosen port is fixed before Vite starts, so a
// restart binds the same one.

import { createServer as createNetServer } from "node:net";
import { createServer } from "vite";

function askedPort(argv) {
  const at = argv.indexOf("--port");
  return at === -1 ? 0 : Number(argv[at + 1]);
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createNetServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => {
        resolve(port);
      });
    });
  });
}

const asked = askedPort(process.argv);
const port = asked === 0 ? await freePort() : asked;
const server = await createServer({
  configFile: "dashboard/vite.config.mts",
  clearScreen: false,
  server: { port, strictPort: true },
});
await server.listen();
server.printUrls();

let restarting = Promise.resolve();
process.on("SIGUSR2", () => {
  restarting = restarting.then(async () => {
    await server.restart();
    console.log("Restarted");
  });
});
