// Open Dough's own notification sender app: its identity, its one stable
// location and how it is built. macOS takes a notification's icon and its
// Notifications permission entry from the sending app bundle, and
// terminal-notifier 3.1 removed its icon/sender overrides, so the app is a
// copy of the separately installed helper's app with the accepted Open Dough
// icon, bundle identifier and name, signed ad hoc. The executable keeps its
// name and the `terminalNotifier.ts` protocol. It is built only by
// `npm run setup-notifier:dashboard` (notifierSetup.ts).
import { execFile } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { machineDashboardPath } from "./machineHome.ts";

export const notifierBundleIdentifier = "dev.opendough.dashboard-notifier";
export const notifierDisplayName = "Open Dough";
export const notifierSetupCommand = "npm run setup-notifier:dashboard";
const iconName = "OpenDough";

// Stable across deployments and refreshes: macOS keys the permission to this
// bundle, so it never lives in a checkout that a deployment retires.
export function brandedNotifierApp(): string {
  return machineDashboardPath("notifier", `${notifierDisplayName}.app`);
}

export function notifierAppExecutable(app: string): string {
  return path.join(app, "Contents", "MacOS", "terminal-notifier");
}

export function brandedNotifierExecutable(): string {
  return notifierAppExecutable(brandedNotifierApp());
}

// macOS asks for and keeps a notification permission only for an app that
// Launch Services knows; a copied bundle that is only executed is refused.
// Like the other native tools it is found on PATH, after which its system
// location is searched.
const launchServicesSupport =
  "/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support";

const canonicalIcon = fileURLToPath(
  new URL("../../assets/brand/opendough-icon.png", import.meta.url),
);

// Ends the setup with its fixed explanation.
export class SetupStop extends Error {}

export function run(
  file: string,
  args: readonly string[],
): Promise<{
  readonly ok: boolean;
  readonly stdout: string;
  readonly missing: boolean;
}> {
  return new Promise((resolve) => {
    execFile(file, args, (error, stdout) => {
      resolve({
        ok: error === null,
        stdout,
        missing: (error as NodeJS.ErrnoException | null)?.code === "ENOENT",
      });
    }).stdin?.end();
  });
}

async function tool(file: string, args: readonly string[]): Promise<void> {
  const result = await run(file, args);
  if (result.missing)
    throw new SetupStop(
      `${path.basename(file)} was not found. The Open Dough notification sender is prepared on macOS with its built-in sips, iconutil, plutil, codesign and lsregister.`,
    );
  if (!result.ok)
    throw new SetupStop(
      `${path.basename(file)} failed while preparing the Open Dough notification sender. Run ${notifierSetupCommand} again.`,
    );
}

export function onPath(
  name: string,
  after: readonly string[] = [],
): string | undefined {
  for (const directory of [
    ...(process.env.PATH ?? "").split(path.delimiter),
    ...after,
  ]) {
    if (directory === "") continue;
    const candidate = path.join(directory, name);
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

const iconSizes = [16, 32, 128, 256, 512] as const;

async function brand(app: string, work: string): Promise<void> {
  const iconset = path.join(work, `${iconName}.iconset`);
  mkdirSync(iconset);
  for (const size of iconSizes)
    for (const [scale, suffix] of [
      [1, ""],
      [2, "@2x"],
    ] as const)
      await tool("sips", [
        "-s",
        "format",
        "png",
        "-z",
        String(size * scale),
        String(size * scale),
        canonicalIcon,
        "--out",
        path.join(iconset, `icon_${size}x${size}${suffix}.png`),
      ]);
  const resources = path.join(app, "Contents", "Resources");
  const plist = path.join(app, "Contents", "Info.plist");
  const previousIcon = await run("plutil", [
    "-extract",
    "CFBundleIconFile",
    "raw",
    plist,
  ]);
  if (previousIcon.ok) {
    const name = previousIcon.stdout.trim();
    rmSync(
      path.join(resources, name.endsWith(".icns") ? name : `${name}.icns`),
      { force: true },
    );
  }
  await tool("iconutil", [
    "-c",
    "icns",
    iconset,
    "-o",
    path.join(resources, `${iconName}.icns`),
  ]);
  for (const [key, value] of [
    ["CFBundleIconFile", iconName],
    ["CFBundleIdentifier", notifierBundleIdentifier],
    ["CFBundleName", notifierDisplayName],
    ["CFBundleDisplayName", notifierDisplayName],
  ] as const)
    await tool("plutil", ["-replace", key, "-string", value, plist]);
  rmSync(path.join(app, "Contents", "_CodeSignature"), {
    recursive: true,
    force: true,
  });
  await tool("codesign", ["--force", "--sign", "-", app]);
  await tool("codesign", ["--verify", app]);
}

// Builds from the installed helper's app, which is only read, beside the
// stable location and swaps the finished app in, so a failed refresh leaves
// an existing sender as it was; then registers it with Launch Services.
export async function prepareBrandedNotifierApp(source: string): Promise<void> {
  const target = brandedNotifierApp();
  const parent = path.dirname(target);
  mkdirSync(parent, { recursive: true });
  const work = mkdtempSync(path.join(parent, ".setup-"));
  try {
    const staged = path.join(work, path.basename(target));
    cpSync(source, staged, { recursive: true, verbatimSymlinks: true });
    await brand(staged, work);
    const replaced = path.join(work, "replaced.app");
    if (existsSync(target)) renameSync(target, replaced);
    renameSync(staged, target);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  await tool(onPath("lsregister", [launchServicesSupport]) ?? "lsregister", [
    "-f",
    target,
  ]);
}
