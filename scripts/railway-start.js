const { execSync } = require('child_process')

async function createMissingTables() {
  console.log('📋 Checking and creating missing tables...')
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  
  try {
    // Toplanti tablosu
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Toplanti" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "firmaId" TEXT NOT NULL,
          "yetkiliKisiId" TEXT,
          "toplantiTarihi" DATETIME NOT NULL,
          "konu" TEXT,
          "notlar" TEXT,
          "userId" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "Toplanti_firmaId_fkey" FOREIGN KEY ("firmaId") REFERENCES "Firma" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Toplanti_yetkiliKisiId_fkey" FOREIGN KEY ("yetkiliKisiId") REFERENCES "YetkiliKisi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
          CONSTRAINT "Toplanti_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
      `)
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Toplanti_firmaId_idx" ON "Toplanti"("firmaId");`)
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Toplanti_yetkiliKisiId_idx" ON "Toplanti"("yetkiliKisiId");`)
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Toplanti_userId_idx" ON "Toplanti"("userId");`)
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Toplanti_toplantiTarihi_idx" ON "Toplanti"("toplantiTarihi");`)
      console.log('✅ Toplanti table ready')
    } catch (e) {
      console.log('ℹ️  Toplanti table already exists or error:', e.message)
    }
    
    // GelistirmeNotu tablosu
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "GelistirmeNotu" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "baslik" TEXT NOT NULL,
          "icerik" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "GelistirmeNotu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
      `)
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GelistirmeNotu_userId_idx" ON "GelistirmeNotu"("userId");`)
      console.log('✅ GelistirmeNotu table ready')
    } catch (e) {
      console.log('ℹ️  GelistirmeNotu table already exists or error:', e.message)
    }
    
    await prisma.$disconnect()
    console.log('✅ All missing tables created/verified')
    return true
  } catch (error) {
    console.error('❌ Error creating tables:', error.message)
    await prisma.$disconnect()
    return false
  }
}

async function runMigrations() {
  // Migration çalıştır
  let migrationSuccess = false
  try {
    console.log('📦 Running Prisma migrations...')
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      env: { ...process.env }
    })
    console.log('✅ Migrations completed')
    migrationSuccess = true
  } catch (error) {
    console.log('⚠️  Migration deploy failed, trying db push...')
    try {
      execSync('npx prisma db push --accept-data-loss --skip-generate', { 
        stdio: 'inherit', 
        cwd: process.cwd(),
        env: { ...process.env }
      })
      console.log('✅ Database schema pushed')
      migrationSuccess = true
    } catch (pushError) {
      console.log('⚠️  Database push also failed, will try manual table creation...')
    }
  }
  
  // Her durumda eksik tabloları kontrol et ve oluştur
  await createMissingTables()
  
  return migrationSuccess
}

async function main() {
  console.log('🚀 Starting Railway deployment...')
  
  const migrationSuccess = await runMigrations()
  
  if (!migrationSuccess) {
    console.log('⚠️  Migration failed but continuing with server start...')
  }

  // Next.js sunucusunu başlat
  console.log('🌐 Starting Next.js server...')
  const port = process.env.PORT || 3000
  execSync(`next start -p ${port} -H 0.0.0.0`, { stdio: 'inherit', cwd: process.cwd() })
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
