import React from 'react'

type Props = {
  subtotal: number
  taxAmount: number
  totalAmount: number
  taxRate: number
  setTaxRate: (n: number) => void
  tipAmount: number
  setTipAmount: (n: number) => void
}

const TotalsPanel: React.FC<Props> = ({ subtotal, taxAmount, totalAmount, taxRate, setTaxRate, tipAmount, setTipAmount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
        <input
          type="number"
          min={0}
          step={0.01}
          className="mt-1 w-full border rounded-md px-3 py-2"
          value={taxRate}
          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tip Amount</label>
        <input
          type="number"
          min={0}
          step={0.01}
          className="mt-1 w-full border rounded-md px-3 py-2"
          value={tipAmount}
          onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="text-right space-y-1">
        <div>
          Subtotal: <span className="font-medium">{'\u20b1'}{subtotal.toFixed(2)}</span>
        </div>
        <div>
          Tax: <span className="font-medium">{'\u20b1'}{taxAmount.toFixed(2)}</span>
        </div>
        <div>
          Total: <span className="font-semibold">{'\u20b1'}{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default TotalsPanel
