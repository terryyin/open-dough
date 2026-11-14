// Native follow-up passes use a closed server's HOME, owned by its origin.
import { spawn } from "node:child_process";
import type { ProjectHistory } from "../../server/landedCiHistoryStore.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { endAtExit, endGroup, signal as sendSignal } from "./processGroup.ts";

const owners = new WeakMap<
  StartOrigin,
  ReturnType<typeof collectionCommands>
>();

export function ownFollowUpCollectionCommands(origin: StartOrigin) {
  const owner = collectionCommands();
  owners.set(origin, owner);
  return owner;
}

export function collectFollowUps(
  origin: StartOrigin,
  ...args: Parameters<ReturnType<typeof collectionCommands>["collect"]>
) {
  const owner = owners.get(origin);
  if (owner === undefined)
    throw new Error("Follow-up collection needs its origin fixture owner");
  return owner.collect(...args);
}

function collectionCommands() {
  let retired = false;
  const active = new Set<{ stop(): Promise<void>; done: Promise<void> }>();
  return {
    async close() {
      retired = true;
      await Promise.all(
        [...active].map(async (command) => {
          await command.stop();
          await command.done.catch(() => undefined);
        }),
      );
    },
    async collect(
      server: DashboardServer,
      history?: ProjectHistory,
      environment = "production",
      signal?: AbortSignal,
    ) {
      if (retired) throw new Error("Follow-up collection origin retired");
      const module = (name: string) =>
        new URL(`../../server/${name}.ts`, import.meta.url).href;
      const child = spawn(
        process.execPath,
        [
          "--experimental-transform-types",
          "--input-type=module",
          "-e",
          `
        import {initializeProjectConfiguration,publishedProjects,projectConfigurationFile} from ${JSON.stringify(module("projectConfiguration"))};
        import {keptLandedCiHistory} from ${JSON.stringify(module("landedCiHistoryStore"))};
        import {collectCiFollowUps} from ${JSON.stringify(module("ciFollowUpCollection"))};
        import {readFileSync} from 'node:fs';
        initializeProjectConfiguration(${JSON.stringify(environment)});
        const projects = ${JSON.stringify(environment)} === 'production' ? publishedProjects() : JSON.parse(readFileSync(projectConfigurationFile('production'),'utf8'));
        const source = projects.find(s => s.id === 'open-dough');
        const controller = new AbortController();
        ${signal === undefined ? "" : 'process.stdin.once("data", () => controller.abort());'}
        await collectCiFollowUps(source, ${history === undefined ? "await keptLandedCiHistory(source.id)" : JSON.stringify(history)}, controller.signal);
        process.stdin.destroy();
      `,
        ],
        {
          detached: true,
          env: { ...process.env, HOME: server.home, NODE_NO_WARNINGS: "1" },
        },
      );
      // Register synchronously, before any awaited work can outlive the case.
      const withdraw = endAtExit(() => {
        if (child.pid !== undefined) sendSignal(-child.pid, "SIGKILL");
      });
      let stopping: Promise<void> | undefined;
      const stop = () => {
        stopping ??= endGroup(child);
        return stopping;
      };
      const collected = new Promise<void>((resolve, reject) => {
        let stderr = "";
        for (const stream of [child.stdout, child.stderr]) {
          let bytes = 0;
          stream.on("data", (chunk: Buffer) => {
            bytes += chunk.length;
            if (bytes > 1024 * 1024) {
              reject(
                new Error("Follow-up collector exceeded its output limit"),
              );
              void stop();
            } else if (stream === child.stderr)
              stderr += chunk.toString("utf8");
          });
        }
        child.once("error", reject);
        child.once("close", (code, signal) => {
          if (code === 0) resolve();
          else
            reject(
              new Error(
                `Follow-up collector exited (${signal ?? String(code)}): ${stderr}`,
              ),
            );
        });
      });
      const interrupt = () => child.stdin.end("interrupt");
      signal?.addEventListener("abort", interrupt, { once: true });
      if (signal?.aborted) interrupt();
      const done = collected
        .then(() => undefined)
        .finally(async () => {
          signal?.removeEventListener("abort", interrupt);
          await stop();
          withdraw();
        });
      const command = { stop, done };
      active.add(command);
      void done.then(
        () => active.delete(command),
        () => active.delete(command),
      );
      await done;
    },
  };
}
