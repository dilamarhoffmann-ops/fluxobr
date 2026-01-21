@echo off
echo ===============================================================
echo    TESTE DE NOTIFICACOES POR EMAIL - FLUXOBR
echo ===============================================================
echo.

set /p TEST_EMAIL="Digite seu email para teste: "

if "%TEST_EMAIL%"=="" (
    echo.
    echo ERRO: Email nao pode estar vazio!
    pause
    exit /b 1
)

echo.
echo Enviando email de teste para: %TEST_EMAIL%
echo.

curl "https://wwedununqkjllxrjlcnc.supabase.co/functions/v1/notify-due-tasks?email=%TEST_EMAIL%" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3ZWR1bnVucWtqbGx4cmpsY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5Nzc4MDksImV4cCI6MjA4MzU1MzgwOX0.0J74GHdUbAjLhZ0EhR4zJjC4tAwBZf1PNMBWbG0_9MA" ^
  -H "Content-Type: application/json"

echo.
echo.
echo ===============================================================
echo Verifique sua caixa de entrada (e spam) em: %TEST_EMAIL%
echo ===============================================================
echo.
pause
