import { API_ENDPOINTS } from '../../../api/endpoints'

export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY']
export const WORK_MODES = ['ONSITE', 'REMOTE', 'HYBRID']
export const AVAILABILITY = ['IMMEDIATELY_AVAILABLE', 'OPEN_TO_OPPORTUNITIES', 'SERVING_NOTICE_PERIOD', 'NOT_LOOKING']
export const SOCIAL_PLATFORMS = ['LINKEDIN', 'GITHUB', 'PORTFOLIO', 'LEETCODE', 'HACKERRANK', 'STACK_OVERFLOW', 'PERSONAL_WEBSITE', 'OTHER']

export const RESOURCE_CONFIG = {
  education: { title: 'Education', endpoint: API_ENDPOINTS.JOB_SEEKER.EDUCATIONS, key: 'educations', method: 'put', fields: [
    ['institution', 'Institution', 'text', true], ['degree', 'Degree', 'text', true], ['fieldOfStudy', 'Field of study'], ['startDate', 'Start date', 'date', true], ['endDate', 'End date', 'date'], ['grade', 'Grade'], ['description', 'Description', 'textarea'],
  ]},
  experience: { title: 'Experience', endpoint: API_ENDPOINTS.JOB_SEEKER.EXPERIENCES, key: 'experiences', method: 'put', fields: [
    ['company', 'Company', 'text', true], ['role', 'Role', 'text', true], ['employmentType', 'Employment type', 'select', true, EMPLOYMENT_TYPES], ['location', 'Location'], ['startDate', 'Start date', 'date', true], ['endDate', 'End date', 'date'], ['isCurrent', 'I currently work here', 'checkbox'], ['description', 'Description', 'textarea'],
  ]},
  skills: { title: 'Skills', endpoint: API_ENDPOINTS.JOB_SEEKER.SKILLS, key: 'skills', method: 'put', fields: [['skillName', 'Skill name', 'text', true]] },
  projects: { title: 'Projects', endpoint: API_ENDPOINTS.JOB_SEEKER.PROJECTS, key: 'projects', method: 'patch', fields: [
    ['title', 'Project title', 'text', true], ['description', 'Description', 'textarea'], ['technologies', 'Technologies (comma separated)', 'csv'], ['projectUrl', 'Project URL', 'url'], ['repositoryUrl', 'Repository URL', 'url'], ['startDate', 'Start date', 'date'], ['endDate', 'End date', 'date'],
  ]},
  certifications: { title: 'Certifications', endpoint: API_ENDPOINTS.JOB_SEEKER.CERTIFICATIONS, key: 'certifications', method: 'patch', fields: [
    ['name', 'Certification name', 'text', true], ['issuingOrganization', 'Issuing organization', 'text', true], ['credentialId', 'Credential ID'], ['credentialUrl', 'Credential URL', 'url'], ['issueDate', 'Issue date', 'date', true], ['expiryDate', 'Expiry date', 'date'], ['doesNotExpire', 'This certification does not expire', 'checkbox'],
  ]},
  'social-links': { title: 'Social links', endpoint: API_ENDPOINTS.JOB_SEEKER.SOCIAL_LINKS, key: 'socialLinks', method: 'patch', fields: [
    ['platform', 'Platform', 'select', true, SOCIAL_PLATFORMS], ['url', 'Profile URL', 'url', true], ['displayName', 'Display name'],
  ]},
}

export const formatLabel = (value = '') => value.toLowerCase().replaceAll('_', ' ').replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
