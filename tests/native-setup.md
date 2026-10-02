# Native verification setup

Run commands from the repository root. Select the exact Node patch in
`.node-version` with your existing version manager or the official Node archive;
put it first on `PATH`. This is the contributor/CI selection, not a restriction
on the product installer's supported Node versions.

Install Git and Bash 5 or newer using your host's normal tool installation.
On macOS put the newer Bash first on `PATH` (for example `/opt/homebrew/bin`);
macOS's system Bash 3.2 cannot run these checks. Lint additionally needs
ShellCheck 0.11.0 and shfmt 3.14.0, matching `.github/workflows/ci.yml`.
These host tools are explicit prerequisites; checks do not update the OS.

## First setup or changed lockfile

```sh
node scripts/setup-native.mjs npm
node scripts/setup-native.mjs browser
node scripts/setup-native.mjs check
```

The npm stage performs `npm ci` from `package-lock.json`, with zero fetch
retries and a 20-second request timeout. The browser stage invokes that
installed Playwright's Chromium installer, with a 20-second connection timeout.
Each acquisition has a 45-second total bound (including internal retries);
CI also shares a 180-second deadline across its setup stages. No `npx` package
fallback is used. A slow/unavailable source fails with a named infrastructure
diagnosis before checks. Restore connectivity and rerun the failed stage.

The check stage has a 15-second bound. It refuses the wrong Node or a mismatch
between the installed and locked Playwright before launching Chromium. It then
launches and closes Playwright's default headless browser, so missing files or
host libraries produce a prerequisite diagnosis. Install the selected Node,
rerun npm setup after a lockfile change, or rerun browser setup for missing
browser files. For missing host libraries, restore the platform prerequisites;
do not hide a setup failure by claiming tests passed.

Playwright stores browsers in its normal platform cache (or the explicit
`PLAYWRIGHT_BROWSERS_PATH` you keep the same for setup and checks). The installed
locked Playwright selects its matching browser revision. Never copy
`node_modules` from another checkout or restore an incompatible browser as the
selected version. On Linux the host must supply the Chromium libraries;
CI's Ubuntu 24.04 image is verified by the full suite without apt acquisition.
The macOS and Ubuntu environments need not have identical fonts or packages.

## Repeated checks

```sh
node scripts/setup-native.mjs check
npm test -- tests/test-runner-selection.sh tests/test-runner-bash.sh tests/test-runner-failure-report.sh
npm run typecheck:dashboard
npm run test:dashboard
```

Use `npm test` for the whole shell/Node suite, or name the checks being verified
as described in [the runner guide](README.md). Repeating unchanged checks does
not run npm setup, browser downloads or a system package manager. When
`package-lock.json` changes, repeat both acquisition stages before checking.
Every dashboard suite run rebuilds production assets from the current checkout
in `dashboard/tests/support/globalSetup.ts`; retaining prerequisites does not
retain a stale app build. Real failures retain their normal reports and exit
status; tests are never retried to turn them green.

For comparable debugging record `sw_vers` (macOS) or `/etc/os-release` (Linux),
`node --version`, `npm --version`, `git --version`, `bash --version`,
`node node_modules/playwright/cli.js --version`, and the Chromium version printed
by the check stage. CI logs additionally identify the runner image. Record
setup and check time separately; a warm repeat avoids acquisition, while native
platform scheduling and rendering can still differ.
