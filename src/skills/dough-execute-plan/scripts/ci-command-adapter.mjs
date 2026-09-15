import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const configurationPath = ".planning/open-dough.json";
const adapterTimeoutMs = 20_000;
const adapterResponseBytes = 64 * 1024;

export function readCiAdapter(root = process.cwd()) {
  const path = join(root, configurationPath);
  if (!existsSync(path)) return;
  const configuration = JSON.parse(readFileSync(path, "utf8"));
  const command = configuration.ciAdapter;
  if (command === undefined || (Array.isArray(command) && !command.length))
    return;
  if (
    !Array.isArray(command) ||
    !command.length ||
    command.some((argument) => typeof argument !== "string" || !argument)
  )
    throw new Error("ciAdapter must be an empty or nonempty string array");
  return command;
}

export function createCommandRunAcquisition({ command, repo, branch, root }) {
  return async (signal) => {
    const response = await runAdapter(
      command,
      { operation: "discover", check: { repo, branch } },
      { signal, cwd: root },
    );
    if (!response || !Array.isArray(response.attempts))
      throw new Error("CI adapter discovery must return an attempts array");
    return response.attempts.map((attempt) =>
      normalizeAttempt(attempt, branch),
    );
  };
}

function runAdapter(command, request, { signal, cwd }) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      command[0],
      command.slice(1),
      {
        cwd,
        signal,
        timeout: adapterTimeoutMs,
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

function normalizeAttempt(attempt, branch) {
  if (
    !attempt ||
    !["string", "number"].includes(typeof attempt.runId) ||
    !["string", "number"].includes(typeof attempt.attemptId) ||
    typeof attempt.sha !== "string" ||
    !["pending", "success", "failure", "incomplete"].includes(attempt.outcome)
  )
    throw new Error("CI adapter returned an invalid attempt");

  const completed = attempt.outcome !== "pending";
  return {
    databaseId: attempt.runId,
    attempt: attempt.attemptId,
    headSha: attempt.sha,
    headBranch: branch,
    status: completed ? "completed" : "in_progress",
    conclusion:
      attempt.outcome === "incomplete"
        ? "cancelled"
        : completed
          ? attempt.outcome
          : null,
    ...(attempt.url === undefined ? {} : { url: attempt.url }),
    ...(attempt.time === undefined ? {} : { createdAt: attempt.time }),
  };
}
