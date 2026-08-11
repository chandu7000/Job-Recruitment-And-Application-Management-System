import { describe, expect, it } from 'vitest'
import { getCandidateInterviewActions, getRecruiterInterviewActions, normalizePagination, toIsoSchedule } from '../features/interviews/utils/interview'
describe('interview business helpers',()=>{
 it('returns backend-compatible recruiter actions',()=>{expect(getRecruiterInterviewActions({status:'CONFIRMED'})).toEqual(['reschedule','cancel','complete']);expect(getRecruiterInterviewActions({status:'CANCELLED'})).toEqual([])})
 it('only allows candidate response before start',()=>{expect(getCandidateInterviewActions({status:'SCHEDULED',scheduledStartAt:new Date(Date.now()+60000).toISOString()})).toEqual(['confirm','decline']);expect(getCandidateInterviewActions({status:'SCHEDULED',scheduledStartAt:new Date(Date.now()-60000).toISOString()})).toEqual([])})
 it('normalizes pagination',()=>{expect(normalizePagination({page:2,limit:10,total:25}).totalPages).toBe(3)})
 it('builds ISO schedule timestamps',()=>{const value=toIsoSchedule({date:'2030-01-02',startTime:'10:00',endTime:'11:00'});expect(value.scheduledStartAt).toContain('2030-01-02')})
})
