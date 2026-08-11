import '@testing-library/jest-dom/vitest'
import { render,screen } from '@testing-library/react'
import { MemoryRouter,Route,Routes } from 'react-router-dom'
import { describe,expect,it,vi } from 'vitest'
import ScheduleInterviewPage from '../features/interviews/pages/ScheduleInterviewPage'
vi.mock('../features/interviews/services/interviewApi',()=>({recruiterInterviewApi:{schedule:vi.fn()},candidateInterviewApi:{}}))
vi.mock('../features/applications/services/recruiterApplicationApi',()=>({recruiterApplicationApi:{details:vi.fn().mockResolvedValue(null)}}))
describe('interview pages',()=>{it('renders scheduling form with all meeting types',()=>{render(<MemoryRouter initialEntries={['/recruiter/applications/a1/schedule-interview']}><Routes><Route path="/recruiter/applications/:applicationId/schedule-interview" element={<ScheduleInterviewPage/>}/></Routes></MemoryRouter>);expect(screen.getByRole('heading',{name:/schedule interview/i})).toBeInTheDocument();expect(screen.getByRole('option',{name:/online/i})).toBeInTheDocument();expect(screen.getByRole('option',{name:/in person/i})).toBeInTheDocument();expect(screen.getByRole('option',{name:/phone/i})).toBeInTheDocument()})})
