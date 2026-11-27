// The watcher's start refusals, decided before it prepares any deployment:
// its options and whether a named production port is already taken.
import { createServer } from "node:net";
import { parseArgs } from "node:util";

const developmentPort = 43127;

/**
 * @param {string[]} args the watcher's command-line arguments
 * @returns {{port: number, checkInterval: number}}
 */
export function watcherOptions(args) {
  const { values } = parseArgs({
    args,
    options: {
      port: { type: "string", default: "4173" },
      "check-interval": { type: "string", default: "30000" },
    },
  });
  if (
    !/^(0|[1-9]\d*)$/.test(values.port) ||
    Number(values.port) > 65535 ||
    Number(values.port) === developmentPort
  ) {
    throw new Error(
      `Production port must be 0–65535 and distinct from development's ${developmentPort}.`,
    );
  }
  const checkInterval = Number(values["check-interval"]);
  if (
    !/^[1-9]\d*$/.test(values["check-interval"]) ||
    !Number.isSafeInteger(checkInterval) ||
    checkInterval > 2_147_483_647
  ) {
    throw new Error(
      "Check interval must be a positive number of milliseconds.",
    );
  }
  return { port: Number(values.port), checkInterval };
}

/**
 * A named port is never moved: an occupied one refuses the start.
 * @param {number} port @param {boolean} occupied
 */
export function expectUsablePort(port, occupied) {
  if (port !== 0 && occupied)
    throw new Error(`Port ${port} is already in use.`);
}

/**
 * Whether a loopback listener already holds `port`.
 * @param {number} port @returns {Promise<boolean>}
 */
export function loopbackPortOccupied(port) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error) => {
      if (/** @type {NodeJS.ErrnoException} */ (error).code === "EADDRINUSE")
        resolve(true);
      else reject(error);
    });
    probe.listen(port, "127.0.0.1", () => probe.close(() => resolve(false)));
  });
}
