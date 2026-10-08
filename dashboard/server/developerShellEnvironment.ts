// The environment every host process the dashboard starts for a session runs
// in, on every host: the dashboard's own environment without what its start
// added. `npm run` exports `npm_*` variables and `INIT_CWD` and puts
// `node_modules/.bin` directories and its `node-gyp-bin` first on `PATH`; Vite
// sets `NODE_ENV`. A developer shell has none of them, and a session given
// `NODE_ENV=production` installs no dev dependencies, so each is removed,
// whatever its value. Everything else passes through unchanged, and applying
// this twice changes nothing.

const npmBinSuffixes = [
  "/node_modules/.bin",
  "/@npmcli/run-script/lib/node-gyp-bin",
];

function addedByNpm(entry: string): boolean {
  const trimmed = entry.replace(/\/+$/, "");
  return (
    trimmed === "node_modules/.bin" ||
    npmBinSuffixes.some((suffix) => trimmed.endsWith(suffix))
  );
}

function startUpAddition(key: string): boolean {
  return key === "NODE_ENV" || key === "INIT_CWD" || key.startsWith("npm_");
}

export function developerShellEnvironment(
  environment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  const kept: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(environment)) {
    if (!startUpAddition(key)) kept[key] = value;
  }
  if (kept["PATH"] !== undefined) {
    kept["PATH"] = kept["PATH"]
      .split(":")
      .filter((entry) => !addedByNpm(entry))
      .join(":");
  }
  return kept;
}
