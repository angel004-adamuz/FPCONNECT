# Compila la memoria TFG en PDF (2 pasadas) desde la raiz del repo.
param(
  [string]$TexFile = "FPConnect_TFG.tex"
)

if (-not (Test-Path $TexFile)) {
  Write-Error "No se encontro el archivo: $TexFile"
  exit 1
}

$pdflatex = Get-Command pdflatex -ErrorAction SilentlyContinue
if (-not $pdflatex) {
  Write-Error "pdflatex no esta instalado o no esta en PATH. Revisa Requisitos/GUIA_COMPILACION_LATEX_WINDOWS.md"
  exit 1
}

Write-Host "Compilando $TexFile (pasada 1)..."
pdflatex -interaction=nonstopmode -halt-on-error $TexFile
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Compilando $TexFile (pasada 2)..."
pdflatex -interaction=nonstopmode -halt-on-error $TexFile
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Compilacion finalizada. PDF generado correctamente." -ForegroundColor Green
