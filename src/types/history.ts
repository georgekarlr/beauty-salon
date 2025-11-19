// src/types/sales.ts

export type UUID = string;
export type SaleItemType = 'product' | 'service';
// Assuming you have a DB enum for this, usually matches these strings
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

// =================================================================
// 1. Sales History List
// Matches return of: bs_get_sales_history
// =================================================================

export interface SaleHistoryItem {
    id: UUID;
    sale_date: string; // ISO 8601 timestamp
    customer_name: string;
    total_amount: number;
    total_refund: number; // Calculated by SQL
    net_revenue: number;  // Calculated by SQL
}

export type GetSalesHistoryInput = {
    start_date: string | Date;
    end_date: string | Date;
    search_term?: string | null;
}

// =================================================================
// 2. Sale Details (The Receipt)
// Matches return of: bs_get_sale_details
// =================================================================

/**
 * Represents a single line item inside a sale.
 * Maps to the objects inside the 'items' JSONB array.
 */
export interface SaleItemDetail {
    sale_item_id: number;
    item_type: SaleItemType;
    item_name: string;
    quantity: number;
    price_per_unit: number;
    total_price: number;
}

/**
 * Represents a past refund event for this sale.
 * Maps to the objects inside the 'refunds' JSONB array.
 */
export interface SaleRefundHistory {
    refund_date: string;
    amount: number;
    reason: string;
}

/**
 * The full receipt details.
 */
export interface SaleDetails {
    id: UUID;
    sale_date: string;
    customer_name: string;
    subtotal: number;
    tax_amount: number;
    tip_amount: number;
    total_amount: number;
    amount_tendered: number;
    change_due: number;
    payment_method: PaymentMethod;

    // These come from SQL as JSONB arrays, but we type them strongly here
    items: SaleItemDetail[];
    refunds: SaleRefundHistory[];
}

// =================================================================
// 3. Process Refund Action
// Matches inputs for: bs_process_refund
// =================================================================

/**
 * Defines which item to return and how much money to give back for it.
 */
export interface RefundItemInput {
    sale_item_id: number;
    quantity: number;
    refund_amount: number;
}

/**
 * The payload required to execute a refund.
 */
export interface ProcessRefundInput {
    account_id: number;
    sale_id: UUID;
    reason: string;
    items: RefundItemInput[];
}

/**
 * The result returned by the refund function.
 */
export interface RefundResult {
    refund_id: UUID;
    total_refunded: number;
}