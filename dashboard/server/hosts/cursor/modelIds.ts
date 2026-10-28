// Cursor lists effort inside model ids. Strip a trailing
// `-(none|minimal|low|medium|high|xhigh|max)` and optional `-fast`, or a
// trailing `-fast` alone, keeping `-thinking` in the base. Composition is the
// inverse so every offered pair maps 1:1 to a listed id. A bare listed id that
// also has variants is offered as the empty effort choice for that base.
import type { LaunchHostOptions } from "../../../src/launchHostOptions.ts";

const effortSuffix = /(?:-(none|minimal|low|medium|high|xhigh|max))(-fast)?$/u;
const fastOnly = /-fast$/u;

export type ListedCursorModel = {
  readonly model: string;
  readonly name: string;
};

export function splitCursorModelId(id: string): {
  readonly base: string;
  readonly effort: string;
} | null {
  const effort = effortSuffix.exec(id);
  if (effort?.[0] !== undefined) {
    return { base: id.slice(0, -effort[0].length), effort: effort[0].slice(1) };
  }
  if (fastOnly.test(id)) {
    return { base: id.slice(0, -"-fast".length), effort: "fast" };
  }
  return null;
}

export function composeCursorListedId(
  model: string,
  effort: string | undefined,
): string {
  if (effort === undefined || effort === "") return model;
  return `${model}-${effort}`;
}

type Group = {
  name: string;
  bareName?: string;
  efforts: { effort: string; description: string }[];
  seen: Set<string>;
};

export function projectCursorModels(
  listed: readonly ListedCursorModel[],
): LaunchHostOptions["models"] {
  const groups = new Map<string, Group>();
  const order: string[] = [];

  const ensure = (base: string, fallbackName: string): Group => {
    let group = groups.get(base);
    if (group === undefined) {
      group = { name: fallbackName, efforts: [], seen: new Set() };
      groups.set(base, group);
      order.push(base);
    }
    return group;
  };

  for (const item of listed) {
    const split = splitCursorModelId(item.model);
    if (split === null) {
      const group = ensure(item.model, item.name);
      group.bareName = item.name;
      if (!group.seen.has("")) {
        group.seen.add("");
        group.efforts.unshift({ effort: "", description: item.name });
      }
      continue;
    }
    const group = ensure(split.base, item.name);
    if (group.seen.has(split.effort)) continue;
    group.seen.add(split.effort);
    group.efforts.push({
      effort: split.effort,
      description: item.name,
    });
  }

  return order.map((model) => {
    const group = groups.get(model);
    if (group === undefined) {
      throw new Error(`Cursor model group missing for ${model}.`);
    }
    const hasVariants = group.efforts.some((entry) => entry.effort !== "");
    // Bare-only listings keep an empty efforts array so the dialog disables
    // Reasoning effort. Multi-effort bases keep an empty effort entry only
    // when that bare id was itself listed.
    return {
      model,
      name: group.bareName ?? group.name,
      description: "",
      efforts: hasVariants
        ? group.efforts.filter(
            (entry) => entry.effort !== "" || group.bareName !== undefined,
          )
        : [],
    };
  });
}
