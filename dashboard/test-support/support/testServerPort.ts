// The port a test server listens on when the test names none. A test that
// restarts a server on the port the closed one served gives that port back to
// the machine in between, and the machine hands its ephemeral range to any
// listener asking for port 0 and any outgoing connection, in this worker or
// another process. So the port comes from a band below that range, which only
// a deliberate bind can take, and a lease file on this machine keeps every
// other test process using this helper off it until this process exits.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

const band = { first: 20_000, last: 32_767 } as const;
const leases = path.join(tmpdir(), "open-dough-test-server-ports");
const held: string[] = [];
let next = band.first + (process.pid % (band.last - band.first + 1));

process.on("exit", () => {
  for (const lease of held) {
    try {
      unlinkSync(lease);
    } catch {
      // Already gone; nothing to release.
    }
  }
});

// The first port the machine hands out for port 0 and outgoing connections.
function ephemeralFirst(): number {
  if (process.platform === "linux") {
    const range = readFileSync("/proc/sys/net/ipv4/ip_local_port_range");
    return Number(range.toString("utf8").trim().split(/\s+/)[0]);
  }
  return Number(
    execFileSync("sysctl", ["-n", "net.inet.ip.portrange.first"], {
      encoding: "utf8",
    }).trim(),
  );
}

let bandChecked = false;
function requireBandBelowEphemeralPorts() {
  if (bandChecked) return;
  const first = ephemeralFirst();
  if (!(first > band.last)) {
    throw new Error(
      `Test server ports ${String(band.first)}-${String(band.last)} overlap this machine's ephemeral ports from ${String(first)}`,
    );
  }
  bandChecked = true;
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

// Takes the lease on `port` unless a living process holds it.
function lease(port: number): boolean {
  const file = path.join(leases, String(port));
  for (;;) {
    try {
      writeFileSync(file, String(process.pid), { flag: "wx" });
      held.push(file);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    let holder: number;
    try {
      holder = Number(readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    // An empty lease is one its holder is still writing.
    if (holder === 0 || alive(holder)) return false;
    try {
      unlinkSync(file);
    } catch {
      // Another process reclaimed it first.
    }
  }
}

// Whether nothing else on this machine listens on `port` now.
function bindable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once("error", () => {
      resolve(false);
    });
    probe.listen(port, "127.0.0.1", () => {
      probe.close(() => {
        resolve(true);
      });
    });
  });
}

// A free port this process keeps for its lifetime, for a server and any
// restart of it.
export async function testServerPort(): Promise<number> {
  requireBandBelowEphemeralPorts();
  mkdirSync(leases, { recursive: true });
  for (let tried = 0; tried <= band.last - band.first; tried++) {
    const port = next;
    next = port === band.last ? band.first : port + 1;
    if (lease(port) && (await bindable(port))) return port;
  }
  throw new Error(
    `No free test server port in ${String(band.first)}-${String(band.last)}`,
  );
}
