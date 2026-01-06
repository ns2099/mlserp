import { redirect } from 'next/navigation'

export default async function Home() {
  // Ana sayfaya gelen tüm istekleri direkt login'e yönlendir
  redirect('/login')
}

