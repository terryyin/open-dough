import { readdirSync, watch } from "node:fs";
import type { dashboardCommand } from "./dashboardCommand.ts";

type WatchCommand = ReturnType<typeof dashboardCommand>;

// Subscribe first, then read the current state. Both delayed and already
// buffered events are observable, and a stopped watcher ends the wait.
export function observeWatcher<T>(
  command: WatchCommand,
  read: () => T | undefined,
  subscribe: (check: () => void, fail: (error: unknown) => void) => () => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const child = command.child;
    function cleanup() {
      unsubscribe();
      child.off("close", closed);
      child.off("error", fail);
    }
    function fail(error: unknown) {
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    }
    function closed() {
      fail(
        new Error(
          `Watcher exited before the expected event:\n${command.output()}`,
        ),
      );
    }
    function check() {
      try {
        const value = read();
        if (value === undefined) return;
        cleanup();
        resolve(value);
      } catch (error) {
        fail(error);
      }
    }
    const unsubscribe = subscribe(check, fail);
    child.once("close", closed);
    child.once("error", fail);
    check();
    // A child that had already closed cannot notify a newly attached listener.
    if (child.stdout.destroyed && child.stderr.destroyed) closed();
  });
}

export function waitForWatcherOutput(
  command: WatchCommand,
  expected: RegExp,
): Promise<RegExpExecArray> {
  return observeWatcherOutput(
    command,
    (output) => expected.exec(output) ?? undefined,
  );
}

export function observeWatcherOutput<T>(
  command: WatchCommand,
  read: (output: string) => T | undefined,
): Promise<T> {
  return observeWatcher(
    command,
    () => read(command.output()),
    (check) => {
      const { stdout, stderr } = command.child;
      stdout.on("data", check);
      stderr.on("data", check);
      return () => {
        stdout.off("data", check);
        stderr.off("data", check);
      };
    },
  );
}

// macOS can deliver a file event late or not at all under load, so the wait
// also reads the state itself at a short interval.
export function waitForWatcherFile<T>(
  command: WatchCommand,
  file: string,
  read: () => T | undefined,
): Promise<T> {
  return observeWatcher(command, read, (check, fail) => {
    const observer = watch(file, { persistent: false }, check);
    observer.once("error", fail);
    const looking = setInterval(check, 20);
    return () => {
      clearInterval(looking);
      observer.close();
    };
  });
}

// npm can close before retirement, or before a completed retirement's file
// event is delivered. Either event lets us observe the actual directory.
export function waitForEmptyDirectory(
  command: WatchCommand,
  directory: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    function complete() {
      settled = true;
      changes.close();
    }
    function fail(error: unknown) {
      if (settled) return;
      complete();
      reject(error instanceof Error ? error : new Error(String(error)));
    }
    function check() {
      if (settled) return;
      try {
        if (readdirSync(directory).length !== 0) return;
        complete();
        resolve();
      } catch (error) {
        fail(error);
      }
    }
    const changes = watch(directory, { persistent: false }, check);
    changes.once("error", fail);
    void command.exited.then(check, fail);
    check();
  });
}
