import { shellCommand } from "../src/sessionCapabilities.ts";
import type { RecordedLaunchRequest } from "../src/launchRequest.ts";
// All host grammars carry the same explicit channel; blank native launches stay blank.
export function reportingInstruction(
  request: RecordedLaunchRequest,
): string | undefined {
  if (
    request.reporting === undefined ||
    (request.workflow === "ad-hoc" && !request.instruction?.trim())
  )
    return undefined;
  const landing =
    request.reporting.landingContext === undefined
      ? request.workflow !== "ad-hoc" && request.policy?.tracking === "one-shot"
        ? " This installed reporting command cannot capture a landing comparison; explain that evidence gap without supplying unsupported landing flags."
        : ""
      : ` For this one-shot launch, supply --landing-context ${shellCommand([request.reporting.landingContext])} to the installed publication command (or landingContext to its shared publication API). It retains the final candidate and suffix base before each push, records accepted landing evidence before retirement, and reports capture separately from completion. Keep the exact retained landing retry input; recording failure never repeats Git publication.`;
  return [
    "Dashboard reporting context:",
    `- project: ${request.source}`,
    `- host: ${request.host}`,
    `- launch reference: ${request.reporting.reference}`,
    `- reporting command: ${request.reporting.command}`,
    `For Dough Land or Story Wrap Up, after all required operations and final wording settle, append --outcome completed with no message file for explicit completion with nothing requiring attention. This is the final operation; wait for its matching receipt, then give only the normal minimal native response. Silence, a marker, or process exit cannot report success. To retain an attention message for this session, append --outcome completed (finished with a reminder) or --outcome unfinished (remaining work), and --message-file <file containing your exact response>. Wait for its receipt. A pending-native-session receipt names only this launch until its native session is confirmed. Reporting does not stop the session or declare the story complete. If delivery fails, retain and run the printed reporting-only --retry command; it reuses the exact submission without repeating Git or retirement.${landing}`,
  ].join("\n");
}
