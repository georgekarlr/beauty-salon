import { useCallback, useEffect, useState } from 'react'
import type { ServiceDetails } from '../types/service'
import { ServicesService } from '../services/servicesService'

export function useServiceDetails(serviceId: string | null) {
  const [data, setData] = useState<ServiceDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    const { data, error } = await ServicesService.getServiceDetails(id)
    if (error) setError(error)
    setData(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (serviceId) load(serviceId)
  }, [serviceId, load])

  return { data, loading, error, reload: () => serviceId && load(serviceId) }
}

export default useServiceDetails
