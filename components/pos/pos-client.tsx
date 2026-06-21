"use client"

import { useState, useEffect } from "react"
import { ProductSearch } from "./product-search"
import { CartPanel } from "./cart-panel"
import { UnitDialog } from "./unit-dialog"
import { PaymentDialog } from "./payment-dialog"

export type CartItem = {
  id: string
  productId: number
  productUnitId: number
  name: string
  unitName: string
  quantity: number
  quantityBase: number
  unitPrice: number
  lineTotal: number
  isStockItem: boolean
  stockWarning?: boolean
}

export function POSClient({ initialProducts, categories, customers }: any) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [discount, setDiscount] = useState<number>(0)
  const [isVatIncluded, setIsVatIncluded] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)

  const addToCart = (item: CartItem) => {
    setCart([...cart, item])
    setSelectedProduct(null)
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setIsVatIncluded(false)
    setSelectedCustomer(null)
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 = Focus Search
      if (e.key === "F1") {
        e.preventDefault()
        document.getElementById("product-search-input")?.focus()
      }
      // F2 = Focus Customer
      else if (e.key === "F2") {
        e.preventDefault()
        document.getElementById("customer-selector")?.focus()
      }
      // F5 = New Bill (Clear Cart)
      else if (e.key === "F5") {
        e.preventDefault()
        if (confirm("ต้องการเริ่มบิลใหม่ใช่หรือไม่? ข้อมูลในตะกร้าจะถูกลบทั้งหมด")) {
          clearCart()
        }
      }
      // Enter = Checkout (if no dialogs are open and cart is not empty)
      else if (e.key === "Enter" && !isPaymentOpen && !selectedProduct && cart.length > 0) {
        // Prevent default if it's not focused on an input that handles Enter
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault()
          setIsPaymentOpen(true)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cart, isPaymentOpen, selectedProduct])

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0)
  const afterDiscount = subtotal - discount
  const vatAmount = isVatIncluded ? afterDiscount * 0.07 : 0
  const grandTotal = afterDiscount + vatAmount

  return (
    <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* LEFT 60% */}
      <div className="w-3/5 border-r border-slate-200 flex flex-col h-full bg-white z-0">
        <ProductSearch 
          products={initialProducts} 
          categories={categories} 
          onSelectProduct={setSelectedProduct} 
        />
      </div>

      {/* RIGHT 40% */}
      <div className="w-2/5 flex flex-col h-full z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        <CartPanel 
          cart={cart}
          onRemove={removeFromCart}
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          subtotal={subtotal}
          discount={discount}
          onDiscountChange={setDiscount}
          isVatIncluded={isVatIncluded}
          onVatChange={setIsVatIncluded}
          vatAmount={vatAmount}
          grandTotal={grandTotal}
          onCheckout={() => setIsPaymentOpen(true)}
        />
      </div>

      {selectedProduct && (
        <UnitDialog 
          product={selectedProduct} 
          customer={selectedCustomer}
          onClose={() => setSelectedProduct(null)} 
          onAdd={addToCart} 
        />
      )}

      {isPaymentOpen && (
        <PaymentDialog 
          cart={cart}
          customer={selectedCustomer}
          subtotal={subtotal}
          discount={discount}
          vatAmount={vatAmount}
          grandTotal={grandTotal}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={() => {
            clearCart()
            setIsPaymentOpen(false)
            // print receipt will trigger here in the future
          }}
        />
      )}
    </div>
  )
}
