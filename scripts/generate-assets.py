#!/usr/bin/env python3
"""Generate the After the Rain art with the user's LAN FLUX / TRELLIS services.

Run one stage at a time. Existing outputs are kept, so interrupted runs resume.
"""
import argparse
import base64
import json
from pathlib import Path
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'game/assets'
SOURCE = ROOT / 'art/source'
STYLE = ('An exquisite hand-painted illustration for a literary indie adventure game. '
         'Rich gouache and oil pastel on textured paper, sophisticated atmospheric perspective, '
         'expressive brushwork, restrained small details, cinematic lighting, painterly European animation background. ')
COMPOSITION = ('Wide landscape, looking across a broad calm river from a slightly elevated angle. '
               'The entire lower 55 percent of the image is open uninterrupted river water, '
               'deep petrol teal with long soft rippling reflections, no boats or people in this water. '
               'All buildings and trees are on the distant bank, above the center of the image. '
               'The horizon is at 35 percent from the top. No text, letters, lettering, UI, logos, borders or watermark. ')
ART = {
    'quay': STYLE + COMPOSITION + 'An imagined old Uzhhorod riverside in late afternoon after rain. '
        'A row of weathered peach, ochre and sage townhouses with terracotta roofs, tiny warm windows, '
        'a riverside cafe, ancient broad leafy linden trees, a stone embankment with steps down to the river. '
        'A soft apricot sky and layered green hills. The left foreground has a subtle branch of dark leaves '
        'framing the scene. Tender quiet mood. Muted copper orange and dusty pink against saturated deep teal water.',
    'garden': STYLE + COMPOSITION + 'An imagined Uzhhorod riverside garden at blue hour after rain. '
        'An old pale pink greenhouse, a little ochre cottage, stone steps down to the water, '
        'very old weeping willows, lush tangled foliage and ivory flowers. A peach-lit cloud above '
        'deep lavender hills, tiny amber lamps glowing beneath trees. Lavender and sage, deep petrol blue '
        'water, salmon light. Enchanting but grounded, quiet and intimate.',
    'bridge': STYLE + COMPOSITION + 'An imagined Uzhhorod riverside at nightfall. '
        'A graceful slender pedestrian footbridge crosses the very distant background, above the center, '
        'behind the water. Two cathedral towers and a small hilltop castle appear in silhouette '
        'between dark trees. Old waterfront houses have warm amber windows. '
        'A slim crescent moon in a dusty indigo sky, coral remnants of sunset. '
        'Tiny golden lights reflect in the broad dark blue river. Magical nocturne with a few fireflies.',
    'boat': 'A beautiful single miniature wooden river mail boat, three quarter elevated view from above, '
        'bow pointing toward the right of the image, isolated on plain white background. '
        'Elegant long pointed teal blue wooden hull with copper rubbing strake, honey colored wooden seats, '
        'a short ivory canvas canopy at the stern, a tiny brass lantern, '
        'a leather mail satchel and two cream envelopes inside. No people, no water, no scenery, no text. '
        'Handcrafted tactile model, subtle painted wood grain, refined charming European animation art direction. '
        'Whole boat in frame, clean silhouette, studio lighting, no cast shadow on background.'
}

def call(base, path, payload=None, timeout=1800):
    body = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(base + path, data=body, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.load(response)

def download(base, url, target):
    with urllib.request.urlopen(base + url, timeout=120) as response:
        target.write_bytes(response.read())

def flux(base):
    for i, (name, prompt) in enumerate(ART.items()):
        target = SOURCE / (name + '.png')
        if target.exists():
            print('kept', name, flush=True)
            continue
        print('generating', name, time.strftime('%H:%M:%S'), flush=True)
        result = call(base, '/generate', dict(prompt=prompt, width=1024 if name == 'boat' else 1536,
            height=1024, num_inference_steps=28, guidance_scale=4, seed=3817 + i, return_base64=False))
        download(base, result['images'][0]['url'], target)
        (SOURCE / (name + '.json')).write_text(json.dumps({'prompt': prompt, 'result': result}, indent=2))
        print('saved', target.name, result.get('seconds'), flush=True)

def trellis(base):
    target = OUT / 'mailboat.glb'
    if target.exists():
        return
    source = SOURCE / 'boat.png'
    print('reconstructing mailboat', flush=True)
    result = call(base, '/generate', dict(image=base64.b64encode(source.read_bytes()).decode(),
        formats=['glb'], seed=3817, texture_size=1024, simplify=.95))
    download(base, result['files']['glb']['url'], target)
    (SOURCE / 'trellis.json').write_text(json.dumps(result, indent=2))
    print('saved', target.name, flush=True)

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('stage', choices=['flux', 'trellis'])
    p.add_argument('--url', default='http://192.168.8.163:7870')
    a = p.parse_args()
    SOURCE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    (flux if a.stage == 'flux' else trellis)(a.url)
