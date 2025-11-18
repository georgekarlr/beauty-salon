import React from 'react'

type Props = {
  current: number
  total?: number
}

const POSStepper: React.FC<Props> = ({ current, total = 4 }) => {
  const steps = Array.from({ length: total }, (_, i) => i + 1)
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm">
        {steps.map((n) => (
          <div key={n} className={`flex-1 flex items-center ${n < total ? 'pr-2' : ''}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full border ${current >= n ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-500 bg-white'}`}>{n}</div>
            {n < total && <div className={`flex-1 h-0.5 ml-2 ${current > n ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default POSStepper
