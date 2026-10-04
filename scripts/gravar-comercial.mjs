import { spawn, execSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "assets/videos/reels-comercial-xv-iza.mp4");
const chromePath = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";
const display = process.env.REELS_DISPLAY || ":99";

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
      return {
        nome: completo,
        presenca: "Levarei um acompanhante",
        acompanhante: "Sim",
        nomeAcompanhante: `${parceiros[i % parceiros.length]} ${sobrenome}`,
      };
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

function liberarTela() {
  let linhas = "";
  try {
    linhas = execSync("pgrep -a Xvfb", { encoding: "utf8" });
  } catch {
    return;
  }
  for (const linha of linhas.split("\n")) {
    if (!linha.includes(`Xvfb ${display}`)) continue;
    const pid = Number(linha.trim().split(/\s+/)[0]);
    if (pid) {
      try {
        process.kill(pid);
      } catch {
        /* já saiu */
      }
    }
  }
}

function startServer() {
  const payload = JSON.stringify(respostaConvidados());
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://127.0.0.1");
        if (url.pathname === "/api/convidados" || url.pathname === "/api/confirmar") {
          await new Promise((done) => {
            req.on("data", () => {});
            req.on("end", done);
            req.on("error", done);
          });
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(url.pathname === "/api/convidados" ? payload : JSON.stringify({ ok: true }));
          return;
        }
        const rel = decodeURIComponent(url.pathname);
        const filePath = path.normalize(path.join(root, rel === "/" ? "comercial.html" : rel));
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

function iniciarFfmpeg() {
  return spawn("ffmpeg", [
    "-y",
    "-f", "x11grab",
    "-draw_mouse", "0",
    "-framerate", "30",
    "-video_size", "1080x1920",
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

async function ir(page, arquivo) {
  await page.evaluate((src) => {
    document.getElementById("tela").src = src;
  }, arquivo);
  return frameCom(page, arquivo);
}

async function dizer(page, opts) {
  await page.evaluate((entrada) => window.dizer(entrada), opts);
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

async function ampliarConvite(frame) {
  await frame.addStyleTag({
    content: `
      html { font-size: 26px !important; }
      .convite-unified,
      .convite-modal,
      .convite-modal-inner,
      .convite-scroll-content,
      .convite-modal-popup,
      #modalSugestoes .convite-modal-popup { max-width: 940px !important; }
      .convite-map-wrap iframe { height: 280px !important; }
    `,
  });
}

async function ampliarGestao(frame) {
  await frame.addStyleTag({
    content: `
      body { font-size: 18px !important; }
      .gestao-wrap { max-width: 1040px !important; padding: 28px 36px 80px !important; }
      .gestao-stat-num { font-size: 2.6rem !important; }
      .gestao-title { font-size: 2rem !important; }
      table { font-size: 1.05rem !important; }
    `,
  });
}

async function rolar(frame, seletor) {
  await frame.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "auto", block: "center" });
  }, seletor);
}

async function chaveDeExemplo(frame) {
  await frame.evaluate(() => {
    const chave = document.querySelector("#pixKey");
    if (chave) chave.textContent = "sua chave aqui";
  });
}

liberarTela();
await sleep(200);

const server = await startServer();
const { port } = server.address();
const xvfb = spawn("Xvfb", [display, "-screen", "0", "1080x1920x24", "-ac"], { stdio: "ignore" });
await sleep(400);

const perfil = path.join(root, ".chrome-reels");
await mkdir(path.join(perfil, "Default"), { recursive: true });
await writeFile(
  path.join(perfil, "Default", "Preferences"),
  JSON.stringify({
    autofill: { enabled: false, profile_enabled: false, credit_card_enabled: false },
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
    "--window-size=1080,1920",
    "--force-device-scale-factor=1",
    "--disable-infobars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-translate",
    "--disable-features=Translate,TranslateUI,AutofillServerCommunication,Autofill",
    "--lang=pt-BR",
  ],
  defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
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

await page.goto(`http://127.0.0.1:${port}/comercial.html`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await page.waitForFunction(() => window.__comercialPronto === true);

process.stdout.write("preparo\n");
const indice = await ir(page, "index.html");
await esperar(indice, () => window.gsap && document.querySelector("#cartaMain"), 20000, "gsap");
await esperar(indice, () => {
  const camada = document.querySelector("#cartaMain");
  const img = document.querySelector("#cartaImage");
  if (!camada || !img || !img.complete || img.naturalWidth < 10) return false;
  const opacidade = parseFloat(getComputedStyle(camada).opacity);
  return opacidade > 0.92 && camada.getBoundingClientRect().height > 200;
}, 20000, "carta");
await page.evaluate(() => {
  gsap.set("#tela", { autoAlpha: 1 });
  gsap.set("#marca", { autoAlpha: 1 });
});
await dizer(page, {
  lugar: "cima",
  kicker: "Para.",
  titulo: "Olha isso.",
  sub: "Não é um link.",
});

const ffmpeg = iniciarFfmpeg();
let ffmpegErro = "";
ffmpeg.stderr.on("data", (chunk) => {
  ffmpegErro += chunk.toString();
});
await sleep(250);

const marco = Date.now();
function log(msg) {
  process.stdout.write(`${((Date.now() - marco) / 1000).toFixed(1)}s ${msg}\n`);
}

try {
  log("gancho");
  await indice.evaluate(() => {
    gsap.fromTo("#carta", { scale: 0.94 }, { scale: 1, duration: 0.55, ease: "back.out(1.8)" });
  });
  await sleep(1500);
  await indice.click("#carta");
  await sleep(2400);
  await indice.evaluate(() => {
    const video = document.querySelector("#conviteVideo");
    const tela = document.querySelector("#videoFullscreen");
    if (tela) {
      tela.style.visibility = "visible";
      tela.style.opacity = "1";
    }
    if (video) {
      video.muted = true;
      if (video.currentTime < 0.2) video.currentTime = 0.35;
      video.play();
    }
  });
  await esperar(indice, () => {
    const video = document.querySelector("#conviteVideo");
    return video && video.currentTime > 0.2;
  }, 10000, "video");

  log("video");
  await dizer(page, {
    lugar: "baixo",
    kicker: "Abertura",
    titulo: "Com vídeo.",
    sub: "A festa começa na tela.",
  });
  await sleep(4200);

  log("carta");
  await page.evaluate(() => {
    sessionStorage.setItem("gestao_token", "demo");
    window.modo("carta");
    gsap.set("#tela", { autoAlpha: 0 });
    gsap.set("#legenda", { autoAlpha: 0 });
  });
  const convite = await ir(page, "convite.html");
  await ampliarConvite(convite);
  await esperar(convite, () => document.querySelector(".convite-modal.is-content-visible"), 20000, "convite");
  await sleep(900);
  await page.evaluate(() => window.mostrarSite(true));
  await dizer(page, {
    lugar: "cima",
    kicker: "A carta",
    titulo: "Você está convidado.",
    sub: "Escrita para emocionar.",
  });
  await sleep(1000);
  await chaveDeExemplo(convite);

  await rolar(convite, "#conviteSectionData");
  await dizer(page, {
    lugar: "cima",
    kicker: "Data e hora",
    titulo: "09 de maio.",
    sub: "Às 19h30.",
  });
  await sleep(850);

  log("mapa");
  await rolar(convite, "#conviteSectionLocal");
  await dizer(page, {
    lugar: "cima",
    kicker: "O lugar",
    titulo: "No mapa.",
    sub: "Um toque abre o caminho.",
  });
  await sleep(1000);

  await rolar(convite, "#conviteSectionTraje");
  await dizer(page, {
    lugar: "cima",
    kicker: "O traje",
    titulo: "Esporte fino.",
    sub: "Já escrito no convite.",
  });
  await sleep(800);

  await rolar(convite, "#conviteSectionCountdown");
  await dizer(page, {
    lugar: "cima",
    kicker: "A contagem",
    titulo: "Os dias passando.",
    sub: "Até a festa.",
  });
  await sleep(800);

  log("presentes");
  await rolar(convite, "#btnSugestaoPresente");
  await convite.click("#btnSugestaoPresente");
  await dizer(page, {
    lugar: "cima",
    kicker: "Presentes",
    titulo: "A lista dela.",
    sub: "Cada detalhe, no convite.",
  });
  await sleep(1000);
  await convite.click("#closeSugestoes");
  await esperar(convite, () => {
    const aberto = document.querySelector("#overlaySugestoes");
    return aberto && !aberto.classList.contains("is-open");
  }, 4000, "fechar presentes");
  await rolar(convite, "#btnPix");
  await chaveDeExemplo(convite);
  await dizer(page, {
    lugar: "cima",
    kicker: "Pix",
    titulo: "A chave na hora.",
    sub: "Sem sair do convite.",
  });
  await convite.click("#btnPix");
  await esperar(convite, () => {
    const aberto = document.querySelector("#overlayPix");
    const chave = document.querySelector("#pixKey");
    return aberto && aberto.classList.contains("is-open") && chave && chave.textContent.includes("sua chave");
  }, 4000, "pix");
  await chaveDeExemplo(convite);
  await sleep(1200);
  await convite.evaluate(() => {
    document.querySelector("#closePix")?.click();
    document.querySelector("#overlayPix")?.classList.remove("is-open");
  });
  await sleep(280);

  log("presenca");
  await rolar(convite, "#btnConfirmarPresenca");
  await sleep(200);
  await convite.evaluate(() => {
    document.querySelector("#btnConfirmarPresenca")?.click();
  });
  await esperar(convite, () => {
    const aberto = document.querySelector("#overlayConfirmar");
    return aberto && aberto.classList.contains("is-open");
  }, 4000, "abrir presenca");
  await dizer(page, {
    lugar: "cima",
    kicker: "Presença",
    titulo: "Confirma na hora.",
    sub: "Com nome e acompanhante.",
  });
  await sleep(400);
  await convite.evaluate(() => {
    document.querySelectorAll("input").forEach((campo) => {
      campo.setAttribute("autocomplete", "off");
      campo.setAttribute("autocorrect", "off");
    });
  });
  await convite.select("#confirmarPresenca", "Levarei um acompanhante");
  await esperar(convite, () => {
    const campo = document.querySelector("#wrapAcompanhante");
    return campo && !campo.hidden;
  }, 8000, "acompanhante");
  await convite.click("#confirmarNome", { clickCount: 3 });
  await convite.type("#confirmarNome", "Helena Duarte", { delay: 32 });
  await convite.type("#confirmarNomeAcompanhante", "Theo Duarte", { delay: 28 });
  await sleep(500);
  await convite.evaluate(() => {
    const form = document.querySelector("#formConfirmar");
    const nome = document.querySelector("#confirmarNome");
    const acomp = document.querySelector("#confirmarNomeAcompanhante");
    const botao = document.querySelector("#btnEnviarConfirmacao");
    if (nome && nome.value.trim().length < 2) nome.value = "Helena Duarte";
    if (acomp && acomp.value.trim().length < 2) acomp.value = "Theo Duarte";
    if (botao) botao.scrollIntoView({ block: "center", behavior: "auto" });
    form.requestSubmit(botao);
  });
  const confirmou = await esperar(convite, () => {
    const msg = document.querySelector("#confirmarMensagem");
    return msg && msg.textContent.includes("Obrigado");
  }, 8000, "confirmacao");
  if (!confirmou) {
    const texto = await convite.evaluate(() => {
      const msg = document.querySelector("#confirmarMensagem");
      return msg ? msg.textContent : "sem mensagem";
    });
    process.stdout.write(`mensagem: ${texto}\n`);
  }
  await sleep(1600);

  log("gestao");
  await page.evaluate(() => {
    window.modo("carta");
    gsap.set("#legenda", { autoAlpha: 0 });
  });
  const gestao = await ir(page, "gestao.html");
  await ampliarGestao(gestao);
  await esperar(gestao, () => {
    const tabela = document.querySelector("#gestaoTable");
    return tabela && !tabela.hidden && tabela.querySelectorAll("tbody tr").length > 3;
  }, 15000, "gestao");
  await dizer(page, {
    lugar: "cima",
    kicker: "A gestão",
    titulo: "Cada resposta.",
    sub: "Quem vem. Quem leva alguém.",
  });
  await sleep(1400);
  await gestao.evaluate(() => {
    const bloco = document.querySelector("#cardTabela");
    if (bloco) bloco.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await sleep(1400);

  log("fecho");
  await page.evaluate(() => window.fechar());
  await sleep(7600);
} finally {
  await sleep(300);
  ffmpeg.kill("SIGINT");
  await new Promise((resolve) => ffmpeg.on("close", resolve));
  await browser.close();
  server.close();
  xvfb.kill();
}

if (!ffmpegErro.includes("video:")) {
  process.stderr.write(ffmpegErro.slice(-1200) + "\n");
}

const musica = path.join(root, "assets/music/reels-comercial.mp3");
const comAudio = outPath.replace(/\.mp4$/, ".com-audio.mp4");
let segundos = NaN;
for (let tentativa = 0; tentativa < 5 && !Number.isFinite(segundos); tentativa += 1) {
  await sleep(200);
  const bruto = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${outPath}"`,
    { encoding: "utf8" },
  ).trim();
  segundos = Number(bruto);
}
const saidaFade = Math.max(0, segundos - 2.6).toFixed(2);
await new Promise((resolve, reject) => {
  const mux = spawn("ffmpeg", [
    "-y",
    "-i", outPath,
    "-i", musica,
    "-filter_complex", `[1:a]afade=t=in:st=0:d=1.2,afade=t=out:st=${saidaFade}:d=2.4,volume=0.9[a]`,
    "-map", "0:v:0",
    "-map", "[a]",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    "-movflags", "+faststart",
    comAudio,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let erro = "";
  mux.stderr.on("data", (chunk) => {
    erro += chunk.toString();
  });
  mux.on("close", (code) => {
    if (code === 0) resolve();
    else reject(new Error(erro.slice(-800)));
  });
});
await unlink(outPath);
await rename(comAudio, outPath);
process.stdout.write(`video ${outPath}\n`);
