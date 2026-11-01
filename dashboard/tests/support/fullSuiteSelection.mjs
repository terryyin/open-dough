// Selection is determined at the actual Playwright config entry, including
// direct CLI calls. Nonselecting options (workers, reporter, timeout, etc.) do
// not turn a full suite into a focused one. Listing/UI do not own admission.
export function fullDashboardSuite(
  argv = process.argv.slice(2),
  env = process.env,
) {
  if (env["OPEN_DOUGH_DASHBOARD_SPLIT"]) return false;
  const args = argv[0] === "test" ? argv.slice(1) : argv;
  const selections =
    /^(?:-g|-G|--grep|--grep-invert|--project|--shard|--test-list|--test-list-invert|--last-failed|--only-changed|--list|--ui|--ui-host|--ui-port)(?:=|$)/;
  const values = new Set([
    "-c",
    "--config",
    "--add-reporter",
    "--browser",
    "--global-timeout",
    "--last-failed-file",
    "--max-failures",
    "--output",
    "--repeat-each",
    "--reporter",
    "--retries",
    "--run-agents",
    "--timeout",
    "--trace",
    "--tsconfig",
    "--update-source-method",
    "-j",
    "--workers",
  ]);
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (selections.test(argument)) return false;
    if (argument === "--") return args.length === index + 1;
    if (!argument.startsWith("-")) return false;
    if (values.has(argument)) index++;
    else if (
      argument === "--debug" &&
      ["inspector", "cli"].includes(args[index + 1])
    )
      index++;
    else if (
      ["-u", "--update-snapshots"].includes(argument) &&
      ["all", "changed", "missing", "none"].includes(args[index + 1])
    )
      index++;
  }
  return true;
}
