import { localSettingRequest } from "./localSettingRequest.ts";
import {
  terminalThemeEndpoint,
  terminalThemeSaveEndpoint,
  type TerminalThemeSetting,
} from "./terminalThemeSetting.ts";
import { isTerminalThemeId, type TerminalThemeId } from "./terminalThemes.ts";

const readFailure =
  "The saved terminal theme could not be read. Retry the operation.";

export type TerminalThemeSource = {
  readonly read: () => Promise<TerminalThemeSetting>;
  readonly save: (theme: TerminalThemeId) => Promise<TerminalThemeSetting>;
};

async function terminalThemeRequest(
  theme?: TerminalThemeId,
): Promise<TerminalThemeSetting> {
  const answer = await localSettingRequest(
    theme === undefined ? terminalThemeEndpoint : terminalThemeSaveEndpoint,
    theme === undefined ? undefined : { theme },
    theme === undefined
      ? readFailure
      : "The terminal theme could not be saved. Retry the operation; the previous theme was kept.",
  );
  if (
    typeof answer !== "object" ||
    answer === null ||
    !("theme" in answer) ||
    !isTerminalThemeId(answer.theme)
  )
    throw new Error(readFailure);
  return { theme: answer.theme };
}

export const pageTerminalThemeSource: TerminalThemeSource = {
  read: () => terminalThemeRequest(),
  save: (theme) => terminalThemeRequest(theme),
};
