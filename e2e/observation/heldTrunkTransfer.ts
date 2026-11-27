// A cold open's verified Git trunk check of `repository`, held at the
// origin's upload-pack under the dashboard's `home`: `held` settles once a
// transfer waits, `log` reads the gate's calls, and `release` lets it finish.
// Git is blocked in the gate's read, so `release` blocks until it is read;
// `releaseIfHeld` signals only a waiting reader and otherwise does nothing.
// The dashboard server's close ends a transfer still held with its process
// group.
import { readFileSync } from "node:fs";
import {
  heldUploadPack,
  readUntilClosed,
  signalFifo,
} from "../../dashboard/backend-tests/review/verifiedOriginTrunkCase.ts";
import { routedOrigin } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { homeReviewRepository } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";

export function holdTrunkTransfer(home: string, repository: string) {
  const pack = heldUploadPack(
    home,
    homeReviewRepository(home, repository),
    routedOrigin(home, repository),
  );
  return {
    held: readUntilClosed(pack.heldFifo),
    log: () => readFileSync(pack.log, "utf8"),
    release: () => signalFifo(pack.releaseFifo, true),
    releaseIfHeld: () => signalFifo(pack.releaseFifo, false),
  };
}
