import React, { useRef } from 'react'
import type { SalePaymentMethod } from '../types/sale'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePOS } from '../composables/usePOS'
import POSStepper from '../components/pos/ui/POSStepper'
import CustomerSelector from '../components/pos/ui/CustomerSelector'
import ItemsPicker from '../components/pos/ui/ItemsPicker'
import CartTable from '../components/pos/ui/CartTable'
import TotalsPanel from '../components/pos/ui/TotalsPanel'
import PaymentForm from '../components/pos/ui/PaymentForm'
import ReceiptView from '../components/pos/ui/ReceiptView'

const POSPage: React.FC = () => {
  const navigate = useNavigate()
  const { persona } = useAuth()
  const accountId = Number(persona?.id || 0)
  const {
    step, setStep,
    clients, clientQuery, setClientQuery, selectedClient, setSelectedClient,
    appointments, selectedAppointment, setSelectedAppointment,
    services, products, selectedItems,
    taxRate, setTaxRate, tipAmount, setTipAmount,
    paymentMethod, setPaymentMethod, amountTendered, setAmountTendered,
    processing, error, result,
    subtotal, taxAmount, totalAmount, changeDue,
    addItem, updateQty, removeItem,
    resetAll, handleProcess, canGoNext,
  } = usePOS(accountId, true)

  const receiptRef = useRef<HTMLDivElement | null>(null)

  const printReceipt = () => {
    if (!receiptRef.current) return
    const win = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150')
    if (!win) return
    win.document.write('<html><head><title>Receipt</title>')
    win.document.write('<style>body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:16px} table{width:100%;border-collapse:collapse} th,td{padding:6px;border-bottom:1px solid #e5e7eb;text-align:left} .total-row td{font-weight:600}</style>')
    win.document.write('</head><body>')
    win.document.write(receiptRef.current.innerHTML)
    win.document.write('</body></html>')
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const downloadReceiptImage = async () => {
    if (!receiptRef.current) return
    const node = receiptRef.current
    const width = node.scrollWidth
    const height = node.scrollHeight
    const svg = `<?xml version="1.0" standalone="no"?><svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>\
      <foreignObject width='100%' height='100%'>\
        <div xmlns='http://www.w3.org/1999/xhtml' style='font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background: white;'>${node.innerHTML}</div>\
      </foreignObject>\
    </svg>`
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `receipt-${result?.sale_id || Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
    }
    img.src = url
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-md hover:bg-gray-100" aria-label="Back to dashboard">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Point Of Sales</h1>
          <p className="text-sm text-gray-500">Process a new sale in a few steps.</p>
        </div>
        <div className="ml-auto">
          <button
            className="px-3 py-1.5 text-sm rounded-md border"
            onClick={resetAll}
          >Reset</button>
        </div>
      </div>

      {!persona && (
        <div className="mb-4 p-3 rounded-md bg-yellow-50 text-yellow-700 text-sm">You must select a persona to process sales.</div>
      )}

      {/* Stepper */}
      <POSStepper current={step} />

      <div className="bg-white rounded-xl shadow border p-4">
        {step === 1 && (
          <CustomerSelector
            clientQuery={clientQuery}
            setClientQuery={setClientQuery}
            clients={clients}
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            appointments={appointments}
            selectedAppointment={selectedAppointment}
            onSelectAppointment={setSelectedAppointment}
          />
        )}

        {step === 2 && (
          <div className="space-y-6">
            <ItemsPicker services={services} products={products} onAdd={addItem} />

            <div>
              <h4 className="font-semibold mb-2">Cart</h4>
              <CartTable items={selectedItems} updateQty={updateQty} removeItem={removeItem} />
            </div>

            <TotalsPanel
              subtotal={subtotal}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              tipAmount={tipAmount}
              setTipAmount={setTipAmount}
            />
          </div>
        )}

        {step === 3 && (
          <PaymentForm
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            amountTendered={amountTendered}
            setAmountTendered={setAmountTendered}
            totalAmount={totalAmount}
            changeDue={changeDue}
            error={error}
          />
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Sale Completed</h4>
              <div className="text-sm text-gray-600">Sale ID: <span className="font-mono">{result?.sale_id}</span></div>
            </div>
            <ReceiptView
              ref={receiptRef}
              selectedClient={selectedClient}
              items={selectedItems}
              subtotal={subtotal}
              taxAmount={taxAmount}
              tipAmount={tipAmount}
              totalAmount={totalAmount}
              amountTendered={amountTendered}
              changeDue={changeDue}
              saleId={result?.sale_id || null}
              saleDate={result?.sale_date || null}
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-md border" onClick={downloadReceiptImage}>Download Image</button>
              <button className="px-4 py-2 rounded-md border" onClick={printReceipt}>Print Receipt</button>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4">
          <div className="text-sm text-gray-500">Step {step} of 4</div>
          <div className="flex gap-2">
            {step > 1 && step < 4 && (
              <button className="px-4 py-2 rounded-md border" onClick={() => setStep(step - 1)} disabled={processing}>Back</button>
            )}
            {step < 3 && (
              <button
                className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50"
                onClick={() => setStep(step + 1)}
                disabled={processing || !canGoNext(step)}
              >Next</button>
            )}
            {step === 3 && (
              <button
                className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-50"
                onClick={handleProcess}
                disabled={processing || selectedItems.length === 0 || !persona}
              >{processing ? 'Processing...' : 'Process Payment'}</button>
            )}
            {step === 4 && (
              <button className="px-4 py-2 rounded-md bg-gray-200" onClick={() => navigate('/dashboard')}>Close</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default POSPage
