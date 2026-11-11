// @ts-check
// Project CI settings as `.planning/open-dough.json` declares them for the
// custom adapter path (`../../src/skills/dough-execute-plan/scripts/ci-project-configuration.mjs`).
// Call sites state the chosen adapter command (and any other settings fields
// the case relies on). File encoding stays at the harness or call site.

/**
 * Settings a project publishes for CI observation. `ciAdapter` is the argv
 * the observer runs in the project folder; an empty array means no adapter.
 * Other keys the configuration reader tolerates stay explicit when stated.
 * @typedef {{
 *   ciAdapter: readonly string[],
 *   [key: string]: unknown,
 * }} ProjectCiSettings
 */

/**
 * @typedef {Pick<ProjectCiSettings, "ciAdapter"> &
 *   Omit<ProjectCiSettings, "ciAdapter">} ProjectCiSettingsFacts
 */

export class ProjectCiSettingsBuilder {
  /** @param {ProjectCiSettingsFacts} facts */
  with({ ciAdapter, ...rest }) {
    return {
      /** @returns {ProjectCiSettings} */
      please: () => ({
        ...rest,
        ciAdapter: [...ciAdapter],
      }),
    };
  }
}

/**
 * @typedef {object} ProjectCiSettingsMakeMe
 * @property {ProjectCiSettingsBuilder} projectCiSettings
 */

/** @returns {PropertyDescriptorMap} */
export function projectCiSettingsMakeMeProperties() {
  return {
    projectCiSettings: {
      enumerable: true,
      get() {
        return new ProjectCiSettingsBuilder();
      },
    },
  };
}
