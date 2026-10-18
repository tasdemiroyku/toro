import Link from 'next/link'
import LegalPage, { LegalSection, ContactLine } from '@/components/LegalPage'

export const metadata = {
  title: 'Terms of Use',
  description: 'The rules for using Toro, the student services marketplace in Turin.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="These terms apply whenever you use Toro. By creating an account you agree to them, so please read them carefully."
    >
      <LegalSection title="1. What Toro is">
        <p>
          Toro is an online noticeboard that helps people in Turin, mostly students, find and offer
          everyday services such as tutoring, cleaning, help with paperwork, moving and language
          exchange. Toro is <strong>not a party</strong> to any agreement between users: we do not
          provide the services, employ the providers or handle payments. Users agree on the price,
          time and conditions directly with each other.
        </p>
      </LegalSection>

      <LegalSection title="2. Who can use Toro">
        <ul>
          <li>You must be at least 18 years old.</li>
          <li>The information in your account and profile must be accurate and your own.</li>
          <li>You are responsible for keeping your login details safe and for activity on your account.</li>
          <li>One person, one account.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Listings and conduct">
        <p>When you publish a listing or send a message, you agree to:</p>
        <ul>
          <li>describe your service, price and availability honestly;</li>
          <li>only offer services you are legally allowed to provide. You are responsible for any rules that apply to you, including tax, residence permit and work-hour limits;</li>
          <li>treat other users with respect.</li>
        </ul>
        <p>The following are not allowed:</p>
        <ul>
          <li>illegal, dangerous or adult services;</li>
          <li>academic dishonesty, such as taking exams or writing graded work for someone else;</li>
          <li>discrimination, harassment, threats or hate speech;</li>
          <li>spam, scams, fake listings or impersonating another person;</li>
          <li>sharing other people&apos;s personal data without their permission.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. The Verified Student badge">
        <p>
          The badge shows that, at the time of verification, the user proved access to an e-mail
          address at a recognised university. It is <strong>not</strong> a background check, an
          endorsement or a guarantee of the quality of anyone&apos;s services.
        </p>
      </LegalSection>

      <LegalSection title="5. Staying safe">
        <ul>
          <li>Keep conversations on Toro until you trust the other person.</li>
          <li>Meet in public places for the first time, and avoid paying large amounts in advance.</li>
          <li>Never share passwords, bank details or identity documents through messages.</li>
          <li>Tell us about suspicious listings or behaviour.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Your content">
        <p>
          You keep ownership of the text and photos you publish. You give Toro a free, non-exclusive
          licence to display them on the platform while they are online. Only upload content you
          have the right to share.
        </p>
      </LegalSection>

      <LegalSection title="7. Moderation and termination">
        <p>
          We may remove content or suspend or close accounts that break these terms or put other
          users at risk. You can stop using Toro and delete your account at any time from your
          profile settings.
        </p>
      </LegalSection>

      <LegalSection title="8. Liability">
        <p>
          Toro is provided &ldquo;as is&rdquo;, during an early, pre-launch phase. To the extent
          permitted by law, we are not liable for the services users provide to each other, for
          agreements between users, or for temporary unavailability of the platform. Nothing in these
          terms limits rights you have as a consumer under mandatory Italian or EU law.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes and governing law">
        <p>
          We may update these terms. If the changes are significant, we will tell you in the app
          before they apply. These terms are governed by Italian law.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these terms: <ContactLine />. How we handle personal data is described in
          our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
