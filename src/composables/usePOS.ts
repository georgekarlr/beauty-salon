import { useEffect, useMemo, useState } from 'react'
import type { Client, UUID } from '../types/client'
import type { Product } from '../types/product'
import type { Service } from '../types/service'
import type { Appointment } from '../types/appointment'
import { ClientsService } from '../services/clientsService'
import { ProductsService } from '../services/productsService'
import { ServicesService } from '../services/servicesService'
import { AppointmentsService } from '../services/appointmentsService'
import { SalesService } from '../services/salesService'
import type { ProcessSaleInput, ProcessSaleResult, SalePaymentMethod } from '../types/sale'
import { getTodaysDateRange } from '../utils/dateAndTime.ts'

export type POSSelectedItem = {
  id: UUID
  name: string
  price: number
  quantity: number
  type: 'product' | 'service'
}

export function usePOS(accountId: number, active: boolean) {
  // Steps
  const [step, setStep] = useState(1)

  // Step 1: Customer / Appointment
  const [clients, setClients] = useState<Client[]>([])
  const [clientQuery, setClientQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Step 2: Items
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedItems, setSelectedItems] = useState<POSSelectedItem[]>([])

  // Totals
  const [taxRate, setTaxRate] = useState(0)
  const [tipAmount, setTipAmount] = useState(0)

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>('cash')
  const [amountTendered, setAmountTendered] = useState<number | ''>('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 4: Result
  const [result, setResult] = useState<ProcessSaleResult | null>(null)

  // Preload services/products when active
  useEffect(() => {
    if (!active) return
    let cancelled = false
    ;(async () => {
      const [svcRes, prodRes] = await Promise.all([
        ServicesService.getServices(null),
        ProductsService.getProducts(null),
      ])
      if (cancelled) return
      if (!svcRes.error) setServices(svcRes.data)
      if (!prodRes.error) setProducts(prodRes.data)
    })()
    return () => { cancelled = true }
  }, [active])

  // Search clients
  useEffect(() => {
    if (!active) return
    let ignore = false
    ;(async () => {
      const { data } = await ClientsService.getClients(clientQuery.trim() || null)
      if (!ignore) setClients(data)
    })()
    return () => { ignore = true }
  }, [active, clientQuery])

  // Load today's appointments and filter by selected customer
  useEffect(() => {
    if (!active) return
    setSelectedAppointment(null)
    if (!selectedClient) {
      setAppointments([])
      return
    }
    const range = getTodaysDateRange()
    ;(async () => {
      const { data } = await AppointmentsService.getAppointments({
        startDate: new Date(range.start_datetime),
        endDate: new Date(range.end_datetime),
      })
      const filtered = (data || []).filter(a => a.customer_id === selectedClient.id && (a.status === 'scheduled' || a.status === 'confirmed'))
      setAppointments(filtered)
    })()
  }, [active, selectedClient])

  // Derived totals
  const subtotal = useMemo(() => selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0), [selectedItems])
  const taxAmount = useMemo(() => +(subtotal * (taxRate / 100)).toFixed(2), [subtotal, taxRate])
  const totalAmount = useMemo(() => +(subtotal + taxAmount + (tipAmount || 0)).toFixed(2), [subtotal, taxAmount, tipAmount])
  const changeDue = useMemo(() => {
    const tendered = typeof amountTendered === 'number' ? amountTendered : 0
    const c = tendered - totalAmount
    return c > 0 ? +c.toFixed(2) : 0
  }, [amountTendered, totalAmount])

  // Actions
  const addItem = (item: POSSelectedItem) => {
    setSelectedItems(prev => {
      const idx = prev.findIndex(p => p.id === item.id && p.type === item.type)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 }
        return copy
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQty = (id: UUID, type: 'product' | 'service', qty: number) => {
    setSelectedItems(prev => prev.map(it => it.id === id && it.type === type ? { ...it, quantity: Math.max(1, Math.floor(qty || 1)) } : it))
  }

  const removeItem = (id: UUID, type: 'product' | 'service') => {
    setSelectedItems(prev => prev.filter(it => !(it.id === id && it.type === type)))
  }

  const resetAll = () => {
    setStep(1)
    setClients([])
    setClientQuery('')
    setSelectedClient(null)
    setAppointments([])
    setSelectedAppointment(null)
    setServices([])
    setProducts([])
    setSelectedItems([])
    setTaxRate(0)
    setTipAmount(0)
    setPaymentMethod('cash')
    setAmountTendered('')
    setProcessing(false)
    setError(null)
    setResult(null)
  }

  const handleProcess = async () => {
    setProcessing(true)
    setError(null)
    const service_items = selectedItems.filter(i => i.type === 'service').map(i => ({ id: i.id, quantity: i.quantity, price: i.price, total_amount: +(i.price * i.quantity).toFixed(2) }))
    const product_items = selectedItems.filter(i => i.type === 'product').map(i => ({ id: i.id, quantity: i.quantity, price: i.price, total_amount: +(i.price * i.quantity).toFixed(2) }))
    const payload: ProcessSaleInput = {
      account_id: accountId,
      customer_id: selectedClient?.id ?? null,
      appointment_id: selectedAppointment?.id ?? null,
      subtotal: +subtotal.toFixed(2),
      tax_amount: taxAmount,
      tip_amount: +(+tipAmount || 0).toFixed(2),
      total_amount: totalAmount,
      amount_tendered: typeof amountTendered === 'number' ? amountTendered : null,
      payment_method: paymentMethod,
      service_items,
      product_items,
    }
    const { data, error } = await SalesService.processSale(payload)
    if (error || !data) {
      setError(error || 'Failed to process sale')
      setProcessing(false)
      return
    }
    setResult(data)
    setProcessing(false)
    setStep(4)
  }

  const canGoNext = (currentStep: number) => {
    if (currentStep === 1) return !!selectedClient
    if (currentStep === 2) return selectedItems.length > 0
    return true
  }

  return {
    // state
    step, setStep,
    clients, clientQuery, setClientQuery, selectedClient, setSelectedClient,
    appointments, selectedAppointment, setSelectedAppointment,
    services, products, selectedItems, setSelectedItems,
    taxRate, setTaxRate, tipAmount, setTipAmount,
    paymentMethod, setPaymentMethod, amountTendered, setAmountTendered,
    processing, error, result,
    // derived
    subtotal, taxAmount, totalAmount, changeDue,
    // actions
    addItem, updateQty, removeItem, resetAll, handleProcess, canGoNext,
  }
}

export type UsePOSType = ReturnType<typeof usePOS>
