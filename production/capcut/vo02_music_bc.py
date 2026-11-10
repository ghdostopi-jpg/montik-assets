"""KOLAGEN 2 VIDEO hook-variant scores, local synthesis (0 credits).
B "Silk Morning": 92 BPM, Eb major, soft e-piano + finger snaps + warm bass, gentle lift at the gift.
C "Bright Deal": 112 BPM, G major, plucky arps + claps + four-on-the-floor, bell hook on the offer.
usage: python3 vo02_music_bc.py B|C DUR OUT.wav GIFT END"""
import numpy as np, scipy.signal as ss, sys
from scipy.io import wavfile
V=sys.argv[1]; SR=48000; DUR=float(sys.argv[2]); OUT=sys.argv[3]; GIFT=float(sys.argv[4]); END=float(sys.argv[5])
N=int(DUR*SR); L=np.zeros(N); R=np.zeros(N); rng=np.random.default_rng(7 if V=='B' else 11)
hz=lambda m:440*2**((m-69)/12)
def add(sig,t0,pan=0.0,g=1.0):
    i=int(t0*SR)
    if i>=N or i<0: return
    sig=sig[:N-i]*g; L[i:i+len(sig)]+=sig*np.sqrt(0.5*(1-pan)); R[i:i+len(sig)]+=sig*np.sqrt(0.5*(1+pan))
def kick(g=0.6):
    t=np.arange(int(0.28*SR))/SR; f=45+75*np.exp(-t*32); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*12)*g
def snap():
    t=np.arange(int(0.12*SR))/SR; n=rng.standard_normal(len(t)); b,a=ss.butter(2,[1500/(SR/2),7000/(SR/2)],'band'); return ss.lfilter(b,a,n)*np.exp(-t*45)*0.3
def clap():
    t=np.arange(int(0.2*SR))/SR; n=rng.standard_normal(len(t)); b,a=ss.butter(2,[900/(SR/2),6000/(SR/2)],'band')
    env=np.exp(-t*22)*(1+0.6*(np.sin(2*np.pi*90*t)>0)*(t<0.03)); return ss.lfilter(b,a,n)*env*0.32
def hat(g):
    t=np.arange(int(0.05*SR))/SR; n=rng.standard_normal(len(t)); b,a=ss.butter(2,8000/(SR/2),'high'); return ss.lfilter(b,a,n)*np.exp(-t*70)*g
def epiano(m,dur,vel):
    t=np.arange(int((dur+0.6)*SR))/SR; f=hz(m)
    s=np.sin(2*np.pi*f*t+0.3*np.sin(2*np.pi*f*t)*np.exp(-t*4))+0.15*np.sin(2*np.pi*2*f*t)*np.exp(-t*3)
    return s*np.minimum(1,t/0.01)*np.exp(-t*1.2)*np.where(t>dur,np.exp(-(t-dur)*8),1)*vel
def pluck(m,vel):
    t=np.arange(int(0.45*SR))/SR; f=hz(m); s=sum(np.sign(np.sin(2*np.pi*f*k*t))/k**1.7 for k in (1,2,3))*0.45+np.sin(2*np.pi*f*t)*0.55
    b,a=ss.butter(2,4200/(SR/2)); return ss.lfilter(b,a,s)*np.minimum(1,t/0.004)*np.exp(-t*8)*vel
def bell(m,vel):
    t=np.arange(int(1.1*SR))/SR; f=hz(m); return (np.sin(2*np.pi*f*t)+0.5*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*6))*np.exp(-t*3.5)*vel
def bass(m,dur,vel=0.45):
    t=np.arange(int((dur+0.05)*SR))/SR; f=hz(m); s=np.sin(2*np.pi*f*t)+0.12*np.sin(4*np.pi*f*t)
    return s*np.minimum(1,t/0.01)*np.where(t>dur-0.06,np.exp(-(t-dur+0.06)*40),1)*vel*0.4
def pad(ms,dur,vel):
    t=np.arange(int((dur+1.2)*SR))/SR; s=0
    for m in ms:
        for d in (-0.1,0.1): s=s+np.sin(2*np.pi*hz(m)*(1+d/100)*t)
    b,a=ss.butter(2,2000/(SR/2)); s=ss.lfilter(b,a,s); return s*np.minimum(1,t/0.5)*np.where(t>dur,np.exp(-(t-dur)*2.5),1)*vel/len(ms)
if V=='B':
    BPM=92.0; prog=[([63,67,70,74],39),([60,63,67,70],36),([56,60,63,67],32),([58,62,65,68],34)]  # Ebmaj7 Cm7 Abmaj7 Bb7
else:
    BPM=112.0; prog=[([67,71,74,78],43),([64,67,71,74],40),([60,64,67,71],36),([62,66,69,72],38)]  # Gmaj7 Em7 Cmaj7 D7
BEAT=60/BPM; BAR=4*BEAT; t=0.0; bar=0
hook=[0,2,1,3,2,1,0,2]
while t<END-0.05:
    ch,root=prog[bar%4]; lift=1.25 if t>=GIFT-0.1 else 1.0; intro=t<3.2
    add(pad(ch,BAR,(0.08 if V=='B' else 0.05)*lift),t,0)
    for b in range(4):
        tb=t+b*BEAT
        if not intro or V=='C':
            add(kick(0.5 if V=='B' else 0.62),tb,0)
            if b%2: add(snap() if V=='B' else clap(),tb,0.1)
            add(hat(0.06*lift),tb+BEAT/2,0.35)
        add(bass(root-12+(7 if b==3 else 0),BEAT*0.85,0.45),tb)
    if V=='B':
        for j,m in enumerate(ch): add(epiano(m,BEAT*1.6,0.09*lift),t+0.006*j,-0.25+0.15*j)
        for j,m in enumerate(ch[1:]): add(epiano(m+12,BEAT*0.6,0.05*lift),t+BEAT*2.5+0.006*j,0.25)
    else:
        for k,i in enumerate(hook): add(pluck(ch[i]+12,0.08*lift),t+k*BEAT/2,-0.2+0.12*(k%4))
        if t>=GIFT-0.1:
            for k,m in enumerate([ch[3]+12,ch[2]+12,ch[3]+12,ch[1]+24]): add(bell(m,0.06),t+k*BEAT,0.2)
    t+=BAR; bar+=1
root=prog[0][1]; ch=prog[0][0]
add(pad([root]+ch+[ch[1]+12],DUR-END,0.12),END,0); add(bass(root,DUR-END-0.3,0.3),END)
for k,m in enumerate([ch[0]+12,ch[1]+12,ch[2]+12,ch[3]+12]): add(bell(m,0.05),END+0.09*k,0.2)
mix=np.stack([L,R],1)
for d,g in ((0.027,0.15),(0.043,0.11),(0.071,0.08),(0.113,0.05)):
    k=int(d*SR); mix[k:,0]+=mix[:-k,1]*g; mix[k:,1]+=mix[:-k,0]*g
fade=np.ones(N); fl=int(2.0*SR); fade[-fl:]=np.linspace(1,0,fl)**2; fi=int(0.2*SR); fade[:fi]*=np.linspace(0,1,fi)
mix*=fade[:,None]; mix/=np.max(np.abs(mix))/0.89
wavfile.write(OUT,SR,(mix*32767).astype(np.int16)); print('wrote',OUT)
