import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import EditProfileClient from '@/components/EditProfileClient'

export const metadata = {
  title: 'Edit Profile',
}

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Own profile only: public fields + private fields (phone, verified university e-mail)
  const [{ data: profile }, { data: privateProfile }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('private_profiles').select('phone_number, student_email').eq('id', user.id).maybeSingle(),
  ])

  return (
    <div className="flex-grow bg-toro-light">
      <main className="w-full">
        <EditProfileClient
          user={user}
          initialProfile={{
            ...profile,
            phone_number: privateProfile?.phone_number ?? '',
            student_email: privateProfile?.student_email ?? null,
          }}
        />
      </main>
    </div>
  )
}