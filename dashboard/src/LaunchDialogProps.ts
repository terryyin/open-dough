import type { ReactNode } from "react";
import type { OfferedShape } from "./commandOptions.ts";
import type { AgentLaunchRequest, LaunchChoices } from "./agentLaunch.ts";
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import type { DialogSession } from "./LaunchSessionPolicy.tsx";

// Shared startup-dialog contract: subject, Session group, options, and the
// Start/Cancel outcomes. Mounted only while open (`LaunchDialog.tsx`).
export type LaunchDialogProps = {
  readonly sourceId: string;
  readonly projectContext?: boolean;
  readonly host: AgentLaunchRequest["host"];
  readonly onHost?: ((host: AgentLaunchRequest["host"]) => void) | undefined;
  readonly heading: string;
  // What the launch is about, such as a story's title and identity.
  readonly subject?: ReactNode;
  // Why the launch is started, in a sentence.
  readonly description: ReactNode;
  // What pressing Start does, always in view beside Start.
  readonly effects?: ReactNode;
  // Longer explanations and metadata, read under Command details.
  readonly details?: ReactNode;
  // What the launch's workflow notes about the work, in a quiet sentence.
  readonly note?: string | undefined;
  readonly fieldLabel: string;
  // The command line the instruction follows; it includes the selected
  // options' flags, in the order `options` offers them.
  readonly command?: string;
  readonly optionsReading?: boolean;
  // The Session group: a story's choices, or an unattached session's.
  readonly session: DialogSession;
  readonly options?: OfferedShape | undefined;
  // The name of the options' disclosure.
  readonly optionsLabel?: string;
  readonly optionsHint?: string;
  // Said in place of the options when there are none to choose from.
  readonly optionsLine?: string | undefined;
  readonly kept?: ReadonlySet<string> | undefined;
  // Said under the options when `kept` names flags the offer no longer has.
  readonly notOfferedLine?: string | undefined;
  readonly onStart: (choices: LaunchChoices) => Promise<StartAnswer>;
  readonly onRefused?: (selected: ReadonlySet<string>) => void;
  // Whether the launch was accepted.
  readonly onClose: (accepted: boolean) => void;
};
