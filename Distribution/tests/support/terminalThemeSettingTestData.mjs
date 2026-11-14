// @ts-check
// The terminal theme preference saved on this machine
// (`../../../dashboard/src/terminalThemeSetting.ts`). Build a valid preset id;
// keep corrupt or unknown preference bytes literal at the call site.

/** @typedef {import("../../../dashboard/src/terminalThemeSetting.ts").TerminalThemeSetting} TerminalThemeSetting */

export class TerminalThemeSettingBuilder {
  /** @param {TerminalThemeSetting} facts */
  with(facts) {
    return {
      /** @returns {TerminalThemeSetting} */
      please: () => ({ ...facts }),
    };
  }
}

/**
 * @typedef {object} TerminalThemeSettingMakeMe
 * @property {TerminalThemeSettingBuilder} aTerminalThemeSetting
 */

/** @returns {PropertyDescriptorMap} */
export function terminalThemeSettingMakeMeProperties() {
  return {
    aTerminalThemeSetting: {
      enumerable: true,
      get() {
        return new TerminalThemeSettingBuilder();
      },
    },
  };
}
