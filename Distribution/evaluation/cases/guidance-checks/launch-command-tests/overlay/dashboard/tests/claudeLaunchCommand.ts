// Reads one recorded `claude --bg` command without coupling an observation
// of its name, model or instruction to the other session options.
export function claudeLaunchCommand(argv: readonly string[] | undefined) {
  const options = new Map<string, string | undefined>();
  let index = 1;
  while (["--name", "--model", "--effort"].includes(argv?.[index] ?? "")) {
    options.set(argv?.[index] ?? "", argv?.[index + 1]);
    index += 2;
  }
  return {
    name: options.get("--name"),
    model: options.get("--model"),
    effort: options.get("--effort"),
    instruction: argv?.[index],
  };
}
