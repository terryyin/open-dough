// One CI adapter invocation (`./ci-command-adapter.mjs`): the configured
// command run in its folder with one JSON request on stdin and one JSON
// answer on stdout, bounded in time and answer size alike for every
// operation.
import { execFile } from "node:child_process";

export const defaultAdapterTimeoutMs = 20_000;
const adapterResponseBytes = 64 * 1024;

export function runAdapter(command, request, { signal, cwd, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      command[0],
      command.slice(1),
      {
        cwd,
        signal,
        timeout: timeoutMs,
        maxBuffer: adapterResponseBytes,
        encoding: "utf8",
      },
      (error, stdout) => {
        if (error) return reject(error);
        try {
          resolve(JSON.parse(stdout));
        } catch (parseError) {
          reject(
            new Error(
              `CI adapter returned invalid JSON: ${parseError.message}`,
            ),
          );
        }
      },
    );
    child.stdin.end(`${JSON.stringify(request)}\n`);
  });
}

// `value` cut to at most `limit` UTF-8 bytes on a character boundary.
export function truncateUtf8(value, limit) {
  let text = "";
  let bytes = 0;
  for (const character of value) {
    const size = Buffer.byteLength(character);
    if (bytes + size > limit) return { text, truncated: true };
    text += character;
    bytes += size;
  }
  return { text, truncated: false };
}
