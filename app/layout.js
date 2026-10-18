import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/server'
import { SITE_URL } from '@/lib/site'

// Inter for all UI text; Cormorant only for the "Toro" wordmark (font-logo)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['700'],
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
  description: 'The marketplace of Turin\'s students: find and offer tutoring, cleaning, help with Italian paperwork, moving, tech help and language exchange.',
  keywords: ['students Turin', 'tutoring Turin', 'student services Torino', 'ripetizioni torino', 'permesso di soggiorno help', 'marketplace torino'],
  authors: [{ name: 'Toro' }],
  creator: 'Toro',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Toro · Torino',
    description: 'The marketplace of Turin\'s students.',
    url: SITE_URL,
    siteName: 'Toro',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Toro, the marketplace of Turin\'s students',
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toro · Torino',
    description: 'The marketplace of Turin\'s students.',
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body className="bg-toro-light font-sans antialiased min-h-screen flex flex-col">
        <Header user={user} profile={profile} />

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}