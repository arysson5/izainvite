@echo off
REM Inicia ngrok na porta 5500 (Live Server - http://127.0.0.1:5500)
set NGROK_EXE=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe
if not exist "%NGROK_EXE%" (
  echo ngrok nao encontrado em: %NGROK_EXE%
  echo Instale com: winget install ngrok.ngrok
  pause
  exit /b 1
)
echo Iniciando ngrok na porta 5500 (Live Server)...
echo Abra http://127.0.0.1:4040 no navegador para ver o link publico.
echo.
"%NGROK_EXE%" http 5500
pause
