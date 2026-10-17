'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import ToretBull from './ToretBull' // Importing the central, reusable logo

export default function Footer() {
  const pathname = usePathname()

  // Hide the footer completely on focus-heavy pages like Login
  if (pathname === '/login' || pathname === '/reset-password') {
    return null
  }

  return (
    <footer className="bg-toro-dark px-6 lg:px-8 pt-10 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Bottom Section (Logo & Links) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <ToretBull className="w-8 h-8 text-toro-light opacity-90" />
            <span
              className="text-2xl font-bold text-toro-light"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              Toro
            </span>
            <span suppressHydrationWarning className="text-xs font-medium text-toro-light/30 ml-2 hidden sm:inline-block">
              © {new Date().getFullYear()} · Torino, Piemonte
            </span>
          </div>

          {/* Mobile-only copyright */}
          <span suppressHydrationWarning className="text-[10px] font-medium text-toro-light/30 sm:hidden">
             © {new Date().getFullYear()} · Torino, Piemonte
          </span>

          {/* Legal Links */}
          <div className="flex gap-6">
            <Link href="#" className="text-xs font-medium text-toro-light/50 hover:text-toro-light transition">
              Privacy
            </Link>
            <Link href="#" className="text-xs font-medium text-toro-light/50 hover:text-toro-light transition">
              Terms
            </Link>
            <Link href="#" className="text-xs font-medium text-toro-light/50 hover:text-toro-light transition">
              Contacts
            </Link>
          </div>
          
        </div>
      </div>
    </footer>
  )
}
