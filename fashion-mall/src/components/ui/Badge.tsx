interface BadgeProps {
  label: string
  variant?: 'hot' | 'new' | 'best' | 'sale' | 'default'
}

const variantClasses: Record<string, string> = {
  hot: 'bg-red-500 text-white',
  new: 'bg-emerald-500 text-white',
  best: 'bg-amber-500 text-white',
  sale: 'bg-rose-600 text-white',
  default: 'bg-gray-200 text-gray-700',
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${variantClasses[variant]}`}>
      {label}
    </span>
  )
}
