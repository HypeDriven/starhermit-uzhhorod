#!/usr/bin/env python3
"""Render two MOSS clips with component offloading; leave fleet services alone."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art/source'
HOST = 'albert@192.168.8.186'
REMOTE = r'''
import os
os.environ['TORCHDYNAMO_DISABLE']='1'
import sys, time
from pathlib import Path
import soundfile as sf
import torch
sys.path.insert(0,str(Path.home()/'ai/MOSS-TTS'))
from moss_soundeffect_v2 import MossSoundEffectPipeline
pipe=MossSoundEffectPipeline.from_pretrained(str(Path.home()/'ai/models/moss-soundeffect-v2'),device='cpu',torch_dtype=torch.bfloat16)
# Preserve complex rotary buffers when reducing real weights to BF16.
for parameter in pipe.engine.parameters():
 if parameter.is_floating_point():parameter.data=parameter.data.to(torch.bfloat16)
for module in pipe.engine.modules():
 for name,buffer in list(module._buffers.items()):
  if buffer is not None and buffer.is_floating_point():module._buffers[name]=buffer.to(torch.bfloat16)
pipe.engine.torch_dtype=torch.bfloat16
pipe.engine.device='cuda'
pipe.engine.vram_management_enabled=True
out=Path('/tmp/uzhhorod-river-assets')
out.mkdir(exist_ok=True)
clips=[
 ('water','Gentle river water lapping against the wooden side of a small boat, soft continuous ripples outdoors, close and calm, no voices, no music',14,16),
 ('paper','A single soft rustle of a thick paper envelope being opened, dry textured paper folding gently, close miked, quiet background, no voice, no music',3,4)
]
for i,(name,prompt,seconds,window) in enumerate(clips):
 target=out/(name+'.wav')
 if target.exists(): continue
 for attempt in range(120):
  free,total=torch.cuda.mem_get_info()
  if free>4.2*1024**3: break
  if attempt==0:print('Waiting for 4.2 GiB GPU headroom',flush=True)
  time.sleep(3)
 else:raise RuntimeError('Not enough GPU headroom; no other services were changed')
 print('Rendering',name,flush=True)
 audio=pipe(prompt=prompt,seconds=seconds,max_inference_seconds=window,num_inference_steps=80,cfg_scale=4,sigma_shift=5,seed=3817+i)
 sf.write(str(target),audio[0].detach().float().cpu().numpy().T,pipe.sample_rate,subtype='PCM_16')
 print('Saved',name,flush=True)
'''
SOURCE.mkdir(parents=True, exist_ok=True)
subprocess.run(['ssh', '-o', 'BatchMode=yes', HOST,
    '~/.local/bin/micromamba run -n moss-sfx python -'], input=REMOTE.encode(), check=True)
for name in ['water', 'paper']:
    result = subprocess.run(['ssh', '-o', 'BatchMode=yes', HOST,
        'cat /tmp/uzhhorod-river-assets/' + name + '.wav'], capture_output=True, check=True)
    (SOURCE / (name + '.wav')).write_bytes(result.stdout)
    print('Downloaded', name, flush=True)
