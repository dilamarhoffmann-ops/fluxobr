# Script para processar tarefas do DOCX e criar estrutura de template
param(
    [string]$JsonPath = ".\tarefas_extraidas.json"
)

$json = Get-Content $JsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

Write-Host "=== TAREFAS EXTRAÍDAS ===" -ForegroundColor Green
Write-Host ""

$currentTask = $null
$tasks = @()
$taskNumber = 0

foreach ($line in $json.lines) {
    # Detectar se é uma tarefa principal (geralmente em maiúsculas ou começa com número)
    if ($line -match '^\d+\s*[-.]?\s*(.+)$' -or $line -eq $line.ToUpper() -and $line.Length -gt 5) {
        # Nova tarefa
        if ($currentTask) {
            $tasks += $currentTask
        }
        
        $taskNumber++
        $currentTask = @{
            number   = $taskNumber
            title    = $line
            subtasks = @()
        }
        
        Write-Host "TAREFA $taskNumber : $line" -ForegroundColor Cyan
    }
    elseif ($line.Trim() -ne "" -and $currentTask) {
        # Subtarefa
        $currentTask.subtasks += $line
        Write-Host "  - $line" -ForegroundColor Gray
    }
}

# Adicionar última tarefa
if ($currentTask) {
    $tasks += $currentTask
}

Write-Host ""
Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "Total de tarefas: $($tasks.Count)"
Write-Host "Total de subtarefas: $(($tasks | ForEach-Object { $_.subtasks.Count } | Measure-Object -Sum).Sum)"

# Salvar estrutura processada
$output = @{
    processedAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    totalTasks  = $tasks.Count
    tasks       = $tasks
}

$output | ConvertTo-Json -Depth 10 | Out-File -FilePath ".\tarefas_processadas.json" -Encoding UTF8

Write-Host ""
Write-Host "Estrutura salva em: tarefas_processadas.json" -ForegroundColor Green
