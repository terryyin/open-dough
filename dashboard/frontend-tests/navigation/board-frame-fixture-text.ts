// Backlog markdown, roster profile texts, and machine-answer defaults for
// Board frame typed mounts.
import { onTestFinished } from "vitest";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { renderPublishedBacklog } from "../../../Distribution/tests/support/published-backlog.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { AgentRoster } from "../../src/assignmentRoster.ts";
import type { PublishedWork, WorkEntry } from "../../src/publishedWork.ts";

function backlogHref(recorded: string): string {
  // Backlog entry links cannot carry spaces or ")".
  return recorded.replace(/[\s)]/g, "-");
}

function linkTarget(
  link: WorkEntry["canonical"] | NonNullable<WorkEntry["plan"]>,
): string {
  if (link.kind === "external") return link.url;
  return backlogHref(link.recorded);
}

function linkedEntry(entry: WorkEntry) {
  return {
    identity: entry.identity,
    title: entry.title,
    href: linkTarget(entry.canonical),
    ...(entry.plan === undefined
      ? {}
      : {
          plan: {
            label: "plan",
            target: linkTarget(entry.plan),
          },
        }),
  };
}

export function backlogMarkdownOf(work: PublishedWork): string {
  return renderPublishedBacklog({
    direction: work.direction,
    taken: work.taken.map(linkedEntry),
    queued: work.backlog.map(linkedEntry),
  });
}

export function entriesOf(work: PublishedWork): readonly WorkEntry[] {
  return [...work.taken, ...work.backlog];
}

export function emptyMachineAnswer(): MachineAnswer & {
  readonly revision: string;
} {
  return {
    ...makeMe.aMachineAnswer.please(),
    alerts: { available: true },
    revision: "m".repeat(40),
  };
}

export function rosterProfileTexts(
  roster: Extract<AgentRoster, { status: "read" }>,
) {
  return roster.members.flatMap((member) => {
    const profile = member.profile;
    if (profile === undefined || !("profilePath" in profile)) {
      return [];
    }
    const activity =
      profile.activity === "preparation" ? "preparation" : "execution";
    return [
      {
        path: `.planning/${agentIdentity(member.name).path}`,
        text: renderAgentProfile({
          name: member.name,
          identity: profile.identity,
          activity,
          ...(activity === "execution"
            ? { mode: "trunk", branch: "origin/main" }
            : {}),
          host: "claude",
          model: "claude-opus-5-5",
        }),
      },
    ];
  });
}

// Stream delivery needs an uncapped hop so typed subscription handlers open.
export function forceRevisionStreamDelivery() {
  const proto = Performance.prototype;
  // eslint-disable-next-line @typescript-eslint/unbound-method -- restore the prototype method after the case
  const original = proto.getEntriesByType;
  proto.getEntriesByType = function getEntriesByType(this: Performance, type) {
    if (type === "navigation") {
      return [
        { nextHopProtocol: "h2" } as unknown as PerformanceNavigationTiming,
      ];
    }
    return original.call(this, type);
  };
  onTestFinished(() => {
    proto.getEntriesByType = original;
  });
}
