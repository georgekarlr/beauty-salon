import React from 'react'
import type { UUID } from '../../types/product'
import { useServiceDetails } from '../../hooks/useServiceDetails'

type Props = {
  serviceId: UUID
}

const ServiceDetailsPanel: React.FC<Props> = ({ serviceId }) => {
  const { data, loading, error } = useServiceDetails(serviceId)

  if (loading) return <div className="text-sm text-gray-500">Loading details...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!data) return <div className="text-sm text-gray-500">No data.</div>

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
        {data.category && <div className="text-sm text-gray-600">Category: {data.category}</div>}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Price</div>
          <div className="font-medium">${Number(data.price).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500">Duration</div>
          <div className="font-medium">{data.duration_minutes} min</div>
        </div>
      </div>
      {data.description && (
        <div>
          <div className="text-sm text-gray-500">Description</div>
          <div className="text-sm text-gray-800">{data.description}</div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-800 mb-2">Activity</h4>
        {(!data.activity_history || data.activity_history.length === 0) ? (
          <div className="text-sm text-gray-500">No activity yet.</div>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-auto pr-2">
            {data.activity_history!.map((a, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-gray-300" />
                <div>
                  <div className="text-gray-800 font-medium">{a.action}</div>
                  {a.details && (
                    <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-auto">{JSON.stringify(a.details, null, 2)}</pre>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{a.created_at}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ServiceDetailsPanel
