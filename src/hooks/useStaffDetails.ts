import { useEffect, useState, useCallback } from 'react'
import type { StaffDetails } from '../types/staff'
import { StaffService } from '../services/staffService'

export function useStaffDetails(staffId: string | null) {
  const [data, setData] = useState<StaffDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    const { data, error } = await StaffService.getStaffDetails(id)
    if (error) setError(error)
    setData(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (staffId) load(staffId)
  }, [staffId, load])

  return { data, loading, error, reload: () => staffId && load(staffId) }
}

export default useStaffDetails
