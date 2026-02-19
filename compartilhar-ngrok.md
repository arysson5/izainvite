# Compartilhar convite com link público (ngrok)

## Primeira vez: conta e authtoken

O ngrok exige uma **conta gratuita** e um **authtoken**:

1. Crie uma conta: **[https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)**
2. Copie seu authtoken: **[https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)**
3. No PowerShell (na pasta do projeto ou em qualquer lugar), rode **uma vez**:
   ```powershell
   & "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe" config add-authtoken SEU_TOKEN_AQUI
   ```
   Substitua `SEU_TOKEN_AQUI` pelo token que você copiou. Depois disso não precisa repetir.

## O que você precisa

1. **Servidor local na porta 5500** – por exemplo o **Live Server** do VS Code (botão “Go Live”) ou outro servidor em `http://127.0.0.1:5500`.
2. **ngrok** – túnel na mesma porta do servidor (80 ou 5500). Se usar servidor na porta 80, rode `ngrok http 80`.

**Servidor na porta 80:** execute `iniciar-servidor-80.bat` como Administrador. Acesso: `http://localhost/inicio.html`

## Como ver seu link público

- **Opção 1:** Abra no navegador: **http://127.0.0.1:4040**  
  Na interface do ngrok aparece o link público (ex.: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`).

- **Opção 2:** No terminal onde o ngrok está rodando, procure a linha **Forwarding**, por exemplo:
  ```text
  Forwarding   https://abc123.ngrok-free.app -> http://localhost:8080
  ```
  Use esse `https://...` como link público.

## Páginas para compartilhar

Com o Live Server em `http://127.0.0.1:5500` e o ngrok rodando:

- **Início (carta):** `https://SEU-LINK-NGROK/inicio.html`
- **Convite (página final):** `https://SEU-LINK-NGROK/convite.html`

Quem acessar pelo link público verá o fluxo: início → vídeo → convite.

## Para rodar de novo depois

1. **Deixe o Live Server rodando** em `http://127.0.0.1:5500` (botão “Go Live” no VS Code na pasta do projeto).

2. **Inicie o ngrok na porta 5500:**  
   - **Opção fácil:** dois cliques em **`iniciar-ngrok.bat`** ou no PowerShell: `.\iniciar-ngrok.ps1`
   - **Ou** em um terminal: `ngrok http 5500` (se ngrok estiver no PATH)
   - **Ou** com caminho completo:
     ```powershell
   & "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe" http 5500
   ```

3. Copie o link **Forwarding** que o ngrok mostrar (ou abra http://127.0.0.1:4040) e compartilhe.

## Requisitos

- **Python** instalado (para `python -m http.server`).
- **ngrok** instalado: `winget install ngrok.ngrok` ou [ngrok.com/download](https://ngrok.com/download).

Se não tiver Python, pode usar: `npx serve . -l 8080` (Node.js) e depois iniciar o ngrok.
