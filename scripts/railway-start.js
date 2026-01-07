const { execSync } = require('child_process')

console.log('🚀 Starting Railway deployment...')

// Migration çalıştır
try {
  console.log('📦 Running Prisma migrations...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: process.cwd() })
  console.log('✅ Migrations completed')
} catch (error) {
  console.log('⚠️  Migration deploy failed, trying db push...')
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: process.cwd() })
    console.log('✅ Database schema pushed')
  } catch (pushError) {
    console.log('⚠️  Database push failed, continuing anyway...')
    console.error('Migration error:', pushError.message)
  }
}

// Next.js sunucusunu başlat
console.log('🌐 Starting Next.js server...')
const port = process.env.PORT || 3000
execSync(`next start -p ${port} -H 0.0.0.0`, { stdio: 'inherit', cwd: process.cwd() })
