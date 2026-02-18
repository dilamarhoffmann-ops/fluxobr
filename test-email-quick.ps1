# Script PowerShell para testar envio de notificações
# Execute com: .\test-email-quick.ps1
#
# ✅ SECURITY: Usa CRON_SECRET para autenticar — nunca a ANON_KEY
# Configure o CRON_SECRET no arquivo .env.local:
#   CRON_SECRET=seu-secret-aqui
# E também no painel Supabase: Edge Functions > notify-due-tasks > Secrets

# Carregar variáveis do .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.+)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
        }
    }
}

$SUPABASE_URL = [System.Environment]::GetEnvironmentVariable("VITE_SUPABASE_URL")
$CRON_SECRET = [System.Environment]::GetEnvironmentVariable("CRON_SECRET")

if ([string]::IsNullOrWhiteSpace($SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($CRON_SECRET)) {
    Write-Host "`n❌ ERRO: Configure VITE_SUPABASE_URL e CRON_SECRET no arquivo .env.local" -ForegroundColor Red
    Write-Host "   Exemplo: CRON_SECRET=meu-secret-seguro" -ForegroundColor Yellow
    exit 1
}

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TESTE DE NOTIFICAÇÕES - CHECKLIST APOIO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "🔔 Disparando verificação de tarefas vencidas...`n" -ForegroundColor Yellow

$fullUrl = "$SUPABASE_URL/functions/v1/notify-due-tasks"

try {
    $headers = @{
        "Authorization" = "Bearer $CRON_SECRET"
        "Content-Type"  = "application/json"
    }

    $response = Invoke-RestMethod -Uri $fullUrl -Method Post -Headers $headers -ErrorAction Stop

    Write-Host "✅ SUCESSO! Resposta recebida:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White

    if ($null -ne $response.processed) {
        Write-Host "`n📋 Tarefas processadas: $($response.processed)" -ForegroundColor Cyan
        Write-Host "🔍 Total verificado: $($response.total_tasks_checked)" -ForegroundColor Cyan
    }

    if ($response.details -and $response.details.Count -gt 0) {
        Write-Host "`n📧 Emails enviados:" -ForegroundColor Green
        $response.details | ForEach-Object {
            Write-Host "  • $($_.recipient) ($($_.type))" -ForegroundColor White
        }
    }
    else {
        Write-Host "`n📭 Nenhum email enviado (sem tarefas vencidas ou já notificadas)" -ForegroundColor Yellow
    }

}
catch {
    Write-Host "❌ ERRO ao processar notificações:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.ErrorDetails) {
        Write-Host "`nDetalhes:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor White
    }
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TESTE CONCLUÍDO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan


Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TESTE DE NOTIFICAÇÕES POR EMAIL - FLUXOBR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Solicitar email do usuário
$TEST_EMAIL = Read-Host "Digite seu email para teste"

if ([string]::IsNullOrWhiteSpace($TEST_EMAIL)) {
    Write-Host "`n❌ Email não pode estar vazio!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🧪 Iniciando teste de envio de email...`n" -ForegroundColor Yellow

# Teste 1: Email simples
Write-Host "📧 Enviando email de teste para: $TEST_EMAIL" -ForegroundColor Green
$functionUrl = "$SUPABASE_URL/functions/v1/notify-due-tasks?email=$([System.Web.HttpUtility]::UrlEncode($TEST_EMAIL))"

Write-Host "📡 URL: $functionUrl`n" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $SUPABASE_ANON_KEY"
        "Content-Type"  = "application/json"
    }

    $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ SUCESSO! Resposta recebida:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    
    Write-Host "`n📬 Verifique sua caixa de entrada (e spam) em: $TEST_EMAIL" -ForegroundColor Cyan
    
}
catch {
    Write-Host "❌ ERRO ao enviar email:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "`nDetalhes do erro:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor White
    }
}

Write-Host "`n─────────────────────────────────────────────────────`n" -ForegroundColor Gray

# Perguntar se quer testar notificação completa
$testFull = Read-Host "Deseja testar notificação completa (tarefas vencidas)? (S/N)"

if ($testFull -eq "S" -or $testFull -eq "s") {
    Write-Host "`n🔔 Testando notificação completa...`n" -ForegroundColor Yellow
    
    $fullUrl = "$SUPABASE_URL/functions/v1/notify-due-tasks"
    
    try {
        $response = Invoke-RestMethod -Uri $fullUrl -Method Post -Headers $headers -ErrorAction Stop
        
        Write-Host "✅ SUCESSO! Resposta recebida:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
        
        if ($response.processed) {
            Write-Host "`n📋 Tarefas processadas: $($response.processed)" -ForegroundColor Cyan
            Write-Host "🔍 Total verificado: $($response.total_tasks_checked)" -ForegroundColor Cyan
        }
        
        if ($response.details -and $response.details.Count -gt 0) {
            Write-Host "`n📧 Emails enviados:" -ForegroundColor Green
            $response.details | ForEach-Object {
                Write-Host "  • $($_.recipient) ($($_.type))" -ForegroundColor White
            }
        }
        else {
            Write-Host "`n📭 Nenhum email enviado (sem tarefas vencidas ou já notificadas)" -ForegroundColor Yellow
        }
        
    }
    catch {
        Write-Host "❌ ERRO ao processar notificações:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TESTE CONCLUÍDO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan
