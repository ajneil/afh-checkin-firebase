'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/currentUser'
import { getOrCreateCheckIn } from '@/lib/checkins/daily'
import { usersCollection } from '@/lib/db/firestore'
import { localTime } from '@/lib/time/localTime'

export async function startTodaysCheckIn(): Promise<void> {
  const user = await getCurrentUser()
  if (!user) redirect('/')
  const { day } = localTime(new Date(), user.timeZone)
  const { token } = await getOrCreateCheckIn(user, day)
  redirect(`/checkin/${token}`)
}

export async function setMorningEmails(formData: FormData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) redirect('/')
  await usersCollection().doc(user.email).update({ morningEmails: formData.get('enabled') === 'on' })
  revalidatePath('/')
}
