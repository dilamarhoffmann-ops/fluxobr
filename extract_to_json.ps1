# Script PowerShell para extrair texto de arquivo DOCX e salvar em JSON
param(
    [string]$DocxPath = "C:\Users\SR APOIO\OneDrive\Documents\Projetos IA\agilepulse-dashboard\taredas squad.docx",
    [string]$OutputPath = "C:\Users\SR APOIO\OneDrive\Documents\Projetos IA\agilepulse-dashboard\tarefas_extraidas.json"
)

try {
    # Criar diretório temporário
    $tempDir = Join-Path $env:TEMP "docx_extract_$(Get-Random)"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    # Extrair DOCX (é um arquivo ZIP)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($DocxPath, $tempDir)
    
    # Ler o arquivo document.xml
    $documentXml = Join-Path $tempDir "word\document.xml"
    
    if (Test-Path $documentXml) {
        [xml]$xmlContent = Get-Content $documentXml -Encoding UTF8
        
        # Namespace do Word
        $ns = @{w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' }
        
        # Extrair todos os parágrafos
        $paragraphs = Select-Xml -Xml $xmlContent -XPath "//w:p" -Namespace $ns
        
        $allLines = @()
        foreach ($para in $paragraphs) {
            $texts = Select-Xml -Xml $para.Node -XPath ".//w:t" -Namespace $ns
            $paraText = ($texts | ForEach-Object { $_.Node.InnerText }) -join ""
            
            if ($paraText.Trim()) {
                $allLines += $paraText.Trim()
            }
        }
        
        # Criar objeto JSON
        $result = @{
            filename    = Split-Path $DocxPath -Leaf
            extractedAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
            lines       = $allLines
            totalLines  = $allLines.Count
        }
        
        # Salvar como JSON
        $result | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath -Encoding UTF8
        
        Write-Host "Conteúdo extraído com sucesso!"
        Write-Host "Total de linhas: $($allLines.Count)"
        Write-Host "Arquivo salvo em: $OutputPath"
    }
    else {
        Write-Host "ERRO: Arquivo document.xml não encontrado no DOCX"
        exit 1
    }
    
    # Limpar diretório temporário
    Remove-Item -Path $tempDir -Recurse -Force
}
catch {
    Write-Host "ERRO ao processar arquivo: $_"
    exit 1
}
