import { useCallback, useEffect, useState } from 'react'
import type { ProductDetails } from '../types/product'
import { ProductsService } from '../services/productsService'

export function useProductDetails(productId: string | null) {
  const [data, setData] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    const { data, error } = await ProductsService.getProductDetails(id)
    if (error) setError(error)
    setData(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (productId) load(productId)
  }, [productId, load])

  return { data, loading, error, reload: () => productId && load(productId) }
}

export default useProductDetails
