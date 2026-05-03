const { execSync } = require('child_process');
const path = require('path');

const projectRoot = __dirname;
// Order matters: shared must be built first
const workspaces = ['shared', 'server', 'client'];

console.log('🏗️ Starting build for all workspaces...\n');

workspaces.forEach(workspace => {
  console.log(`📦 Building ${workspace}...`);
  try {
    execSync('npm run build', {
      cwd: path.join(projectRoot, workspace),
      stdio: 'inherit'
    });
    console.log(`✅ ${workspace} built successfully.\n`);
  } catch (error) {
    console.error(`❌ Error building ${workspace}: ${error.message}`);
    process.exit(1);
  }
});

console.log('🎉 All workspaces built successfully!');
