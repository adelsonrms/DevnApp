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
const reset = '\x1b[0m';

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

// Função para testar health de um serviço
async function testHealth(service, silent = false) {
  try {
    const response = await makeRequest(service.healthUrl);
    if (response.status === 200) {
      if (!silent) {
        console.log(`${service.color}✅ ${service.name}: OK${reset}`);
        if (response.data && typeof response.data === 'object') {
          console.log(`   Status: ${response.data.status || 'unknown'}`);
        }
      }
      return true;
    } else {
      console.log(`${service.color}❌ ${service.name}: HTTP ${response.status}${reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${service.color}❌ ${service.name}: -> Aguardando inicialização...`);
    return false;
  }
}

// Função para iniciar um serviço
function startService(service) {
  console.log(`${service.color}🚀 Iniciando ${service.name}...${reset}`);
  
  const childProcess = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'pipe',
    shell: true,
    env: {
      ...process.env,
      ...(service.env || {})
    }
  });
  
  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`${service.color}[${service.name}]${reset} ${line}`);
    });
  });
  
  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`${service.color}[${service.name} ERROR]${reset} ${line}`);
    });
  });
  
  childProcess.on('close', (code) => {
    console.log(`${service.color}[${service.name}] Processo finalizado com código ${code}${reset}`);
  });
  
  processes.push({ service, process: childProcess });
  return childProcess;
}

// Função para aguardar que os serviços estejam prontos
async function waitForServices() {
  console.log('\n⏳ Aguardando serviços ficarem prontos...');
  
  const maxAttempts = 10;
  const delay = 2000;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const results = [];
    for (const service of services) {
      const isHealthy = await testHealth(service, false);
      results.push({ service: service.name, healthy: isHealthy });
    }
    
    const allHealthy = results.every(r => r.healthy);
    
    if (allHealthy) {
      console.log('\n🎉 Todos os serviços estão funcionando!');
      console.log('\n📋 Resumo dos serviços:');
      services.forEach(service => {
        console.log(`   • ${service.name}: ${service.healthUrl}`);
      });
      return true;
    }

    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('\n❌ Nem todos os serviços estão respondendo após todas as tentativas.');
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
