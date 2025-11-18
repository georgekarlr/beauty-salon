import React from 'react'
import type { POSSelectedItem } from '../../../composables/usePOS'
import type { UUID } from '../../../types/client'

type Props = {
  items: POSSelectedItem[]
  updateQty: (id: UUID, type: 'product' | 'service', qty: number) => void
  removeItem: (id: UUID, type: 'product' | 'service') => void
}

const CartTable: React.FC<Props> = ({ items, updateQty, removeItem }) => {
  if (items.length === 0) return <div className="text-sm text-gray-500">No items selected.</div>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-500">
          <th className="text-left py-1">Item</th>
          <th className="text-right py-1">Price</th>
          <th className="text-center py-1">Qty</th>
          <th className="text-right py-1">Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={`${it.type}-${it.id}`}>
            <td className="py-1">{it.name}</td>
            <td className="py-1 text-right">${it.price.toFixed(2)}</td>
            <td className="py-1 text-center">
              <input
                type="number"
                min={1}
                className="w-16 border rounded px-2 py-1 text-right"
                value={it.quantity}
                onChange={(e) => updateQty(it.id, it.type, parseInt(e.target.value))}
              />
            </td>
            <td className="py-1 text-right">${(it.price * it.quantity).toFixed(2)}</td>
            <td className="py-1 text-right">
              <button className="text-red-600 text-xs" onClick={() => removeItem(it.id, it.type)}>
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default CartTable
