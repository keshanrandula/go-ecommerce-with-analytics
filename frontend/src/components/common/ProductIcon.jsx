import React from 'react'

export function ProductIcon({ id, className }) {
  if (id === 'prod_macbook') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="3" y="4" width="18" height="12" rx="2" strokeWidth="1.5" />
        <path d="M1 20h22" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 16v4" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'prod_iphone') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="6" y="2" width="12" height="20" rx="3" strokeWidth="2" />
        <path d="M12 5h.01" strokeWidth="3" strokeLinecap="round" />
        <circle cx="12" cy="18" r="1.5" strokeWidth="1.5" />
      </svg>
    )
  }
  if (id === 'prod_headphones') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9" strokeWidth="2" strokeLinecap="round" />
        <rect x="2" y="13" width="4" height="6" rx="1.5" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
        <rect x="18" y="13" width="4" height="6" rx="1.5" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
        <path d="M6 14v-2c0-3.31 2.69-6 6-6s6 2.69 6 6v2" strokeWidth="1.5" />
      </svg>
    )
  }
  if (id === 'prod_keyboard') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
        <path d="M6 9h2v2H6V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zM6 13h12v2H6v-2z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (id === 'prod_monitor') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="2" y="3" width="20" height="13" rx="1.5" strokeWidth="2" />
        <path d="M12 16v5" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 21h8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  return null
}
