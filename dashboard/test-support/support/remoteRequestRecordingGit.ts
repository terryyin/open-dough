// A `git` placed in `bin`, for callers to put first on PATH, that records the
// physical directory of every remote request (`fetch` or `ls-remote`) before
// running Git; callers name directories physically too.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type RemoteRequest = {
  readonly command: "fetch" | "ls-remote";
  readonly directory: string;
};

export function remoteRequestRecordingGit(machine: string) {
  const bin = path.join(machine, "remote-request-recording-bin");
  const log = path.join(machine, "remote-requests.log");
  const git = execFileSync("sh", ["-c", "command -v git"], {
    encoding: "utf8",
  }).trim();
  mkdirSync(bin, { recursive: true });
  writeFileSync(log, "");
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh\ncase " $* " in\n*" fetch "*) printf 'fetch\\t%s\\n' "$(pwd -P)" >> '${log}';;\n*" ls-remote "*) printf 'ls-remote\\t%s\\n' "$(pwd -P)" >> '${log}';;\nesac\nexec '${git}' "$@"\n`,
    { mode: 0o755 },
  );
  const requests = (): RemoteRequest[] =>
    readFileSync(log, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [command, directory] = line.split("\t");
        return { command, directory } as RemoteRequest;
      });
  return {
    bin,
    requests,
    fetchesIn: (directory: string) =>
      requests().filter(
        (request) =>
          request.command === "fetch" && request.directory === directory,
      ).length,
  };
}
