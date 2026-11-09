"""BF Video 02 v2 score "Green Ribbon Pop" - local synthesis, 0 credits. 120 BPM, A major, bright retail pop:
four-on-the-floor soft kick, claps on 2/4, offbeat hats, plucky synth chords, round bass, bell hook; drops out
for 1 bar at the -60% slam and the -25% stamp, lifts in the CTA. usage: python3 bf02v2_music.py DUR OUT.wav"""
import numpy as np, scipy.signal as ss, sys
from scipy.io import wavfile
SR = 48000; DUR = float(sys.argv[1]); OUT = sys.argv[2]
BPM = 120.0; BEAT = 60 / BPM; BAR = 4 * BEAT
N = int(DUR * SR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(2611)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def add(sig, t0, pan=0.0, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i] * g; L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan)); R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))
def kick():
    t = np.arange(int(0.32 * SR)) / SR; f = 48 + 90 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9
def clap():
    t = np.arange(int(0.22 * SR)) / SR; n = rng.standard_normal(len(t)); b, a = ss.butter(2, [900 / (SR / 2), 6000 / (SR / 2)], "band")
    env = np.exp(-t * 22) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03)); return ss.lfilter(b, a, n) * env * 0.35
def hat(g=0.12):
    t = np.arange(int(0.06 * SR)) / SR; n = rng.standard_normal(len(t)); b, a = ss.butter(2, 8000 / (SR / 2), "high"); return ss.lfilter(b, a, n) * np.exp(-t * 60) * g
def pluck(m, dur=0.22, vel=0.3):
    t = np.arange(int((dur + 0.25) * SR)) / SR; f = hz(m)
    s = sum(np.sign(np.sin(2 * np.pi * f * k * t + k)) / k ** 1.6 for k in (1, 2, 3)) * 0.4 + np.sin(2 * np.pi * f * t) * 0.6
    b, a = ss.butter(2, 3800 / (SR / 2)); s = ss.lfilter(b, a, s)
    return s * np.minimum(1, t / 0.004) * np.exp(-t * 7) * vel
def bass(m, dur, vel=0.5):
    t = np.arange(int((dur + 0.05) * SR)) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t); env = np.minimum(1, t / 0.006) * np.where(t > dur - 0.04, np.exp(-(t - dur + 0.04) * 60), 1)
    return s * env * vel * 0.45
def bell(m, vel=0.2):
    t = np.arange(int(1.2 * SR)) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)) * np.exp(-t * 3.5) * vel
prog = [([57, 61, 64, 68], 45), ([54, 57, 61, 64], 42), ([50, 54, 57, 61], 38), ([52, 56, 59, 62], 40)]  # Amaj7 F#m7 Dmaj7 E7
hook = [76, 73, 76, 78, 76, 73, 71, 73]
BREAKS = [(1.70, 1.70 + BEAT * 2), (29.2 + 1.15, 29.2 + 1.15 + BEAT * 1)]  # drums out for the slams
inbreak = lambda t: any(a <= t < b for a, b in BREAKS)
t = 0.0; bar = 0
while t < DUR - 0.2:
    ch, root = prog[bar % 4]; lift = 1.15 if t > 35.4 else 1.0
    for b in range(4):
        tb = t + b * BEAT
        if not inbreak(tb):
            add(kick(), tb, 0, 0.75 * (0.6 if t < 0.5 else 1))
            if b % 2: add(clap(), tb, 0.1, 0.8)
            add(hat(0.10 * lift), tb + BEAT / 2, 0.4)
        for k in range(2):  # plucky offbeat chords
            for j, m in enumerate(ch): add(pluck(m + 12, 0.16, 0.10 * lift), tb + BEAT / 2 * k + 0.004 * j, -0.3 + 0.2 * j)
        add(bass(root - 12 + (7 if b == 3 else 0), BEAT * 0.9, 0.55), tb)
    if bar % 2 == 1 or t > 35.4:
        for k, m in enumerate(hook): add(bell(m, 0.10 * lift), t + k * BEAT / 2, 0.25)
    t += BAR; bar += 1
mix = np.stack([L, R], 1)
for d, g in ((0.021, 0.14), (0.037, 0.10), (0.061, 0.07)):
    k = int(d * SR); mix[k:, 0] += mix[:-k, 1] * g; mix[k:, 1] += mix[:-k, 0] * g
fade = np.ones(N); fl = int(1.8 * SR); fade[-fl:] = np.linspace(1, 0, fl) ** 2; mix *= fade[:, None]
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write(OUT, SR, (mix * 32767).astype(np.int16)); print("wrote", OUT)
