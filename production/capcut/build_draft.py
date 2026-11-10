"""Build CapCut draft 'KOLAGEN 2 VIDEO' from the MAGNEZIJ draft (same CapCut version) as a schema template."""
import json, copy, uuid, subprocess, sys
T = json.load(open('/home/claude/capcut/mg/draft_info.json'))
M = T['materials']
US = lambda s: int(round(s * 1_000_000))
uid = lambda: uuid.uuid4().hex
UID = lambda: str(uuid.uuid4()).upper()
MAC = '/Users/renegermek/Downloads/KOLAGEN_2_VIDEO/LINK_THIS_FOLDER/'
LOCAL = {}  # mac file name -> local copy for probing
def probe(p):
    o = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=width,height,codec_type', '-of', 'json', p], capture_output=True, text=True).stdout
    j = json.loads(o); dur = float(j['format']['duration']); v = [s for s in j['streams'] if s['codec_type'] == 'video']
    return dur, (v[0]['width'] if v else 0), (v[0]['height'] if v else 0), any(s['codec_type'] == 'audio' for s in j['streams'])

idx = {}
for k, arr in M.items():
    if isinstance(arr, list):
        for x in arr:
            if isinstance(x, dict) and 'id' in x: idx[x['id']] = k
tmpl_tracks = {t['name']: t for t in T['tracks']}
def tseg(name, i=0): return tmpl_tracks[name]['segments'][i]
def ref_tmpl(seg):
    out = []
    for r in seg['extra_material_refs']:
        k = idx[r]; obj = next(x for x in M[k] if x['id'] == r); out.append((k, obj))
    return out

NEWM = {k: ([] if isinstance(v, list) else copy.deepcopy(v)) for k, v in M.items()}
def add_extras(seg_t, speed=1.0, keep=None):
    ids = []
    for k, obj in ref_tmpl(seg_t):
        if k == 'transitions': continue
        o = copy.deepcopy(obj); o['id'] = UID()
        if k == 'speeds': o['speed'] = speed; o['mode'] = 0; o['curve_speed'] = None
        NEWM[k].append(o); ids.append(o['id'])
    return ids

def video_material(fname, local):
    dur, w, h, has_a = probe(local)
    v = copy.deepcopy(M['videos'][0]); v['id'] = uid(); v['path'] = MAC + fname; v['material_name'] = fname
    v['duration'] = US(dur); v['width'] = w; v['height'] = h; v['has_audio'] = has_a; v['type'] = 'video'
    for k in ('local_material_id',):
        if k in v: v[k] = v['id']
    v['crop'] = copy.deepcopy(M['videos'][0].get('crop')); NEWM['videos'].append(v); return v

def audio_material(fname, local, typ='extract_music'):
    dur, _, _, _ = probe(local)
    a = copy.deepcopy(M['audios'][0]); a['id'] = uid(); a['name'] = fname; a['path'] = MAC + fname; a['duration'] = US(dur)
    a['type'] = typ; a['music_id'] = a['id']; a['local_material_id'] = a['id']; a['wave_points'] = []
    NEWM['audios'].append(a); return a

def kf_scale(a, b, dur_us):
    return [{"id": uid(), "material_id": "", "property_type": "KFTypeScaleX", "keyframe_list": [
        {"id": uid(), "curveType": "Line", "time_offset": 0, "left_control": {"x": 0.0, "y": 0.0}, "right_control": {"x": 0.0, "y": 0.0}, "values": [a], "string_value": "", "graphID": ""},
        {"id": uid(), "curveType": "Line", "time_offset": dur_us - 1, "left_control": {"x": 0.0, "y": 0.0}, "right_control": {"x": 0.0, "y": 0.0}, "values": [b], "string_value": "", "graphID": ""}]}]

def vseg(tname, mat, start, end, off=0.0, rate=1.0, z=None, ty=0.0, track_ri=0, ri=0):
    s = copy.deepcopy(tseg(tname)); s['id'] = uid(); s['material_id'] = mat['id']
    tdur = US(end - start); s['target_timerange'] = {'start': US(start), 'duration': tdur}
    s['source_timerange'] = {'start': US(off), 'duration': int(round(tdur * rate))}
    s['speed'] = rate; s['extra_material_refs'] = add_extras(tseg(tname), rate)
    sc = z[0] if z else 1.0
    s['clip'] = {'scale': {'x': sc, 'y': sc}, 'rotation': 0.0, 'transform': {'x': 0.0, 'y': ty}, 'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
    s['common_keyframes'] = kf_scale(z[0], z[1], tdur) if z else []
    s['keyframe_refs'] = []; s['render_index'] = ri; s['track_render_index'] = track_ri; s['volume'] = 0.0 if tname == 'MAIN' else 1.0
    return s

def aseg(tname, mat, start, dur=None, off=0.0, vol=1.0):
    s = copy.deepcopy(tseg(tname)); s['id'] = uid(); s['material_id'] = mat['id']
    d = US(dur) if dur else mat['duration'] - US(off)
    s['target_timerange'] = {'start': US(start), 'duration': d}; s['source_timerange'] = {'start': US(off), 'duration': d}
    s['extra_material_refs'] = add_extras(tseg(tname)); s['volume'] = vol; s['speed'] = 1.0; s['common_keyframes'] = []; s['keyframe_refs'] = []
    return s

GOLD = [0.886, 0.745, 0.416]; WHITE = [1.0, 1.0, 1.0]
def text_material(text):
    t = copy.deepcopy(M['texts'][0]); t['id'] = uid()
    plain = text.replace('*', ''); styles = []; pos = 0
    for i, part in enumerate(text.split('*')):
        if not part: continue
        n = len(part.encode('utf-16-le')) // 2
        styles.append({"fill": {"alpha": 1.0, "content": {"render_type": "solid", "solid": {"alpha": 1.0, "color": GOLD if i % 2 else WHITE}}},
                       "range": [pos, pos + n], "size": 11.0, "bold": True, "italic": False, "underline": False,
                       "strokes": [{"content": {"solid": {"alpha": 1.0, "color": [0.05, 0.09, 0.07]}}, "width": 0.11}]})
        pos += n
    t['content'] = json.dumps({"styles": styles, "text": plain}, ensure_ascii=False); t['font_size'] = 11.0
    t['has_shadow'] = True; t['shadow_color'] = '#000000'; t['shadow_alpha'] = 0.55; t['shadow_smoothing'] = 0.45; t['shadow_distance'] = 5.0
    t['shadow_point'] = {"x": 0.6, "y": -0.6}; t['shadow_angle'] = -45.0
    NEWM['texts'].append(t); return t

def tseg_text(mat, a, b, y=-0.458):
    s = copy.deepcopy(tseg('CAPTIONS')); s['id'] = uid(); s['material_id'] = mat['id']
    s['target_timerange'] = {'start': US(a), 'duration': US(b - a)}; s['clip']['transform'] = {'x': 0.0, 'y': y}; s['clip']['scale'] = {'x': 1.0, 'y': 1.0}
    s['extra_material_refs'] = []; return s

def transition_after(seg, name='Pull in', dur=0.33):
    tr = copy.deepcopy(next(x for x in M['transitions'] if x['name'] == name)); tr['id'] = UID(); tr['duration'] = US(dur)
    NEWM['transitions'].append(tr); seg['extra_material_refs'].append(tr['id'])

# ---------------- media ----------------
L_FOOT = '/home/claude/montik-assets/remotion/public/vo01/'
L_CAP = '/home/claude/vo02/capcut/'; L_AUD = '/home/claude/vo02/audio/'
foot = {k: video_material(f'{k}.mp4', L_FOOT + f'{k}.mp4') for k in ['P8', 'P21', 'M8', 'M2', 'P38', 'P22', 'M6', 'P20']}
sc = {k: video_material(k, L_CAP + k) for k in ['S01_INGREDIENTS.mp4', 'S02_Q10_GIFT_REVEAL.mp4', 'S03_END_CARD.mp4']}
gr = {k: video_material(k, L_CAP + k) for k in ['G01_HOOK_2xCOLLAGEN_Q10POKLON.mov', 'G02_OFFER_2xCOLLAGEN_Q10GRATIS.mov']}
vo = [audio_material(f'VO02_SR_mina_{i}.wav', L_AUD + f'cc/VO02_SR_mina_{i}.wav') for i in range(5)]
mus = audio_material('MUSIC_ivory_pulse.wav', L_AUD + 'music.wav')
sfxm = {k: audio_material(f'SFX_{k}.wav', L_AUD + f'sfx_{k}.wav', 'sound') for k in ['impact', 'shimmer', 'whoosh', 'click', 'pop']}

# ---------------- tracks ----------------
main = []
EDL = [('P8', 0, 3.4, 0.15, 0.5, (1.16, 1.27), -0.165), ('P21', 3.4, 5.4, 1.6, 1, (1.0, 1.05), 0), ('M8', 5.4, 7.0, 2.2, 1, None, 0),
       ('M2', 7.0, 8.6, 2.8, 1, (1.04, 1.0), 0), ('P38', 8.6, 10.3, 3.0, 1, (1.0, 1.06), 0), ('S01_INGREDIENTS.mp4', 10.3, 14.4, 0, 1, None, 0),
       ('P22', 14.4, 16.0, 0.8, 1, None, 0), ('M6', 16.0, 18.0, 1.2, 1, (1.0, 1.04), 0), ('P20', 18.0, 19.4, 0.4, 1, (1.04, 1.0), 0),
       ('S02_Q10_GIFT_REVEAL.mp4', 19.4, 24.5, 0, 1, None, 0), ('P8', 24.5, 26.9, 0.5, 0.5, (1.2, 1.28), -0.17), ('S03_END_CARD.mp4', 26.9, 33.5, 0, 1, None, 0)]
for k, a, b, off, rate, z, ty in EDL:
    mat = foot.get(k) or sc[k]
    main.append(vseg('MAIN', mat, a, b, off, rate, z, ty, 0, 0))
for i in (0, 4, 8):  # soft "Pull in" into: product (3.4), ingredients (10.3), gift reveal (19.4)
    transition_after(main[i])
graphics = [vseg('GRAPHICS', gr['G01_HOOK_2xCOLLAGEN_Q10POKLON.mov'], 0.0, 3.4, track_ri=6, ri=1),
            vseg('GRAPHICS', gr['G02_OFFER_2xCOLLAGEN_Q10GRATIS.mov'], 24.5, 26.9, track_ri=6, ri=1)]
vo_t = [aseg('VO', vo[i], at) for i, at in enumerate([0.0, 3.50, 8.60, 18.10, 24.52])]
mus_t = [aseg('MUSIC', mus, 0.0, 33.5, vol=0.16)]
SFX = [('impact', 0.42, 0.14), ('shimmer', 1.80, 0.09), ('whoosh', 10.15, 0.05), ('click', 10.52, 0.06), ('click', 11.92, 0.06), ('click', 13.36, 0.06),
       ('whoosh', 19.25, 0.05), ('shimmer', 21.25, 0.10), ('pop', 23.75, 0.07), ('whoosh', 26.75, 0.05), ('pop', 28.0, 0.07)]
sfx_t = [aseg('POPS', sfxm[k], at, vol=v) for k, at, v in SFX]
SUBS = json.load(open('/home/claude/capcut/build/subs.json'))
txt_t = [tseg_text(text_material(s['t']), s['a'], s['b']) for s in SUBS]

def track(tname, segs, name):
    t = copy.deepcopy(tmpl_tracks[tname]); t['id'] = UID(); t['segments'] = segs; t['name'] = name; return t
D = copy.deepcopy(T)
D['id'] = UID(); D['duration'] = US(33.5); D['materials'] = NEWM; D['keyframes'] = {k: [] for k in T['keyframes']}
D['tracks'] = [track('MAIN', main, 'MAIN'), track('VO', vo_t, 'VO'), track('MUSIC', mus_t, 'MUSIC'), track('POPS', sfx_t, 'SFX'),
               track('GRAPHICS', graphics, 'GRAPHICS'), track('CAPTIONS', txt_t, 'CAPTIONS')]
json.dump(D, open('/home/claude/capcut/build/draft_info.json', 'w'), ensure_ascii=False)
print('ok', D['id'], {k: len(v) for k, v in NEWM.items() if isinstance(v, list) and v})
