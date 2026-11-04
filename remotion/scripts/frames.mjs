// Render chosen frames of compositions to PNG, reusing one bundle.
// usage: node scripts/frames.mjs out/dir Comp:1,5,9 Comp2:3,4
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [outDir, ...jobs] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.CHROME || "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl: "swangle" } });
for (const job of jobs) {
  const [id, list] = job.split(":");
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
  for (const f of list.split(",").map(Number)) {
    const output = path.join(outDir, `${id}-${String(f).padStart(4, "0")}.png`);
    await renderStill({ composition, serveUrl, frame: f, output, scale: 0.5, puppeteerInstance: browser, browserExecutable });
    console.log("ok", output);
  }
}
await browser.close({ silent: true });
