import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "assets/videos/reel-xv-iza.mp4");
const fps = 30;
const chromePath = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://127.0.0.1");
        const rel = decodeURIComponent(url.pathname);
        const filePath = path.join(root, rel === "/" ? "reel.html" : rel);
        const data = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

const server = await startServer();
const { port } = server.address();

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--font-render-hinting=none",
    "--force-color-profile=srgb",
  ],
  defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/reel.html?record=1`, {
  waitUntil: "networkidle0",
  timeout: 30000,
});
await page.waitForFunction(() => window.__reelReady === true, { timeout: 20000 });

const duration = await page.evaluate(() => window.__reelDuration);

if (process.env.SAMPLE_AT) {
  const times = process.env.SAMPLE_AT.split(",").map(Number);
  for (const time of times) {
    await page.evaluate((value) => window.renderAt(value), time);
    const file = `/tmp/reel-t${String(time).replace(".", "_")}.jpg`;
    await page.screenshot({ path: file, type: "jpeg", quality: 90 });
    process.stdout.write(`${file}\n`);
  }
  await browser.close();
  server.close();
  process.exit(0);
}

const total = Math.round(duration * fps);

const ffmpeg = spawn("ffmpeg", [
  "-y",
  "-f",
  "image2pipe",
  "-framerate",
  String(fps),
  "-i",
  "pipe:0",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-profile:v",
  "high",
  "-crf",
  "16",
  "-preset",
  "medium",
  "-movflags",
  "+faststart",
  outPath,
]);

let ffmpegError = "";
ffmpeg.stderr.on("data", (chunk) => {
  ffmpegError += chunk.toString();
});

const closed = new Promise((resolve, reject) => {
  ffmpeg.on("error", reject);
  ffmpeg.on("close", (code) => {
    if (code === 0) resolve();
    else reject(new Error(ffmpegError.slice(-2000) || `ffmpeg saiu com código ${code}`));
  });
});

for (let i = 0; i < total; i += 1) {
  await page.evaluate((time) => window.renderAt(time), i / fps);
  const shot = await page.screenshot({
    type: "jpeg",
    quality: 92,
    captureBeyondViewport: false,
  });
  if (!ffmpeg.stdin.write(shot)) {
    await new Promise((resolve) => ffmpeg.stdin.once("drain", resolve));
  }
  if (i % 30 === 0) {
    process.stdout.write(`quadro ${i}/${total}\n`);
  }
}

ffmpeg.stdin.end();
await closed;
await browser.close();
server.close();
process.stdout.write(`video ${outPath} (${total} quadros, ${duration}s)\n`);
