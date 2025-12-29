const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Veritabanı kontrol ediliyor...\n')
    
    const userCount = await prisma.user.count()
    console.log(`Toplam kullanıcı sayısı: ${userCount}`)
    
    if (userCount === 0) {
      console.log('\n❌ Veritabanında kullanıcı bulunamadı!')
      console.log('Admin kullanıcısı oluşturuluyor...\n')
      
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const admin = await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          adSoyad: 'Admin Kullanıcı',
          yetki: 'Yönetici',
        },
      })
      
      console.log('✅ Admin kullanıcısı oluşturuldu!')
      console.log('Kullanıcı Adı: admin')
      console.log('Şifre: admin123\n')
    } else {
      const users = await prisma.user.findMany({
        select: {
          username: true,
          adSoyad: true,
          yetki: true,
        },
      })
      
      console.log('\nMevcut kullanıcılar:')
      users.forEach(user => {
        console.log(`- ${user.username} (${user.adSoyad}) - ${user.yetki}`)
      })
      
      const adminExists = users.some(u => u.username === 'admin')
      if (!adminExists) {
        console.log('\n⚠️  Admin kullanıcısı bulunamadı!')
        console.log('Admin kullanıcısı oluşturuluyor...\n')
        
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash('admin123', 10)
        
        const admin = await prisma.user.create({
          data: {
            username: 'admin',
            password: hashedPassword,
            adSoyad: 'Admin Kullanıcı',
            yetki: 'Yönetici',
          },
        })
        
        console.log('✅ Admin kullanıcısı oluşturuldu!')
        console.log('Kullanıcı Adı: admin')
        console.log('Şifre: admin123\n')
      }
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Hata:', error.message)
    if (error.message.includes('Can\'t reach database')) {
      console.log('\n💡 Çözüm:')
      console.log('1. Prisma migrate çalıştırın: npx prisma migrate dev')
      console.log('2. Prisma generate çalıştırın: npx prisma generate')
    }
    process.exit(1)
  }
}

main()









