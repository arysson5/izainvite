# Configurar confirmação de presença (Google Planilha)

A confirmação de presença grava na planilha [convite_isa](https://docs.google.com/spreadsheets/d/13DSFfqDkwA2Yq0nxdiEQoSxacQKRdP444PYoFDiYeXM/edit), aba **convidados**, colunas: **Nome**, **presença**, **aconpanhante**, **Nome do acompanhante**.

## 1. Google Cloud – conta de serviço

1. Acesse [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto (ou use um existente).
3. Ative a **Google Sheets API**: no menu, APIs e serviços → Biblioteca → pesquise “Google Sheets API” → Ativar.
4. **Conta de serviço**: APIs e serviços → Credenciais → Criar credenciais → Conta de serviço.
  - Nome: ex. `convite-planilha`.
  - Conclua a criação.
5. Na conta de serviço criada, abra **Chaves** → Adicionar chave → **JSON**. O arquivo será baixado.
6. **Compartilhe a planilha** com o e-mail da conta de serviço (ex.: `convite-planilha@meu-projeto.iam.gserviceaccount.com`) com permissão **Editor**.

## 2. Variáveis de ambiente no Vercel

1. No [Vercel](https://vercel.com), abra o projeto → **Settings** → **Environment Variables**.
2. Crie a variável:
  - **Name:** `GOOGLE_SERVICE_ACCOUNT_JSON`
  - **Value:** cole o conteúdo **inteiro** do JSON da conta de serviço (uma única linha; pode minificar o JSON).
  - Marque o ambiente (Production, Preview, etc.) e salve.
3. (Opcional) Se usar **outra** planilha, crie:
  - **Name:** `GOOGLE_SHEET_ID`
  - **Value:** o ID da planilha (o que aparece em `docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit`).

## 3. Valor da variável no Vercel

- No campo **Value** coloque **somente** o conteúdo do arquivo JSON (começando com `{` e terminando com `}`).
- **Não** inclua o nome da variável no valor (ex.: não use `GOOGLE_SERVICE_ACCOUNT_JSON={...}` no Value).
- O JSON deve estar em **uma única linha** (minificado). Quebras de linha podem causar erro. Você pode minificar em [jsonformatter.org](https://jsonformatter.org/json-minify) colando o JSON do arquivo e copiando o resultado para o Value.

## 4. Erro 500 no Vercel

- Confirme que a planilha foi **compartilhada** com o e-mail da conta de serviço (ex.: `invite-sheets@casa-nova-461916.iam.gserviceaccount.com`) com permissão **Editor**.
- Abra a planilha no Google Sheets → Compartilhar → adicione esse e-mail como Editor.
- Depois de alterar variáveis no Vercel, faça um **novo deploy** (Redeploy) para a configuração ser aplicada.

## 5. Testar

Faça um novo deploy. Na página do convite, use **Confirmar presença**, preencha e envie. Uma nova linha deve aparecer na aba **convidados** da planilha.

## Resumo das variáveis


| Variável                      | Obrigatório | Descrição                                           |
| ----------------------------- | ----------- | --------------------------------------------------- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Sim         | JSON completo da conta de serviço (uma linha).      |
| `GOOGLE_SHEET_ID`             | Não         | ID da planilha; padrão é a planilha do convite_isa. |


