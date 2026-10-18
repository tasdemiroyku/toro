import { PASSWORD_RULES } from '@/lib/password'

// Live checklist of the password policy (lib/password.js)
export default function PasswordStrength({ password }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5" aria-label="Password requirements">
      {PASSWORD_RULES.map(rule => {
        const met = rule.test(password)
        return (
          <li key={rule.id} className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-700' : 'text-toro-dark/40'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${met ? 'bg-green-600' : 'border border-toro-dark/20'}`}>
              {met && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            {rule.label}
            <span className="sr-only">{met ? '(met)' : '(missing)'}</span>
          </li>
        )
      })}
    </ul>
  )
}
