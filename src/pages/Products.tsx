import React, { useEffect, useMemo, useState } from 'react'
import { Package, Plus, Pencil, Eye, Search, Loader2, ToggleLeft, ToggleRight, CircleAlert, ArrowUpDown } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ProductForm, { ProductFormValues } from '../components/products/ProductForm'
import StockAdjustForm from '../components/products/StockAdjustForm'
import ProductDetailsPanel from '../components/products/ProductDetailsPanel'
import type { Product } from '../types/product'
import { ProductsService } from '../services/productsService'
import { useAuth } from '../contexts/AuthContext'

const ProductsPage: React.FC = () => {
  const { persona } = useAuth()
  const [items, setItems] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Product | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [adjustItem, setAdjustItem] = useState<Product | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    const handle = setTimeout(async () => {
      const { data, error } = await ProductsService.getProducts(query.trim() || null)
      if (!active) return
      if (error) {
        setError(error)
        setItems([])
      } else {
        setItems(data)
      }
      setLoading(false)
    }, 300)
    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [query])

  const sorted = useMemo(() => {
    const arr = [...items]
    if (sortBy === 'name') arr.sort((a,b) => (a.name || '').localeCompare(b.name || ''))
    if (sortBy === 'stock') arr.sort((a,b) => (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0))
    if (sortBy === 'price') arr.sort((a,b) => Number(b.retail_price) - Number(a.retail_price))
    return arr
  }, [items, sortBy])

  const addProduct = async (values: ProductFormValues) => {
    if (!persona?.id && persona?.id !== 0) {
      setError('No account selected. Please switch persona to an account with ID.')
      return
    }
    const input = {
      account_id: Number(persona!.id),
      ...values,
    }
    const { data, error } = await ProductsService.addProduct(input)
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => [data, ...prev])
    setCreateOpen(false)
  }

  const updateProduct = async (values: ProductFormValues) => {
    if (!editItem) return
    const { data, error } = await ProductsService.editProduct({
      id: editItem.id,
      name: values.name,
      brand: values.brand ?? null,
      sku: values.sku ?? null,
      description: values.description ?? null,
      retail_price: values.retail_price,
      cost_price: values.cost_price ?? null,
      low_stock_threshold: values.low_stock_threshold ?? null,
      is_active: values.is_active,
    })
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => prev.map(p => p.id === data.id ? { ...p, ...data } as Product : p))
    setEditItem(null)
  }

  const toggleActive = async (item: Product) => {
    const { data, error } = await ProductsService.editProduct({ id: item.id, is_active: !item.is_active })
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => prev.map(p => p.id === data.id ? { ...p, is_active: data.is_active } : p))
  }

  const adjustStock = async (amount: number, reason: string) => {
    if (!adjustItem) return
    const { data, error } = await ProductsService.adjustStock(adjustItem.id, amount, reason)
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => prev.map(p => p.id === adjustItem.id ? { ...p, stock_quantity: data.new_stock_quantity } : p))
    setAdjustItem(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><Package className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Add products, manage stock and pricing, and view activity.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name, brand, or SKU"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy(s => s === 'name' ? 'price' : s === 'price' ? 'stock' : 'name')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            title="Change sort"
          >
            <ArrowUpDown className="w-4 h-4" /> Sort: {sortBy}
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map(item => {
            const low = item.stock_quantity <= (item.low_stock_threshold ?? 0)
            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm text-gray-500">{item.brand || '—'}</div>
                    <div className="text-base font-semibold text-gray-900">{item.name}</div>
                    {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                  </div>
                  <button onClick={() => toggleActive(item)} className="text-gray-500 hover:text-gray-700" title={item.is_active ? 'Deactivate' : 'Activate'}>
                    {item.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">Price</div>
                    <div className="font-medium">${Number(item.retail_price).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Stock</div>
                    <div className="font-medium flex items-center gap-1">{item.stock_quantity} {low && <CircleAlert className="w-4 h-4 text-amber-500" />}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className="font-medium">{item.is_active ? 'Active' : 'Inactive'}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => setAdjustItem(item)} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Adjust Stock</button>
                  <button onClick={() => setEditItem(item)} className="px-3 py-1.5 text-sm inline-flex items-center gap-1 rounded-md border border-gray-300 hover:bg-gray-50"><Pencil className="w-4 h-4" /> Edit</button>
                  <button onClick={() => setViewId(item.id)} className="ml-auto px-3 py-1.5 text-sm inline-flex items-center gap-1 rounded-md bg-gray-900 text-white hover:bg-black"><Eye className="w-4 h-4" /> View</button>
                </div>
              </div>
            )
          })}
          {sorted.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-16">No products found.</div>
          )}
        </div>
      )}

      {/* Create Product Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Product">
        <ProductForm
          onSubmit={addProduct}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Create"
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Product">
        {editItem && (
          <ProductForm
            initial={editItem}
            onSubmit={updateProduct}
            onCancel={() => setEditItem(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal isOpen={!!adjustItem} onClose={() => setAdjustItem(null)} title={adjustItem ? `Adjust Stock — ${adjustItem.name}` : 'Adjust Stock'}>
        {adjustItem && (
          <StockAdjustForm onSubmit={adjustStock} onCancel={() => setAdjustItem(null)} />
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={!!viewId} onClose={() => setViewId(null)} title="Product Details">
        {viewId && <ProductDetailsPanel productId={viewId} />}
      </Modal>
    </div>
  )
}

export default ProductsPage
