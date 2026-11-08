# After the Rain — asset provenance

The new game uses original assets generated with the user's LAN services documented in `~/system/docs/sources/docs/usage/`. No assets from the retired miniature-city game are used.

| Runtime asset | Generator | Original source |
| --- | --- | --- |
| `game/assets/quay.webp` | FLUX.2 klein, seed 3817 | `art/source/quay.png` and `quay.json` |
| `game/assets/garden.webp` | FLUX.2 klein, seed 3818 | `art/source/garden.png` and `garden.json` |
| `game/assets/bridge.webp` | FLUX.2 klein, seed 3819 | `art/source/bridge.png` and `bridge.json` |
| `game/assets/mailboat.glb` | TRELLIS image-large, seed 3817 | FLUX boat image, seed 3820; `art/source/boat.png`, `boat.json`, `trellis.json` |
| `game/assets/music.ogg` | YuE2 BF16, seed 3817 | `art/source/after-the-rain.flac`, `music-job.json`, `music-result.json` |
| `game/assets/water.ogg` | MOSS-SoundEffect v2, seed 3817 | `art/source/water.wav` |
| `game/assets/paper.ogg` | MOSS-SoundEffect v2, seed 3818 | `art/source/paper.wav` |

`game/cover.jpg` is a capture of the new title screen. The favicon and seals are original vector drawings. Boat rocking, steering, wakes, reflections, and fireflies are animated in game code. There are no humanoid actors requiring skeletal animation.

## Prompts and reproduction

The full FLUX prompts and service responses are recorded in the four `art/source/*.json` art records and [generate-assets.py](scripts/generate-assets.py). Landscape images are 1536 × 1024; the boat reference is 1024 × 1024. All use 28 steps and guidance 4. The shared direction is expressive gouache and oil pastel, textured paper, warm copper light, and deep teal river water. The three scenes depict an imagined quay, willow garden, and footbridge, rather than measured reconstructions.

The boat reference depicts a teal wooden mail boat with an ivory canopy, brass lantern, leather satchel, and envelopes on a white background. TRELLIS turns that reference into a textured GLB with 1024² baked texture and 0.95 simplification. The actual GLB is loaded, lit, and steered in the game.

[generate-music.py](scripts/generate-music.py) records the complete YuE2 workflow: instrumental chamber folk, felt piano, nylon guitar, warm cello, 72 BPM; three instrumental section markers; full melody/chord planning; 32 synthesis steps; 65-second duration. The master is retained as FLAC.

[generate-sfx.py](scripts/generate-sfx.py) records both MOSS prompts verbatim: gentle river water against a wooden boat, and a single paper-envelope rustle. Each uses 80 steps, guidance 4, and sigma shift 5. Active components move between CPU and GPU, reducing real weights to BF16 while preserving complex rotary buffers. Other fleet services are left running.

```sh
python3 scripts/generate-assets.py flux --url http://192.168.8.163:7870
python3 scripts/generate-assets.py trellis --url http://192.168.8.186:7871
python3 scripts/generate-music.py
python3 scripts/generate-sfx.py
python3 scripts/prepare-assets.py
```

Image and model generation retain existing outputs when rerun. Music generation submits a new job. Sound generation retains the remote clips if already present. Run GPU jobs sequentially when they share a host.

Runtime backgrounds use WebP, which both StarHermit renderers decode. Audio masters are normalized, given short fades, and encoded as Ogg Vorbis. Source files stay outside the distributable game; play needs no connection to the generation services. The existing repository license and applicable generator terms remain in effect.
