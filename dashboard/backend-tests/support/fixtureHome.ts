// A backend case's machine HOME: the fixture directory it stubs as HOME also
// routes the configured repository's GitHub URL to the case's origin.
import { delimiter } from "node:path";
import { vi } from "vitest";
import { routeOriginThroughHome } from "../../test-support/support/fixtureOriginRoute.ts";
import { remoteRequestRecordingGit } from "../../test-support/support/remoteRequestRecordingGit.ts";

// The repository a backend case's configured project names; its fixture HOME
// routes this repository to the case's origin.
export const fixtureRepository = "terryyin/open-dough";

export function stubFixtureHome(home: string, origin: string): void {
  routeOriginThroughHome(home, origin, fixtureRepository);
  vi.stubEnv("HOME", home);
}

// Records every remote request the case's Git makes from here on, logged
// under the case's machine directory.
export function stubRemoteRequestRecording(machine: string) {
  const recording = remoteRequestRecordingGit(machine);
  vi.stubEnv("PATH", `${recording.bin}${delimiter}${process.env.PATH ?? ""}`);
  return recording;
}
