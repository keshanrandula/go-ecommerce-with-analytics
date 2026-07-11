import React, { useState } from 'react'

function CartWireframeIcon({ name, className }) {
  const lowerName = (name || '').toLowerCase()
  if (lowerName.includes('keyboard')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="2" y="5" width="20" height="14" rx="3" strokeWidth="1.8" />
        <path d="M5 8h2v2H5V8zm4 0h2v2H9V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zM5 11h2v2H5v-2zm4 0h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM5 14h14v2H5v-2z" strokeWidth="1.2" />
      </svg>
    )
  }
  if (lowerName.includes('headphone') || lowerName.includes('audio') || lowerName.includes('sound')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="2" y="12" width="4" height="7" rx="2" strokeWidth="1.5" />
        <rect x="18" y="12" width="4" height="7" rx="2" strokeWidth="1.5" />
      </svg>
    )
  }
  if (lowerName.includes('watch') || lowerName.includes('wearable') || lowerName.includes('smartwatch')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="6" y="6" width="12" height="12" rx="4" strokeWidth="2" />
        <path d="M9 6V2h6v4M9 18v4h6v-4" strokeWidth="1.5" />
      </svg>
    )
  }
  if (lowerName.includes('mouse') || lowerName.includes('clicker')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="6" y="2" width="12" height="20" rx="6" strokeWidth="2" />
        <line x1="12" y1="2" x2="12" y2="10" strokeWidth="1.5" />
        <line x1="6" y1="10" x2="18" y2="10" strokeWidth="1.2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" />
      <polyline points="2 17 12 22 22 17" strokeWidth="1.5" />
    </svg>
  )
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isCheckoutLoading = false,
  apiBase,
  token
}) {
  if (!isOpen) return null

  // Coupon States
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // Stripe Sandbox Modal States
  const [showStripeModal, setShowStripeModal] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [stripeError, setStripeError] = useState('')
  const [stripeLoading, setStripeLoading] = useState(false)

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  const shipping = 0.00
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0
  const total = subtotal + shipping - discountAmount

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setCouponError('')
    setCouponLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/v1/coupons/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Invalid coupon code')
      }
      setAppliedCoupon(data)
    } catch (err) {
      setCouponError(err.message === 'invalid coupon code' ? 'Invalid coupon code (වලංගු නොවන කේතයක්)' : err.message)
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    if (!cardNumber || !expiry || !cvc) {
      setStripeError('Please fill in all credit card details.')
      return
    }
    setStripeError('')
    setStripeLoading(true)

    try {
      // 1. Create Mock payment intent
      const intentRes = await fetch(`${apiBase}/api/v1/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: total })
      })
      
      if (!intentRes.ok) {
        throw new Error('Payment processing failed on gateway. Try again.')
      }

      // 2. Process final checkout
      await onCheckout(appliedCoupon)
      setShowStripeModal(false)
      onClose()
    } catch (err) {
      setStripeError(err.message)
    } finally {
      setStripeLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop blur overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Slide-out Panel container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-100 flex flex-col justify-between h-full relative animate-slide-in">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>🛒 Shopping Cart</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
                </span>
              </h2>
              <p className="text-[11px] text-slate-450 mt-1 font-medium">Verify your items before checking out</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close Drawer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-slate-50 text-slate-350 border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-2xl mb-4 select-none">
                  🛍️
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-455 max-w-[240px] leading-relaxed">
                  Go back to the catalog shop page and click "Add to Cart" to start adding premium tech gear.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.product.id || item.product.name} 
                  className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-500/10 transition-all duration-200"
                >
                  <div className="w-14 h-14 shrink-0 rounded-lg bg-slate-50 border border-slate-200/50 flex items-center justify-center overflow-hidden">
                    {item.product.image ? (
                      <img 
                        src={item.product.image.startsWith('http') ? item.product.image : `${apiBase}${item.product.image}`} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <CartWireframeIcon name={item.product.name} className="w-7 h-7 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs truncate">{item.product.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.product.category}</span>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                      ${item.product.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-lg p-1">
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id || item.product.name, item.quantity - 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-xs text-slate-500 hover:text-slate-850 hover:bg-slate-50 font-bold transition"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-700 min-w-[14px] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id || item.product.name, item.quantity + 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-xs text-slate-500 hover:text-slate-850 hover:bg-slate-50 font-bold transition"
                    >
                      +
                    </button>
                  </div>

                  <button 
                    onClick={() => onRemoveItem(item.product.id || item.product.name)}
                    className="p-1 rounded-lg text-slate-350 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary / Actions */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
              
              {/* Promo code field */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Promo Code</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. CYBER25)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={appliedCoupon || couponLoading}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 disabled:bg-slate-100 transition"
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition disabled:opacity-50"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-[10px] text-rose-500 font-medium">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-[10px] text-emerald-600 font-bold">
                    ✓ Code Applied: {appliedCoupon.value}% discount!
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t border-slate-200/60 pt-3">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-slate-700">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-650 font-bold">
                    <span>Discount</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Shipping</span>
                  <span className="font-mono font-semibold text-slate-700">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between text-sm font-bold text-slate-800">
                  <span>Total Due</span>
                  <span className="font-mono text-base text-slate-900">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (token) {
                    setShowStripeModal(true)
                  } else {
                    onCheckout()
                  }
                }}
                disabled={isCheckoutLoading}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-450 text-white shadow-md shadow-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 border border-emerald-500/10"
              >
                <span>🛍️ Proceed to Secure Payment</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stripe Payment Sandbox Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-slate-200">
            <button 
              onClick={() => {
                setShowStripeModal(false)
                setStripeError('')
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 transition"
              title="Close payment window"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <span className="text-xl">💳</span>
              <span>Stripe Checkout Sandbox</span>
            </h3>
            <p className="text-[11px] text-slate-450 mb-6 leading-relaxed">
              Complete your transaction securely. Enter any simulated credit card details to finalize test checkout.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Card Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiration Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength="5"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
                
                {/* CVC */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CVC</label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    maxLength="4"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
              </div>

              {stripeError && (
                <div className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-lg py-1.5 px-2.5 text-center font-medium">
                  ⚠️ {stripeError}
                </div>
              )}

              <button
                type="submit"
                disabled={stripeLoading || isCheckoutLoading}
                className="w-full mt-2 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/10 transition duration-200 flex items-center justify-center gap-2"
              >
                {stripeLoading || isCheckoutLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <span>Pay ${total.toFixed(2)}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
