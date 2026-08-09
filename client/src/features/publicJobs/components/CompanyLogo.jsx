function CompanyLogo({ company, size = 'medium' }) {
  const sizeClass = size === 'large' ? 'size-20 text-2xl' : 'size-12 text-base'
  const initials = (company?.companyName || 'Company')
    .split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()

  if (company?.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt={`${company.companyName || 'Company'} logo`}
        className={`${sizeClass} rounded-xl border border-slate-200 bg-white object-contain p-1`}
        loading="lazy"
      />
    )
  }

  return (
    <div aria-hidden="true" className={`${sizeClass} flex shrink-0 items-center justify-center rounded-xl bg-brand-100 font-bold text-brand-700`}>
      {initials}
    </div>
  )
}

export default CompanyLogo
