# Servidor na porta 80
# Execute como Administrador: clique direito no script > "Executar com PowerShell como administrador"
Set-Location $PSScriptRoot
Write-Host "Iniciando servidor em http://localhost/inicio.html"
Write-Host ""
Write-Host "Se der erro de permissao na porta 80, execute o PowerShell como Administrador."
Write-Host ""
python -m http.server 80
