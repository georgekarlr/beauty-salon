import React from 'react'
import useStaffDetails from '../../hooks/useStaffDetails'

type Props = {
  staffId: string
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const StaffDetailsPanel: React.FC<Props> = ({ staffId }) => {
  const { data, loading, error } = useStaffDetails(staffId)

  if (loading) return <div className="text-sm text-gray-500">Loading details...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!data) return <div className="text-sm text-gray-500">No data.</div>

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{data.first_name} {data.last_name || ''}</h3>
        <div className="text-sm text-gray-600">
          {data.email && <div>{data.email}</div>}
          {data.phone_number && <div>{data.phone_number}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${data.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {data.is_active ? 'Active' : 'Inactive'}
        </span>
        {data.account_id != null && (
          <span className="text-gray-500">Account: {data.account_id}</span>
        )}
      </div>

      <div>
        <h4 className="font-medium text-gray-800 mb-2">Schedule</h4>
        {(!data.schedule || data.schedule.length === 0) ? (
          <div className="text-sm text-gray-500">No schedule set.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-2 py-1">Day</th>
                  <th className="px-2 py-1">Start</th>
                  <th className="px-2 py-1">End</th>
                </tr>
              </thead>
              <tbody>
                {data.schedule
                  .slice()
                  .sort((a,b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                  .map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-2 py-1">{item.day_of_week} {dayNames[item.day_of_week] ?? ''}</td>
                    <td className="px-2 py-1">{item.start_time}</td>
                    <td className="px-2 py-1">{item.end_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffDetailsPanel
