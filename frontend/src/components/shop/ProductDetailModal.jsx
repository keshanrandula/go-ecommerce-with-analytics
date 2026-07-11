import React from 'react'
import { ProductIcon } from '../common/ProductIcon'

function StarRating({ rating }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 !== 0
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalf && (
        <svg className="w-3.5 h-3.5 fill-current opacity-70" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
    </div>
  )
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  backendStatus
}) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto font-sans">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in">
        {/* Header info */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-400">
              {product.category}
            </span>
            <h3 className="text-xl font-extrabold text-slate-100 mt-2">{product.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition border border-transparent hover:border-slate-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Product Visual */}
          <div className="rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none"></div>
            <ProductIcon id={product.id} className="w-24 h-24" />
          </div>

          {/* Product Details info */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={product.rating} />
                <span className="text-xs text-slate-400 font-bold font-mono">({product.reviews} reviews)</span>
              </div>
              
              <div className="text-2xl font-bold font-mono text-emerald-400 mb-3">
                ${product.price.toFixed(2)}
              </div>
              
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                {product.description}
              </p>

              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Key Specs & Features:</h5>
              <ul className="space-y-1.5">
                {product.features.map((feature, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
              <button
                onClick={() => {
                  onAddToCart(product)
                  onClose()
                }}
                disabled={backendStatus !== 'connected'}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
