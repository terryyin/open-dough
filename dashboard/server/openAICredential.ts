// One machine credential, shared by dev and preview. Read afresh for every use;
// no environment import, cache, or provider request is part of configuration.
import { randomUUID } from "node:crypto";
import {
  chmodSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

// The local JSON admission allows 32 KiB; our canonical file adds one newline.
// Both writes and reads bound the serialized UTF-8 bytes, not key characters.
const credentialLimitBytes = 32 * 1024 + 1;

export class OpenAICredentialProblem extends Error {}
export function openAICredentialFile(): string {
  return path.join(homedir(), ".open-dough/dashboard/credentials/openai.json");
}

function credentialDirectoryIsSafe(): void {
  try {
    const directory = lstatSync(path.dirname(openAICredentialFile()));
    if (!directory.isDirectory() || directory.isSymbolicLink())
      throw new Error();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export function readOpenAIAPIKey(): string | undefined {
  try {
    credentialDirectoryIsSafe();
    const file = openAICredentialFile();
    // Refuse directories and symbolic links rather than reading unrelated files.
    let stat;
    try {
      stat = lstatSync(file);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    }
    if (!stat.isFile() || stat.size > credentialLimitBytes) throw new Error();
    const value: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (
      typeof value !== "object" ||
      value === null ||
      !("apiKey" in value) ||
      typeof value.apiKey !== "string" ||
      !value.apiKey.trim()
    )
      throw new Error();
    return value.apiKey;
  } catch {
    throw new OpenAICredentialProblem(
      "The saved OpenAI API key could not be read. Check its file permissions, replace it, or remove it in System settings.",
    );
  }
}

export function saveOpenAIAPIKey(apiKey: string): void {
  const file = openAICredentialFile();
  const directory = path.dirname(file);
  const temporary = `${file}.${randomUUID()}.tmp`;
  const serialized = `${JSON.stringify({ apiKey })}\n`;
  if (Buffer.byteLength(serialized, "utf8") > credentialLimitBytes)
    throw new OpenAICredentialProblem(
      "The API key is too large to save. The previous key was kept.",
    );
  try {
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    credentialDirectoryIsSafe();
    chmodSync(directory, 0o700);
    writeFileSync(temporary, serialized, { flag: "wx", mode: 0o600 });
    renameSync(temporary, file);
  } catch {
    throw new OpenAICredentialProblem(
      "The OpenAI API key could not be saved. Check the credential folder permissions and retry; the previous key was kept.",
    );
  } finally {
    try {
      rmSync(temporary, { force: true });
    } catch {
      /* Preserve the original safe error. */
    }
  }
}

export function removeOpenAIAPIKey(): void {
  try {
    credentialDirectoryIsSafe();
    unlinkSync(openAICredentialFile());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw new OpenAICredentialProblem(
      "The OpenAI API key could not be removed. Check the credential folder permissions and retry; the previous key was kept.",
    );
  }
}
