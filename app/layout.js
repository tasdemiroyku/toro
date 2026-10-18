import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/server'
import { SITE_URL } from '@/lib/site'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-cormorant',
})

export const metadata = {
  title: {
    default: 'Toro · Torino',
    template: '%s · Toro'
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  description: 'Il marketplace degli studenti di Torino. Trova studenti per ripetizioni, pulizie, aiuto con documenti consolari e molto altro.',
  keywords: ['studenti torino', 'ripetizioni torino', 'pulizie torino', 'lavoro studenti torino', 'marketplace torino', 'öğrenci hizmetleri torino'],
  authors: [{ name: 'Toro' }],
  creator: 'Toro',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Toro · Torino',
    description: 'Il marketplace degli studenti di Torino.',
    url: SITE_URL,
    siteName: 'Toro',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Toro - Il marketplace degli studenti di Torino',
      }
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toro · Torino',
    description: 'Il marketplace degli studenti di Torino.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
      
    profile = data
  }

  return (
    <html lang="it" className={cormorant.variable} suppressHydrationWarning>
      <body className="bg-[#FAFAF7] font-sans antialiased min-h-screen flex flex-col">
        <Header user={user} profile={profile} />

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}