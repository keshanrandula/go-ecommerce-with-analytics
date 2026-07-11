import React from 'react'
import { ProductIcon } from '../common/ProductIcon'

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemove,
  onCheckout,
  checkoutStatus,
  backendStatus,
  cartCount,
  cartSubtotal
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl relative">
            
            {/* Cart Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-bold text-slate-100">Shopping Cart</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition border border-transparent hover:border-slate-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950/60 flex items-center justify-center text-slate-600 border border-slate-800/40">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-300">Your cart is empty</h4>
                    <p className="text-xs text-slate-500 mt-1">Add items from the store grid to proceed with testing.</p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <ProductIcon id={item.product.id} className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-200 truncate">{item.product.name}</h4>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">{item.product.category}</span>
                      <div className="text-xs font-bold text-emerald-400 font-mono mt-1">
                        ${item.product.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* Quantity selectors */}
                      <div className="flex items-center bg-slate-900 rounded-md border border-slate-850 overflow-hidden">
                        <button
                          onClick={() => onUpdateQty(item.product.id, -1)}
                          className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-slate-200 bg-slate-950/50">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.product.id, 1)}
                          className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => onRemove(item.product.id)}
                        className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout pricing and action footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Items Subtotal</span>
                    <span className="font-mono text-slate-200">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Est. Shipping & Taxes</span>
                    <span className="text-emerald-500 font-semibold">FREE DEMO</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-100 pt-2 border-t border-slate-850">
                    <span>Total (Simulated)</span>
                    <span className="font-mono text-emerald-400 text-base">${cartSubtotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  disabled={checkoutStatus === 'processing' || backendStatus !== 'connected'}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutStatus === 'processing' ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      💳 Simulated Checkout (Sends Purchases)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
