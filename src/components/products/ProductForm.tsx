import React, { useMemo, useState } from 'react'
import { Package, DollarSign, Tag, Hash, FileText, Layers } from 'lucide-react'
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

const ProductForm: React.FC<Props> = ({ initial, onSubmit, onCancel, submitLabel = 'Save Product' }) => {
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
        const { name, value, type } = e.target
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setValues(v => ({ ...v, [name]: checked }))
        } else {
            setValues(v => ({
                ...v,
                [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
            }))
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                if (isValid) onSubmit(values)
            }}
            // FIX: Added max-height and overflow-y-auto here to enable scrolling on mobile
            className="flex flex-col h-full max-h-[80vh]"
        >

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-1 space-y-6 pb-4 custom-scrollbar">

                {/* --- Section 1: General Information --- */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4" /> General Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                            <input
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-all"
                                placeholder="e.g. Revitalizing Shampoo"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    name="brand"
                                    value={values.brand ?? ''}
                                    onChange={handleChange}
                                    className="w-full pl-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    placeholder="e.g. L'Oreal"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Barcode</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    name="sku"
                                    value={values.sku ?? ''}
                                    onChange={handleChange}
                                    className="w-full pl-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm font-mono text-sm"
                                    placeholder="PROD-001"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <div className="relative">
                <textarea
                    name="description"
                    value={values.description ?? ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm resize-none"
                    placeholder="Enter details about the product..."
                />
                                <FileText className="absolute top-3 right-3 h-4 w-4 text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Section 2: Pricing --- */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Pricing Strategy
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Retail Price <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-bold">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="retail_price"
                                    min={0}
                                    step={0.01}
                                    value={values.retail_price ?? ''}
                                    onChange={handleChange}
                                    className="w-full pl-8 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm font-medium text-gray-900"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="cost_price"
                                    min={0}
                                    step={0.01}
                                    value={values.cost_price ?? ''}
                                    onChange={handleChange}
                                    className="w-full pl-8 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm text-gray-600"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Used to calculate profit margins.</p>
                        </div>
                    </div>
                </div>

                {/* --- Section 3: Inventory & Status --- */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Inventory Control
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                            <input
                                type="number"
                                name="stock_quantity"
                                step={1}
                                value={values.stock_quantity ?? 0}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                            <input
                                type="number"
                                name="low_stock_threshold"
                                min={0}
                                step={1}
                                value={values.low_stock_threshold ?? 5}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            />
                        </div>

                        <div className="flex flex-col justify-center">
                            <span className="block text-sm font-medium text-gray-700 mb-2">Status</span>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={!!values.is_active}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className={`ml-3 text-sm font-medium ${values.is_active ? 'text-indigo-700' : 'text-gray-500'}`}>
                  {values.is_active ? 'Active' : 'Archived'}
                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Footer Actions (Sticky) --- */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-auto shrink-0 bg-white">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!isValid}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    )
}

export default ProductForm