import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "assets/videos/produto-convite.mp4");
const chromePath = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";
const display = process.env.PRODUTO_DISPLAY || ":99";

const primeiros = ["Helena", "Marina", "Ana", "Beatriz", "Clara", "Lia", "Sofia", "Valentina", "Isabel", "Laura", "Alice", "Manuela", "Lorena", "Lara", "Melissa", "Bianca", "Camila", "Daniela", "Eduarda", "Fernanda", "Gabriela", "Isadora", "Juliana", "Letícia", "Natália", "Renata", "Sabrina", "Vitória"];
const sobrenomes = ["Duarte", "Costa", "Luz", "Nogueira", "Mendes", "Ferreira", "Ramos", "Rocha", "Almeida", "Barbosa", "Cardoso", "Dias", "Freitas", "Gomes", "Lopes", "Martins", "Moreira", "Nunes", "Pinto", "Ribeiro", "Teixeira", "Vieira"];
const parceiros = ["Theo", "Pedro", "Miguel", "Gael", "Davi", "Heitor", "Arthur", "Bernardo", "Lucas", "Enzo"];

function convidadosDemo() {
  const lista = primeiros.map((nome, i) => {
    const sobrenome = sobrenomes[i % sobrenomes.length];
    const completo = `${nome} ${sobrenome}`;
    if (i % 7 === 2) {
      return { nome: completo, presenca: "Não poderei ir", acompanhante: "Não", nomeAcompanhante: "" };
    }
    if (i % 3 === 0) {
      const parceiro = `${parceiros[i % parceiros.length]} ${sobrenome}`;
      return { nome: completo, presenca: "Levarei um acompanhante", acompanhante: "Sim", nomeAcompanhante: parceiro };
    }
    return { nome: completo, presenca: "Comparecerei", acompanhante: "Não", nomeAcompanhante: "" };
  });
  lista[0] = {
    nome: "Helena Duarte",
    presenca: "Levarei um acompanhante",
    acompanhante: "Sim",
    nomeAcompanhante: "Theo Duarte",
  };
  return lista;
}

function respostaConvidados() {
  const convidados = convidadosDemo();
  const acompanhantes = convidados.filter((c) => c.acompanhante === "Sim").length;
  return {
    header: ["Nome", "presença", "acompanhante", "Nome do acompanhante"],
    convidados,
    totais: {
      convidadosOficiais: convidados.length,
      acompanhantes,
      total: convidados.length + acompanhantes,
    },
  };
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".glb": "model/gltf-binary",
  ".svg": "image/svg+xml",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startServer() {
  const payload = JSON.stringify(respostaConvidados());
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://127.0.0.1");
        if (url.pathname === "/api/convidados") {
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(payload);
          return;
        }
        if (url.pathname === "/api/confirmar") {
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true }));
          return;
        }
        const rel = decodeURIComponent(url.pathname);
        const filePath = path.normalize(path.join(root, rel === "/" ? "produto.html" : rel));
        if (!filePath.startsWith(root)) {
          res.writeHead(403);
          res.end();
          return;
        }
        const data = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": types[ext] || "application/octet-stream",
          "Cache-Control": "no-store",
        });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function iniciarTela() {
  const xvfb = spawn("Xvfb", [display, "-screen", "0", "1920x1080x24", "-ac"], {
    stdio: "ignore",
  });
  return xvfb;
}

function iniciarFfmpeg() {
  return spawn("ffmpeg", [
    "-y",
    "-f", "x11grab",
    "-draw_mouse", "0",
    "-framerate", "30",
    "-video_size", "1920x1080",
    "-i", `${display}.0`,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-crf", "17",
    "-preset", "veryfast",
    "-movflags", "+faststart",
    outPath,
  ], { stdio: ["ignore", "ignore", "pipe"] });
}

async function frameCom(page, parte, timeout = 20000) {
  const inicio = Date.now();
  while (Date.now() - inicio < timeout) {
    const found = page.frames().find((frame) => frame.url().includes(parte));
    if (found) return found;
    await sleep(80);
  }
  throw new Error(`Quadro não encontrado: ${parte}`);
}

async function passo(page, id) {
  await page.evaluate((nome) => window.mostrarPasso(nome), id);
}

async function ir(page, arquivo) {
  await page.evaluate((src) => {
    document.getElementById("tela").src = src;
  }, arquivo);
  return frameCom(page, arquivo);
}

async function rolar(frame, seletor) {
  await frame.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, seletor);
}

async function esperar(frame, fn, timeout, rotulo) {
  try {
    await frame.waitForFunction(fn, { timeout, polling: 200 });
    return true;
  } catch (err) {
    process.stdout.write(`seguir sem ${rotulo}: ${err.message}\n`);
    return false;
  }
}

const server = await startServer();
const { port } = server.address();

const xvfb = iniciarTela();
await sleep(400);

const perfil = path.join(root, ".chrome-produto");
await mkdir(path.join(perfil, "Default"), { recursive: true });
await writeFile(
  path.join(perfil, "Default", "Preferences"),
  JSON.stringify({
    translate: { enabled: false },
    translate_blocked_languages: ["pt", "pt-BR", "en", "en-US"],
    intl: { accept_languages: "pt-BR,pt", selected_languages: "pt-BR,pt" },
  }),
);

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: false,
  protocolTimeout: 120000,
  ignoreDefaultArgs: ["--enable-automation"],
  env: { ...process.env, DISPLAY: display, LANGUAGE: "pt_BR.UTF-8", LANG: "pt_BR.UTF-8" },
  args: [
    `--user-data-dir=${perfil}`,
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--autoplay-policy=no-user-gesture-required",
    "--hide-scrollbars",
    "--kiosk",
    "--window-position=0,0",
    "--window-size=1920,1080",
    "--force-device-scale-factor=1",
    "--disable-infobars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-translate",
    "--disable-features=Translate,TranslateUI",
    "--lang=pt-BR",
  ],
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
page.on("pageerror", (err) => process.stderr.write(`pagina: ${err.message}\n`));

await page.evaluateOnNewDocument(() => {
  sessionStorage.setItem("gestao_token", "demo");
  const Nativa = Date;
  const origem = new Nativa("2026-04-18T15:00:00").getTime();
  const partida = Nativa.now();
  class DataDemo extends Nativa {
    constructor(...args) {
      if (args.length === 0) super(origem + (Nativa.now() - partida));
      else super(...args);
    }
    static now() {
      return origem + (Nativa.now() - partida);
    }
  }
  window.Date = DataDemo;

  const tocar = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function playMudo() {
    this.muted = true;
    this.volume = 0;
    return tocar.apply(this, arguments);
  };
});

await page.goto(`http://127.0.0.1:${port}/produto.html`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await page.waitForFunction(() => typeof window.mostrarPasso === "function");

const ffmpeg = iniciarFfmpeg();
let ffmpegErro = "";
ffmpeg.stderr.on("data", (chunk) => {
  ffmpegErro += chunk.toString();
});
await sleep(400);

const marco = Date.now();
function log(msg) {
  process.stdout.write(`${((Date.now() - marco) / 1000).toFixed(1)}s ${msg}\n`);
}

try {
  log("abertura");
  await passo(page, "abertura");
  await sleep(2300);

  log("codigo");
  await passo(page, "codigo");
  const indice = await ir(page, "index.html");
  await esperar(indice, () => window.gsap && document.querySelector("#carta"), 20000, "gsap");
  await esperar(indice, () => {
    const carta = document.querySelector("#carta");
    return carta && parseFloat(getComputedStyle(carta).opacity) > 0.9;
  }, 20000, "carta");

  await passo(page, "convite");
  await sleep(1600);
  log("toque");
  await passo(page, "toque");
  await sleep(900);
  await indice.click("#carta");
  await sleep(2800);
  await indice.evaluate(() => {
    const video = document.querySelector("#conviteVideo");
    const tela = document.querySelector("#videoFullscreen");
    if (tela) {
      tela.style.visibility = "visible";
      tela.style.opacity = "1";
    }
    if (video) {
      video.muted = true;
      if (video.currentTime < 0.2) video.currentTime = 0.3;
      video.play();
    }
  });

  await esperar(indice, () => {
    const video = document.querySelector("#conviteVideo");
    return video && video.currentTime > 0.15;
  }, 12000, "video");
  log("video");
  await passo(page, "video");
  await sleep(5200);

  await page.evaluate(() => sessionStorage.setItem("gestao_token", "demo"));
  const convite = await ir(page, "convite.html");
  await esperar(convite, () => document.querySelector(".convite-modal.is-content-visible"), 20000, "convite");
  log("pagina");
  await passo(page, "pagina");
  await sleep(2600);

  await passo(page, "data");
  await rolar(convite, "#conviteSectionData");
  await sleep(1900);

  await passo(page, "local");
  await rolar(convite, "#conviteSectionLocal");
  await sleep(2200);

  await passo(page, "traje");
  await rolar(convite, "#conviteSectionTraje");
  await sleep(1700);

  await passo(page, "contagem");
  await rolar(convite, "#conviteSectionCountdown");
  await sleep(2000);

  await passo(page, "presente");
  await rolar(convite, "#btnSugestaoPresente");
  await sleep(700);
  await convite.click("#btnSugestaoPresente");
  await sleep(2300);
  await convite.click("#closeSugestoes");
  await sleep(500);

  await passo(page, "pix");
  await convite.click("#btnPix");
  await sleep(2100);
  await convite.click("#closePix");
  await sleep(450);

  log("formulario");
  await passo(page, "form");
  await rolar(convite, "#btnConfirmarPresenca");
  await sleep(700);
  await convite.click("#btnConfirmarPresenca");
  await sleep(700);
  await convite.select("#confirmarPresenca", "Levarei um acompanhante");
  await esperar(convite, () => {
    const campo = document.querySelector("#wrapAcompanhante");
    return campo && !campo.hidden;
  }, 8000, "acompanhante");
  await convite.click("#confirmarNome", { clickCount: 3 });
  await convite.type("#confirmarNome", "Helena Duarte", { delay: 48 });
  await convite.type("#confirmarNomeAcompanhante", "Theo Duarte", { delay: 42 });
  await sleep(1300);
  await convite.click("#btnEnviarConfirmacao");
  await esperar(convite, () => {
    const msg = document.querySelector("#confirmarMensagem");
    return msg && msg.textContent.includes("Obrigado");
  }, 8000, "confirmacao");
  await sleep(1700);

  log("gestao");
  await passo(page, "gestao");
  await sleep(700);
  const gestao = await ir(page, "gestao.html");
  await esperar(gestao, () => {
    const tabela = document.querySelector("#gestaoTable");
    return tabela && !tabela.hidden && tabela.querySelectorAll("tbody tr").length > 3;
  }, 15000, "gestao");
  await sleep(2400);
  await gestao.evaluate(() => {
    const bloco = document.querySelector("#cardTabela");
    if (bloco) bloco.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  await sleep(2800);
} finally {
  await sleep(400);
  ffmpeg.kill("SIGINT");
  await new Promise((resolve) => ffmpeg.on("close", resolve));
  await browser.close();
  server.close();
  xvfb.kill();
}

if (!ffmpegErro.includes("video:")) {
  process.stderr.write(ffmpegErro.slice(-1200) + "\n");
}
process.stdout.write(`video ${outPath}\n`);
