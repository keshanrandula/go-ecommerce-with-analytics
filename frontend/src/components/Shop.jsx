import React, { useState } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'

function ProductWireframeIcon({ name, className }) {
  const lowerName = (name || '').toLowerCase()
  
  if (lowerName.includes('keyboard')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="2" y="5" width="20" height="14" rx="3" strokeWidth="1.8" />
        <path d="M5 8h2v2H5V8zm4 0h2v2H9V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zM5 11h2v2H5v-2zm4 0h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM5 14h14v2H5v-2z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="21" cy="5" r="1.5" className="fill-emerald-400 animate-ping" />
      </svg>
    )
  }
  if (lowerName.includes('headphone') || lowerName.includes('audio') || lowerName.includes('sound')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="2" y="12" width="4" height="7" rx="2" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="18" y="12" width="4" height="7" rx="2" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M6 15v-2c0-3.31 2.69-6 6-6s6 2.69 6 6v2" strokeWidth="1.2" />
        <path d="M9 13c1 0 1.5 1 2 1s1-.5 1.5-.5.5.5 1 .5" strokeWidth="1" strokeLinecap="round" className="animate-pulse" />
      </svg>
    )
  }
  if (lowerName.includes('watch') || lowerName.includes('wearable') || lowerName.includes('smartwatch')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="6" y="6" width="12" height="12" rx="4" strokeWidth="2" />
        <path d="M9 6V2h6v4M9 18v4h6v-4" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.5" strokeWidth="1.2" strokeDasharray="3 2" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '6s' }} />
        <line x1="12" y1="10" x2="12" y2="12" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="12" x2="14" y2="13" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (lowerName.includes('mouse') || lowerName.includes('clicker') || lowerName.includes('pointer')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="6" y="2" width="12" height="20" rx="6" strokeWidth="2" />
        <line x1="12" y1="2" x2="12" y2="10" strokeWidth="1.5" />
        <line x1="6" y1="10" x2="18" y2="10" strokeWidth="1.2" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
        <path d="M12 15v3" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
      </svg>
    )
  }
  
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 17 12 22 22 17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 12 12 17 22 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Shop({ 
  products = [], 
  cart = [], 
  onAddToCart, 
  currentUser, 
  apiBase,
  wishlist = [],
  onToggleWishlist,
  token,
  onProductReviewed
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('default')

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        product.category === selectedCategory
        
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.price - b.price
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price
      }
      return 0
    })

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!token) return
    setSubmitError('')
    setSubmitLoading(true)

    try {
      const targetId = selectedProduct.id || selectedProduct.name
      const res = await fetch(`${apiBase}/api/v1/products/${targetId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      setReviewComment('')
      setReviewRating(5)
      
      // Update selected product locally
      const updatedProductRes = await fetch(`${apiBase}/api/v1/products`)
      if (updatedProductRes.ok) {
        const prods = await updatedProductRes.json()
        const found = prods.find(p => p.id === targetId || p.name === targetId)
        if (found) {
          setSelectedProduct(found)
        }
      }

      if (typeof onProductReviewed === 'function') {
        onProductReviewed()
      }
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="font-sans text-slate-800">
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 origin-left z-50 shadow-[0_2px_15px_rgba(16,185,129,0.4)]"
      />
      
      {/* Dynamic Cyberpunk Glassmorphic Hero Banner */}
      <section className="relative rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-950 p-8 sm:p-12 md:p-16 overflow-hidden mb-12 shadow-2xl relative group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-teal-500/15 transition-all duration-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="max-w-2xl relative z-10">
          <span className="inline-flex px-3.5 py-1.5 rounded-full font-extrabold text-[10px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider mb-6 animate-pulse">
            {currentUser ? `Welcome back, ${currentUser.name}! ✨` : 'Cybernetic Innovation Launch'}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-5 leading-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
            {currentUser ? `Hello ${currentUser.name}, Upgrade your Workspace!` : 'High-Performance Tech for the Next Digital Era'}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
            {currentUser 
              ? `We have curated the finest futuristic gear specifically for you, ${currentUser.name}. Explore the catalog below and feel free to submit analytics metric events to our live system database!`
              : 'Upgrade your workspace setup with our flagship neon-themed peripherals and wearables. Add items to your shopping cart and complete checkout to submit transactional metric events live to MongoDB!'
            }
          </p>
          <div className="flex gap-4">
            <a
              href="#storefront-catalog"
              className="px-6 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] tracking-wider uppercase"
            >
              Enter Storefront
            </a>
          </div>
        </div>
      </section>

      {/* Catalog Title */}
      <div id="storefront-catalog" className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 scroll-mt-24">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse"></span>
            Featured Innovations
          </h3>
          <p className="text-xs text-slate-555 mt-1 font-medium">Sleek cyberpunk hardware designed for absolute tracking performance</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-555 border border-slate-200/50 font-bold self-start sm:self-center">
          Showing {filteredProducts.length} of {products.length} Products
        </span>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xl shadow-slate-100/40">
        <div className="relative flex-1 max-w-lg">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search innovative tech..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/5 transition duration-300"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer hover:bg-slate-100 transition"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer hover:bg-slate-100 transition"
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Products Grid */}
      {products.length === 0 ? (
        <div className="py-20 text-center text-slate-555 text-xs border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 font-mono">
          [SYSTEM] No products found in database context. Verify seeding status.
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-slate-500 border border-slate-200/60 rounded-3xl bg-white p-10 shadow-lg flex flex-col items-center justify-center">
          <div className="text-4xl mb-4 animate-bounce">🔍</div>
          <h4 className="font-extrabold text-slate-800 text-sm mb-1.5">No Matching Products Found</h4>
          <p className="text-slate-400 text-xs max-w-xs">Adjust your search query or filters and try again.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const cartItem = cart.find(item => item.product.id === product.id || item.product.name === product.name)
            const quantityInCart = cartItem ? cartItem.quantity : 0
            const isWished = wishlist.includes(product.id || product.name)

            return (
              <motion.div 
                key={product.id || product.name} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="group rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider bg-slate-550/5 border border-slate-200/50 text-slate-555">
                      {product.category || 'Hardware'}
                    </span>
                    {product.badge && (
                      <span className="px-2.5 py-1 rounded-full font-bold text-[8.5px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-250/50 animate-pulse">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div 
                    onClick={() => setSelectedProduct(product)}
                    className="h-48 w-full rounded-2xl bg-gradient-to-tr from-slate-50 via-slate-100 to-emerald-50/15 border border-slate-150 flex items-center justify-center mb-5 group-hover:bg-gradient-to-tr group-hover:from-slate-50 group-hover:to-emerald-50/30 transition-all duration-300 relative overflow-hidden cursor-pointer"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (typeof onToggleWishlist === 'function') {
                          onToggleWishlist(product.id || product.name)
                        }
                      }}
                      className="absolute top-3 right-3 z-25 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-150 shadow-md text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-95 transition"
                      title="Add to Wishlist"
                    >
                      <svg 
                        className={`w-4 h-4 ${isWished ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} 
                        fill={isWished ? 'currentColor' : 'none'} 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {product.image ? (
                      <img 
                        src={product.image.startsWith('http') ? product.image : `${apiBase}${product.image}`} 
                        alt={product.name} 
                        className="w-full h-full object-cover relative z-10 transition duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-transparent to-slate-900"></div>
                        <div className="absolute w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-[1.8] transition-transform duration-500"></div>
                        <ProductWireframeIcon name={product.name} className="w-20 h-20 relative z-10 transition duration-500 group-hover:scale-110 text-emerald-600" />
                      </>
                    )}
                  </div>

                  <h4 
                    onClick={() => setSelectedProduct(product)}
                    className="font-extrabold text-slate-800 text-lg mb-1 group-hover:text-emerald-600 transition-colors duration-200 cursor-pointer hover:underline"
                  >
                    {product.name}
                  </h4>

                  {/* Star Ratings */}
                  <div 
                    onClick={() => setSelectedProduct(product)}
                    className="flex items-center gap-1.5 mb-3 cursor-pointer group/rating"
                  >
                    <div className="flex text-amber-500">
                      {Array(5).fill(0).map((_, idx) => (
                        <span key={idx} className="text-xs select-none">
                          {idx < Math.round(product.average_rating || 0) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold group-hover/rating:underline">
                      ({product.reviews ? product.reviews.length : 0} reviews)
                    </span>
                    <span className="text-[10px] text-emerald-600 font-extrabold opacity-0 group-hover/rating:opacity-100 transition-opacity ml-1">
                      · Write Review
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-5">
                    {product.description || 'No description provided.'}
                  </p>

                  {product.specs && product.specs.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {product.specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-655 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Price</span>
                    <span className="text-xl font-bold font-mono text-slate-900 tracking-tight">
                      ${(product.price || 0).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className={`py-3 px-5 rounded-xl font-bold text-xs border transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${
                      quantityInCart > 0 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-555 hover:from-emerald-500 hover:to-teal-450 text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30 border-emerald-500/10'
                    }`}
                  >
                    {quantityInCart > 0 ? `✓ Added (${quantityInCart})` : 'Add to Cart'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Product Details & Reviews Modal popup */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            <button 
              onClick={() => {
                setSelectedProduct(null)
                setSubmitError('')
                setReviewComment('')
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
              title="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-y-auto space-y-6 pr-2">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image panel */}
                <div className="w-full md:w-1/2 h-52 rounded-2xl bg-gradient-to-tr from-slate-950 via-emerald-950/20 to-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  {selectedProduct.image ? (
                    <img 
                      src={selectedProduct.image.startsWith('http') ? selectedProduct.image : `${apiBase}${selectedProduct.image}`} 
                      alt={selectedProduct.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <ProductWireframeIcon name={selectedProduct.name} className="w-24 h-24 text-emerald-500" />
                  )}
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 space-y-4">
                  <span className="px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-400">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-100">{selectedProduct.name}</h3>
                  <div className="text-2xl font-bold font-mono text-emerald-400">${(selectedProduct.price || 0).toFixed(2)}</div>
                  <p className="text-slate-400 text-xs leading-relaxed">{selectedProduct.description}</p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <span>💬 Customer Reviews</span>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-mono">
                    {selectedProduct.reviews ? selectedProduct.reviews.length : 0}
                  </span>
                </h4>

                {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                  <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 font-mono">
                    [SYSTEM] No reviews yet. Be the first to review!
                  </div>
                ) : (
                  <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                    {selectedProduct.reviews.map((rev, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-300 text-xs">{rev.username}</span>
                          <span className="text-[9px] text-slate-500">{new Date(rev.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex text-amber-500">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i} className="text-[10px]">{i < rev.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Write review form */}
              {token ? (
                <form onSubmit={handleReviewSubmit} className="border-t border-slate-800 pt-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-355 uppercase tracking-wider">Write a Review</h4>
                  
                  {/* Rating Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wide">Rating:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-base transition duration-100 ${star <= reviewRating ? 'text-amber-500' : 'text-slate-600 hover:text-slate-550'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      required
                      rows="2"
                      placeholder="Share your thoughts on this product..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition resize-none font-sans"
                    />
                  </div>

                  {submitError && (
                    <div className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-lg py-1.5 px-2.5 text-center font-medium">
                      ⚠️ {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-450 text-white shadow-md shadow-emerald-500/10 transition duration-200"
                  >
                    {submitLoading ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl border border-blue-950 bg-blue-950/10 text-blue-400 text-xs leading-relaxed text-center font-semibold mt-4">
                  🔑 Please log in to post a review and share your feedback on this product!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
