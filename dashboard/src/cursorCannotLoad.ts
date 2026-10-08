// Provisional contract sentence for a Cursor resume that cannot load the
// recorded chat. Native cursor-agent (2026.10.01-e373342) still opens an empty
// composer instead of exiting with cannot-load text. Replace with the observed
// native sentence when one exists.
export const cursorCannotLoadChat = "Cursor could not load this chat.";

export function showsCursorCannotLoad(text: string): boolean {
  return text.includes(cursorCannotLoadChat);
}
