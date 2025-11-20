import { supabase } from '../lib/supabase'
import type { Product, CreateProductInput, UpdateProductInput, ProductDetails, UUID } from '../types/product'
import {getCurrentDate} from "../utils/dateAndTime.ts";

export class ProductsService {
  static async getProducts(search?: string | null): Promise<{ data: Product[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_get_product_list', {
        p_search_term: search && search.trim() !== '' ? search : null,
      })
      if (error) return { data: [], error: error.message }
      return { data: (data as Product[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to fetch products' }
    }
  }

  static async addProduct(input: CreateProductInput): Promise<{ data: Product | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_add_product', {
        p_account_id: input.account_id,
        p_name: input.name,
        p_retail_price: input.retail_price,
        p_stock_quantity: typeof input.stock_quantity === 'number' ? input.stock_quantity : 0,
        p_brand: input.brand ?? null,
        p_sku: input.sku ?? null,
          p_created_at: getCurrentDate(),

          p_description: input.description ?? null,
        p_cost_price: input.cost_price ?? null,
        p_low_stock_threshold: typeof input.low_stock_threshold === 'number' ? input.low_stock_threshold : 5,
        p_is_active: typeof input.is_active === 'boolean' ? input.is_active : true,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as Product[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to add product' }
    }
  }

  static async editProduct(input: UpdateProductInput): Promise<{ data: Product | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_edit_product', {
        p_product_id: input.id,
        p_name: input.name ?? null,
        p_brand: input.brand ?? null,
        p_sku: input.sku ?? null,
          p_created_at: getCurrentDate(),

          p_description: input.description ?? null,
        p_retail_price: typeof input.retail_price === 'number' ? input.retail_price : null,
        p_cost_price: typeof input.cost_price === 'number' ? input.cost_price : null,
        p_low_stock_threshold: typeof input.low_stock_threshold === 'number' ? input.low_stock_threshold : null,
        p_is_active: typeof input.is_active === 'boolean' ? input.is_active : null,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as Product[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to edit product' }
    }
  }

  static async adjustStock(productId: UUID, amount: number, reason: string): Promise<{ data: { id: UUID; new_stock_quantity: number } | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_adjust_product_stock', {
        p_product_id: productId,
        p_adjustment_amount: amount,
        p_reason: reason,
          p_created_at: getCurrentDate(),

      })
      if (error) return { data: null, error: error.message }
      const row = (data as any[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to adjust stock' }
    }
  }

  static async getProductDetails(id: UUID): Promise<{ data: ProductDetails | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_get_product_details', {
        p_product_id: id,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as ProductDetails[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to fetch product details' }
    }
  }
}
