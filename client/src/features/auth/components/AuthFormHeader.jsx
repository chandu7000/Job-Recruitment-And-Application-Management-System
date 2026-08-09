function AuthFormHeader({ title, description }) {
  return (
    <header className="mb-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
      {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
    </header>
  )
}

export default AuthFormHeader
