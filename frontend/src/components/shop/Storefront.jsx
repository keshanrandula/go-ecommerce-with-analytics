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

export default function Storefront({
  products,
  cart,
  onViewDetails,
  onAddToCart,
  backendStatus,
  onSwitchToAdmin
}) {
  return (
    <div>
      {/* Promo / Hero Banner */}
      <section className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/40 p-6 sm:p-8 md:p-12 overflow-hidden mb-10 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-xl relative z-10">
          <span className="inline-flex px-2.5 py-1 rounded-full font-bold text-[10px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider mb-4">
            Tech Setup Upgrade Sale
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Equip Your Workspace with Peak Performance
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Browse our handpicked tech gear designed for developers, audiophiles, and power users. Adding items to cart or viewing specs will fire analytic metrics dynamically.
          </p>
          <div className="flex gap-3">
            <a
              href="#product-grid"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/10 transition duration-200"
            >
              Start Browsing
            </a>
            <button
              onClick={onSwitchToAdmin}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition duration-200"
            >
              Monitor Metrics Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Product Section Title */}
      <div id="product-grid" className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-200">Catalog Products</h3>
          <p className="text-xs text-slate-500">Select products below to interact and test analytic logging</p>
        </div>
        <span className="text-xs text-slate-400 font-medium">Showing {products.length} Premium items</span>
      </div>

      {/* Product cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const isItemInCart = cart.some(item => item.product.id === product.id)
          const themeClass = 
            product.theme === 'teal' ? 'text-teal-400' :
            product.theme === 'emerald' ? 'text-emerald-400' :
            product.theme === 'cyan' ? 'text-cyan-400' :
            product.theme === 'amber' ? 'text-amber-400' :
            'text-indigo-400'

          return (
            <div 
              key={product.id} 
              className="group rounded-2xl border border-slate-900 bg-slate-900/30 p-5 flex flex-col justify-between hover:bg-slate-900/40 hover:border-slate-800/80 transition-all duration-300"
            >
              <div>
                {/* Product Header details */}
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-slate-900 border border-slate-850 text-slate-400">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <StarRating rating={product.rating} />
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">({product.reviews})</span>
                  </div>
                </div>

                {/* Custom SVG Icon Container */}
                <div className="h-32 w-full rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-center justify-center mb-4 group-hover:bg-slate-950/80 transition duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-transparent to-slate-950"></div>
                  <ProductIcon id={product.id} className={`w-14 h-14 ${themeClass}`} />
                </div>

                {/* Title & Info */}
                <h4 className="font-bold text-slate-200 text-base mb-1.5 group-hover:text-white transition">{product.name}</h4>
                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">{product.description}</p>
              </div>

              {/* Pricing and Actions footer */}
              <div className="pt-4 border-t border-slate-900/80 flex items-center justify-between mt-auto">
                <div className="text-xl font-bold font-mono text-white">
                  ${product.price.toFixed(2)}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewDetails(product)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
                    title="Quick view product specs (Sends View Event)"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={backendStatus !== 'connected'}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition ${
                      isItemInCart 
                        ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400 hover:bg-emerald-950/50' 
                        : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {isItemInCart ? 'Add More' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
