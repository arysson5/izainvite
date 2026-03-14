const { google } = require("googleapis");

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "13DSFfqDkwA2Yq0nxdiEQoSxacQKRdP444PYoFDiYeXM";
const SHEET_TAB = "convidados";
const GESTAO_SENHA = "xvdaiza123";

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
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON inválido");
  }
  if (!creds.client_email || !creds.private_key) {
    throw new Error("JSON da conta de serviço deve ter client_email e private_key");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return auth;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const token = req.headers["x-gestao-token"] || req.query.token || "";
  if (token !== GESTAO_SENHA) {
    return res.status(401).json({ message: "Acesso negado. Senha necessária." });
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_TAB}!A:D`,
    });

    const rows = result.data.values || [];
    const header = rows[0] || ["Nome", "presença", "acompanhante", "Nome do acompanhante"];
    const dataRows = rows.slice(1).filter((r) => r && r.length > 0);

    const convidados = dataRows.map((r) => ({
      nome: (r[0] || "").toString().trim(),
      presenca: (r[1] || "").toString().trim(),
      acompanhante: (r[2] || "").toString().trim(),
      nomeAcompanhante: (r[3] || "").toString().trim(),
    }));

    const convidadosOficiais = convidados.length;
    const totalAcompanhantes = convidados.filter(
      (c) => (c.acompanhante || "").toLowerCase() === "sim" || (c.nomeAcompanhante || "").trim() !== ""
    ).length;
    const totalGeral = convidadosOficiais + totalAcompanhantes;

    return res.status(200).json({
      header,
      convidados,
      totais: {
        convidadosOficiais,
        acompanhantes: totalAcompanhantes,
        total: totalGeral,
      },
    });
  } catch (err) {
    console.error("Erro ao ler planilha:", err.message);
    return res.status(500).json({
      message: "Não foi possível carregar a lista de convidados. Verifique a configuração da planilha.",
    });
  }
};
