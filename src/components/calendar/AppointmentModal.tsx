import React, { useEffect, useMemo, useState, useRef } from 'react'
import Modal from '../ui/Modal'
import type { Appointment, AppointmentStatus } from '../../types/appointment'
import type { Staff } from '../../types/staff'
import type { Client } from '../../types/client'
import type { Service } from '../../types/service'
import { ClientsService } from '../../services/clientsService'
import { ServicesService } from '../../services/servicesService'
import { AppointmentsService } from '../../services/appointmentsService'
import { useAuth } from '../../contexts/AuthContext'

// --- ICONS ---
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
)
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
)
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
)

type Props = {
    isOpen: boolean
    onClose: () => void
    staffList: Staff[]
    mode: 'create' | 'edit'
    defaultDate?: Date | null
    defaultStaffId?: string | null
    appointment?: Appointment | null
    onChanged?: () => void
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
    const [startLocal, setStartLocal] = useState<string>('')
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
            setStartLocal(appointment.start_time)
            setEndLocal(appointment.end_time)
            setStatus(appointment.status)
            setNotes(appointment.notes || '')
        } else if (mode === 'create') {
            setCustomerId('')
            setStaffId(defaultStaffId || '')
            setServiceIds([])
            const base = defaultDate ? new Date(defaultDate) : new Date()
            base.setMinutes( Math.round(base.getMinutes()/5)*5 )
            base.setSeconds(0,0)
            const end = new Date(base); end.setMinutes(end.getMinutes() + 60)
            setStartLocal(toLocalInput(base.toISOString()))
            setEndLocal(toLocalInput(end.toISOString()))
            setStatus('scheduled')
            setNotes('')
        }
    }, [mode, appointment, defaultDate, defaultStaffId])

    useEffect(() => {
        if (mode !== 'create') return
        if (!startLocal) return
        const start = fromLocalInput(startLocal)
        const minutes = selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
        const total = minutes > 0 ? minutes : 60
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + total)
        setEndLocal(toLocalInput(end.toISOString()))
    }, [serviceIds, startLocal, mode, services])

    const selectedServices = useMemo(() => services.filter(s => serviceIds.includes(s.id)), [services, serviceIds])

    const save = async () => {
        setError(null)
        if (mode === 'create') {
            if (!persona?.id && persona?.id !== 0) {
                setError('No account selected.')
                return
            }
            if (!customerId || !staffId || !startLocal || !endLocal || serviceIds.length === 0) {
                setError('Please fill all required fields.')
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

    const clientOptions = useMemo(() =>
            clients.map(c => ({
                id: c.id,
                label: `${c.first_name}${c.last_name ? ' ' + c.last_name : ''}`,
                subLabel: c.email || c.phone_number
            }))
        , [clients])

    const staffOptions = useMemo(() =>
            staffList.map(s => ({
                id: s.id,
                label: `${s.first_name}${s.last_name ? ' ' + s.last_name : ''}`
            }))
        , [staffList])

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
            {/*
         SCROLL CONTAINER
         1. max-h-[60vh]: Limits height to 60% of viewport, forcing scroll if content is taller.
         2. overflow-y-auto: Enables the scrollbar.
         3. px-1: Adds slight padding so focus rings/borders aren't cut off.
      */}
            <div className="max-h-[60vh] overflow-y-auto px-1">

                {/*
           CONTENT CONTAINER
           pb-40: This large bottom padding is CRITICAL.
           It ensures that if you open a dropdown at the bottom of the form,
           you can scroll down to see the dropdown items instead of them getting cut off.
        */}
                <div className="space-y-4 pb-40">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Customer</label>
                            <SearchableSelect
                                options={clientOptions}
                                value={customerId}
                                onChange={setCustomerId}
                                placeholder="Select customer..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Staff</label>
                            <SearchableSelect
                                options={staffOptions}
                                value={staffId}
                                onChange={setStaffId}
                                placeholder="Select staff..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Services</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-auto p-1 border border-gray-200 rounded-md bg-white">
                            {services.map(s => {
                                const checked = serviceIds.includes(s.id)
                                return (
                                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                                        <input type="checkbox" checked={checked} onChange={() => setServiceIds(prev => checked ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                                               className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{s.name}</span>
                                        <span className="ml-auto text-gray-400 text-xs">{s.duration_minutes}m</span>
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
                            <select value={status} onChange={e => setStatus(e.target.value as AppointmentStatus)} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white">
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
            </div>
        </Modal>
    )
}

// --- REUSABLE SEARCHABLE SELECT COMPONENT ---
interface Option {
    id: string | number
    label: string
    subLabel?: string
}

interface SearchableSelectProps {
    options: Option[]
    value: string | number
    onChange: (val: any) => void
    placeholder?: string
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = 'Select...' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const selectedOption = options.find(o => o.id === value)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full px-3 py-2 rounded-md border bg-white flex items-center justify-between cursor-pointer
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 hover:border-gray-400'}
        `}
            >
        <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
                <ChevronDownIcon />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 py-1 max-h-60 overflow-hidden flex flex-col">
                    <div className="px-2 pb-2 pt-1 border-b border-gray-100 relative">
                        <div className="absolute left-4 top-3.5">
                            <SearchIcon />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <div className="absolute right-4 top-3.5 cursor-pointer" onClick={() => setSearchTerm('')}>
                                <XIcon />
                            </div>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id)
                                        setIsOpen(false)
                                        setSearchTerm('')
                                    }}
                                    className={`
                    px-4 py-2 text-sm cursor-pointer flex flex-col
                    ${opt.id === value ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                                >
                                    <span className="font-medium">{opt.label}</span>
                                    {opt.subLabel && <span className="text-xs text-gray-400">{opt.subLabel}</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function toLocalInput(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    const mm = pad(d.getUTCMonth() + 1);
    const dd = pad(d.getUTCDate());
    const hh = pad(d.getUTCHours());
    const mi = pad(d.getUTCMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromLocalInput(local: string): Date {
    if (!local) return new Date();
    return new Date(local + 'Z');
}

export default AppointmentModal