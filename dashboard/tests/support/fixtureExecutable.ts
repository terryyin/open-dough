// Puts one synthetic executable from ../fixtures (the fake `gh`, the fake
// `claude`, the fake `osascript`) into a test's own PATH directory under its
// command name.

import { chmodSync, copyFileSync, linkSync, mkdirSync } from "node:fs";
import path from "node:path";

// Playwright runs this suite from the repository root (as `npm run
// test:dashboard` and the isolated Vite launches both do); paths are built
// from that rather than from `import.meta.url`, since Playwright's own
// TypeScript transform loads test files as CommonJS, where `import.meta` is
// unavailable.
const fixturesDir = path.join(process.cwd(), "dashboard", "tests", "fixtures");

// Each install hard-links the one committed script instead of copying it:
// macOS assesses every newly created executable on its first run -- about
// 0.1s on a quiet machine, several seconds on a busy one -- and a fresh copy
// per server paid that on the page's first read, inside its wait. A link is
// that already-assessed file under this directory's name (a symbolic link
// would not do: Node would load the script from the repository, where
// extensionless files are ES modules). Only across filesystems, where no link
// can be made, is it copied.
export function installFixtureExecutable(
  fixture: "fake-gh" | "fake-claude" | "fake-osascript",
  binDir: string,
  command: string,
): void {
  const source = path.join(fixturesDir, fixture);
  const target = path.join(binDir, command);
  mkdirSync(binDir, { recursive: true });
  try {
    linkSync(source, target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EXDEV") {
      throw error;
    }
    copyFileSync(source, target);
    chmodSync(target, 0o755);
  }
}
