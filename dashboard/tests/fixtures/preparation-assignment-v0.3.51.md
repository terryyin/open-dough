# Older preparation command fixture

`preparation-assignment-v0.3.51.mjs.txt` contains unchanged bytes from the released
Open Dough v0.3.51 entry `src/skills/dough-story-refinement/scripts/preparation-assignment.mjs`.

- Release commit: `3bf0011c80be5e2a7834e2a294ed9d96348b3f85`.
- Git blob: `fdf6c75103b797957eed2f941ef57380bae10195`.
- SHA-256: `d783f0a86a348ab937046041964f15475388a6df504cbe1cad9c5666694b4320`.

The retry spec copies this entry into the real fixture installation beside its
existing dependencies. Its operation dispatcher rejects `continue` before running
any dependency. The test observes that rejection with intact established ownership,
then exercises dashboard retry after workspace/branch loss and independent Story B.
The text suffix preserves historical bytes without treating this fixture as current
source. Test runs need neither Git release history nor a network release fetch.
