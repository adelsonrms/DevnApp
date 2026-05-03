import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root if not found in current dir
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './modules/auth/auth.routes';
import orgRoutes from './modules/organization/organization.routes';
import userRoutes from './modules/user/user.routes';

/**
 * DevnApp API Server
 */
const app = express();
const port = process.env.PORT || 3001;

// 1. GLOBAL MIDDLEWARES
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simpler development, can be tightened later
}));
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parser

// 2. ROUTES
// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    provider: process.env.DB_PROVIDER || 'postgres',
    version: '1.0.0-template'
  });
});

// App Modules
app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/users', userRoutes);

// 3. SERVE FRONTEND (Production)
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Handle SPA routing: all other routes serve index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  }
});

// 4. START SERVER
app.listen(port, () => {
  console.log(`\n🚀 DevnApp Template API running at http://localhost:${port}`);
  console.log(`📂 DB Provider active: ${process.env.DB_PROVIDER || 'postgres'}\n`);
  console.log(`✨ Template system ready for production use.`);
});
