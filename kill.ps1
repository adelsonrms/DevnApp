
# Script para limpar processos e portas do ContabHub
Write-Host "--- LIMPANDO AMBIENTE ---" -ForegroundColor Cyan

# 1. Mata todos os processos Node e Nodemon
Write-Host "Finalizando todos os processos Node.js e Nodemon..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process nodemon -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Busca e mata especificamente quem estiver nas portas do projeto
$ports = @(5173, 3001, 3443, 9229)
foreach ($port in $ports) {
    Write-Host "Verificando porta $port..." -ForegroundColor Gray
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $procId = $conn.OwningProcess
            if ($procId -gt 0) {
                Write-Host "Matando processo $procId que ocupa a porta $port..." -ForegroundColor Red
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "✅ Ambiente limpo! Pode iniciar o servidor novamente." -ForegroundColor Green
