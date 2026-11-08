// browser_bundle.js - paste into the Browser pane on a page of the SAME origin as the files
// (cdn.promptwise.com/... or elevenlabsusercontent.com/...). Fetches several files and saves them as ONE
// JSON bundle (name -> base64), because the pane delivers one download per page reliably.
// Downloads reach ~/Downloads 1-6 min later: wait, do not trigger again. Decode on the device with:
//   python3 -c "import json,base64,sys;d=json.load(open(sys.argv[1]));[open(k,'wb').write(base64.b64decode(v)) for k,v in d.items()]" BUNDLE.json
window.__bundle = async (files /* {outName: absoluteUrl} */, name) => {
  const out = {};
  for (const [n, u] of Object.entries(files)) {
    const r = await fetch(u); if (!r.ok) { out[n] = "ERR" + r.status; continue; }
    const a = new Uint8Array(await r.arrayBuffer()); let s = "";
    for (let i = 0; i < a.length; i += 32768) s += String.fromCharCode.apply(null, a.subarray(i, i + 32768));
    out[n] = btoa(s);
  }
  const l = document.createElement("a");
  l.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: "application/json" }));
  l.download = name; document.body.appendChild(l); l.click(); window.__done = name;
};
// usage (return immediately, poll window.__done):  window.__done=null; __bundle({...}, "AD07_bundle1.json"); "started"
