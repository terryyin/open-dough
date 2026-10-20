// The native protocol of Open Dough's notification sender, the branded copy
// of the separately installed helper (notifierApp.ts), run from its one stable
// machine-local location. SessionAlerts owns when to probe/send and supplies
// the abort signal for every diagnostic/delivery.
import { execFile } from "node:child_process";
import { shellCommand } from "../src/sessionCapabilities.ts";
import { notificationActivationSource } from "./notificationActivation.ts";
import {
  brandedNotifierExecutable,
  notifierDisplayName,
  notifierSetupCommand,
} from "./notifierApp.ts";

const notFound = `The ${notifierDisplayName} notification sender is not set up. Run ${notifierSetupCommand} -- --test, allow ${notifierDisplayName} when macOS asks, then restart the dashboard.`;
const unsupported = `Alerts need terminal-notifier 3.1 or newer. Update it separately, run ${notifierSetupCommand} again, then restart the dashboard.`;
// Denied and not yet requested permission alike; a sent notification refused
// for any other reason has the same recovery.
const refused = `${notifierDisplayName} did not accept the notification. Turn on Allow notifications in System Settings → Notifications → ${notifierDisplayName}, or run ${notifierSetupCommand} -- --test and choose Allow when macOS asks.`;

// Raw helper output is only interpreted here; fixed explanations cross into
// alert availability. An owner-aborted child says nothing about availability.
function notifier(
  args: readonly string[],
  signal: AbortSignal,
): Promise<{ readonly output: string; readonly unavailable?: string }> {
  return new Promise((resolve) => {
    execFile(brandedNotifierExecutable(), args, { signal }, (error, stdout) => {
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
export function supportedVersion(output: string): boolean {
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

// Literal title/message with the helper's one-leading-backslash escape, and
// the alert sound.
export function notificationContent(
  title: string,
  message: string,
): readonly string[] {
  return [
    "-title",
    `\\${title}`,
    "-message",
    `\\${message}`,
    "-sound",
    "Glass",
  ];
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
      ...notificationContent(title, message),
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
