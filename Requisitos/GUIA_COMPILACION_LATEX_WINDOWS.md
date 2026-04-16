# Guia de Compilacion LaTeX en Windows - FPConnect

## 1. Opcion recomendada: MiKTeX
1. Descargar e instalar MiKTeX:
   - https://miktex.org/download
2. Durante instalacion:
   - Instalar para el usuario actual.
   - Permitir instalacion automatica de paquetes faltantes.
3. Reiniciar terminal de VS Code.

## 2. Verificar instalacion
Ejecutar en PowerShell:

```powershell
pdflatex --version
```

Si responde con version, esta correcto.

## 3. Compilar la memoria
Desde la raiz del proyecto:

```powershell
pdflatex -interaction=nonstopmode -halt-on-error "FPConnect_TFG.tex"
pdflatex -interaction=nonstopmode -halt-on-error "FPConnect_TFG.tex"
```

Se ejecuta dos veces para actualizar indice y referencias.

## 4. Salida esperada
- Archivo PDF: `FPConnect_TFG.pdf`
- Archivos auxiliares: `.aux`, `.log`, `.toc`

## 5. Errores frecuentes y solucion
- `pdflatex no se reconoce`:
  - Reabrir VS Code o anadir MiKTeX al PATH.
- Falta paquete:
  - Aceptar instalacion cuando MiKTeX lo solicite.
- Error por caracteres:
  - Revisar comillas raras o simbolos no escapados en `.tex`.

## 6. Limpieza de auxiliares (opcional)

```powershell
Remove-Item *.aux,*.log,*.toc -ErrorAction SilentlyContinue
```
