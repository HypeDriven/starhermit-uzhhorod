#!/usr/bin/env python3
"""Optimize original generated assets for StarHermit's cross-platform decoders."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art/source'
OUT = ROOT / 'game/assets'
OUT.mkdir(parents=True, exist_ok=True)

def convert(source, target, *options):
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-i', str(source), *options, str(target)], check=True)

for name in ['quay', 'garden', 'bridge']:
    convert(SOURCE / (name + '.png'), OUT / (name + '.webp'), '-c:v', 'libwebp', '-quality', '93')
for source, name, filters, quality in [
    ('after-the-rain.flac', 'music', 'afade=t=in:d=2,afade=t=out:st=60:d=5,loudnorm=I=-20:TP=-3:LRA=9', '5'),
    ('water.wav', 'water', 'afade=t=in:d=0.4,afade=t=out:st=13.3:d=0.7,loudnorm=I=-26:TP=-5:LRA=7', '4'),
    ('paper.wav', 'paper', 'afade=t=in:d=0.02,afade=t=out:st=2.4:d=0.6,loudnorm=I=-23:TP=-4:LRA=7', '4'),
]:
    convert(SOURCE / source, OUT / (name + '.ogg'), '-af', filters, '-c:a', 'libvorbis', '-q:a', quality)
print('Prepared three WebP scenes and three Ogg Vorbis clips.')
