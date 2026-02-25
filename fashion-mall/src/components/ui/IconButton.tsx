import React from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export default function IconButton({ label, children, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`flex items-center justify-center rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
