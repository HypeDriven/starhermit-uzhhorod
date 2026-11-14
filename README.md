# Uzhhorod: After the Rain

**[▶ Play Uzhhorod on StarHermit](https://dashboard.starhermit.com/play/aa9ff15f-c11a-4b7a-9d08-09c220917078)**

A quiet river adventure rebuilt around painted scenery, a textured mail boat, and nine lost letters. Sail an imagined stretch of the Uzh through late afternoon, blue hour, and nightfall. Recover each envelope, match its seal to a landing, and leave a small reply.

[Title screen](art/previews/title.jpg) · [River view](art/previews/river.jpg) · [Phone view](art/previews/phone.jpg) · [A letter](art/previews/letter.jpg)

There is no timer or failure state. Reeds slow the boat; letters are never lost. Gentle current removes drift and reed drag. Each reply leaves a different closing line in the chapter. All characters, correspondence, landings, and events are fiction; the scenery is an artistic interpretation of Uzhhorod.

## Play

Click, tap, or hold on the water to steer. Recover an envelope by sailing close to it. Tap the landing with the same seal to sail there and deliver automatically, or press **E** nearby. Three deliveries open the next chapter. Nine complete the journey.

**WASD / arrows:** steer. **Space:** slow down. **E / Enter:** deliver. **1 / 2:** choose a reply. **J:** letters. **Esc:** pause. **M:** sound. **G:** gentle current. In portrait mode the camera follows the boat; the thin river overview lets you sail to distant parts of the scene. Standard gamepad steering and confirmation are supported.

Progress saves locally every two seconds and after deliveries. This new game uses `after-the-rain-v2`; saves from the retired miniature-city game are left intact. Starting over asks for confirmation and keeps sound and current preferences.

## Develop

Requires the official **StarHermit Engine 1.39.0**, Node.js 24+, and TypeScript.

```sh
starhermit types game
node /path/to/typescript/bin/tsc --project game/tsconfig.json
node tests/river.mjs
starhermit check game
starhermit game
starhermit package --web game --out dist
python3 scripts/finish-web.py
```

`game/` is the native script package; `dist/` is the generated web package, using the official pinned engine. The same game code and scene run in both. The game makes no generator calls at play time.

The gameplay tests complete all nine deliveries through the real steering model and entry-point state machine. They also cover bounds, reed drag, braking, chapter gates, invalid saves, reloads, legacy-save isolation, paused time, reset cancellation, touch input, and responsive control bounds.

Native visual checks use `starhermit game --render-check --script tests/native.play`. The browser smoke runner is `node tests/web.mjs dist /path/to/engine/1.39.0`; it uses this workstation's Playwright/Chrome tooling. Native rendering and desktop/phone browser checks pass, including a browser delivery. The finished web package is approximately 4.6 MiB.

Publish with `node scripts/publish.mjs` after committing and pushing to `origin/main`. It uploads exactly the committed `dist/`, updates the existing listing and its cover, verifies every live file against the integrity index, and records the release in ignored `publication.json`. Credentials come from `STARHERMIT_PUBLIC_KEY` / `STARHERMIT_PRIVATE_KEY` or `STARHERMIT_ENV_FILE` (defaults to the parent directory's `.env`). `--dry-run` validates the committed package without publishing.

## Assets

The original art pipeline uses the generators documented in `~/system`: FLUX for the three painted river scenes and mail boat reference, TRELLIS for the textured boat mesh, YuE2 for the instrumental score, and MOSS for sound effects. See [ARTWORK.md](ARTWORK.md) for prompts, generation scripts, and provenance. Sources remain in `art/source/`; runtime assets are optimized separately.

## License

First-party code, documentation, and original assets use the repository's [LICENSE](LICENSE): PolyForm Noncommercial 1.0.0 with the existing StarHermit publishing permission. Generator and engine components retain their own terms. No engine binaries are committed here.
