import Link from 'next/link'
import LegalPage, { LegalSection, ContactLine } from '@/components/LegalPage'

export const metadata = {
  title: 'Privacy Policy',
  description: 'What personal data Toro collects, why, who can see it and how to exercise your GDPR rights.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Toro is a marketplace where students in Turin offer and find services. This policy explains what personal data we collect, why we collect it, who can see it and what rights you have under the EU General Data Protection Regulation (GDPR)."
    >
      <LegalSection title="1. Who is responsible">
        <p>
          Toro is run by its founders, Öykü and Ogi, in Turin, Italy. They are the data controller
          for the information described here. You can reach us at <ContactLine />.
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <ul>
          <li><strong>Account:</strong> e-mail address, password (stored only as a secure hash by our authentication provider) and the name you give us. If you sign in with Google or LinkedIn, we receive your name, e-mail address and profile picture from them.</li>
          <li><strong>Public profile:</strong> username, name, photo, bio, languages, location, skills, university and department. You decide what to fill in.</li>
          <li><strong>Private profile:</strong> your phone number, if you add one. Only you can see it.</li>
          <li><strong>Student verification:</strong> the university e-mail address you verify and the date of verification. The 6-digit code we send is stored only as a cryptographic hash and expires after 15 minutes.</li>
          <li><strong>Listings</strong> you publish, and <strong>messages</strong> you exchange with other users.</li>
          <li><strong>Waitlist:</strong> your e-mail address, if you ask to be notified about the launch.</li>
          <li><strong>Technical data:</strong> session cookies needed to keep you logged in, and standard server logs (such as your IP address and browser type) kept by our hosting provider for security.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Why we use it (legal bases)">
        <ul>
          <li><strong>To provide the service</strong> (GDPR Art. 6(1)(b)): create your account, show your profile and listings, deliver messages and verify student status when you ask us to.</li>
          <li><strong>To keep Toro safe</strong> (Art. 6(1)(f), legitimate interest): prevent spam and abuse, limit repeated attempts and investigate reports.</li>
          <li><strong>To send launch updates</strong> (Art. 6(1)(a), consent): only if you joined the waitlist. You can ask us to remove you at any time.</li>
        </ul>
        <p>We do not sell your data, show ads or use tracking or advertising cookies.</p>
      </LegalSection>

      <LegalSection title="4. Who can see what">
        <ul>
          <li><strong>Everyone,</strong> including visitors who are not logged in: your public profile, your active listings and whether you have a Verified Student badge.</li>
          <li><strong>Only the other person in a conversation:</strong> your messages.</li>
          <li><strong>Only you:</strong> your phone number, your verified university e-mail and your login e-mail.</li>
        </ul>
        <p>
          Access rules are enforced in our database (row-level security), not just in the app.
        </p>
      </LegalSection>

      <LegalSection title="5. Service providers">
        <p>We use a small number of providers who process data on our behalf:</p>
        <ul>
          <li><strong>Supabase</strong>: database, authentication and file storage, hosted in the European Union (Ireland)</li>
          <li><strong>Vercel</strong>: website hosting</li>
          <li><strong>Resend</strong>: delivery of verification e-mails</li>
          <li><strong>Google and LinkedIn</strong>: only if you choose to sign in with them</li>
        </ul>
        <p>
          Your account, profile, listings and messages are stored in the EU. Some providers, such as
          Vercel and Resend, are based in or may process data in the United States. Such
          transfers are covered by the safeguards those providers offer, such as the EU–U.S. Data
          Privacy Framework or the European Commission&apos;s Standard Contractual Clauses.
        </p>
      </LegalSection>

      <LegalSection title="6. How long we keep it">
        <ul>
          <li>Account, profile, listings and messages are kept until you delete your account.</li>
          <li>Deleting your account (Profile → Settings) permanently removes your profile, private data, listings, uploaded photos and the messages linked to them.</li>
          <li>Waitlist addresses are kept until the launch announcement or until you ask us to remove yours.</li>
          <li>Hosting logs are kept for a limited period set by our hosting provider.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          We only use cookies that are strictly necessary to keep you signed in. We use no
          analytics, advertising or other optional cookies, so no consent banner is needed.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>Under the GDPR you can:</p>
        <ul>
          <li>access, correct or download your data. Most of it can be edited directly in your profile settings.</li>
          <li>delete your data. You can delete your account yourself at any time.</li>
          <li>object to or restrict certain processing, and withdraw consent you have given.</li>
          <li>lodge a complaint with the Italian data protection authority, the <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali</a>.</li>
        </ul>
        <p>To exercise these rights, contact us at <ContactLine />.</p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          If we change this policy, we will update the date at the top of this page and, for
          significant changes, tell you in the app. See also our <Link href="/terms">Terms of Use</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
