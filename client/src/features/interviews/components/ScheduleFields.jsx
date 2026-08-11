export default function ScheduleFields({ register, errors, meetingType }) {
  const field='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
  const error=(name)=>errors?.[name]&&<p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
  return <div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold text-slate-700">Date<input type="date" {...register('date')} className={`mt-1 ${field}`}/>{error('date')}</label>
    <label className="text-sm font-semibold text-slate-700">Timezone<input {...register('timezone')} className={`mt-1 ${field}`} placeholder="Asia/Kolkata"/>{error('timezone')}</label>
    <label className="text-sm font-semibold text-slate-700">Start time<input type="time" {...register('startTime')} className={`mt-1 ${field}`}/>{error('startTime')}</label>
    <label className="text-sm font-semibold text-slate-700">End time<input type="time" {...register('endTime')} className={`mt-1 ${field}`}/>{error('endTime')}</label>
    <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Meeting type<select {...register('meetingType')} className={`mt-1 ${field}`}><option value="ONLINE">Online</option><option value="IN_PERSON">In person</option><option value="PHONE">Phone</option></select></label>
    {meetingType==='ONLINE'&&<label className="text-sm font-semibold text-slate-700 sm:col-span-2">Meeting link<input {...register('meetingLink')} className={`mt-1 ${field}`} placeholder="https://..."/>{error('meetingLink')}</label>}
    {meetingType==='IN_PERSON'&&<label className="text-sm font-semibold text-slate-700 sm:col-span-2">Physical location<textarea rows="3" {...register('physicalLocation')} className={`mt-1 ${field}`}/>{error('physicalLocation')}</label>}
    {meetingType==='PHONE'&&<label className="text-sm font-semibold text-slate-700 sm:col-span-2">Phone instructions<textarea rows="3" {...register('phoneInstructions')} className={`mt-1 ${field}`}/>{error('phoneInstructions')}</label>}
    <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Interview instructions<textarea rows="4" {...register('interviewInstructions')} className={`mt-1 ${field}`} maxLength="5000"/>{error('interviewInstructions')}</label>
  </div>
}
