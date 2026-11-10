"""Build CapCut drafts 'KOLAGEN 2 VIDEO HOOK B' / 'HOOK C' (VO02 product/offer ad, new hooks).
Schema template: MAGNEZIJ draft (same CapCut build). CapCut-native looks come from capcut_lib.json, harvested from
the user's own drafts (transitions, video effects, stickers, text animations already in their CapCut cache).
Media are referenced inside the draft folder (Resources/media) so CapCut's sandbox can read them without relinking.
usage: python3 build_hooks.py B|C"""
import json, copy, uuid, subprocess, sys, os, time
V = sys.argv[1]
NAME = f'KOLAGEN 2 VIDEO HOOK {V}'
ROOT = '/Users/renegermek/Movies/CapCut/User Data/Projects/com.lveditor.draft'
MAC = f'{ROOT}/{NAME}/Resources/media/'
OUT = f'/home/claude/capcut/hooks/{V}'; os.makedirs(OUT, exist_ok=True)
T = json.load(open('/home/claude/capcut/mg/draft_info.json')); M = T['materials']
LIB = json.load(open('/home/claude/capcut/capcut_lib.json'))
US = lambda s: int(round(s * 1_000_000)); uid = lambda: uuid.uuid4().hex; UID = lambda: str(uuid.uuid4()).upper()
MEDIA = {}  # mac file name -> local source path (for copying + meta)

def probe(p):
    j = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=width,height,codec_type', '-of', 'json', p], capture_output=True, text=True).stdout)
    v = [s for s in j['streams'] if s['codec_type'] == 'video']
    return float(j['format'].get('duration', 0) or 0), (v[0]['width'] if v else 0), (v[0]['height'] if v else 0), any(s['codec_type'] == 'audio' for s in j['streams'])

idx = {}
for k, arr in M.items():
    if isinstance(arr, list):
        for x in arr:
            if isinstance(x, dict) and 'id' in x: idx[x['id']] = k
tmpl = {t['name']: t for t in T['tracks']}
tseg = lambda name: tmpl[name]['segments'][0]
NEWM = {k: ([] if isinstance(v, list) else copy.deepcopy(v)) for k, v in M.items()}
for k in ('video_effects', 'stickers', 'material_animations', 'transitions'): NEWM.setdefault(k, [])

def add_extras(seg_t, speed=1.0):
    ids = []
    for r in seg_t['extra_material_refs']:
        k = idx[r]
        if k in ('transitions', 'material_animations'): continue
        o = copy.deepcopy(next(x for x in M[k] if x['id'] == r)); o['id'] = UID()
        if k == 'speeds': o['speed'] = speed; o['mode'] = 0; o['curve_speed'] = None
        NEWM[k].append(o); ids.append(o['id'])
    return ids

def video_material(fname, local, photo=False):
    dur, w, h, has_a = probe(local); MEDIA[fname] = local
    v = copy.deepcopy(M['videos'][0]); v['id'] = uid(); v['path'] = MAC + fname; v['material_name'] = fname
    v['duration'] = 10800000000 if photo else US(dur); v['width'] = w; v['height'] = h; v['has_audio'] = has_a
    v['type'] = 'photo' if photo else 'video'; v['local_material_id'] = v['id']
    NEWM['videos'].append(v); return v

def audio_material(fname, local, typ='extract_music'):
    dur = probe(local)[0]; MEDIA[fname] = local
    a = copy.deepcopy(M['audios'][0]); a['id'] = uid(); a['name'] = fname; a['path'] = MAC + fname; a['duration'] = US(dur)
    a['type'] = typ; a['music_id'] = a['id']; a['local_material_id'] = a['id']; a['wave_points'] = []
    NEWM['audios'].append(a); return a

def kf(prop, pts):
    return {"id": uid(), "material_id": "", "property_type": prop, "keyframe_list": [
        {"id": uid(), "curveType": "Line", "time_offset": US(t), "left_control": {"x": 0.0, "y": 0.0}, "right_control": {"x": 0.0, "y": 0.0},
         "values": [val], "string_value": "", "graphID": ""} for t, val in pts]}

def anim_container(ins=None, outs=None, seg_dur=0.0):
    anims = []
    for key, d, is_out in ((ins, None, False), (outs, None, True)):
        if not key: continue
        name, dur = key; a = copy.deepcopy(LIB['anim'][name]['anim']); a['duration'] = US(dur)
        a['start'] = US(seg_dur - dur) if is_out else 0; anims.append(a)
    c = {"id": UID(), "type": "sticker_animation", "animations": anims, "multi_language_current": "none"}
    NEWM['material_animations'].append(c); return c['id']

def vseg(tname, mat, start, end, off=0.0, rate=1.0, z=None, ty=0.0, tx=0.0, scale=None, kfs=None, track_ri=0, ri=0, anim=None):
    s = copy.deepcopy(tseg(tname)); s['id'] = uid(); s['material_id'] = mat['id']
    tdur = US(end - start); s['target_timerange'] = {'start': US(start), 'duration': tdur}
    s['source_timerange'] = {'start': US(off), 'duration': int(round(tdur * rate))}
    s['speed'] = rate; s['extra_material_refs'] = add_extras(tseg(tname), rate)
    sc = scale if scale else (z[0] if z else 1.0)
    s['clip'] = {'scale': {'x': sc, 'y': sc}, 'rotation': 0.0, 'transform': {'x': tx, 'y': ty}, 'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
    s['uniform_scale'] = {'on': True, 'value': 1.0}
    s['common_keyframes'] = kfs or ([kf('KFTypeScaleX', [(0, z[0]), ((end - start) - 1e-6, z[1])])] if z else [])
    if anim: s['extra_material_refs'].append(anim_container(anim.get('in'), anim.get('out'), end - start))
    s['keyframe_refs'] = []; s['render_index'] = ri; s['track_render_index'] = track_ri; s['volume'] = 0.0 if tname == 'MAIN' else 1.0
    return s

def aseg(tname, mat, start, dur=None, off=0.0, vol=1.0):
    s = copy.deepcopy(tseg(tname)); s['id'] = uid(); s['material_id'] = mat['id']
    d = US(dur) if dur else mat['duration'] - US(off)
    s['target_timerange'] = {'start': US(start), 'duration': d}; s['source_timerange'] = {'start': US(off), 'duration': d}
    s['extra_material_refs'] = add_extras(tseg(tname)); s['volume'] = vol; s['speed'] = 1.0; s['common_keyframes'] = []; s['keyframe_refs'] = []
    return s

GOLD = [0.886, 0.745, 0.416]; WHITE = [1.0, 1.0, 1.0]; INK = [0.05, 0.09, 0.07]
def text_material(text, size=11.0, bg=None, color=WHITE, accent=GOLD, stroke=0.11, stroke_col=None):
    t = copy.deepcopy(M['texts'][0]); t['id'] = uid(); t['type'] = 'text'
    plain = text.replace('*', ''); styles = []; pos = 0
    for i, part in enumerate(text.split('*')):
        if not part: continue
        n = len(part.encode('utf-16-le')) // 2
        st = {"fill": {"alpha": 1.0, "content": {"render_type": "solid", "solid": {"alpha": 1.0, "color": accent if i % 2 else color}}},
              "range": [pos, pos + n], "size": size, "bold": True, "italic": False, "underline": False}
        if stroke: st["strokes"] = [{"content": {"solid": {"alpha": 1.0, "color": stroke_col or INK}}, "width": stroke}]
        styles.append(st); pos += n
    t['content'] = json.dumps({"styles": styles, "text": plain}, ensure_ascii=False); t['font_size'] = size
    t['has_shadow'] = True; t['shadow_color'] = '#000000'; t['shadow_alpha'] = 0.55; t['shadow_smoothing'] = 0.45; t['shadow_distance'] = 5.0
    t['shadow_point'] = {"x": 0.6, "y": -0.6}; t['shadow_angle'] = -45.0
    if bg:
        t['background_style'] = 1; t['background_color'] = bg; t['background_alpha'] = 0.92; t['background_round_radius'] = 0.35
        t['background_width'] = 0.16; t['background_height'] = 0.16
    NEWM['texts'].append(t); return t

def tseg_text(mat, a, b, y=-0.458, anim=None, ri=None):
    s = copy.deepcopy(tseg('CAPTIONS')); s['id'] = uid(); s['material_id'] = mat['id']
    s['target_timerange'] = {'start': US(a), 'duration': US(b - a)}; s['clip']['transform'] = {'x': 0.0, 'y': y}; s['clip']['scale'] = {'x': 1.0, 'y': 1.0}
    s['extra_material_refs'] = []
    if anim: s['extra_material_refs'].append(anim_container(anim.get('in'), anim.get('out'), b - a))
    if ri: s['render_index'] = ri
    return s

def transition_after(seg, name, dur):
    tr = copy.deepcopy(LIB['transitions'][name]); tr['id'] = UID(); tr['duration'] = US(dur)
    NEWM['transitions'].append(tr); seg['extra_material_refs'].append(tr['id'])

def fx_seg(name, a, b, ri=11004, tri=0):
    m = copy.deepcopy(LIB['video_effects'][name]); m['id'] = UID(); NEWM['video_effects'].append(m)
    s = copy.deepcopy(LIB['examples']['fx_seg']); s['id'] = UID(); s['material_id'] = m['id']
    s['target_timerange'] = {'start': US(a), 'duration': US(b - a)}; s['render_index'] = ri; s['track_render_index'] = tri; return s

def st_seg(name, a, b, x, y, scale=1.0, ri=14030, tri=0, anim=None):
    m = copy.deepcopy(LIB['stickers'][name]); m['id'] = UID(); NEWM['stickers'].append(m)
    s = copy.deepcopy(LIB['examples']['st_seg']); s['id'] = UID(); s['material_id'] = m['id']
    s['target_timerange'] = {'start': US(a), 'duration': US(b - a)}
    s['clip']['transform'] = {'x': x, 'y': y}; s['clip']['scale'] = {'x': scale, 'y': scale}; s['render_index'] = ri; s['track_render_index'] = tri
    s['extra_material_refs'] = [anim_container(anim.get('in'), anim.get('out'), b - a)] if anim else []
    return s

# ---------------- variant config ----------------
LF = '/home/claude/montik-assets/remotion/public/vo01/'; LC = '/home/claude/vo02/capcut/'; LA = '/home/claude/vo02/audio/'
LP = '/home/claude/montik-assets/remotion/public/vo02/'
# Body (3.4 s -> end) is identical to the approved Hook A: same shots, offsets, graphics, captions, VO and SFX.
BODY = [('P21', 3.4, 5.4, 1.6, 1, (1.0, 1.05), 0), ('M8', 5.4, 7.0, 2.2, 1, (1.0, 1.03), 0), ('M2', 7.0, 8.6, 2.8, 1, (1.04, 1.0), 0),
        ('P38', 8.6, 10.3, 3.0, 1, (1.0, 1.06), 0), ('S01_INGREDIENTS.mp4', 10.3, 14.4, 0, 1, None, 0),
        ('P22', 14.4, 16.0, 0.8, 1, (1.0, 1.03), 0), ('M6', 16.0, 18.0, 1.2, 1, (1.0, 1.04), 0), ('P20', 18.0, 19.4, 0.4, 1, (1.04, 1.0), 0),
        ('S02_Q10_GIFT_REVEAL.mp4', 19.4, 24.5, 0, 1, None, 0), ('P8', 24.5, 26.9, 0.5, 0.5, (1.2, 1.28), -0.17), ('S03_END_CARD.mp4', 26.9, 33.5, 0, 1, None, 0)]
BODY_TRANS = ['Slow Fade', 'Slow Fade', 'Slow Fade', 'Pull in', 'Slow Fade', 'Slow Fade', 'Slow Fade', 'Pull in', 'Slow Fade', 'Slow Fade']
BODY_FX = [('Divine Glow', 21.15, 22.6), ('Light Bokeh', 27.3, 33.5)]
BODY_STICK = [('Sparkles EN White Simple Minimalist', 21.3, 23.4, -0.38, 0.12, 0.8, {'in': ('in:Pop In', 0.3)})]
#   clip, a, b, src_off, rate, zoom(a->b), ty
if V == 'B':
    EDL = [('M1', 0.0, 1.95, 0.0, 0.85, (1.0, 1.07), 0), ('CB2', 1.95, 3.4, 0.5, 1, (1.07, 1.0), 0)] + BODY
    TRANS = ['Wispy Fade', 'Camera Glow'] + BODY_TRANS
    TDUR = 0.4
    HOOK_SUBS = [{"t": "Tvoja *Collagen* rutina", "a": 0.09, "b": 1.61}, {"t": "dolazi sa *dodatnim poklonom*.", "a": 1.61, "b": 3.40}]
    TITLES = [("TVOJA *COLLAGEN*\nRUTINA", 0.12, 1.95, 0.34, 15.0, '#0F3B2A', {'in': ('in:Wiping In', 0.5), 'out': ('out:Fade Out', 0.25)}),
              ("+ *DODATNI POKLON*", 2.0, 3.4, 0.34, 14.0, '#0F3B2A', {'in': ('in:Bounce In', 0.55)})]
    FX = [('Dreamy Glow', 0.0, 1.95)] + BODY_FX
    STICK = [('Sparkles EN White Simple Minimalist', 2.25, 3.4, 0.36, 0.48, 0.9, {'in': ('in:Pop In', 0.3)})] + BODY_STICK
    SUB_ANIM = {'in': ('in:Slide Up', 0.25)}
    MUSIC = ('MUSIC_silk_morning.wav', LA + 'music_B.wav'); VO0 = LA + 'cc/VO02_SR_mina_0B.wav'
    HOOK_SFX = [('whoosh', 1.80, 0.05), ('shimmer', 2.30, 0.10)]
    PHOTOS = []
else:
    EDL = [('M3', 0.0, 1.6, 0.0, 0.6, (1.0, 1.08), 0), ('P23', 1.6, 3.4, 0.1, 1, (1.06, 1.0), 0)] + BODY
    TRANS = ['Flash Zoom', 'Straight Zoom'] + BODY_TRANS
    TDUR = 0.35
    HOOK_SUBS = [{"t": "*Dva pakovanja* Collagena.", "a": 0.05, "b": 1.55}, {"t": "Još jedan proizvod *gratis*.", "a": 1.55, "b": 3.40}]
    TITLES = [("*2×* COLLAGEN", 0.05, 3.4, 0.36, 17.0, '#0F3B2A', {'in': ('in:Pop In', 0.35)}),
              ("+1 PROIZVOD *GRATIS*", 1.62, 3.4, 0.22, 12.0, '#0F3B2A', {'in': ('in:Bounce In', 0.5)})]
    FX = [('Zoom Lens', 0.0, 0.7)] + BODY_FX
    STICK = [('Sparkles EN White Simple Minimalist', 1.75, 3.4, 0.62, -0.02, 0.85, {'in': ('in:Pop In', 0.3)})] + BODY_STICK
    SUB_ANIM = {'in': ('in:Slide Up', 0.25)}
    MUSIC = ('MUSIC_bright_deal.wav', LA + 'music_C.wav'); VO0 = LA + 'cc/VO02_SR_mina_0C.wav'
    HOOK_SFX = [('impact', 0.05, 0.12), ('whoosh', 1.45, 0.05), ('pop', 1.66, 0.09), ('shimmer', 1.75, 0.09)]
    # Q10 gift packshot pops in on "Još jedan proizvod gratis" (scale pop via keyframes + CapCut Fade In)
    PHOTOS = [('q10_pack.png', 1.64, 3.4, 0.40, -0.085, [(0, 0.12), (0.2, 0.34), (0.34, 0.30), (1.76 - 1e-3, 0.31)])]

# ---------------- media ----------------
mats = {}
for k, *_ in EDL:
    if k in mats: continue
    mats[k] = video_material(k if k.endswith('.mp4') else f'{k}.mp4', (LC + k) if k.endswith('.mp4') else (LF + f'{k}.mp4'))
g02 = video_material('G02_OFFER_2xCOLLAGEN_Q10GRATIS.mov', LC + 'G02_OFFER_2xCOLLAGEN_Q10GRATIS.mov')
ph = {p[0]: video_material(p[0], LP + p[0], photo=True) for p in PHOTOS}
vo = [audio_material(f'VO02_SR_mina_0{V}.wav', VO0)] + [audio_material(f'VO02_SR_mina_{i}.wav', LA + f'cc/VO02_SR_mina_{i}.wav') for i in range(1, 5)]
mus = audio_material(MUSIC[0], MUSIC[1])
sfxm = {k: audio_material(f'SFX_{k}.wav', LA + f'sfx_{k}.wav', 'sound') for k in ['impact', 'shimmer', 'whoosh', 'click', 'pop']}

# ---------------- tracks ----------------
main = [vseg('MAIN', mats[k], a, b, off, rate, z, ty) for k, a, b, off, rate, z, ty in EDL]
for i, name in enumerate(TRANS):
    if name: transition_after(main[i], name, TDUR)
over = [vseg('GRAPHICS', ph[f], a, b, scale=k[0][1], tx=x, ty=y, kfs=[kf('KFTypeScaleX', [(t, v) for t, v in k])], track_ri=5, ri=2,
             anim={'in': ('in:Fade In', 0.15)}) for f, a, b, x, y, k in PHOTOS]
graphics = [vseg('GRAPHICS', g02, 24.5, 26.9, track_ri=6, ri=1)]
vo_t = [aseg('VO', vo[i], at) for i, at in enumerate([0.0, 3.50, 8.60, 18.10, 24.52])]
mus_t = [aseg('MUSIC', mus, 0.0, 33.5, vol=0.16)]
BODY_SFX = [('whoosh', 10.15, 0.05), ('click', 10.52, 0.06), ('click', 11.92, 0.06), ('click', 13.36, 0.06),
            ('whoosh', 19.25, 0.05), ('shimmer', 21.25, 0.10), ('pop', 23.75, 0.07), ('whoosh', 26.75, 0.05), ('pop', 28.0, 0.07)]
sfx_t = [aseg('POPS', sfxm[k], at, vol=v) for k, at, v in HOOK_SFX + BODY_SFX]
SUBS = HOOK_SUBS + json.load(open('/home/claude/capcut/build/subs.json'))[2:]
def wrap(t, n=27):
    if len(t.replace('*', '')) <= n: return t
    w = t.split(' '); best = min(range(1, len(w)), key=lambda i: abs(len(' '.join(w[:i])) - len(' '.join(w[i:]))))
    a, b = ' '.join(w[:best]), ' '.join(w[best:])
    if a.count('*') % 2: a += '*'; b = '*' + b
    return a + '\n' + b
txt_t = [tseg_text(text_material(wrap(s['t']), size=10.0), s['a'], s['b'], anim={**SUB_ANIM, 'out': ('out:Fade Out', 0.15)}) for s in SUBS]
TSTYLE = {}
title_t = [tseg_text(text_material(t, size=sz, **TSTYLE), a, b, y=y, anim=an, ri=14025) for t, a, b, y, sz, bg, an in TITLES]
fx_t = [fx_seg(n, a, b) for n, a, b in FX]
st_t = [st_seg(n, a, b, x, y, sc, anim=an) for n, a, b, x, y, sc, an in STICK]

def track(tname, segs, name):
    t = copy.deepcopy(tmpl[tname]); t['id'] = UID(); t['segments'] = segs; t['name'] = name; return t
def track_ex(ex, segs, name):
    t = copy.deepcopy(LIB['examples'][ex]); t['id'] = UID(); t['segments'] = segs; t['name'] = name; return t
D = copy.deepcopy(T)
D['id'] = '7263DE8C-E150-4E16-9B82-0772A1D22D84'; D['duration'] = US(33.5); D['materials'] = NEWM
D['keyframes'] = {k: [] for k in T['keyframes']}
tracks = [track('MAIN', main, 'MAIN')]
if over: tracks.append(track('GRAPHICS', over, 'PACKSHOT'))
tracks += [track('GRAPHICS', graphics, 'OFFER'), track_ex('fx_track', fx_t, 'EFFECTS'), track_ex('st_track', st_t, 'STICKERS'),
           track('CAPTIONS', txt_t, 'CAPTIONS'), track('CAPTIONS', title_t, 'HOOK TITLES'),
           track('VO', vo_t, 'VO'), track('MUSIC', mus_t, 'MUSIC'), track('POPS', sfx_t, 'SFX')]
D['tracks'] = tracks
json.dump(D, open(f'{OUT}/draft_info.json', 'w'), ensure_ascii=False)

# ---------------- meta ----------------
now = int(time.time() * 1e6)
meta = json.load(open('/home/claude/capcut/build/draft_meta_info.json'))
meta.update({'draft_id': UID(), 'draft_name': NAME, 'draft_fold_path': f'{ROOT}/{NAME}', 'draft_root_path': ROOT,
             'tm_draft_create': now, 'tm_draft_modified': now, 'tm_duration': US(33.5)})
items = []
for fn, local in MEDIA.items():
    dur, w, h, _ = probe(local); photo = fn.endswith('.png'); aud = fn.endswith('.wav')
    items.append({"ai_group_type": "", "create_time": now // 10**6, "duration": 5000000 if photo else US(dur), "enter_from": 0, "extra_info": fn,
                  "file_Path": MAC + fn, "height": h, "id": UID(), "import_time": now // 10**6, "import_time_ms": now, "item_source": 1, "md5": "",
                  "metetype": 'photo' if photo else ('music' if aud else 'video'), "roughcut_time_range": {"duration": -1, "start": -1},
                  "sub_time_range": {"duration": -1, "start": -1}, "type": 0, "width": w})
for x in meta['draft_materials']:
    x['value'] = items if x['type'] == 0 else []
json.dump(meta, open(f'{OUT}/draft_meta_info.json', 'w'), ensure_ascii=False)
json.dump({k: v for k, v in MEDIA.items()}, open(f'{OUT}/media.json', 'w'), indent=1)
print(NAME, 'tracks', [(t['name'], len(t['segments'])) for t in D['tracks']], 'media', len(MEDIA))
