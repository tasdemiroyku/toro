'use client'

import { motion } from 'framer-motion'

// Four-step meter: length ≥ 8, an uppercase letter, a digit, a symbol
export default function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full"
            animate={{ background: i < score ? colors[score - 1] : 'rgba(19, 38, 0, 0.08)' }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: score > 0 ? colors[score - 1] : 'rgba(19, 38, 0, 0.4)' }}>
        {score > 0 ? labels[score - 1] : ''}
      </span>
    </div>
  )
}
