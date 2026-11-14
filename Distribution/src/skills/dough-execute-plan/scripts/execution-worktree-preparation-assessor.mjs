import { existsSync } from "node:fs";
import { join } from "node:path";

const blockedRoles = new Set(["delegate", "format", "proof", "ci-ready"]);

export function directoryPresenceObservation(executionCheckout) {
  return {
    evidence: "node_modules",
    executionCheckout,
    nodeModulesExists: existsSync(join(executionCheckout, "node_modules")),
    traces: [],
    invocations: [],
    report: null,
  };
}

function assessWrapperOwnership(observation) {
  if (!observation.generatedOutputInWorktree) {
    return {
      status: "fail",
      reason: "generated output is not worktree-local",
    };
  }
  if (!observation.sharedArtifactCacheOutsideWorktree) {
    return {
      status: "fail",
      reason: "artifact cache is not machine-level",
    };
  }
  if (observation.copiedOriginArtifacts) {
    return {
      status: "fail",
      reason: "copied origin-checkout artifacts",
    };
  }
  if (observation.usedNpmOrNix) {
    return {
      status: "fail",
      reason: "invoked npm or Nix",
    };
  }
  if (!observation.originMarkerUnchanged) {
    return {
      status: "fail",
      reason: "origin marker changed",
    };
  }
  return null;
}

function assessOwnedCommand(observation, command) {
  const execution = observation.executionCheckout;
  if (command.code !== 0 || command.cwd !== execution) {
    return {
      status: "fail",
      reason: "applicable project command did not succeed in the checkout",
    };
  }
  if (observation.wrapperDriven) {
    return assessWrapperOwnership(observation);
  }
  if (!observation.executionOwnsInstall) {
    return {
      status: "fail",
      reason: "execution checkout does not own its mutable installation",
    };
  }
  if (
    !observation.originMarkerUnchanged ||
    !observation.originLockUnchanged ||
    !observation.executionLockUnchanged
  ) {
    return {
      status: "fail",
      reason: "origin marker or a lockfile digest changed",
    };
  }
  return null;
}

function assessReusedPreparation(observation) {
  const execution = observation.executionCheckout;
  const traces = observation.traces ?? [];
  const invocations = observation.invocations ?? [];
  const setups = traces.filter((entry) => entry.type === "setup");
  if (setups.length !== 1) {
    return {
      status: "fail",
      reason: "reused preparation did not keep a single setup",
    };
  }
  if (setups[0].cwd !== execution) {
    return {
      status: "fail",
      reason: "reused preparation's setup was not in the selected checkout",
    };
  }
  if (invocations.some((entry) => entry.role === "setup")) {
    return {
      status: "fail",
      reason: "reused preparation ran setup again",
    };
  }
  const commandInvocation = invocations.findIndex(
    (entry) => entry.role === "command",
  );
  if (commandInvocation === -1) {
    return {
      status: "fail",
      reason: "missing project-command invocation",
    };
  }
  const firstDelegate = invocations.findIndex(
    (entry) => entry.role === "delegate",
  );
  if (firstDelegate !== -1 && firstDelegate < commandInvocation) {
    return {
      status: "fail",
      reason: "implementation delegated before the project command",
    };
  }
  const owned = assessOwnedCommand(observation, invocations[commandInvocation]);
  if (owned) return owned;
  return {
    status: "pass",
    reason: "reused host-established preparation",
  };
}

export function assessWorktreePreparation(observation) {
  if (observation.evidence === "node_modules") {
    return {
      status: "fail",
      reason: "availability inferred from node_modules presence",
    };
  }

  const execution = observation.executionCheckout;
  const traces = observation.traces ?? [];
  const invocations = observation.invocations ?? [];
  const report = observation.report ?? "";
  const failed = observation.ok === false;

  if (failed) {
    const blocked = invocations.find((entry) => blockedRoles.has(entry.role));
    if (blocked) {
      return {
        status: "fail",
        reason: `failed preparation continued into ${blocked.role}`,
      };
    }
    if (observation.convention?.missing === true && invocations.length > 0) {
      return {
        status: "fail",
        reason: "missing convention ran a guessed command",
      };
    }
    const setup = invocations.find((entry) => entry.role === "setup");
    const namedCommand =
      observation.convention?.missing === true
        ? "missing"
        : (observation.convention?.setup ?? setup?.command);
    if (!report.includes(execution)) {
      return {
        status: "fail",
        reason: "failure report omits the execution checkout",
      };
    }
    if (!namedCommand || !report.includes(namedCommand)) {
      return {
        status: "fail",
        reason: "failure report omits the selected or missing command",
      };
    }
    if (!/fail|error|exit|missing|ambiguous/i.test(report)) {
      return {
        status: "fail",
        reason: "failure report omits the failure",
      };
    }
    return { status: "pass", reason: "failed preparation stopped recoverably" };
  }

  if (observation.reused) {
    return assessReusedPreparation(observation);
  }

  const setupTrace = traces.find((entry) => entry.type === "setup");
  const commandTrace = traces.find((entry) => entry.type === "command");
  if (!setupTrace || !commandTrace) {
    return {
      status: "fail",
      reason: "missing setup or project-command trace",
    };
  }
  if (setupTrace.cwd !== execution || commandTrace.cwd !== execution) {
    return {
      status: "fail",
      reason: "setup or project command did not use the execution checkout",
    };
  }
  if (traces.indexOf(setupTrace) > traces.indexOf(commandTrace)) {
    return {
      status: "fail",
      reason: "project command ran before setup",
    };
  }
  const firstDelegate = invocations.findIndex(
    (entry) => entry.role === "delegate",
  );
  const setupInvocation = invocations.findIndex(
    (entry) => entry.role === "setup",
  );
  const commandInvocation = invocations.findIndex(
    (entry) => entry.role === "command",
  );
  if (setupInvocation === -1 || commandInvocation === -1) {
    return {
      status: "fail",
      reason: "missing setup or project-command invocation",
    };
  }
  if (setupInvocation > commandInvocation) {
    return {
      status: "fail",
      reason: "project command was invoked before setup",
    };
  }
  if (firstDelegate !== -1 && firstDelegate < commandInvocation) {
    return {
      status: "fail",
      reason: "implementation delegated before the project command",
    };
  }
  const owned = assessOwnedCommand(observation, invocations[commandInvocation]);
  if (owned) return owned;
  return {
    status: "pass",
    reason: "setup then project command before delegation",
  };
}
