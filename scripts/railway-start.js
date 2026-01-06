#!/usr/bin/env node
// Railway start script with database migration

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('🚀 Starting Railway deployment...');
    console.log('📦 Checking database...');
    
    // Check if DATABASE_URL is set or database file exists
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const hasDatabase = process.env.DATABASE_URL || fs.existsSync(dbPath);
    
    if (hasDatabase || process.env.DATABASE_URL) {
      console.log('🔄 Running database migration...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: process.cwd() });
      } catch (error) {
        console.log('⚠️ Migration failed, trying db push...');
        try {
          execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: process.cwd() });
        } catch (pushError) {
          console.error('❌ Database push failed:', pushError.message);
        }
      }
      
      console.log('🌱 Seeding database...');
      try {
        execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', cwd: process.cwd() });
      } catch (error) {
        console.log('⚠️ Seed skipped (may already be seeded)');
      }
    } else {
      console.log('📝 No database found, creating...');
      try {
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: process.cwd() });
        execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', cwd: process.cwd() });
      } catch (error) {
        console.error('❌ Database creation failed:', error.message);
      }
    }
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    // Continue anyway - maybe database already exists
  }
  
  console.log('🚀 Starting Next.js server...');
  // Start the Next.js server
  const serverPath = path.join(process.cwd(), '.next', 'standalone', 'server.js');
  
  if (!fs.existsSync(serverPath)) {
    console.error('❌ Server file not found:', serverPath);
    console.log('📁 Current directory:', process.cwd());
    console.log('📁 Files in .next/standalone:', fs.existsSync(path.join(process.cwd(), '.next', 'standalone')) ? fs.readdirSync(path.join(process.cwd(), '.next', 'standalone')).join(', ') : 'directory not found');
    process.exit(1);
  }
  
  // Use spawn to keep the process alive
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    console.log(`⚠️ Server exited with code ${code}`);
    process.exit(code || 1);
  });
  
  // Keep process alive
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.kill('SIGTERM');
  });
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

