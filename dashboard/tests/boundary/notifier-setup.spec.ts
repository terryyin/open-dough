// The explicit notification sender setup (`npm run setup-notifier:dashboard`)
// against an isolated machine home and a synthetic installed helper app, so
// no test posts a real notification, asks for permission or registers an app
// with this machine's Launch Services. Building the branded app uses macOS's
// own sips, iconutil, plutil and codesign; those tests run only on macOS.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { machine, type Machine } from "../support/notifierSetupMachine.ts";

const macOS = process.platform === "darwin";
const bundleIdentifier = "dev.opendough.dashboard-notifier";

function tree(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory)) {
      const file = path.join(directory, entry);
      if (statSync(file).isDirectory()) walk(file);
      else
        files[path.relative(root, file)] = createHash("sha256")
          .update(readFileSync(file))
          .digest("hex");
    }
  };
  walk(root);
  return files;
}

function plistValue(app: string, key: string): string {
  return execFileSync(
    "plutil",
    ["-extract", key, "raw", path.join(app, "Contents", "Info.plist")],
    { encoding: "utf8" },
  ).trim();
}

let current: Machine | undefined;
test.afterEach(() => {
  if (current !== undefined)
    rmSync(current.root, { recursive: true, force: true });
  current = undefined;
});

test("setup without an installed helper names its installation and prepares nothing", () => {
  current = machine({ helper: false });
  const { status, out } = current.setup();
  expect(status).toBe(1);
  expect(out).toContain(
    "terminal-notifier was not found. Install it separately with brew install terminal-notifier, then run npm run setup-notifier:dashboard again.",
  );
  expect(existsSync(path.join(current.home, ".open-dough"))).toBe(false);
});

test("setup refuses an unsupported helper before copying it", () => {
  current = machine({ helper: true });
  current.mode("older");
  const { status, out } = current.setup();
  expect(status).toBe(1);
  expect(out).toContain(
    "The Open Dough notification sender needs terminal-notifier 3.1 or newer. Update it separately, then run npm run setup-notifier:dashboard again.",
  );
  expect(existsSync(current.app)).toBe(false);
  expect(current.calls().map(({ argv }) => argv)).toEqual([["-version"]]);
});

test.describe("on macOS", () => {
  test.skip(!macOS, "The branded app is built with macOS's own tools");

  test("setup prepares the branded sender from the installed helper and only diagnoses it", () => {
    current = machine({ helper: true });
    const installedBefore = tree(current.installed);
    const { status, out } = current.setup();
    expect(out).toContain(
      `Sender app: ${current.app}\nBundle identifier: ${bundleIdentifier}\nPermission entry: System Settings → Notifications → Open Dough\n` +
        "Open Dough has not asked for notification permission yet. Run npm run setup-notifier:dashboard -- --test and choose Allow when macOS asks.",
    );
    expect(status).toBe(0);
    // The installed helper is only read and run for its version.
    expect(tree(current.installed)).toEqual(installedBefore);
    const branded = path.join(
      current.app,
      "Contents",
      "MacOS",
      "terminal-notifier",
    );
    expect(current.calls()).toEqual([
      {
        executable: path.join(
          current.installed,
          "Contents",
          "MacOS",
          "terminal-notifier",
        ),
        argv: ["-version"],
      },
      // Its own permission, not the installed helper's; nothing is posted.
      { executable: branded, argv: ["-diagnose"] },
    ]);
    expect(plistValue(current.app, "CFBundleIdentifier")).toBe(
      bundleIdentifier,
    );
    expect(plistValue(current.app, "CFBundleName")).toBe("Open Dough");
    expect(plistValue(current.app, "CFBundleDisplayName")).toBe("Open Dough");
    expect(plistValue(current.app, "CFBundleIconFile")).toBe("OpenDough");
    expect(plistValue(current.app, "CFBundleExecutable")).toBe(
      "terminal-notifier",
    );
    expect(
      readdirSync(path.join(current.app, "Contents", "Resources")),
    ).toEqual(["OpenDough.icns"]);
    // The icon is the accepted mark at every size, up to its 1024-pixel form.
    const iconset = path.join(current.root, "check.iconset");
    execFileSync("iconutil", [
      "-c",
      "iconset",
      path.join(current.app, "Contents", "Resources", "OpenDough.icns"),
      "-o",
      iconset,
    ]);
    expect(readdirSync(iconset).sort()).toEqual(
      [16, 32, 128, 256, 512]
        .flatMap((size) => [
          `icon_${size}x${size}.png`,
          `icon_${size}x${size}@2x.png`,
        ])
        .sort(),
    );
    expect(
      execFileSync(
        "sips",
        ["-g", "pixelWidth", path.join(iconset, "icon_512x512@2x.png")],
        {
          encoding: "utf8",
        },
      ),
    ).toContain("pixelWidth: 1024");
    const signature = spawnSync("codesign", ["-dv", current.app], {
      encoding: "utf8",
    });
    expect(signature.stderr).toContain(`Identifier=${bundleIdentifier}`);
    expect(signature.stderr).toContain("Signature=adhoc");
    expect(spawnSync("codesign", ["--verify", current.app]).status).toBe(0);
    expect(current.registrations()).toEqual([`-f ${current.app}`]);
  });

  test("an explicit test posts one labelled notification and a refresh keeps the same sender", () => {
    current = machine({ helper: true });
    current.mode("authorized");
    expect(current.setup().out).toContain(
      "Open Dough notifications are allowed.",
    );
    const { status, out } = current.setup("--test");
    expect(out).toContain(
      "Sent a test notification from Open Dough. If macOS asked, allow it; the pop-up shows the Open Dough icon and title.",
    );
    expect(status).toBe(0);
    const branded = path.join(
      current.app,
      "Contents",
      "MacOS",
      "terminal-notifier",
    );
    expect(
      current.calls().filter(({ argv }) => argv[0] !== "-version"),
    ).toEqual([
      { executable: branded, argv: ["-diagnose"] },
      {
        executable: branded,
        argv: [
          "-title",
          "\\Open Dough",
          "-message",
          "\\Test notification from Open Dough notification setup.",
          "-sound",
          "Glass",
        ],
      },
    ]);
    // Refreshed in place: one app at the same location with the same identity.
    expect(readdirSync(path.dirname(current.app))).toEqual(["Open Dough.app"]);
    expect(plistValue(current.app, "CFBundleIdentifier")).toBe(
      bundleIdentifier,
    );
    expect(spawnSync("codesign", ["--verify", current.app]).status).toBe(0);
    expect(current.registrations()).toEqual([
      `-f ${current.app}`,
      `-f ${current.app}`,
    ]);
  });

  test("a refused permission names the sender's own settings entry", () => {
    current = machine({ helper: true });
    current.mode("denied");
    const turnOn =
      "Turn on Allow notifications in System Settings → Notifications → Open Dough, then run npm run setup-notifier:dashboard -- --test.";
    const diagnosed = current.setup();
    expect(diagnosed.out).toContain(
      `Open Dough notifications are not allowed. ${turnOn}`,
    );
    expect(diagnosed.status).toBe(0);
    const tested = current.setup("--test");
    expect(tested.out).toContain(
      `macOS did not accept the Open Dough test notification. ${turnOn}`,
    );
    expect(tested.status).toBe(1);
  });
});
