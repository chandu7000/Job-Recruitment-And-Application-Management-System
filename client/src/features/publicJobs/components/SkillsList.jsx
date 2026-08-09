function SkillsList({ skills = [], limit }) {
  const normalizedSkills = Array.isArray(skills) ? skills : []
  const visibleSkills = limit ? normalizedSkills.slice(0, limit) : normalizedSkills
  const remaining = normalizedSkills.length - visibleSkills.length

  if (!visibleSkills.length) return <span className="text-sm text-slate-500">Skills not specified</span>

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Required skills">
      {visibleSkills.map((skill) => (
        <li key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{skill}</li>
      ))}
      {remaining > 0 && <li className="px-1 py-1 text-xs font-medium text-slate-500">+{remaining} more</li>}
    </ul>
  )
}

export default SkillsList
