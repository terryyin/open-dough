import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";

// Real dev and preview servers sharing one machine HOME, for System settings
// journeys. Only outbound provider egress is replaced; configuration and files
// remain real. `temporaryPermissions` records the mode of each temporary OpenAI
// credential file as it is written.
export function systemSettingsMachine() {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-system-settings-"));
  const egressFile = path.join(machine, "provider-egress");
  const permissionFile = path.join(machine, "temporary-permissions");
  writeFileSync(permissionFile, "");
  const preload = path.join(machine, "deny-provider.cjs");
  writeFileSync(egressFile, "");
  writeFileSync(
    preload,
    `const fs = require('node:fs');
const write = fs.writeFileSync;
fs.writeFileSync = (...args) => {
  const answer = write(...args);
  if (typeof args[0] === 'string' && args[0].includes('/credentials/openai.json.') && args[0].endsWith('.tmp')) {
    fs.appendFileSync(${JSON.stringify(permissionFile)}, String(fs.statSync(args[0]).mode & 0o777) + '\\n');
  }
  return answer;
};
require('node:module').syncBuiltinESMExports();
const fetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
    fs.appendFileSync(${JSON.stringify(egressFile)}, url.host + '\\n');
    throw new Error('External requests are blocked in this fixture.');
  }
  return fetch(input, options);
};`,
  );
  const home = path.join(machine, "home");
  const directory = path.join(home, ".open-dough/dashboard/credentials");
  const servers = new Set<DashboardServer>();
  return {
    machine,
    home,
    credentialDirectory: directory,
    credentialFile: path.join(directory, "openai.json"),
    temporaryPermissions: () =>
      readFileSync(permissionFile, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(Number),
    egress: () => readFileSync(egressFile, "utf8"),
    async start(mode: "dev" | "preview", port?: number) {
      const server = await startDashboardServer({
        mode,
        machine,
        port,
        configureDevelopmentProjects: false,
        prebuilt: builtDashboardDir,
        extraEnv: {
          NODE_OPTIONS: `--require=${preload}`,
          OPENAI_API_KEY: "synthetic-environment-key-must-not-import",
        },
      });
      servers.add(server);
      return server;
    },
    async stop(server: DashboardServer) {
      await server.close();
      servers.delete(server);
    },
    async close() {
      await Promise.all([...servers].map((server) => server.close()));
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
