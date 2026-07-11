import React from 'react'

function OrderProductIcon({ name, className }) {
  const lowerName = (name || '').toLowerCase()
  
  if (lowerName.includes('keyboard')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="2" y="5" width="20" height="14" rx="3" strokeWidth="1.8" />
        <path d="M5 8h2v2H5V8zm4 0h2v2H9V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zM5 11h2v2H5v-2zm4 0h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM5 14h14v2H5v-2z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (lowerName.includes('headphone') || lowerName.includes('audio') || lowerName.includes('sound')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="2" y="12" width="4" height="7" rx="2" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="18" y="12" width="4" height="7" rx="2" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      </svg>
    )
  }
  if (lowerName.includes('watch') || lowerName.includes('wearable') || lowerName.includes('smartwatch')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="6" y="6" width="12" height="12" rx="4" strokeWidth="2" />
        <path d="M9 6V2h6v4M9 18v4h6v-4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (lowerName.includes('mouse') || lowerName.includes('clicker') || lowerName.includes('pointer')) {
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
      <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 17 12 22 22 17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Orders({ orders = [], loading = false, currentUser }) {
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="font-sans text-slate-800 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <section className="relative rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-550/5 to-emerald-50/20 p-8 sm:p-10 overflow-hidden mb-8 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <span className="inline-flex px-3 py-1 rounded-full font-bold text-[10px] uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 tracking-wider mb-4">
            Order Status 📦
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 leading-tight">
            My Purchase History
          </h2>
          <p className="text-slate-550 text-xs sm:text-sm leading-relaxed max-w-lg font-medium">
            Hello, <strong className="text-slate-700 font-bold">{currentUser?.name}</strong>. Track your order shipment lifecycle and review transactional metrics live from MongoDB.
          </p>
        </div>
      </section>

      {/* Orders List Container */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin"></div>
          <span className="text-xs text-slate-500 font-semibold font-mono">Fetching order history...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-200 rounded-3xl bg-white p-8 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-2xl mx-auto mb-4 border border-slate-100">
            📦
          </div>
          <h3 className="text-sm font-bold text-slate-700 mb-1">No Orders Found</h3>
          <p className="text-xs text-slate-555 max-w-sm mx-auto mb-6">
            You haven't placed any orders yet. Visit our premium catalog to add some items to your workspace.
          </p>
          <a
            href="#storefront"
            onClick={(e) => {
              e.preventDefault()
              window.dispatchEvent(new CustomEvent('switch-to-shop'))
            }}
            className="inline-flex px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Purchases ({orders.length})</span>
            <span className="text-xs text-slate-400 font-semibold font-mono">Real-time DB Sync</span>
          </div>

          <div className="space-y-5">
            {orders.map((order, index) => {
              const currentStatus = order.status || 'Processing'
              return (
                <div 
                  key={order.id || index} 
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200 flex flex-col gap-4"
                >
                  {/* Item header details */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100/50 shrink-0">
                        <OrderProductIcon name={order.product_id} className="w-6 h-6" />
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{order.product_id}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium font-mono">
                          <span>ID: {order.id?.substring(0, 8) || 'N/A'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                          <span>{formatDate(order.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:mb-0.5">Amount Paid</span>
                      <span className="text-base font-bold font-mono text-emerald-650">${(order.price || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Visual Tracker Bar */}
                  <div className="flex flex-col w-full border-t border-slate-100 pt-4 mt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-3">
                      <span>Logistics Shipment Tracker</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] ${
                        currentStatus === 'Delivered' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : currentStatus === 'Shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {currentStatus}
                      </span>
                    </div>

                    {/* Step progress graphic */}
                    <div className="flex items-center justify-between relative mt-2 px-6">
                      <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-100 z-0"></div>
                      <div 
                        style={{
                          width: currentStatus === 'Delivered' ? '100%' : currentStatus === 'Shipped' ? '50%' : '0%'
                        }}
                        className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 z-0 transition-all duration-500"
                      ></div>

                      {['Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                        const stepsList = ['Processing', 'Shipped', 'Delivered']
                        const currentIdx = stepsList.indexOf(currentStatus)
                        const isCompleted = idx <= currentIdx
                        
                        return (
                          <div key={step} className="flex flex-col items-center relative z-10">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-bold transition duration-300 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                              {idx === 0 ? '⚙️' : idx === 1 ? '🚚' : '🎁'}
                            </div>
                            <span className={`text-[9px] font-extrabold mt-1.5 transition duration-300 ${
                              isCompleted ? 'text-slate-700' : 'text-slate-400'
                            }`}>
                              {step}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
