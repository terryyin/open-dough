// The process serving one staged production build, including its replacement
// handshake: close start admission and await settlements before stopping it.
import { stripVTControlCharacters } from "node:util";
import { ownedProcess, stopProcess } from "./productionProcess.mjs";
import { startOnChosenPort } from "./chosenPort.mjs";

/** @param {{directory: string, port?: number, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} options */
export async function startDeploymentPreview(options) {
  const port = options.port ?? 4173;
  return startOnChosenPort(port, () => startPreviewOn(port, options));
}
/** @param {number} port @param {{directory: string, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} options */
async function startPreviewOn(port, options) {
  const process = ownedProcess(
    "npm",
    [
      "run",
      "preview:dashboard",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: options.directory,
      ...(options.env ? { env: options.env } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    },
  );
  let ended = false;
  const end = () => {
    ended = true;
  };
  void process.exited.then(end, end);
  const deadline = Date.now() + 20_000;
  try {
    while (Date.now() < deadline && !ended) {
      const address = /Local:\s+(http:\/\/127\.0\.0\.1:\d+\/)/.exec(
        stripVTControlCharacters(process.output()),
      )?.[1];
      if (address !== undefined) {
        const url = new URL(address).origin;
        if (port !== 0 && new URL(url).port !== String(port)) {
          throw new Error(`Preview reported an unexpected address ${url}`);
        }
        const response = await fetch(url, {
          signal: AbortSignal.timeout(2_000),
        });
        if (response.ok && !ended) {
          return {
            url,
            pid: process.child.pid,
            exited: process.exited,
            // Old deployments without the protocol fail closed: never infer
            // quiescence from an unrecognized response or a failed request.
            drain: async (signal) => {
              const response = await fetch(`${url}/__agent-launch/drain`, {
                method: "POST",
                headers: { Origin: url },
                signal,
              });
              if (!response.ok || (await response.json()).drained !== true)
                throw new Error(
                  "The running dashboard could not confirm its starts drained; keeping it running.",
                );
            },
            stop: () => stopProcess(process),
          };
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(
      `Production dashboard preview did not start:\n${process.output()}`,
    );
  } catch (error) {
    await stopProcess(process);
    throw error;
  }
}
