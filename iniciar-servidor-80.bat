@echo off
REM Servidor na porta 80 - EXECUTE COMO ADMINISTRADOR (clique direito > Executar como administrador)
cd /d "%~dp0"
echo Iniciando servidor em http://localhost/inicio.html
echo.
echo Se der erro de permissao, clique direito neste arquivo e escolha "Executar como administrador".
echo.
python -m http.server 80
pause
