@echo off
echo ===============================================================
echo    TESTE DE NOTIFICACOES - CHECKLIST APOIO
echo ===============================================================
echo.

REM Carregar variaveis do .env.local
for /f "tokens=1,2 delims==" %%a in (.env.local) do (
    if "%%a"=="VITE_SUPABASE_URL" set SUPABASE_URL=%%b
    if "%%a"=="CRON_SECRET" set CRON_SECRET=%%b
)

if "%SUPABASE_URL%"=="" (
    echo ERRO: Configure VITE_SUPABASE_URL no arquivo .env.local
    pause
    exit /b 1
)

if "%CRON_SECRET%"=="" (
    echo ERRO: Configure CRON_SECRET no arquivo .env.local
    echo Exemplo: CRON_SECRET=meu-secret-seguro
    pause
    exit /b 1
)

echo Disparando verificacao de tarefas vencidas...
echo.

curl "%SUPABASE_URL%/functions/v1/notify-due-tasks" ^
  -X POST ^
  -H "Authorization: Bearer %CRON_SECRET%" ^
  -H "Content-Type: application/json"

echo.
echo.
echo ===============================================================
echo TESTE CONCLUIDO
echo ===============================================================
echo.
pause
