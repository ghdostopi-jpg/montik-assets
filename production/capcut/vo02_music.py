"""KOLAGEN 2 VIDEO score "Ivory Pulse" - local synthesis, 0 credits. 104 BPM, F major, clean premium beauty:
soft kick + rim, airy pad, round bass, marimba-like plucked arpeggio; lifts at the Q10 gift (GIFT) and resolves on a
held Fmaj9 under the end card. usage: python3 vo02_music.py DUR OUT.wav GIFT END"""
import numpy as np, scipy.signal as ss, sys
from scipy.io import wavfile
SR=48000; DUR=float(sys.argv[1]); OUT=sys.argv[2]; GIFT=float(sys.argv[3]); END=float(sys.argv[4])
BPM=104.0; BEAT=60/BPM; BAR=4*BEAT; N=int(DUR*SR); L=np.zeros(N); R=np.zeros(N); rng=np.random.default_rng(22)
hz=lambda m:440*2**((m-69)/12)
def add(sig,t0,pan=0.0,g=1.0):
    i=int(t0*SR)
    if i>=N or i<0: return
    sig=sig[:N-i]*g; L[i:i+len(sig)]+=sig*np.sqrt(0.5*(1-pan)); R[i:i+len(sig)]+=sig*np.sqrt(0.5*(1+pan))
def kick():
    t=np.arange(int(0.28*SR))/SR; f=46+70*np.exp(-t*34); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*13)*0.6
def rim():
    t=np.arange(int(0.08*SR))/SR; n=rng.standard_normal(len(t)); b,a=ss.butter(2,[1800/(SR/2),6000/(SR/2)],'band'); return (ss.lfilter(b,a,n)*0.5+np.sin(2*np.pi*1700*t)*0.3)*np.exp(-t*60)*0.25
def shaker(g):
    t=np.arange(int(0.07*SR))/SR; n=rng.standard_normal(len(t)); b,a=ss.butter(2,7000/(SR/2),'high'); return ss.lfilter(b,a,n)*np.exp(-t*45)*g
def marimba(m,vel):
    t=np.arange(int(0.6*SR))/SR; f=hz(m); return (np.sin(2*np.pi*f*t)+0.25*np.sin(2*np.pi*4*f*t)*np.exp(-t*30))*np.exp(-t*7)*vel
def bass(m,dur,vel=0.45):
    t=np.arange(int((dur+0.05)*SR))/SR; f=hz(m); s=np.sin(2*np.pi*f*t)+0.12*np.sin(4*np.pi*f*t)
    return s*np.minimum(1,t/0.01)*np.where(t>dur-0.06,np.exp(-(t-dur+0.06)*40),1)*vel*0.4
def pad(ms,dur,vel):
    t=np.arange(int((dur+1.2)*SR))/SR; s=0
    for m in ms:
        for d in (-0.1,0.1): s=s+np.sin(2*np.pi*hz(m)*(1+d/100)*t)
    b,a=ss.butter(2,2200/(SR/2)); s=ss.lfilter(b,a,s); env=np.minimum(1,t/0.5)*np.where(t>dur,np.exp(-(t-dur)*2.5),1); return s*env*vel/len(ms)
prog=[([65,69,72,76],41),([62,65,69,72],38),([58,62,65,69],34),([60,64,67,70],36)]  # Fmaj7 Dm7 Bbmaj7 C7
arp=[0,2,1,3,2,1,3,2]
t=0.0; bar=0
while t<END-0.05:
    ch,root=prog[bar%4]; lift=1.25 if t>=GIFT-0.1 else 1.0; intro=t<3.2
    add(pad(ch,BAR,0.07*lift),t,0)
    for b in range(4):
        tb=t+b*BEAT
        if not intro:
            if b in (0,2): add(kick(),tb,0,0.55)
            if b in (1,3): add(rim(),tb,0.1)
            add(shaker(0.05*lift),tb+BEAT/2,0.3)
        add(bass(root-12+(7 if b==3 else 0),BEAT*0.85,0.45 if not intro else 0.25),tb)
    for k,i in enumerate(arp): add(marimba(ch[i]+12,0.07*lift*(0.7 if intro else 1)),t+k*BEAT/2,-0.2+0.1*(k%4))
    t+=BAR; bar+=1
# resolution: held Fmaj9 under the end card
add(pad([53,65,69,72,76,79],DUR-END,0.12),END,0); add(bass(41-12+12,DUR-END-0.3,0.35),END)
for k,m in enumerate([77,81,84,88]): add(marimba(m,0.06),END+0.08*k,0.2)
mix=np.stack([L,R],1)
for d,g in ((0.027,0.15),(0.043,0.11),(0.071,0.08),(0.113,0.05)):
    k=int(d*SR); mix[k:,0]+=mix[:-k,1]*g; mix[k:,1]+=mix[:-k,0]*g
fade=np.ones(N); fl=int(2.0*SR); fade[-fl:]=np.linspace(1,0,fl)**2; fi=int(0.25*SR); fade[:fi]*=np.linspace(0,1,fi)
mix*=fade[:,None]; mix/=np.max(np.abs(mix))/0.89
wavfile.write(OUT,SR,(mix*32767).astype(np.int16)); print('wrote',OUT)
