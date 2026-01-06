#!/usr/bin/env node
// Railway start script with database migration

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('Checking database...');
    
    // Check if DATABASE_URL is set or database file exists
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const hasDatabase = process.env.DATABASE_URL || fs.existsSync(dbPath);
    
    if (hasDatabase) {
      console.log('Running database migration...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (error) {
        console.log('Migration failed, trying db push...');
        execSync('npx prisma db push', { stdio: 'inherit' });
      }
      
      console.log('Seeding database...');
      try {
        execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
      } catch (error) {
        console.log('Seed skipped (may already be seeded)');
      }
    } else {
      console.log('No database found, creating...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Database setup error:', error.message);
    // Continue anyway
  }
  
  console.log('Starting application...');
  // Start the Next.js server
  require('../.next/standalone/server.js');
}

main().catch(console.error);

