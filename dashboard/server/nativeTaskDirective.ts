// Interpret assignment intent only after host context has been classified.
import { usageUnfencedText } from "./usageStoryReaders.ts";
import { nativeAssignmentContent } from "./nativeAssignmentContent.ts";
import type { NativeTaskFact } from "./nativeTaskFacts.ts";
import type { UsageTask } from "./usageRecords.ts";
function directive(text: string) {
  // Anchored invocations only: AGENTS, injected skills, quotes and transcripts
  // containing a skill name cannot manufacture a task or historical reference.
  // A command typed without arguments has no <command-args> element.
  const readable = usageUnfencedText(text).trim();
  const command =
    /^(?:<command-message>[^<]*<\/command-message>\s*)?<command-name>\/(dough-[a-z-]+)<\/command-name>(?:[\s\S]*?<command-args>([^<]*)<\/command-args>|\s*$)/.exec(
      readable,
    );
  const workflow = /^(?:\$|\/)(dough-[a-z-]+)\b([^\n]*)/.exec(readable);
  const natural =
    /^(?:Use|Run|Execute|Invoke) (?:the )?(dough-[a-z-]+)\b([^\n]*)/i.exec(
      readable,
    );
  const invocation = workflow ?? natural ?? command;
  const reporting =
    /^Dashboard reporting context:\n- project: ([^\n]+)\n- host: (codex|claude)\n- launch reference: ([0-9a-f-]{36})(?:\n|$)/im.exec(
      readable,
    );
  const referenceText = invocation?.[2] ?? "";
  const references = [
    ...referenceText.matchAll(
      /SEED-\d+(?:#[a-z0-9-]+)?|(?:\.?\/?[\w.-]+\/)*[^\s`]+\.(?:md|json)(?:#[\w-]+)?/gi,
    ),
  ].map((match) => match[0]);
  const argument = referenceText
    .trim()
    .split(/\s+/)
    .find((part) => !part.startsWith("--"));
  if (
    invocation?.[1] === "dough-execute-plan" &&
    argument &&
    /^\d+$/.test(argument)
  )
    references.push(argument);
  if (invocation) {
    for (const block of readable.matchAll(
      /^(?:#{1,6} )?(?:\*\*)?Established (?:start|preparation)(?:\*\*)?:[ \t]*\n((?:[ \t]*- [^\n]*(?:\n|$))*)/gim,
    )) {
      for (const identity of (block[1] ?? "").matchAll(
        /^[ \t]*- identity: (SEED-\d+#[a-z0-9-]+)[ \t]*$/gim,
      ))
        if (identity[1]) references.push(identity[1]);
    }
  }
  return { invocation, reporting, storyReferences: [...new Set(references)] };
}
export function nativeTaskDirective(
  content: unknown,
  context: Omit<NativeTaskFact, "workflow" | "origin" | "requested" | "turns">,
  first: boolean,
  explicitNative = false,
): NativeTaskFact | undefined {
  const assignment = nativeAssignmentContent(content);
  const text = assignment.text;
  const assignmentEvidence = [
    {
      status: text ? ("supported" as const) : ("rejected" as const),
      turnId: context.turnId,
      source: context.source,
      ...(context.at ? { at: context.at } : {}),
      reason: text ? ("human-input" as const) : ("injected-context" as const),
    },
  ];
  if (!text && assignment.injected)
    return {
      ...context,
      turns: [context.turnId],
      workflow: null,
      origin: "unknown",
      requested: {},
      assignmentEvidence,
    };
  const { invocation, reporting, storyReferences } = directive(text);
  if (!invocation && !reporting && !first) return;
  if (!text.trim()) return;
  const requested: UsageTask["requested"] = {};
  const supported = new Set([
    "--trunk",
    "--one-shot",
    "--auto-land",
    "--skip-retro",
    "--replan",
    "--no-replan",
    "--refine-only",
  ]);
  const options = invocation?.[2]
    ?.match(/--[a-z][a-z-]+/g)
    ?.filter((flag) => supported.has(flag));
  if (options?.length) requested.options = [...new Set(options)];
  // A requested value must be labelled; observed turn settings stay separate.
  for (const [label, key] of [
    ["model", "model"],
    ["effort", "effort"],
    ["approval policy", "approvalPolicy"],
    ["sandbox", "sandbox"],
  ] as const) {
    const value = new RegExp(
      `^Requested ${label}: ([a-zA-Z0-9_.-]+)$`,
      "m",
    ).exec(text)?.[1];
    if (value) requested[key] = value;
  }
  return {
    ...context,
    turns: [context.turnId],
    assignmentEvidence,
    workflow: invocation?.[1] ?? null,
    ...(storyReferences.length ? { storyReferences } : {}),
    ...(reporting?.[3]
      ? { reference: reporting[3], projectHint: reporting[1] }
      : {}),
    origin:
      reporting?.[2] === context.host
        ? "dashboard"
        : explicitNative
          ? "native"
          : "unknown",
    requested,
  };
}
