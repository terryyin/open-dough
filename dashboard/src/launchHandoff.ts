// Where the keyboard rests after a launch dialog handed its startup off
// (`./launchDialogLauncher.ts`): on what the dialog or the startup's end left
// it on (`handoff`), or on no control at all. A later answer of that startup
// may move the keyboard only from there; once the developer moved it, it
// stays where they put it.

export function keyboardRestsOn(
  ...handoff: readonly (Element | null | undefined)[]
): boolean {
  const focused = document.activeElement;
  return (
    focused === null ||
    focused === document.body ||
    handoff.some((place) => place === focused)
  );
}
