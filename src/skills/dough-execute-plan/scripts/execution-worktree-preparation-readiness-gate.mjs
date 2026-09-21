import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

export function readProjectConvention(checkout) {
  const contributing = join(checkout, "CONTRIBUTING.md");
  if (!existsSync(contributing)) {
    return { missing: true, reason: "CONTRIBUTING.md is missing" };
  }
  const text = readFileSync(contributing, "utf8");
  const setup = text.match(/Locked setup:\s*`([^`]+)`/);
  const command = text.match(/Applicable command:\s*`([^`]+)`/);
  if (!setup || !command) {
    return {
      missing: true,
      reason: "setup or applicable command is ambiguous",
    };
  }
  return { setup: setup[1], command: command[1] };
}

async function runCommand(cwd, commandLine, env) {
  const [command, ...args] = commandLine.split(/\s+/).filter(Boolean);
  try {
    const result = await exec(command, args, {
      cwd,
      env,
      timeout: 60_000,
      maxBuffer: 2_000_000,
    });
    return {
      command: commandLine,
      cwd,
      code: 0,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (error) {
    const code =
      typeof error.code === "number"
        ? error.code
        : error.code === "ERR_SOCKET_TIMEOUT"
          ? -1
          : 1;
    return {
      command: commandLine,
      cwd,
      code,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? String(error.message ?? error),
    };
  }
}

function failureReport(executionCheckout, command, failure) {
  return [
    `Failed to prepare execution checkout ${executionCheckout}`,
    `Command: ${command}`,
    failure,
  ].join("\n");
}

// Cheap substitute actor: follow the fixture's project-owned convention,
// record setup then command, and delegate only after both succeed.
// Not product runtime.
export async function runReadinessGate(execution, env) {
  const invocations = [];
  const convention = readProjectConvention(execution);
  if (convention.missing) {
    const command = "missing";
    return {
      ok: false,
      convention,
      invocations,
      report: failureReport(execution, command, convention.reason),
    };
  }

  const setup = await runCommand(execution, convention.setup, env);
  invocations.push({ role: "setup", ...setup });
  if (setup.code !== 0) {
    return {
      ok: false,
      convention,
      invocations,
      report: failureReport(
        execution,
        convention.setup,
        setup.stderr || `exit ${setup.code}`,
      ),
    };
  }

  const command = await runCommand(execution, convention.command, env);
  invocations.push({ role: "command", ...command });
  if (command.code !== 0) {
    return {
      ok: false,
      convention,
      invocations,
      report: failureReport(
        execution,
        convention.command,
        command.stderr || `exit ${command.code}`,
      ),
    };
  }

  invocations.push({
    role: "delegate",
    command: "implementation",
    cwd: execution,
    code: 0,
    stdout: "",
    stderr: "",
  });
  return { ok: true, convention, invocations, report: null };
}
