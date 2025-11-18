import { supabase } from '../lib/supabase'
import type { DashboardData, GetDashboardDataInput } from '../types/dashboard' // Assuming types are in a new file

/**
 * A dedicated service class for handling all dashboard-related data fetching.
 */
export class DashboardService {
    /**
     * Fetches the aggregated data for the dashboard for a given date range.
     * This method calls the `bs_get_dashboard_data` PostgreSQL function.
     *
     * @param input - An object containing the start and end datetimes.
     * @returns A promise that resolves to an object containing the dashboard data or an error message.
     */
    static async getDashboardData(
        input: GetDashboardDataInput
    ): Promise<{ data: DashboardData | null; error: string | null }> {
        try {
            // Call the remote procedure (the PostgreSQL function)
            const { data, error } = await supabase.rpc('bs_get_dashboard_data', {
                p_start_datetime: input.start_datetime,
                p_end_datetime: input.end_datetime,
            })

            // Handle any errors returned from the database function
            if (error) {
                return { data: null, error: error.message }
            }

            // The function returns a single JSONB object, which the client receives as 'data'.
            // We assert its type to match our DashboardData interface.
            return { data: data as DashboardData, error: null }

        } catch (e: any) {
            // Catch any unexpected network or client-side errors
            return { data: null, error: e?.message || 'An unexpected error occurred while fetching dashboard data.' }
        }
    }
}