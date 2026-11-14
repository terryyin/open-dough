// @ts-check
// Skill option definitions as a command's installed references declare them
// (`../../../dashboard/src/commandOptions.ts`): selectable entries, optional
// focuses, and exclusive groups. Call sites state chosen flags, labels, and
// groups; incidental summary and instruction text default from the flag.

/** @typedef {import("../../../dashboard/src/commandOptions.ts").OptionsDefinition} OptionsDefinition */
/** @typedef {OptionsDefinition["options"][number]} OptionsEntry */
/** @typedef {NonNullable<OptionsDefinition["groups"]>[number]} ExclusiveOptionGroup */

/**
 * One selectable option or focus entry.
 * @typedef {Pick<OptionsEntry, "flag"> & Partial<Omit<OptionsEntry, "flag">>} OptionsEntryFacts
 */

/**
 * An exclusive group: members cannot be selected together.
 * @typedef {Pick<ExclusiveOptionGroup, "id" | "label" | "flags">} ExclusiveOptionGroupFacts
 */

/**
 * A whole options definition. Omit `focuses` or `groups` when the definition
 * does not declare them.
 * @typedef {{
 *   command: string,
 *   options: readonly OptionsEntry[],
 *   focuses?: readonly OptionsEntry[],
 *   groups?: readonly ExclusiveOptionGroup[],
 * }} OptionsDefinitionFacts
 */

export class OptionsEntryBuilder {
  /** @param {OptionsEntryFacts} facts */
  with({ flag, label = flag, summary = `${flag}.`, instruction = `${flag}.` }) {
    return {
      /** @returns {OptionsEntry} */
      please: () => ({ flag, label, summary, instruction }),
    };
  }
}

export class ExclusiveOptionGroupBuilder {
  /** @param {ExclusiveOptionGroupFacts} facts */
  with({ id, label, flags }) {
    return {
      /** @returns {ExclusiveOptionGroup} */
      please: () => ({
        id,
        label,
        selection: "exclusive",
        flags: [...flags],
      }),
    };
  }
}

export class OptionsDefinitionBuilder {
  /** @param {OptionsDefinitionFacts} facts */
  with({ command, options, focuses, groups }) {
    return {
      /** @returns {OptionsDefinition} */
      please: () => ({
        command,
        options: options.map((entry) => ({ ...entry })),
        ...(focuses === undefined
          ? {}
          : { focuses: focuses.map((entry) => ({ ...entry })) }),
        ...(groups === undefined
          ? {}
          : {
              groups: groups.map((group) => ({
                ...group,
                flags: [...group.flags],
              })),
            }),
      }),
    };
  }
}

/**
 * @typedef {object} OptionsDefinitionMakeMe
 * @property {OptionsDefinitionBuilder} anOptionsDefinition
 * @property {OptionsEntryBuilder} anOptionsEntry
 * @property {ExclusiveOptionGroupBuilder} anExclusiveOptionGroup
 */

/** @returns {PropertyDescriptorMap} */
export function optionsDefinitionMakeMeProperties() {
  return {
    anOptionsDefinition: {
      enumerable: true,
      get() {
        return new OptionsDefinitionBuilder();
      },
    },
    anOptionsEntry: {
      enumerable: true,
      get() {
        return new OptionsEntryBuilder();
      },
    },
    anExclusiveOptionGroup: {
      enumerable: true,
      get() {
        return new ExclusiveOptionGroupBuilder();
      },
    },
  };
}
