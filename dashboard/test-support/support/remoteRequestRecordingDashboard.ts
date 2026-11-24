// A boundary dashboard restarted on a fixture machine with the
// remote-request-recording `git` first on its PATH, for review specs that
// count the fetches and remote requests the Review repository makes. The
// caller closes the returned server.
import {
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { remoteRequestRecordingGit } from "./remoteRequestRecordingGit.ts";

export async function remoteRequestRecordingDashboard(
  dashboard: DashboardServer,
  machine: string,
) {
  await dashboard.close();
  const recording = remoteRequestRecordingGit(machine);
  const server = await startDashboardServer({
    mode: "boundary",
    liveServer: "separate process",
    machine,
    projectFolders: ["open-dough"],
    pathPrefix: [recording.bin],
  });
  return { server, recording };
}
