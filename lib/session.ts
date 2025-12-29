import { cookies } from 'next/headers'

export interface SessionUser {
  id: string
  username: string
  name: string
  role: string
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie?.value) {
      return null
    }

    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString()
    )

    // Token süresi kontrolü
    if (sessionData.exp && Date.now() > sessionData.exp) {
      return null
    }

    return {
      id: sessionData.id,
      username: sessionData.username,
      name: sessionData.name,
      role: sessionData.role,
    }
  } catch (error) {
    return null
  }
}









