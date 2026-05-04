import { RepositoryFactory } from './src/database/repository.factory';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

// Carregar variáveis de ambiente
dotenv.config();

function generateUUID() {
  return crypto.randomUUID();
}

async function bootstrap() {
  console.log('🚀 Iniciando script de cadastro inicial...');

  try {
    const orgRepository = RepositoryFactory.get<any>('organizations');
    const userRepository = RepositoryFactory.get<any>('users');

    // 1. Criar Organização Root
    console.log('📦 Verificando Organização Root...');
    const existingOrgs = await orgRepository.findMany({ filters: { slug: 'root' } });
    let rootOrgId = '';

    if (existingOrgs.length === 0) {
      const rootOrg = await orgRepository.create({
        id: generateUUID(),
        name: 'Root Organization',
        slug: 'root',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      rootOrgId = rootOrg.id;
      console.log(`✅ Organização Root criada com ID: ${rootOrgId}`);
    } else {
      rootOrgId = existingOrgs[0].id;
      console.log(`ℹ️ Organização Root já existe (ID: ${rootOrgId})`);
    }

    // 2. Criar Usuário Admin
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@root.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
    
    console.log(`👤 Verificando Usuário Admin (${adminEmail})...`);
    const existingUsers = await userRepository.findMany({ filters: { email: adminEmail } });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existingUsers.length === 0) {
      const adminUser = await userRepository.create({
        id: generateUUID(),
        email: adminEmail,
        name: 'System Admin',
        password: hashedPassword,
        role: 'owner', // Role mais alto
        organization_id: rootOrgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log(`✅ Usuário Admin criado com sucesso!`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Senha: ${adminPassword}`);
    } else {
      const existingUser = existingUsers[0];
      await userRepository.update(existingUser.id, {
        password: hashedPassword,
        updated_at: new Date().toISOString()
      });
      console.log(`ℹ️ Usuário Admin já existe. Senha forçada para a definição do script.`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Senha: ${adminPassword}`);
    }

    console.log('\n✨ Processo concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante o bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
