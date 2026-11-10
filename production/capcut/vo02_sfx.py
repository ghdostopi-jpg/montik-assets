"""Subtle SFX for KOLAGEN 2 VIDEO, local synthesis: impact, shimmer, whoosh, click, pop."""
import numpy as np, scipy.signal as ss
from scipy.io import wavfile
SR=48000; rng=np.random.default_rng(5)
def w(name,x): x=x/np.max(np.abs(x))*0.8; wavfile.write(name,SR,(np.stack([x,x],1)*32767).astype(np.int16))
t=np.arange(int(0.7*SR))/SR
f=40+90*np.exp(-t*20); body=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*7)
n=rng.standard_normal(len(t)); b,a=ss.butter(2,900/(SR/2)); air=ss.lfilter(b,a,n)*np.exp(-t*14)*0.3
w('sfx_impact.wav',body+air)
t=np.arange(int(1.4*SR))/SR; s=0
for i,m in enumerate([88,93,96,100,105]):
    tt=np.clip(t-i*0.045,0,None); s=s+np.sin(2*np.pi*440*2**((m-69)/12)*tt)*np.exp(-tt*4.5)*(tt>0)
w('sfx_shimmer.wav',s)
t=np.arange(int(0.55*SR))/SR; n=rng.standard_normal(len(t)); fc=600+3000*np.sin(np.pi*t/0.55)
y=np.zeros_like(n); 
for i in range(0,len(n),480):
    b,a=ss.butter(2,[max(200,fc[i]*0.6)/(SR/2),min(20000,fc[i]*1.4)/(SR/2)],'band'); y[i:i+480]=ss.lfilter(b,a,n[i:i+480])
w('sfx_whoosh.wav',y*np.sin(np.pi*t/0.55)**2)
t=np.arange(int(0.06*SR))/SR; w('sfx_click.wav',np.sin(2*np.pi*2400*t)*np.exp(-t*90)+0.3*rng.standard_normal(len(t))*np.exp(-t*200))
t=np.arange(int(0.15*SR))/SR; f=500+700*np.exp(-t*40); w('sfx_pop.wav',np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*25))
print('ok')
