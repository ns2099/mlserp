import { redirect } from 'next/navigation'

export default async function Home() {
  // Ana sayfa artık dashboard içinde, buraya gelenleri ana sayfaya yönlendir
  // Next.js route groups sayesinde '/' hem root hem de (dashboard) içinde çalışır
  redirect('/')
}
