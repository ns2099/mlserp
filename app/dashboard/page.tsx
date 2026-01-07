import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Dashboard artık ana sayfa, buraya gelenleri ana sayfaya yönlendir
  redirect('/')
}
