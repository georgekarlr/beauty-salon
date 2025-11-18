import React from 'react'
import type { SalePaymentMethod } from '../../../types/sale'

type Props = {
  paymentMethod: SalePaymentMethod
  setPaymentMethod: (m: SalePaymentMethod) => void
  amountTendered: number | ''
  setAmountTendered: (n: number | '') => void
  totalAmount: number
  changeDue: number
  error?: string | null
}

const PaymentForm: React.FC<Props> = ({
  paymentMethod,
  setPaymentMethod,
  amountTendered,
  setAmountTendered,
  totalAmount,
  changeDue,
  error,
}) => {
  return (
    <div className="space-y-4">
      {error && <div className="p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as SalePaymentMethod)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount Tendered</label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={amountTendered}
            onChange={(e) => setAmountTendered(e.target.value === '' ? '' : parseFloat(e.target.value))}
          />
        </div>
        <div className="text-right self-end">
          <div>
            Total: <span className="font-semibold">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600">
            Change Due: <span className="font-medium">${changeDue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
