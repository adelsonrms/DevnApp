#!/usr/bin/env node

/**
 * Script para finalizar todos os processos das portas da aplicação FotUp
 * Uso: node stop.cjs
 */

const { exec, spawn } = require('child_process');
const os = require('os');

const PORTS = [3001, 5173];
const SERVICE_NAMES = {
    5173: 'Frontend (React/Vite)',
    3001: 'Backend (Express)'
};

console.log('🛑 Finalizando todos os processos da aplicação DevnApp...\n');

/**
 * Executa comando e retorna Promise
 */
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

/**
 * Finaliza processo em uma porta específica (Windows)
 */
async function killProcessOnPortWindows(port) {
    try {
        const result = await execCommand(`netstat -ano | findstr :${port}`);
        
        if (result.stdout) {
            const lines = result.stdout.split('\n').filter(line => line.trim());
            const pids = new Set();
            
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 5) {
                    const pid = parts[4];
                    if (pid && pid !== '0') {
                        pids.add(pid);
                    }
                }
            });
            
            if (pids.size > 0) {
                console.log(`🔴 Finalizando ${SERVICE_NAMES[port]} na porta ${port}`);
                for (const pid of pids) {
                    await execCommand(`taskkill /PID ${pid} /F`);
                }
                console.log(`✅ ${SERVICE_NAMES[port]} finalizado com sucesso`);
            } else {
                console.log(`ℹ️  Nenhum processo encontrado na porta ${port} (${SERVICE_NAMES[port]})`);
            }
        } else {
            console.log(`ℹ️  Nenhum processo encontrado na porta ${port} (${SERVICE_NAMES[port]})`);
        }
    } catch (error) {
        console.log(`⚠️  Erro ao verificar porta ${port}: ${error.message}`);
    }
}

/**
 * Finaliza processo em uma porta específica (Unix/Linux/Mac)
 */
async function killProcessOnPortUnix(port) {
    try {
        const result = await execCommand(`lsof -ti:${port}`);
        
        if (result.stdout && result.stdout.trim()) {
            const pids = result.stdout.trim().split('\n');
            console.log(`🔴 Finalizando ${SERVICE_NAMES[port]} na porta ${port}`);
            
            for (const pid of pids) {
                if (pid.trim()) {
                    await execCommand(`kill -9 ${pid.trim()}`);
                }
            }
            console.log(`✅ ${SERVICE_NAMES[port]} finalizado com sucesso`);
        } else {
            console.log(`ℹ️  Nenhum processo encontrado na porta ${port} (${SERVICE_NAMES[port]})`);
        }
    } catch (error) {
        console.log(`⚠️  Erro ao verificar porta ${port}: ${error.message}`);
    }
}

/**
 * Finaliza processos Node.js relacionados ao projeto
 */
async function killNodeProcesses() {
    console.log('\n🔍 Verificando processos Node.js do projeto...');
    
    try {
        if (os.platform() === 'win32') {
            // Windows
            const result = await execCommand('wmic process where "name=\'node.exe\'" get ProcessId,CommandLine /format:csv');
            
            if (result.stdout) {
                const lines = result.stdout.split('\n').filter(line => line.toLowerCase().includes('devnapp'));
                
                if (lines.length > 0) {
                    console.log('🔴 Finalizando processos Node.js relacionados ao projeto');
                    
                    lines.forEach(async (line) => {
                        const parts = line.split(',');
                        if (parts.length >= 3) {
                            const pid = parts[2].trim();
                            if (pid && !isNaN(pid)) {
                                await execCommand(`taskkill /PID ${pid} /F`);
                            }
                        }
                    });
                    
                    console.log('✅ Processos Node.js finalizados');
                } else {
                    console.log('ℹ️  Nenhum processo Node.js do projeto encontrado');
                }
            }
        } else {
            // Unix/Linux/Mac
            const result = await execCommand('ps aux | grep node | grep devnapp');
            
            if (result.stdout && result.stdout.trim()) {
                console.log('🔴 Finalizando processos Node.js relacionados ao projeto');
                await execCommand('pkill -f "node.*devnapp"');
                console.log('✅ Processos Node.js finalizados');
            } else {
                console.log('ℹ️  Nenhum processo Node.js do projeto encontrado');
            }
        }
    } catch (error) {
        console.log(`⚠️  Erro ao finalizar processos Node.js: ${error.message}`);
    }
}

/**
 * Verifica se ainda há processos ativos nas portas
 */
async function checkActivePorts() {
    console.log('\n🔍 Verificação final das portas...');
    
    const activePorts = [];
    
    for (const port of PORTS) {
        try {
            let command;
            if (os.platform() === 'win32') {
                command = `netstat -ano | findstr :${port}`;
            } else {
                command = `lsof -ti:${port}`;
            }
            
            const result = await execCommand(command);
            
            if (result.stdout && result.stdout.trim()) {
                activePorts.push(port);
            }
        } catch (error) {
            // Ignorar erros na verificação final
        }
    }
    
    if (activePorts.length === 0) {
        console.log('✅ Todas as portas foram liberadas com sucesso!');
    } else {
        console.log(`⚠️  Ainda há processos ativos nas portas: ${activePorts.join(', ')}`);
        console.log('💡 Você pode tentar executar o script novamente ou reiniciar o sistema');
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('📍 Verificando portas da aplicação...\n');
    
    // Finalizar processos nas portas específicas
    for (const port of PORTS) {
        if (os.platform() === 'win32') {
            await killProcessOnPortWindows(port);
        } else {
            await killProcessOnPortUnix(port);
        }
    }
    
    // Finalizar processos Node.js relacionados
    await killNodeProcesses();
    
    // Verificação final
    await checkActivePorts();
    
    console.log('\n🎉 Script finalizado!');
    console.log('💡 Para reiniciar a aplicação, use: node start-all-services.cjs');
}

// Executar script
main().catch(console.error);