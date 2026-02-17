# Script PowerShell para extrair texto de arquivo DOCX
# DOCX é um arquivo ZIP contendo XML

param(
    [string]$DocxPath = "C:\Users\SR APOIO\OneDrive\Documents\Projetos IA\agilepulse-dashboard\taredas squad.docx"
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
        
        Write-Host "=" -NoNewline
        Write-Host ("=" * 79)
        Write-Host "CONTEÚDO DO ARQUIVO: $(Split-Path $DocxPath -Leaf)"
        Write-Host "=" -NoNewline
        Write-Host ("=" * 79)
        Write-Host ""
        
        # Namespace do Word
        $ns = @{w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        # Extrair todos os parágrafos
        $paragraphs = Select-Xml -Xml $xmlContent -XPath "//w:p" -Namespace $ns
        
        foreach ($para in $paragraphs) {
            $texts = Select-Xml -Xml $para.Node -XPath ".//w:t" -Namespace $ns
            $paraText = ($texts | ForEach-Object { $_.Node.InnerText }) -join ""
            
            if ($paraText.Trim()) {
                Write-Host $paraText
            }
        }
        
        # Extrair tabelas
        $tables = Select-Xml -Xml $xmlContent -XPath "//w:tbl" -Namespace $ns
        
        if ($tables) {
            Write-Host ""
            Write-Host "=" -NoNewline
            Write-Host ("=" * 79)
            Write-Host "TABELAS ENCONTRADAS:"
            Write-Host "=" -NoNewline
            Write-Host ("=" * 79)
            
            $tableNum = 1
            foreach ($table in $tables) {
                Write-Host ""
                Write-Host "--- Tabela $tableNum ---"
                
                $rows = Select-Xml -Xml $table.Node -XPath ".//w:tr" -Namespace $ns
                foreach ($row in $rows) {
                    $cells = Select-Xml -Xml $row.Node -XPath ".//w:tc" -Namespace $ns
                    $cellTexts = @()
                    
                    foreach ($cell in $cells) {
                        $cellTextNodes = Select-Xml -Xml $cell.Node -XPath ".//w:t" -Namespace $ns
                        $cellText = ($cellTextNodes | ForEach-Object { $_.Node.InnerText }) -join ""
                        $cellTexts += $cellText.Trim()
                    }
                    
                    Write-Host ($cellTexts -join " | ")
                }
                
                $tableNum++
            }
        }
        
        Write-Host ""
        Write-Host "=" -NoNewline
        Write-Host ("=" * 79)
        Write-Host "FIM DO ARQUIVO"
        Write-Host "=" -NoNewline
        Write-Host ("=" * 79)
    }
    else {
        Write-Host "ERRO: Arquivo document.xml não encontrado no DOCX"
    }
    
    # Limpar diretório temporário
    Remove-Item -Path $tempDir -Recurse -Force
}
catch {
    Write-Host "ERRO ao processar arquivo: $_"
    exit 1
}
