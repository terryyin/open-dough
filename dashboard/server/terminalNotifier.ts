// The separately installed helper's native protocol. SessionAlerts owns when
// to probe/send and supplies the abort signal for every diagnostic/delivery.
import { execFile } from "node:child_process";
import { shellCommand } from "../src/sessionCapabilities.ts";
import { notificationActivationSource } from "./notificationActivation.ts";

const notFound =
  "terminal-notifier was not found. Install it separately with brew install terminal-notifier, then restart the dashboard.";
const unsupported =
  "Alerts need terminal-notifier 3.1 or newer. Update it separately, then restart the dashboard.";
const refused =
  "terminal-notifier did not accept the notification. Check System Settings → Notifications → terminal-notifier and allow notifications.";

// Raw helper output is only interpreted here; fixed explanations cross into
// alert availability. An owner-aborted child says nothing about availability.
function notifier(
  args: readonly string[],
  signal: AbortSignal,
): Promise<{ readonly output: string; readonly unavailable?: string }> {
  return new Promise((resolve) => {
    execFile("terminal-notifier", args, { signal }, (error, stdout) => {
      if (error === null || signal.aborted) resolve({ output: stdout });
      else
        resolve({
          output: "",
          unavailable:
            (error as NodeJS.ErrnoException).code === "ENOENT"
              ? notFound
              : refused,
        });
    }).stdin?.end();
  });
}

// 3.1 is the tested permission-diagnostic contract; an old binary can exit
// successfully for an unknown flag, so its presence/exit alone proves nothing.
function supportedVersion(output: string): boolean {
  const version = /^terminal-notifier (\d+)\.(\d+)\.(\d+)\.\s*$/.exec(output);
  if (version === null) return false;
  const major = Number(version[1]);
  return major > 3 || (major === 3 && Number(version[2]) >= 1);
}

// These options neither post a notification nor request permission.
export async function probeTerminalNotifier(
  signal: AbortSignal,
): Promise<string | undefined> {
  const version = await notifier(["-version"], signal);
  if (signal.aborted) return undefined;
  if (version.unavailable !== undefined) return version.unavailable;
  if (!supportedVersion(version.output)) return unsupported;
  return (await notifier(["-diagnose"], signal)).unavailable;
}

export async function sendTerminalNotification(
  {
    title,
    message,
    destination,
  }: {
    readonly title: string;
    readonly message: string;
    readonly destination: string;
  },
  signal: AbortSignal,
): Promise<string | undefined> {
  const { unavailable } = await notifier(
    [
      "-title",
      `\\${title}`,
      "-message",
      `\\${message}`,
      "-sound",
      "Glass",
      "-execute",
      shellCommand([
        "/usr/bin/osascript",
        "-l",
        "JavaScript",
        "-e",
        notificationActivationSource,
        destination,
      ]),
    ],
    signal,
  );
  return unavailable;
}
