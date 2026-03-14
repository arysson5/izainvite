const { google } = require("googleapis");

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "13DSFfqDkwA2Yq0nxdiEQoSxacQKRdP444PYoFDiYeXM";
const SHEET_TAB = "convidados";

function getAuth() {
  let raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw || typeof raw !== "string") {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON não está definido");
  }
  raw = raw.trim();
  if (raw.startsWith("GOOGLE_SERVICE_ACCOUNT_JSON=")) {
    raw = raw.slice("GOOGLE_SERVICE_ACCOUNT_JSON=".length).trim();
  }
  if (raw.startsWith("'") && raw.endsWith("'")) raw = raw.slice(1, -1);
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1).replace(/\\"/g, '"');
  let creds;
  try {
    creds = JSON.parse(raw);
  } catch (e) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON inválido (não é JSON válido). Use só o conteúdo do arquivo JSON, em uma linha.");
  }
  if (!creds.client_email || !creds.private_key) {
    throw new Error("JSON da conta de serviço deve ter client_email e private_key");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { nome, presenca, nomeAcompanhante } = req.body || {};
  if (!nome || !presenca) {
    return res.status(400).json({ message: "Envie nome e presença." });
  }

  const acompanhante = presenca === "Levarei um acompanhante" ? "Sim" : "Não";
  const nomeDoAcompanhante = presenca === "Levarei um acompanhante" ? (nomeAcompanhante || "").trim() : "";

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_TAB}!A:D`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[nome, presenca, acompanhante, nomeDoAcompanhante]],
      },
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao gravar na planilha:", err.message);
    const isAuth = err.message && (err.message.includes("JSON") || err.message.includes("credencial") || err.message.includes("403") || err.message.includes("permission"));
    return res.status(500).json({
      message: isAuth
        ? "Erro de configuração da planilha. Verifique CONFIGURAR_CONFIRMACAO.md e se a planilha foi compartilhada com o e-mail da conta de serviço."
        : "Não foi possível salvar a confirmação. Tente novamente.",
    });
  }
};
