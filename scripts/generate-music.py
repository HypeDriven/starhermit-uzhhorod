#!/usr/bin/env python3
"""Generate and download an original instrumental through the local YuE2 service."""
import json
from pathlib import Path
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = 'http://192.168.8.163:8188'

def request(path, data=None):
    req = urllib.request.Request(BASE + path, data=None if data is None else json.dumps(data).encode(),
        headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.load(response)

def node(kind, **inputs):
    return {'class_type': kind, 'inputs': inputs}

style = ('Instrumental acoustic chamber folk soundtrack for a quiet river journey, '
    'gentle felt piano, delicate nylon guitar, warm cello, soft brushed textures, '
    'nostalgic and hopeful, unhurried 72 BPM, no drums, no vocals, no singing, no speech')
common = dict(style=style, lyrics='[Instrumental]\n[Instrumental]\n[Instrumental]', seed=3817, mode='full')
prompt = {
    '1': node('CheckpointLoaderSimple', ckpt_name='yue2_3b_bf16.safetensors'),
    '2': node('YuE2GenerateABC', clip=['1', 1], **common, max_abc_tokens=4096,
        temperature=.7, top_p=.9, top_k=30, repetition_penalty=1.005, penalty_window=100),
    '3': node('YuE2GenerateMusic', clip=['1', 1], abc=['2', 0], **common,
        max_duration=65, temperature=1., top_p=.95, top_k=100, repetition_penalty=1.2, cfg_scale=1.),
    '4': node('EmptyYuE2LatentAudio', seconds=['3', 1], batch_size=1),
    '5': node('ConditioningZeroOut', conditioning=['3', 0]),
    '6': node('KSampler', model=['1', 0], positive=['3', 0], negative=['5', 0],
        latent_image=['4', 0], seed=3817, steps=32, cfg=1., sampler_name='dpm_2',
        scheduler='sgm_uniform', denoise=1.),
    '7': node('VAEDecodeAudio', samples=['6', 0], vae=['1', 2]),
    '8': node('SaveAudioAdvanced', audio=['7', 0], filename_prefix='uzhhorod/after-the-rain', format='flac'),
}
job = request('/prompt', {'prompt': prompt})
job_id = job['prompt_id']
print('YuE2 job', job_id, flush=True)
out = ROOT / 'art/source'
out.mkdir(parents=True, exist_ok=True)
(out / 'music-job.json').write_text(json.dumps({'job': job, 'workflow': prompt}, indent=2))
for _ in range(720):
    history = request('/history/' + job_id)
    if job_id in history:
        result = history[job_id]
        (out / 'music-result.json').write_text(json.dumps(result, indent=2))
        if result.get('status', {}).get('status_str') != 'success':
            raise SystemExit('YuE2 generation failed: ' + str(result.get('status')))
        audio = result['outputs']['8']['audio'][0]
        with urllib.request.urlopen(BASE + '/view?' + urllib.parse.urlencode(audio), timeout=120) as response:
            (out / 'after-the-rain.flac').write_bytes(response.read())
        print('saved music', flush=True)
        break
    time.sleep(5)
else:
    raise SystemExit('YuE2 timed out')
