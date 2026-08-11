import { describe,expect,it } from 'vitest'
import { scheduleInterviewSchema,interviewFeedbackSchema,interviewReasonSchema } from '../features/interviews/validation/interviewSchemas'
const future=new Date(Date.now()+86400000);const date=future.toISOString().slice(0,10)
describe('interview validation',()=>{
 it('requires online https link',()=>{const r=scheduleInterviewSchema.safeParse({date,startTime:'10:00',endTime:'11:00',timezone:'Asia/Kolkata',meetingType:'ONLINE',meetingLink:'http://bad',physicalLocation:'',phoneInstructions:'',interviewInstructions:''});expect(r.success).toBe(false)})
 it('requires a reason',()=>expect(interviewReasonSchema.safeParse({reason:''}).success).toBe(false))
 it('requires rating 1 to 5',()=>expect(interviewFeedbackSchema.safeParse({feedback:'',rating:6,strengths:'',concerns:'',recommendation:'',feedbackVisibleToCandidate:false}).success).toBe(false))
})
