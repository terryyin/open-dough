// Host-hook merge policy for Open Dough CI registration.
// Identifies managed entries by native event and the known fragment command,
// including locally argument-extended variants that require conflict review.
// Preserves unrelated handlers and matcher siblings; refuses named conflicts.

function jsonValuesEqual(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((value, index) => jsonValuesEqual(value, b[index]))
    );
  }
  if (!isPlainObject(a) || !isPlainObject(b)) {
    return false;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return (
    aKeys.length === bKeys.length &&
    aKeys.every(
      (key) => Object.hasOwn(b, key) && jsonValuesEqual(a[key], b[key]),
    )
  );
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneEntries(entries) {
  return entries.map((item) => structuredClone(item));
}

function conflict(code, message) {
  return { error: message, code };
}

function duplicateManagedCommandConflict(relativePath, managedCommand) {
  return conflict(
    "conflicting-managed-hooks",
    `conflicting-managed-hooks: ${relativePath} has duplicate Open Dough handlers for command ${managedCommand}.`,
  );
}

function eventArrayOrConflict(existingEntries, relativePath) {
  if (existingEntries === undefined) {
    return { missing: true };
  }
  if (!Array.isArray(existingEntries)) {
    return conflict(
      "unsupported-existing-hooks",
      `unsupported-existing-hooks: ${relativePath} has a non-array hooks event that cannot be merged safely.`,
    );
  }
  return { entries: existingEntries };
}

function finishManagedEvent(existingEntries, managedEntry, foundExact) {
  if (foundExact) {
    return { entries: cloneEntries(existingEntries) };
  }
  return {
    entries: [...cloneEntries(existingEntries), structuredClone(managedEntry)],
  };
}

function isManagedCommandOrArgumentVariant(existingCommand, managedCommand) {
  return (
    existingCommand === managedCommand ||
    existingCommand.startsWith(`${managedCommand} `)
  );
}

function classifyManagedCommand(
  existing,
  managedCommand,
  managedExact,
  relativePath,
) {
  if (!isManagedCommandOrArgumentVariant(existing.command, managedCommand)) {
    return "continue";
  }
  if (jsonValuesEqual(existing, managedExact)) {
    return "exact";
  }
  return conflict(
    "conflicting-managed-hooks",
    `conflicting-managed-hooks: ${relativePath} has a modified Open Dough handler for command ${managedCommand}.`,
  );
}

function mergeCursorEvent(existingHandlers, managedEntry, relativePath) {
  const managedCommand = managedEntry.command;
  const event = eventArrayOrConflict(existingHandlers, relativePath);
  if (event.error) {
    return event;
  }
  if (event.missing) {
    return { entries: [structuredClone(managedEntry)] };
  }
  let foundExact = false;
  for (const handler of event.entries) {
    if (!isPlainObject(handler) || typeof handler.command !== "string") {
      return conflict(
        "unsupported-existing-hooks",
        `unsupported-existing-hooks: ${relativePath} has an unsupported Cursor handler shape.`,
      );
    }
    const match = classifyManagedCommand(
      handler,
      managedCommand,
      managedEntry,
      relativePath,
    );
    if (match === "continue") {
      continue;
    }
    if (match === "exact") {
      if (foundExact) {
        return duplicateManagedCommandConflict(relativePath, managedCommand);
      }
      foundExact = true;
      continue;
    }
    return match;
  }
  return finishManagedEvent(event.entries, managedEntry, foundExact);
}

function mergeClaudeEvent(existingWrappers, managedWrapper, relativePath) {
  if (
    !isPlainObject(managedWrapper) ||
    !Array.isArray(managedWrapper.hooks) ||
    managedWrapper.hooks.length !== 1
  ) {
    throw new Error(
      `Authoritative Claude fragment entry for ${relativePath} is not a single nested command wrapper.`,
    );
  }
  const managedHook = managedWrapper.hooks[0];
  const managedCommand = managedHook.command;
  if (typeof managedCommand !== "string") {
    throw new Error(
      `Authoritative Claude fragment is missing a managed command for ${relativePath}.`,
    );
  }
  const event = eventArrayOrConflict(existingWrappers, relativePath);
  if (event.error) {
    return event;
  }
  if (event.missing) {
    return { entries: [structuredClone(managedWrapper)] };
  }
  let foundExact = false;
  for (const wrapper of event.entries) {
    if (!isPlainObject(wrapper)) {
      return conflict(
        "unsupported-existing-hooks",
        `unsupported-existing-hooks: ${relativePath} has an unsupported Claude matcher wrapper shape.`,
      );
    }
    if (wrapper.command !== undefined && wrapper.hooks === undefined) {
      return conflict(
        "unsupported-existing-hooks",
        `unsupported-existing-hooks: ${relativePath} has an ambiguous Claude wrapper that mixes command handlers outside the known nested shape.`,
      );
    }
    if (!Array.isArray(wrapper.hooks)) {
      return conflict(
        "unsupported-existing-hooks",
        `unsupported-existing-hooks: ${relativePath} has a Claude matcher without a hooks array.`,
      );
    }
    for (const hook of wrapper.hooks) {
      if (!isPlainObject(hook) || typeof hook.command !== "string") {
        return conflict(
          "unsupported-existing-hooks",
          `unsupported-existing-hooks: ${relativePath} has an unsupported nested Claude hook shape.`,
        );
      }
      const match = classifyManagedCommand(
        hook,
        managedCommand,
        managedHook,
        relativePath,
      );
      if (match === "continue") {
        continue;
      }
      if (match === "exact") {
        if (!jsonValuesEqual(wrapper, managedWrapper)) {
          return conflict(
            "conflicting-managed-hooks",
            `conflicting-managed-hooks: ${relativePath} changes the matcher scope or wrapper shape for command ${managedCommand}.`,
          );
        }
        if (foundExact) {
          return duplicateManagedCommandConflict(relativePath, managedCommand);
        }
        foundExact = true;
        continue;
      }
      return match;
    }
  }
  return finishManagedEvent(event.entries, managedWrapper, foundExact);
}

function mergeHooksMap(existingHooks, fragmentHooks, hostId, relativePath) {
  if (existingHooks !== undefined) {
    if (!isPlainObject(existingHooks)) {
      return conflict(
        "unsupported-existing-hooks",
        `unsupported-existing-hooks: ${relativePath} hooks value is not a JSON object.`,
      );
    }
  }
  const result =
    existingHooks === undefined
      ? {}
      : Object.fromEntries(
          Object.entries(existingHooks).map(([event, value]) => [
            event,
            Array.isArray(value) ? cloneEntries(value) : structuredClone(value),
          ]),
        );

  for (const [event, fragmentEntries] of Object.entries(fragmentHooks)) {
    if (!Array.isArray(fragmentEntries) || fragmentEntries.length !== 1) {
      throw new Error(
        `Authoritative fragment for ${relativePath} must declare exactly one entry for ${event}.`,
      );
    }
    const managedEntry = fragmentEntries[0];
    const existing = result[event];
    const merged =
      hostId === "cursor"
        ? mergeCursorEvent(existing, managedEntry, relativePath)
        : mergeClaudeEvent(existing, managedEntry, relativePath);
    if (merged.error) {
      return merged;
    }
    result[event] = merged.entries;
  }
  return { hooks: result };
}

export function mergeDocument(existingDoc, fragment, hostId, relativePath) {
  if (
    existingDoc !== null &&
    existingDoc !== undefined &&
    !isPlainObject(existingDoc)
  ) {
    return conflict(
      "unsupported-existing-hooks",
      `unsupported-existing-hooks: ${relativePath} is not a JSON object.`,
    );
  }
  const base = isPlainObject(existingDoc) ? structuredClone(existingDoc) : {};
  const mergedHooks = mergeHooksMap(
    base.hooks,
    fragment.hooks,
    hostId,
    relativePath,
  );
  if (mergedHooks.error) {
    return mergedHooks;
  }
  base.hooks = mergedHooks.hooks;
  if (
    hostId === "cursor" &&
    fragment.version !== undefined &&
    base.version === undefined
  ) {
    base.version = fragment.version;
  }
  return { nextDoc: base, changed: !jsonValuesEqual(existingDoc, base) };
}
