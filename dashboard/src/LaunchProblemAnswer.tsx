// The answer beside a launch action whose session did not start, or may not
// have: Launch failed or Launch uncertain with why, in the problem color and
// words. The card's Start action and the project's Start session show it the
// same way; the action names it as its description.

import type { ReactNode } from "react";
import type { LaunchProblem } from "./agentLaunchClient.ts";
import "./agent-launch.css";

// An explanation's `command` spans, shown as code.
export function LaunchExplanation({ text }: { readonly text: string }) {
  const parts: ReactNode[] = text
    .split("`")
    .map((part, index) =>
      index % 2 === 1 ? <code key={index}>{part}</code> : part,
    );
  return <>{parts}</>;
}

export function LaunchProblemAnswer({
  id,
  problem,
  className,
}: {
  readonly id: string;
  readonly problem: LaunchProblem;
  readonly className?: string;
}) {
  return (
    <p
      id={id}
      className={
        className === undefined
          ? "launch-answer launch-problem"
          : `launch-answer launch-problem ${className}`
      }
    >
      {problem.kind === "failed" ? "Launch failed: " : "Launch uncertain: "}
      <LaunchExplanation text={problem.explanation} />
    </p>
  );
}
