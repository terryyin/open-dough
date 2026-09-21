import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assessWorktreePreparation } from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-assessor.mjs";
import {
  extractStreamCommands,
  nativeEvidence,
  observeNativePreparation,
  readOptional,
  rolesFor,
} from "./execution-worktree-prep-native-observe.mjs";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function streamHasRole(commands, role) {
  return (commands ?? []).some((text) => rolesFor(text).includes(role));
}

function responseClaimsSetup(text) {
  return /npm\s+ci|(?:\.\/)?wrapper\s+prepare|installed dependencies|prepared the (?:checkout|worktree)/i.test(
    text ?? "",
  );
}

export function assessNativePreparation(observation) {
  const streamStatus = observation.streamStatus ?? "complete";
  if (streamStatus !== "complete") {
    return {
      status: "pending",
      reason: observation.streamReason || `${streamStatus} terminal stream`,
    };
  }

  const commands = observation.commands ?? [];
  const { traces, invocations } = nativeEvidence(observation);
  const hasStreamSetup = streamHasRole(commands, "setup");
  const hasStreamCommand = streamHasRole(commands, "command");
  const hasStreamDelegate = streamHasRole(commands, "delegate");
  const hasTraceSetup = traces.some((entry) => entry.type === "setup");
  const hasTraceCommand = traces.some((entry) => entry.type === "command");
  const hasFsOutcome =
    Boolean(observation.greeting) ||
    observation.generatedOutputInWorktree === true ||
    observation.executionOwnsInstall === true ||
    hasTraceSetup ||
    hasTraceCommand;
  const selfReported = responseClaimsSetup(observation.responseText);

  if (observation.missingCheckout === true) {
    return {
      status: "pending",
      reason: "inconclusive: execution checkout was not observable",
    };
  }

  if (!hasStreamSetup && !hasTraceSetup && selfReported && !hasFsOutcome) {
    return {
      status: "pending",
      reason: "self-reported-only",
    };
  }
  if (
    !hasStreamSetup &&
    !hasStreamCommand &&
    !hasTraceSetup &&
    !hasTraceCommand &&
    !hasFsOutcome
  ) {
    return {
      status: "pending",
      reason: "inconclusive: no stream or filesystem preparation evidence",
    };
  }

  const variant = observation.variant ?? "fresh-node";
  const expectedFail = variant === "failed-prep";
  const expectedReuse = variant === "reuse";
  const mapped = {
    ...observation,
    ok: observation.ok ?? !expectedFail,
    reused: observation.reused ?? expectedReuse,
    traces,
    invocations,
    report: observation.report ?? observation.responseText ?? "",
  };

  if (expectedFail) {
    mapped.ok = false;
    if (observation.greeting || observation.greetingInOrigin) {
      return {
        status: "fail",
        reason: "failed preparation continued into implementation",
      };
    }
  } else if (observation.greetingInOrigin) {
    return {
      status: "fail",
      reason: "completed outcome was written in the originating checkout",
    };
  } else if (
    variant !== "wrapper" &&
    observation.greeting !== "hello-ok\n" &&
    observation.greeting !== "hello-ok"
  ) {
    if (!observation.greeting) {
      if (!hasStreamDelegate && !hasFsOutcome) {
        return {
          status: "pending",
          reason:
            "inconclusive: no completed outcome in the execution checkout",
        };
      }
      return {
        status: "fail",
        reason: "missing completed outcome in the selected execution checkout",
      };
    }
    return {
      status: "fail",
      reason: "completed outcome was not the requested greeting",
    };
  }

  if (expectedReuse) {
    if (hasStreamSetup) {
      return {
        status: "fail",
        reason: "verified reuse ran setup again",
      };
    }
    if ((observation.setupCount ?? 0) !== 1) {
      return {
        status: "fail",
        reason: "reused preparation did not keep a single setup",
      };
    }
  }

  if (variant === "wrapper" && mapped.usedNpmOrNix) {
    return {
      status: "fail",
      reason: "invoked npm or Nix",
    };
  }

  const cheap = assessWorktreePreparation(mapped);
  if (cheap.status !== "pass") return cheap;

  if (
    !expectedFail &&
    !hasStreamSetup &&
    !hasTraceSetup &&
    !expectedReuse &&
    observation.executionOwnsInstall !== true
  ) {
    return {
      status: "pending",
      reason:
        "inconclusive: success lacks setup evidence in the selected checkout",
    };
  }

  return cheap;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[index + 1];
    if (value === undefined || value === null || value.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = value;
    index += 1;
  }
  return options;
}

function liveFromArgs(options) {
  const streamText = readOptional(options.stream);
  const before = options.before ? readJson(options.before) : null;
  return observeNativePreparation({
    variant: options.variant,
    host: options.host,
    streamStatus: options["stream-status"] ?? "complete",
    streamReason: options["stream-reason"] ?? "",
    commands: extractStreamCommands(streamText),
    responseText: readOptional(options.response),
    origin: options.origin,
    execution: options.execution,
    tracePath: options["trace-path"],
    before,
    setupCount: options["setup-count"]
      ? Number(options["setup-count"])
      : undefined,
    wrapperDriven: options.wrapper === "1" || options.variant === "wrapper",
    artifactCache: options["artifact-cache"],
    convention: options.convention ? JSON.parse(options.convention) : undefined,
    ok: options.ok === "0" ? false : options.ok === "1" ? true : undefined,
    reused: options.reused === "1",
    report: readOptional(options.report) || undefined,
  });
}

function main(argv) {
  const options = parseArgs(argv);
  let observation;
  if (options.observation) {
    observation = readJson(options.observation);
    if (!observation.commands?.length && options.stream) {
      observation.commands = extractStreamCommands(
        readOptional(options.stream),
      );
    }
  } else {
    observation = liveFromArgs(options);
  }
  const assessment = assessNativePreparation(observation);
  const payload = { ...assessment, observation };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  return assessment.status === "pass" ? 0 : 1;
}

export { extractStreamCommands, observeNativePreparation };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
