// Assuming a shared type alias exists, e.g., in 'src/types/common.ts'
export type UUID = string;

/**
 * Represents the Key Performance Indicators (KPIs) widget.
 * Corresponds to the 'kpis' object in the bs_get_dashboard_data response.
 */
export interface KpiData {
    total_sales: number;
    sales_count: number;
    appointments_count: number;
}

/**
 * Represents a single appointment in the summary list.
 * Corresponds to an element in the 'todays_appointments' array.
 */
export interface AppointmentSummary {
    id: UUID;
    start_time: string; // ISO 8601 timestamp string
    status: string;
    customer_name: string;
    staff_name: string;
}

/**
 * Represents a single recently added client in the summary list.
 * Corresponds to an element in the 'recent_clients' array.
 */
export interface RecentClient {
    id: UUID;
    name: string;
    phone_number: string | null; // Assuming phone_number can be nullable
    created_at: string; // ISO 8601 timestamp string
}

/**
 * Represents a single product with low stock in the summary list.
 * Corresponds to an element in the 'low_stock_products' array.
 */
export interface LowStockProduct {
    id: UUID;
    name: string;
    sku: string | null; // Assuming SKU can be nullable
    stock_quantity: number;
    low_stock_threshold: number;
}

/**
 * The main data structure for the entire dashboard.
 * This is the direct, typed representation of the JSONB object
 * returned by the bs_get_dashboard_data PostgreSQL function.
 */
export interface DashboardData {
    kpis: KpiData;
    todays_appointments: AppointmentSummary[];
    recent_clients: RecentClient[];
    low_stock_products: LowStockProduct[];
}

/**
 * Defines the input parameters required for the dashboard data function.
 */
export type GetDashboardDataInput = {
    start_datetime: string | Date;
    end_datetime: string | Date;
}