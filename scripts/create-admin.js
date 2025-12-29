const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Admin kullanıcısı oluşturuluyor...')
  
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      adSoyad: 'Admin Kullanıcı',
      yetki: 'Yönetici',
    },
  })

  console.log('✅ Admin kullanıcısı oluşturuldu!')
  console.log('Kullanıcı Adı: admin')
  console.log('Şifre: admin123')
  
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })









