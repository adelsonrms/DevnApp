// Função para iniciar um serviço
// Utiliza o módulo 'child_process' para executar o comando de desenvolvimento do serviço

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const services = [
  {
    name: 'Shared',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'shared'),
    color: '\x1b[35m' // Magenta
  },
  {
    name: 'Frontend',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'client'),
    port: 5173,
    healthUrl: 'http://localhost:5173/',
    color: '\x1b[36m' // Cyan
  },
  {
    name: 'Backend',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'server'),
    port: 3001, 
    healthUrl: 'http://localhost:3001/api/health',
    color: '\x1b[32m' // Green
  }
];

const processes = [];
const readyServices = new Set();
const reset = '\x1b[0m';

// Termos para filtrar nos logs (pode ser expandido via ENV LOG_FILTER_SKIP)
const defaultFilters = [
  'DEP0190', 
  'DeprecationWarning',
  'watching for file changes',
  'starting compilation',
  'found 0 errors'
];

const customFilters = process.env.LOG_FILTER_SKIP ? process.env.LOG_FILTER_SKIP.split(',') : [];
const allFilters = [...defaultFilters, ...customFilters].map(f => f.toLowerCase().trim());

/**
 * Verifica se uma linha de log deve ser ignorada
 */
function shouldFilterLine(line) {
  const lowerLine = line.toLowerCase();
  return allFilters.some(filter => lowerLine.includes(filter));
}

// Função para fazer requisição HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Função para testar health de um serviço (Integrada no waitForServices para evitar repetição de logs)
// Removida a função testHealth antiga para centralizar a lógica e evitar logs duplicados

// Função para iniciar um serviço
function startService(service) {
  const processo = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'pipe',
    shell: true, // Reativado para compatibilidade total com comandos npm no Windows
    env: {
      ...process.env,
      NODE_NO_WARNINGS: '1', // Tenta suprimir avisos de depreciação nos processos filhos
      ...(service.env || {})
    }
  });

  processo.on('error', (err) => {
    console.error(`${service.color}[${service.name} SPAWN ERROR]${reset} Não foi possível iniciar o serviço:`, err.message);
  });
  
  //Eventos que são emitidos pelo processo
  //Quando o processo for iniciado, ele emitirá o evento 'data' com a saída do processo
  
  // stdout : Saída padrão do processo. "data" é um Buffer que contém a saída do processo
  processo.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (shouldFilterLine(line)) return;

      if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail')) {
        console.log(`${service.color}[${service.name}]${reset} ${line}`);
      }
    });
  });
  
  // stderr : Saída de erro do processo. "data" é um Buffer que contém a saída de erro do processo
  processo.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (shouldFilterLine(line)) return;
      console.log(`${service.color}[${service.name} ERROR]${reset} ${line}`);
    });
  });
  
  // close : O processo foi fechado. "code" é o código de saída do processo
  // Se for diferente de 0, significa que houve um erro
  processo.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${service.color}[${service.name}] Finalizado com código ${code}${reset}`);
    }
  });
  
  processes.push({ service, process: processo });
  return processo;
}

// Função para aguardar que os serviços estejam prontos
async function waitForServices() {
  const maxAttempts = 20;
  const delay = 1500;
  let backendData = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const pending = [];
    for (const service of services) {
      if (readyServices.has(service.name)) continue;

      // Se o serviço não tem URL de health, consideramos OK se o processo iniciou
      if (!service.healthUrl) {
        console.log(`${service.color}✅ ${service.name}: Pronto${reset}`);
        readyServices.add(service.name);
        continue;
      }

      try {
        const response = await makeRequest(service.healthUrl);
        if (response.status === 200) {
          console.log(`${service.color}✅ ${service.name}: Pronto${reset}`);
          readyServices.add(service.name);
          if (service.name === 'Backend') {
            backendData = response.data;
          }
          continue;
        }
        pending.push(service.name);
      } catch (error) {
        pending.push(service.name);
      }
    }
    
    if (pending.length === 0) {
      console.log(`\n${reset}🎉 Todos os serviços estão online!${reset}`);
      console.log('\n📋 Resumo dos serviços:');
      services.forEach(service => {
        const urlInfo = service.healthUrl ? ` -> ${service.healthUrl}` : ' (Compilação)';
        console.log(`   • ${service.color}${service.name}${reset}${urlInfo}`);
      });

      if (backendData) {
        console.log(`\n📂 Banco de Dados: ${backendData.provider || 'postgres'}`);
        console.log(`✨ Versão: ${backendData.version || '1.0.0'}`);
      }
      return true;
    }

    if (attempt % 3 === 0) {
      console.log(`⏳ Aguardando: ${pending.join(', ')}...`);
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  const finalPending = services.filter(s => !readyServices.has(s.name)).map(s => s.name);
  console.log(`\n❌ Timeout: ${finalPending.join(', ')} não responderam.`);
  return false;
}

// Função principal
async function main() {
  console.log('🚀 Iniciando todos os serviços do Workpace...\n');
  
  // Iniciar todos os serviços
  services.forEach(startService);
  
  // Aguardar um pouco para os serviços iniciarem
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Testar health checks
  await waitForServices();
}

// Lidar com encerramento
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando todos os serviços...');
  processes.forEach(({ service, process }) => {
    console.log(`Finalizando ${service.name}...`);
    process.kill('SIGTERM');
  });
  process.exit(0);
});

// Executar
main().catch(console.error);
