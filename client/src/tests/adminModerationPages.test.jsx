import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminCompaniesPage from '../features/admin/pages/AdminCompaniesPage'
import AdminJobDetailsPage from '../features/admin/pages/AdminJobDetailsPage'
import AdminReportDetailsPage from '../features/admin/pages/AdminReportDetailsPage'
import AdminAuditLogDetailsPage from '../features/admin/pages/AdminAuditLogDetailsPage'
import { adminApi } from '../features/admin/services/adminApi'

vi.mock('../features/admin/services/adminApi', () => ({ adminApi: {
  listPendingCompanies: vi.fn(), verifyCompany: vi.fn(), rejectCompany: vi.fn(),
  getJob: vi.fn(), removeJob: vi.fn(), restoreJob: vi.fn(),
  getReport: vi.fn(), processReport: vi.fn(), getAuditLog: vi.fn(),
} }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe('Admin moderation pages', () => {
 beforeEach(()=>vi.clearAllMocks())
 it('moderates only pending companies using verify/reject controls', async()=>{
  adminApi.listPendingCompanies.mockResolvedValue({companies:[{id:'c1',companyName:'Acme',status:'PENDING_VERIFICATION',createdAt:'2026-08-01T00:00:00Z'}],pagination:{page:1,totalPages:1,hasNextPage:false,hasPreviousPage:false}})
  adminApi.verifyCompany.mockResolvedValue({id:'c1',status:'VERIFIED'})
  render(<MemoryRouter><AdminCompaniesPage/></MemoryRouter>); expect(await screen.findByText('Acme')).toBeInTheDocument(); fireEvent.click(screen.getByRole('button',{name:'Verify'})); fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Verify company'})); await waitFor(()=>expect(adminApi.verifyCompany).toHaveBeenCalledWith('c1'))
 })
 it('requires job removal reason before backend mutation', async()=>{
  adminApi.getJob.mockResolvedValue({id:'j1',title:'Java Developer',status:'PUBLISHED',company:{companyName:'Acme'}})
  render(<MemoryRouter initialEntries={['/admin/jobs/j1']}><Routes><Route path="/admin/jobs/:jobId" element={<AdminJobDetailsPage/>}/></Routes></MemoryRouter>); expect(await screen.findByText('Java Developer')).toBeInTheDocument(); fireEvent.click(screen.getByRole('button',{name:'Remove job'})); fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Remove job'})); expect(await screen.findByText(/Removal reason is required/)).toBeInTheDocument(); expect(adminApi.removeJob).not.toHaveBeenCalled()
 })
 it('offers the actual OPEN report transitions', async()=>{
  adminApi.getReport.mockResolvedValue({id:'r1',status:'OPEN',targetType:'JOB',targetResourceId:'j1',category:'OTHER',description:'A sufficiently detailed report',createdAt:'2026-08-01T00:00:00Z'})
  render(<MemoryRouter initialEntries={['/admin/reports/r1']}><Routes><Route path="/admin/reports/:reportId" element={<AdminReportDetailsPage/>}/></Routes></MemoryRouter>); expect(await screen.findByText('A sufficiently detailed report')).toBeInTheDocument(); expect(screen.getByRole('button',{name:'Under Review'})).toBeInTheDocument(); expect(screen.getByRole('button',{name:'Resolved'})).toBeInTheDocument(); expect(screen.getByRole('button',{name:'Dismissed'})).toBeInTheDocument()
 })
 it('does not render sensitive audit metadata', async()=>{
  adminApi.getAuditLog.mockResolvedValue({id:'a1',action:'JOB_REMOVED',resourceType:'JOB',result:'SUCCESS',metadata:{reason:'safe',password:'secret',nested:{accessToken:'hidden',visible:'ok'}}})
  render(<MemoryRouter initialEntries={['/admin/audit-logs/a1']}><Routes><Route path="/admin/audit-logs/:auditId" element={<AdminAuditLogDetailsPage/>}/></Routes></MemoryRouter>); expect(await screen.findByText(/"visible": "ok"/)).toBeInTheDocument(); expect(screen.queryByText(/secret/)).not.toBeInTheDocument(); expect(screen.queryByText(/hidden/)).not.toBeInTheDocument()
 })
})
