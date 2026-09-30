import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));

const fix = process.argv.includes("--fix");
const staged = process.argv.includes("--staged");
if (fix && staged) {
  console.error(
    "lint: --staged only checks and cannot be combined with --fix.",
  );
  process.exit(2);
}
let failed = false;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: "inherit",
    ...options,
  });
  if (result.error?.code === "ENOENT") {
    console.error(
      `${command}: not found on PATH. Run npm ci to install eslint and prettier; shellcheck and shfmt come from your system package manager.`,
    );
  } else if (result.error) {
    console.error(`${command}: ${result.error.message}`);
  }
  return result;
}

function check(command, args) {
  if (run(command, args).status !== 0) {
    failed = true;
  }
}

// Run a tool on the listed files only when there are any; ESLint and Prettier
// fail when given no input.
function checkFiles(command, args, files) {
  if (files.length > 0) {
    check(command, [...args, "--", ...files]);
  }
}

// Include new files and paths containing spaces; honor Git's ignore rules.
// With --staged, list only the added, copied, modified, or renamed staged paths
// and check their working-tree copies.
const listing = run(
  "git",
  staged
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
    : ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  {
    stdio: ["ignore", "pipe", "inherit"],
  },
);
if (listing.status !== 0) {
  process.exit(1);
}
const files = [...new Set(listing.stdout.split("\0"))].filter(
  (file) => file && existsSync(file) && statSync(file).isFile(),
);

// Of the listed paths, those Git matches against an ignore list. Git reads the
// patterns, so no ignoring tool has to be installed.
function ignoredBy(excludeFrom, input, paths) {
  if (paths.length === 0) {
    return new Set();
  }
  const ignored = run(
    "git",
    ["ls-files", "-ci", "-z", `--exclude-from=${excludeFrom}`, "--", ...paths],
    { input, stdio: ["pipe", "pipe", "inherit"] },
  );
  if (ignored.status !== 0) {
    process.exit(1);
  }
  return new Set(ignored.stdout.split("\0"));
}

// ESLint skips listed files under its own ignores (.planning/) silently, and
// Prettier keeps honoring .prettierignore for explicit paths. Staged runs drop
// such files up front so a tool is needed only when a file remains for it.
const scriptFiles = files.filter((file) =>
  /\.(?:js|cjs|mjs|jsx|ts|mts|tsx)$/.test(file),
);
const jsonFiles = files.filter((file) => /\.jsonc?$/.test(file));
let eslintFiles = scriptFiles;
let prettierFiles = [...scriptFiles, ...jsonFiles];
if (staged) {
  const eslintIgnored = ignoredBy(
    "/dev/stdin",
    (await import("../eslint.ignores.mjs")).default.join("\n"),
    scriptFiles,
  );
  const prettierIgnored = ignoredBy(
    ".prettierignore",
    undefined,
    prettierFiles,
  );
  eslintFiles = scriptFiles.filter((file) => !eslintIgnored.has(file));
  prettierFiles = prettierFiles.filter((file) => !prettierIgnored.has(file));
}
const eslintOptions = ["--max-warnings=0", "--no-warn-ignored"];
const shellFiles = files.filter(
  (file) =>
    /\.(?:sh|bash|ksh|bats)$/.test(file) ||
    // Also lint extensionless scripts identified by their interpreter.
    /^#![^\r\n]*\b(?:sh|bash|dash|ksh)\b/.test(readFileSync(file, "utf8")),
);

if (fix) {
  console.log("Applying automatic fixes...");
  // ESLint may return 1 for remaining diagnostics. Check them again below
  // after every tool has had a chance to fix files.
  if (eslintFiles.length > 0) {
    const eslint = run("eslint", [
      "--fix",
      ...eslintOptions,
      "--",
      ...eslintFiles,
    ]);
    if (eslint.status !== 0 && eslint.status !== 1) {
      failed = true;
    }
  }
  checkFiles("prettier", ["--write"], prettierFiles);
  for (const file of shellFiles) {
    const patch = run("shellcheck", ["--format=diff", "--", file], {
      stdio: ["ignore", "pipe", "inherit"],
    });
    if (patch.status !== 0 && patch.status !== 1) {
      failed = true;
    }
    if (patch.stdout) {
      const applied = run("git", ["apply", "--whitespace=nowarn", "-"], {
        input: patch.stdout,
        stdio: ["pipe", "inherit", "inherit"],
      });
      if (applied.status !== 0) {
        failed = true;
      }
    }
    check("shfmt", ["-w", "-i", "2", "-ci", "-bn", "-sr", "--", file]);
  }
}

console.log("Checking lint and formatting (warnings fail)...");
checkFiles("eslint", eslintOptions, eslintFiles);
checkFiles("prettier", ["--check"], prettierFiles);
for (const file of shellFiles) {
  check("shellcheck", ["--", file]);
  check("shfmt", ["-d", "-i", "2", "-ci", "-bn", "-sr", "--", file]);
}

if (failed) {
  console.error(
    fix
      ? "Format failed: unresolved findings or tool failures remain."
      : "Lint failed. Run npm run format to apply automatic fixes.",
  );
}
process.exitCode = failed ? 1 : 0;
