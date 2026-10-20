// The explicit one-time setup of Open Dough's own notification sender
// (notifierApp.ts): `npm run setup-notifier:dashboard [-- --test]`. It finds
// and verifies the separately installed helper, builds the branded app from
// it and reports where it lives and its permission. Without `--test` nothing
// is posted and no permission is requested; `--test` posts one labelled test
// notification, which is what lets macOS ask for this app's own permission.
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import {
  brandedNotifierApp,
  brandedNotifierExecutable,
  notifierAppExecutable,
  notifierBundleIdentifier,
  notifierDisplayName,
  notifierSetupCommand as command,
  onPath,
  prepareBrandedNotifierApp,
  run,
  SetupStop,
} from "./notifierApp.ts";
import { notificationContent, supportedVersion } from "./terminalNotifier.ts";

const turnOn = `Turn on Allow notifications in System Settings → Notifications → ${notifierDisplayName}, then run ${command} -- --test.`;

// The installed helper's app: the executable itself inside its bundle, or
// Homebrew's launcher in a `bin/` beside `terminal-notifier.app`.
function installedHelperApp(): string {
  const found = onPath("terminal-notifier");
  if (found === undefined)
    throw new SetupStop(
      `terminal-notifier was not found. Install it separately with brew install terminal-notifier, then run ${command} again.`,
    );
  const real = realpathSync(found);
  const inBundle = /^(.*\.app)\/Contents\/MacOS\/[^/]+$/.exec(real);
  const app =
    inBundle?.[1] ??
    path.join(path.dirname(path.dirname(real)), "terminal-notifier.app");
  if (!existsSync(path.join(app, "Contents", "Info.plist")))
    throw new SetupStop(
      `The terminal-notifier found at ${found} is not inside its app bundle. Install it with brew install terminal-notifier, then run ${command} again.`,
    );
  return app;
}

async function verifiedHelper(app: string): Promise<string> {
  const version = await run(notifierAppExecutable(app), ["-version"]);
  if (!version.ok || !supportedVersion(version.stdout))
    throw new SetupStop(
      `The Open Dough notification sender needs terminal-notifier 3.1 or newer. Update it separately, then run ${command} again.`,
    );
  return version.stdout.trim().replace(/\.$/, "");
}

export async function setUpNotifier(
  options: { readonly test: boolean },
  print: (line: string) => void,
): Promise<boolean> {
  try {
    const source = installedHelperApp();
    const version = await verifiedHelper(source);
    await prepareBrandedNotifierApp(source);
    print(
      `Prepared the Open Dough notification sender from ${version} at ${source}.`,
    );
    print(`Sender app: ${brandedNotifierApp()}`);
    print(`Bundle identifier: ${notifierBundleIdentifier}`);
    print(
      `Permission entry: System Settings → Notifications → ${notifierDisplayName}`,
    );
    if (options.test) {
      const sent = await run(
        brandedNotifierExecutable(),
        notificationContent(
          notifierDisplayName,
          "Test notification from Open Dough notification setup.",
        ),
      );
      if (!sent.ok) {
        print(
          `macOS did not accept the Open Dough test notification. ${turnOn}`,
        );
        return false;
      }
      print(
        "Sent a test notification from Open Dough. If macOS asked, allow it; the pop-up shows the Open Dough icon and title.",
      );
      return true;
    }
    // The branded app's own permission; the installed helper's grant is not it.
    const diagnosed = await run(brandedNotifierExecutable(), ["-diagnose"]);
    print(
      diagnosed.ok
        ? "Open Dough notifications are allowed."
        : /^\s*authorization\s+not requested yet\s*$/m.test(diagnosed.stdout)
          ? `Open Dough has not asked for notification permission yet. Run ${command} -- --test and choose Allow when macOS asks.`
          : `Open Dough notifications are not allowed. ${turnOn}`,
    );
    return true;
  } catch (error) {
    if (!(error instanceof SetupStop)) throw error;
    print(error.message);
    return false;
  }
}

if (import.meta.main) {
  const unknown = process.argv.slice(2).filter((a) => a !== "--test");
  if (unknown.length > 0) {
    console.error(`Unknown option ${unknown[0]}. Use ${command} [-- --test].`);
    process.exitCode = 2;
  } else if (
    !(await setUpNotifier({ test: process.argv.includes("--test") }, (line) => {
      console.log(line);
    }))
  )
    process.exitCode = 1;
}
