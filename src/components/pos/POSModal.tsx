import React, { useRef } from 'react'
import Modal from '../ui/Modal'
import { usePOS } from '../../composables/usePOS'
import POSStepper from './ui/POSStepper'
import CustomerSelector from './ui/CustomerSelector'
import ItemsPicker from './ui/ItemsPicker'
import CartTable from './ui/CartTable'
import TotalsPanel from './ui/TotalsPanel'
import PaymentForm from './ui/PaymentForm'
import ReceiptView from './ui/ReceiptView'

type Props = {
  isOpen: boolean
  onClose: () => void
  accountId: number
}

const POSModal: React.FC<Props> = ({ isOpen, onClose, accountId }) => {
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
  } = usePOS(accountId, isOpen)

  const receiptRef = useRef<HTMLDivElement | null>(null)

  const closeAndReset = () => {
    resetAll()
    onClose()
  }

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

  const footer = (
    <div className="flex items-center justify-between gap-3">
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
            disabled={processing || selectedItems.length === 0}
          >{processing ? 'Processing...' : 'Process Payment'}</button>
        )}
        {step === 4 && (
          <button className="px-4 py-2 rounded-md bg-gray-200" onClick={closeAndReset}>Close</button>
        )}
      </div>
    </div>
  )

  const Step1 = (
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
  )

  const Step2 = (
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
  )

  const Step3 = (
    <PaymentForm
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
      amountTendered={amountTendered}
      setAmountTendered={setAmountTendered}
      totalAmount={totalAmount}
      changeDue={changeDue}
      error={error}
    />
  )

  const Step4 = (
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
  )

  const title = step === 1 ? 'New Sale — Select Customer'
    : step === 2 ? 'New Sale — Select Items'
      : step === 3 ? 'New Sale — Payment'
        : 'New Sale — Result'

  return (
    <Modal isOpen={isOpen} onClose={closeAndReset} title={title} footer={footer}>
      <POSStepper current={step} />
      {step === 1 && Step1}
      {step === 2 && Step2}
      {step === 3 && Step3}
      {step === 4 && Step4}
    </Modal>
  )
}

export default POSModal
