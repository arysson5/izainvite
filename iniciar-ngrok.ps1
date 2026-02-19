# Inicia ngrok na porta 5500 (Live Server / http://127.0.0.1:5500)
$ngrok = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
if (-not (Test-Path $ngrok)) {
  Write-Host "ngrok nao encontrado. Instale com: winget install ngrok.ngrok"
  exit 1
}
Write-Host "Iniciando ngrok na porta 5500 (Live Server)..."
Write-Host "Seu site deve estar em: http://127.0.0.1:5500/inicio.html"
Write-Host "Painel ngrok: http://127.0.0.1:4040"
Write-Host ""
 $ngrok http 5500
