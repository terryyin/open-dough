import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));

const fix = process.argv.includes("--fix");
const prettierFiles = "**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,json,jsonc}";
let failed = false;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: "inherit",
    ...options,
  });
  if (result.error) {
    console.error(`${command}: ${result.error.message}`);
  }
  return result;
}

function check(command, args) {
  if (run(command, args).status !== 0) {
    failed = true;
  }
}

// Include new files and paths containing spaces; honor Git's ignore rules.
const listing = run(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  {
    stdio: ["ignore", "pipe", "inherit"],
  },
);
if (listing.status !== 0) {
  process.exit(1);
}
const shellFiles = [...new Set(listing.stdout.split("\0"))].filter((file) => {
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    return false;
  }
  if (/\.(?:sh|bash|ksh|bats)$/.test(file)) {
    return true;
  }
  // Also lint extensionless scripts identified by their interpreter.
  return /^#![^\r\n]*\b(?:sh|bash|dash|ksh)\b/.test(readFileSync(file, "utf8"));
});

if (fix) {
  console.log("Applying automatic fixes...");
  // ESLint may return 1 for remaining diagnostics. Check them again below
  // after every tool has had a chance to fix files.
  const eslint = run("eslint", [".", "--fix", "--max-warnings=0"]);
  if (eslint.status !== 0 && eslint.status !== 1) {
    failed = true;
  }
  check("prettier", ["--write", prettierFiles]);
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
check("eslint", [".", "--max-warnings=0"]);
check("prettier", ["--check", prettierFiles]);
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
