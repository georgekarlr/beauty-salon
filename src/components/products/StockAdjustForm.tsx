import React, { useMemo, useState } from 'react'

type Props = {
  onSubmit: (amount: number, reason: string) => void
  onCancel: () => void
}

const StockAdjustForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState<number>(0)
  const [reason, setReason] = useState<string>('')

  const isValid = useMemo(() => Number.isFinite(amount) && amount !== 0 && reason.trim().length > 0, [amount, reason])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isValid) onSubmit(amount, reason)
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Adjustment amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g. 5 or -3"
        />
        <p className="text-xs text-gray-500 mt-1">Use positive to add stock and negative to subtract.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Reason</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Delivery, damage, inventory count, etc."
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={!isValid} className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700">Apply</button>
      </div>
    </form>
  )
}

export default StockAdjustForm
