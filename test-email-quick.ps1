# Script PowerShell para testar envio de email
# Execute com: .\test-email-quick.ps1

$SUPABASE_URL = "https://wwedununqkjllxrjlcnc.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3ZWR1bnVucWtqbGx4cmpsY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5Nzc4MDksImV4cCI6MjA4MzU1MzgwOX0.0J74GHdUbAjLhZ0EhR4zJjC4tAwBZf1PNMBWbG0_9MA"

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
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ SUCESSO! Resposta recebida:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    
    Write-Host "`n📬 Verifique sua caixa de entrada (e spam) em: $TEST_EMAIL" -ForegroundColor Cyan
    
} catch {
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
        } else {
            Write-Host "`n📭 Nenhum email enviado (sem tarefas vencidas ou já notificadas)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ ERRO ao processar notificações:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TESTE CONCLUÍDO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan
