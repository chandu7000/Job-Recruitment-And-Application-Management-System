import { beforeEach,describe,expect,it,vi } from 'vitest'
import axiosClient from '../api/axiosClient'
import { candidateInterviewApi,recruiterInterviewApi } from '../features/interviews/services/interviewApi'
vi.mock('../api/axiosClient',()=>({default:{get:vi.fn(),post:vi.fn(),patch:vi.fn(),put:vi.fn()}}))
beforeEach(()=>vi.clearAllMocks())
describe('interview api',()=>{
 it('schedules recruiter interview',async()=>{axiosClient.post.mockResolvedValue({data:{data:{interview:{id:'i1',status:'SCHEDULED'}}}});const r=await recruiterInterviewApi.schedule('a1',{meetingType:'ONLINE'});expect(axiosClient.post).toHaveBeenCalled();expect(r.id).toBe('i1')})
 it('normalizes candidate list',async()=>{axiosClient.get.mockResolvedValue({data:{data:{interviews:[{id:'i1'}]},meta:{page:1,limit:10,total:1}}});const r=await candidateInterviewApi.list();expect(r.interviews).toHaveLength(1);expect(r.pagination.total).toBe(1)})
 it('sends decline reason',async()=>{axiosClient.patch.mockResolvedValue({data:{data:{interview:{id:'i1',status:'DECLINED'}}}});await candidateInterviewApi.decline('i1','Unavailable');expect(axiosClient.patch.mock.calls[0][1]).toEqual({reason:'Unavailable'})})
})
