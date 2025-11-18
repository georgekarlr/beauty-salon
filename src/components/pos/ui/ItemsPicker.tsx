import React from 'react'
import type { Service } from '../../../types/service'
import type { Product } from '../../../types/product'
import type { POSSelectedItem } from '../../../composables/usePOS'

type Props = {
  services: Service[]
  products: Product[]
  onAdd: (item: POSSelectedItem) => void
}

const ItemsPicker: React.FC<Props> = ({ services, products, onAdd }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold mb-2">Services</h4>
        <div className="border rounded-md max-h-56 overflow-y-auto divide-y">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">${s.price.toFixed(2)}</div>
              </div>
              <button
                className="px-2 py-1 text-sm border rounded-md"
                onClick={() => onAdd({ id: s.id, name: s.name, price: s.price, type: 'service', quantity: 1 })}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Products</h4>
        <div className="border rounded-md max-h-56 overflow-y-auto divide-y">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">${p.retail_price.toFixed(2)} • In stock: {p.stock_quantity}</div>
              </div>
              <button
                className="px-2 py-1 text-sm border rounded-md"
                onClick={() => onAdd({ id: p.id, name: p.name, price: p.retail_price, type: 'product', quantity: 1 })}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ItemsPicker
