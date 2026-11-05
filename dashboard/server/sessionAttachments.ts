// Pasted images are machine-local files keyed by the recorded host and session.
import { createHash } from "node:crypto";
import {
  closeSync,
  mkdirSync,
  openSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { sessionAttachmentStorageFailure } from "../src/agentTerminal.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import {
  checkedImageAttachmentType,
  readImageAttachment,
  sanitizeImageAttachmentName,
} from "./imageAttachments.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { admittedAttach } from "./terminalAdmission.ts";

function sessionDirectory({ host, sessionId }: SessionReference): string {
  // Keep normal native IDs readable. Other IDs are opaque, including on a
  // case-insensitive filesystem, and cannot supply path components.
  const key = /^[a-z0-9_-][a-z0-9._-]{0,199}$/.test(sessionId)
    ? sessionId
    : `~${createHash("sha256").update(sessionId).digest("hex")}`;
  return machineDashboardPath("session-attachments", host, key);
}

function storeSessionAttachment(
  session: SessionReference,
  { bytes, type, name }: Awaited<ReturnType<typeof readImageAttachment>>,
): string {
  const directory = sessionDirectory(session);
  const fileName = sanitizeImageAttachmentName(
    name,
    checkedImageAttachmentType(type, bytes.length),
  );
  mkdirSync(directory, { recursive: true });
  const highest = readdirSync(directory).reduce((last, entry) => {
    const number = /^\.?([1-9][0-9]*)(?:-|\.upload$)/.exec(entry)?.[1];
    return number === undefined ? last : Math.max(last, Number(number));
  }, 0);

  // Reserve a number independent of its file name. Multiple dashboard
  // processes can share this directory; a complete image appears at once.
  for (let number = highest + 1; ; number += 1) {
    const prefix = `${String(number)}-`;
    const temporary = path.join(directory, `.${String(number)}.upload`);
    let descriptor: number;
    try {
      descriptor = openSync(temporary, "wx", 0o600);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") continue;
      throw error;
    }
    try {
      try {
        if (readdirSync(directory).some((entry) => entry.startsWith(prefix))) {
          continue;
        }
        writeFileSync(descriptor, bytes);
      } finally {
        closeSync(descriptor);
      }
      const destination = path.join(directory, `${prefix}${fileName}`);
      renameSync(temporary, destination);
      return destination;
    } finally {
      rmSync(temporary, { force: true });
    }
  }
}

export async function submitSessionAttachment(
  req: IncomingMessage,
  url: URL,
  res: ServerResponse,
  launches: AgentLaunches,
): Promise<{ readonly path: string }> {
  try {
    return await withResponseSignal(
      res,
      async (signal) => {
        if (req.method !== "POST") {
          verifyLocalOrigin(req);
          throw new RefusedRequest(405, "Only POST is accepted.");
        }
        // Apply the same loopback, record and native availability admission
        // as the WebSocket before reading or storing a body for this session.
        const { session } = await admittedAttach(req, url, launches);
        const image = await readImageAttachment(req, signal);
        signal.throwIfAborted();
        return { path: storeSessionAttachment(session, image) };
      },
      60_000,
    );
  } catch (error) {
    if (!req.complete && !res.destroyed) res.setHeader("Connection", "close");
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(503, sessionAttachmentStorageFailure);
  }
}
