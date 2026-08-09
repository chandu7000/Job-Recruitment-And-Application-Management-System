export const ROLE_HOME_PATHS = Object.freeze({
  JOB_SEEKER: '/job-seeker/dashboard',
  RECRUITER: '/recruiter/dashboard',
  ADMIN: '/admin/dashboard',
})

export function getRoleHomePath(role) {
  return ROLE_HOME_PATHS[role] ?? '/unauthorized'
}
