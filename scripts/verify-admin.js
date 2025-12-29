const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Veritabanı kontrol ediliyor...\n')
    
    // Tüm kullanıcıları listele
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        adSoyad: true,
        yetki: true,
        password: true,
      },
    })
    
    console.log(`Toplam kullanıcı sayısı: ${users.length}\n`)
    
    if (users.length === 0) {
      console.log('❌ Veritabanında kullanıcı bulunamadı!')
      console.log('Admin kullanıcısı oluşturuluyor...\n')
      
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
      console.log('Mevcut kullanıcılar:')
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Kullanıcı:`)
        console.log(`   - Kullanıcı Adı: ${user.username}`)
        console.log(`   - Ad Soyad: ${user.adSoyad}`)
        console.log(`   - Yetki: ${user.yetki}`)
        console.log(`   - Şifre Hash: ${user.password.substring(0, 20)}...`)
        
        // Şifre testi
        if (user.username === 'admin') {
          const testPassword = await bcrypt.compare('admin123', user.password)
          console.log(`   - Şifre Testi (admin123): ${testPassword ? '✅ DOĞRU' : '❌ YANLIŞ'}`)
        }
      })
      
      const adminExists = users.some(u => u.username === 'admin')
      if (!adminExists) {
        console.log('\n⚠️  Admin kullanıcısı bulunamadı!')
        console.log('Admin kullanıcısı oluşturuluyor...\n')
        
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
    if (error.message.includes("Can't reach database")) {
      console.log('\n💡 Çözüm:')
      console.log('1. .env dosyasında DATABASE_URL kontrol edin')
      console.log('2. Prisma migrate çalıştırın: npx prisma migrate dev')
      console.log('3. Prisma generate çalıştırın: npx prisma generate')
    }
    process.exit(1)
  }
}

main()









