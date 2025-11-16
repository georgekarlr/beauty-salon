import React, { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal'
import type { Appointment, AppointmentStatus } from '../../types/appointment'
import type { Staff } from '../../types/staff'
import type { Client } from '../../types/client'
import type { Service } from '../../types/service'
import { ClientsService } from '../../services/clientsService'
import { ServicesService } from '../../services/servicesService'
import { AppointmentsService } from '../../services/appointmentsService'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  isOpen: boolean
  onClose: () => void
  staffList: Staff[]
  mode: 'create' | 'edit'
  defaultDate?: Date | null
  defaultStaffId?: string | null
  appointment?: Appointment | null
  onChanged?: () => void // called after successful create/edit/cancel
}

const AppointmentModal: React.FC<Props> = ({ isOpen, onClose, staffList, mode, defaultDate = null, defaultStaffId = null, appointment = null, onChanged }) => {
  const { persona } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [customerId, setCustomerId] = useState<string>('')
  const [staffId, setStaffId] = useState<string>(defaultStaffId || '')
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [startLocal, setStartLocal] = useState<string>('') // yyyy-MM-ddTHH:mm
  const [endLocal, setEndLocal] = useState<string>('')
  const [status, setStatus] = useState<AppointmentStatus>('scheduled')
  const [notes, setNotes] = useState<string>('')

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setError(null)
    ;(async () => {
      const [clientsRes, servicesRes] = await Promise.all([
        ClientsService.getClients(null),
        ServicesService.getServices(null),
      ])
      if (!active) return
      if (clientsRes.error) setError(clientsRes.error)
      if (servicesRes.error) setError(servicesRes.error)
      setClients(clientsRes.data)
      setServices(servicesRes.data)
    })()
    return () => { active = false }
  }, [isOpen])

  useEffect(() => {
    if (mode === 'edit' && appointment) {
      setCustomerId(appointment.customer_id)
      setStaffId(appointment.staff_id)
      setServiceIds(appointment.services?.map(s => s.id) || [])
      setStartLocal(toLocalInput(appointment.start_time))
      setEndLocal(toLocalInput(appointment.end_time))
      setStatus(appointment.status)
      setNotes(appointment.notes || '')
    } else if (mode === 'create') {
      setCustomerId('')
      setStaffId(defaultStaffId || '')
      setServiceIds([])
      const base = defaultDate ? new Date(defaultDate) : new Date()
      base.setMinutes( Math.round(base.getMinutes()/5)*5 ) // snap to 5 min
      base.setSeconds(0,0)
      const end = new Date(base); end.setMinutes(end.getMinutes() + 60)
      setStartLocal(toLocalInput(base.toISOString()))
      setEndLocal(toLocalInput(end.toISOString()))
      setStatus('scheduled')
      setNotes('')
    }
  }, [mode, appointment, defaultDate, defaultStaffId])

  // Calculate end time based on services duration if creating
  useEffect(() => {
    if (mode !== 'create') return
    if (!startLocal) return
    const start = fromLocalInput(startLocal)
    const minutes = selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const total = minutes > 0 ? minutes : 60
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + total)
    setEndLocal(toLocalInput(end.toISOString()))
  }, [serviceIds, startLocal, mode])

  const selectedServices = useMemo(() => services.filter(s => serviceIds.includes(s.id)), [services, serviceIds])

  const save = async () => {
    setError(null)
    if (mode === 'create') {
      if (!persona?.id && persona?.id !== 0) {
        setError('No account selected. Switch persona to an account with ID.')
        return
      }
      if (!customerId || !staffId || !startLocal || !endLocal || serviceIds.length === 0) {
        setError('Please fill all required fields (customer, staff, services, start time).')
        return
      }
      setLoading(true)
      const { error } = await AppointmentsService.bookAppointment({
        account_id: Number(persona!.id),
        customer_id: customerId,
        staff_id: staffId,
        start_time: fromLocalInput(startLocal).toISOString(),
        end_time: fromLocalInput(endLocal).toISOString(),
        service_ids: serviceIds,
        notes: notes || null,
      })
      setLoading(false)
      if (error) {
        setError(error)
        return
      }
      onChanged && onChanged()
      onClose()
    } else if (mode === 'edit' && appointment) {
      setLoading(true)
      const { success, error } = await AppointmentsService.rescheduleAppointment({
        appointment_id: appointment.id,
        staff_id: staffId,
        start_time: fromLocalInput(startLocal).toISOString(),
        end_time: fromLocalInput(endLocal).toISOString(),
        service_ids: serviceIds,
        status,
        notes: notes || null,
      })
      setLoading(false)
      if (!success) {
        setError(error || 'Failed to update appointment')
        return
      }
      onChanged && onChanged()
      onClose()
    }
  }

  const cancelAppt = async () => {
    if (!appointment) return
    setLoading(true)
    const { success, error } = await AppointmentsService.cancelAppointment(appointment.id)
    setLoading(false)
    if (!success) {
      setError(error || 'Failed to cancel appointment')
      return
    }
    onChanged && onChanged()
    onClose()
  }

  const title = mode === 'create' ? 'New Appointment' : 'Edit Appointment'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={
      <div className="flex items-center justify-between">
        <div className="text-sm text-red-600">{error}</div>
        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <button disabled={loading} onClick={cancelAppt} className="px-3 py-2 rounded-md border border-red-200 text-red-700 hover:bg-red-50">Cancel appointment</button>
          )}
          <button disabled={loading} onClick={save} className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    }>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Customer</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300">
              <option value="">Select customer</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.first_name}{c.last_name ? ` ${c.last_name}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Staff</label>
            <select value={staffId} onChange={e => setStaffId(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300">
              <option value="">Select staff</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.first_name}{s.last_name ? ` ${s.last_name}` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Services</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-auto p-1 border border-gray-200 rounded-md">
            {services.map(s => {
              const checked = serviceIds.includes(s.id)
              return (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={checked} onChange={() => setServiceIds(prev => checked ? prev.filter(id => id !== s.id) : [...prev, s.id])} />
                  <span>{s.name}</span>
                  <span className="ml-auto text-gray-500">{s.duration_minutes}m</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start</label>
            <input type="datetime-local" value={startLocal} onChange={e => setStartLocal(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End</label>
            <input type="datetime-local" value={endLocal} onChange={e => setEndLocal(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as AppointmentStatus)} className="w-full px-3 py-2 rounded-md border border-gray-300">
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300" placeholder="Optional notes" />
          </div>
        </div>
      </div>
    </Modal>
  )
}

function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}
function fromLocalInput(local: string) {
  // Treat as local time; construct Date in local timezone
  return new Date(local)
}

export default AppointmentModal
