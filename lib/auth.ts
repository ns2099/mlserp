import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Kullanıcı Adı', type: 'text' },
        password: { label: 'Şifre', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })

        if (!user) {
          return null
        }

        // Email onayı kontrolü - sadece yeni kayıt olanlar için (emailOnayToken varsa)
        // Mevcut kullanıcılar için email onay kontrolü yapılmaz
        if (!user.emailOnaylandiMi && user.emailOnayToken) {
          return null // Email onaylanmamış yeni kullanıcı giriş yapamaz
        }

        // Şifre kontrolü
        if (!user.password) {
          return null // Şifre belirlenmemiş
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // İlk giriş kontrolü - eğer ilk giriş yapılmamışsa ve email varsa şifre sıfırlama gerekiyor
        if (!user.ilkGirisVarmi && user.email) {
          // İlk giriş için token oluştur ve email gönder
          const crypto = await import('crypto')
          const token = crypto.randomBytes(32).toString('hex')
          const tokenExpiry = new Date()
          tokenExpiry.setHours(tokenExpiry.getHours() + 24)

          await prisma.user.update({
            where: { id: user.id },
            data: {
              sifreSifirlamaToken: token,
              sifreSifirlamaTarih: tokenExpiry,
            },
          })

          try {
            const { sendPasswordResetEmail } = await import('@/lib/email')
            await sendPasswordResetEmail(user.email, token, user.username)
          } catch (error) {
            console.error('Email gönderme hatası:', error)
          }

          // İlk giriş için null döndür, kullanıcı email'den linke tıklayacak
          throw new Error('İLK_GIRIS_GEREKLI')
        }

        return {
          id: user.id,
          username: user.username,
          name: user.adSoyad,
          role: user.yetki,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = token.id ? ('' + token.id) : ''
        (session.user as any).username = token.username ? ('' + token.username) : ''
        (session.user as any).role = token.role ? ('' + token.role) : ''
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

