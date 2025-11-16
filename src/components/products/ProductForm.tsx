import React, { useMemo, useState } from 'react'
import type { Product } from '../../types/product'

export type ProductFormValues = Omit<Product, 'id' | 'created_at' | 'account_id' | 'user_id' | 'stock_quantity'> & {
  stock_quantity?: number
}

type Props = {
  initial?: Partial<Product>
  onSubmit: (values: ProductFormValues) => void
  onCancel: () => void
  submitLabel?: string
}

const ProductForm: React.FC<Props> = ({ initial, onSubmit, onCancel, submitLabel = 'Save' }) => {
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name ?? '',
    brand: initial?.brand ?? '',
    sku: initial?.sku ?? '',
    description: initial?.description ?? '',
    retail_price: typeof initial?.retail_price === 'number' ? initial.retail_price : 0,
    cost_price: typeof initial?.cost_price === 'number' ? initial.cost_price : undefined,
    stock_quantity: typeof initial?.stock_quantity === 'number' ? initial.stock_quantity : 0,
    low_stock_threshold: typeof initial?.low_stock_threshold === 'number' ? initial.low_stock_threshold : 5,
    is_active: typeof initial?.is_active === 'boolean' ? initial.is_active : true,
  })

  const isValid = useMemo(() => values.name.trim().length > 0 && (values.retail_price as number) >= 0, [values])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any
    setValues(v => ({
      ...v,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? Boolean(checked) : value,
    }))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isValid) onSubmit(values)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Shampoo Deluxe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            name="brand"
            value={values.brand ?? ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Brand Inc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            name="sku"
            value={values.sku ?? ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="SKU-12345"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={values.description ?? ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Short product description"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Retail Price</label>
          <input
            type="number"
            name="retail_price"
            min={0}
            step={0.01}
            value={values.retail_price ?? 0}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price</label>
          <input
            type="number"
            name="cost_price"
            min={0}
            step={0.01}
            value={values.cost_price ?? ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
          <input
            type="number"
            name="low_stock_threshold"
            min={0}
            step={1}
            value={values.low_stock_threshold ?? 5}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Initial Stock</label>
          <input
            type="number"
            name="stock_quantity"
            step={1}
            value={values.stock_quantity ?? 0}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 mt-6">
            <input type="checkbox" name="is_active" checked={!!values.is_active} onChange={handleChange} />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={!isValid} className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
