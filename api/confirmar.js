const { google } = require("googleapis");

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "13DSFfqDkwA2Yq0nxdiEQoSxacQKRdP444PYoFDiYeXM";
const SHEET_TAB = "convidados";

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON não está definido");
  }
  let creds;
  try {
    creds = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON inválido (não é JSON válido)");
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
    return res.status(500).json({
      message: "Não foi possível salvar a confirmação. Tente novamente.",
    });
  }
};
