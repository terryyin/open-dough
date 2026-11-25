import { shellCommand } from "../src/sessionCapabilities.ts";
import type { RecordedLaunchRequest } from "../src/launchRequest.ts";
import { sendsFirstInput } from "../src/unattachedSession.ts";
import { unattachedPolicyOf } from "../src/launchRequest.ts";
import { sessionBranchEntryEndpoint } from "../src/sessionBranchResult.ts";

function branchEntryInstruction(request: RecordedLaunchRequest): string[] {
  if (
    request.workflow !== "ad-hoc" ||
    request.reporting === undefined ||
    unattachedPolicyOf(request).workspace !== "default-checkout"
  )
    return [];
  const { origin, reference } = request.reporting;
  const script = [
    'import { execFileSync } from "node:child_process";',
    'const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trimEnd();',
    "const [origin, endpoint, source, host, reference] = process.argv.slice(1);",
    'const workspace = git("rev-parse", "--show-toplevel");',
    'const branch = git("symbolic-ref", "HEAD").slice("refs/heads/".length);',
    'const response = await fetch(new URL(endpoint, origin), { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ source, host, reference, workspace, branch }) });',
    "console.log(await response.text());",
    "if (!response.ok) process.exitCode = 1;",
  ].join(" ");
  return [
    "If you take up your own branch or linked worktree, run this command from that checkout on entry, before making changes for this session. Its receipt fixes the starting state for Review changes.",
    `- branch entry command: ${shellCommand(["node", "--input-type=module", "-e", script, origin, sessionBranchEntryEndpoint, request.source, request.host, reference])}`,
  ];
}
// All host grammars carry the same explicit channel; blank native launches stay blank.
export function reportingInstruction(
  request: RecordedLaunchRequest,
): string | undefined {
  if (
    request.reporting === undefined ||
    (request.workflow === "ad-hoc" && !sendsFirstInput(request))
  )
    return undefined;
  const landing =
    request.reporting.landingContext === undefined
      ? request.workflow !== "ad-hoc"
        ? " This installed reporting command cannot capture a landing comparison; explain that evidence gap without supplying unsupported landing flags."
        : ""
      : ` For this launch, supply --landing-context ${shellCommand([request.reporting.landingContext])} to the installed publication command that first lands this launch's work on trunk (or landingContext to its shared publication API). It retains the final candidate and suffix base before each push, records accepted landing evidence before retirement, and reports capture separately from completion. After trunk accepts that publication, this launch's later trunk publications, such as a CI repair, take no landing context. Keep the exact retained landing retry input; recording failure never repeats Git publication.`;
  const borrowedClaim =
    request.workflow === "ad-hoc" &&
    request.followUp === undefined &&
    request.storyIdentity !== undefined &&
    request.reporting.landingContext !== undefined &&
    unattachedPolicyOf(request).workspace === "default-checkout"
      ? "The admitted Taken claim is in admitted-claim.json beside landing-context.json. Follow Story Wrap Up's Dashboard admission instructions to complete it there and pass this landing context to finish as --admitted-launch-context."
      : undefined;
  return [
    "Dashboard reporting context:",
    `- project: ${request.source}`,
    `- host: ${request.host}`,
    `- launch reference: ${request.reporting.reference}`,
    `- reporting command: ${request.reporting.command}`,
    `For Dough Land or Story Wrap Up, after all required operations and final wording settle, append --outcome completed with no message file for explicit completion with nothing requiring attention. This is the final operation; wait for its matching receipt, then give only the normal minimal native response. Silence, a marker, or process exit cannot report success. To retain an attention message for this session, append --outcome completed (finished with a reminder) or --outcome unfinished (remaining work), and --message-file <file containing your exact response>. Wait for its receipt. At a plan execution's execution-complete handoff, before Dough Land or Story Wrap Up, submit that handoff through this command when it needs the developer: --outcome completed when it finished with a reminder, or --outcome unfinished when it is unfinished, in each case with --message-file <file containing your exact response>, and wait for its receipt; when nothing at that handoff requires attention, submit nothing there. That handoff submission is not the final operation: Dough Land or Story Wrap Up remains the final operation, with quiet --outcome completed when nothing requires attention there. A pending-native-session receipt names only this launch until its native session is confirmed. Reporting does not stop the session or declare the story complete. If delivery fails, retain and run the printed reporting-only --retry command; it reuses the exact submission without repeating Git or retirement.${landing}`,
    ...branchEntryInstruction(request),
    borrowedClaim,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}
