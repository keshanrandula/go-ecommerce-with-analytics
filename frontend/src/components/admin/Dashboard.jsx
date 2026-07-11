import React, { useState, useEffect } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, CartesianGrid } from 'recharts'

export default function Dashboard({
  metrics,
  logs,
  trackEvent,
  backendStatus,
  autoRefresh,
  setAutoRefresh,
  isSubmitting,
  onProductAdded,
  apiBase,
  token,
  products = [],
  adminOrders = [],
  loadingAdminOrders = false,
  advancedAnalytics = null
}) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    badge: '',
    description: '',
    specs: '',
    image: '',
    stock: 10
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(Date.now())
  const [uploadLoading, setUploadLoading] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [stockEdits, setStockEdits] = useState({})

  const handleUpdateStock = async (productId, currentVal) => {
    const val = stockEdits[productId]
    if (val === undefined || val === '') return
    const num = parseInt(val, 10)
    if (isNaN(num) || num < 0) return

    try {
      const res = await fetch(`${apiBase}/api/v1/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: num })
      })

      if (res.ok) {
        setStockEdits(prev => {
          const c = { ...prev }
          delete c[productId]
          return c
        })
        if (typeof onProductAdded === 'function') {
          onProductAdded()
        }
      }
    } catch (err) {
      console.error('Failed to update stock:', err)
    }
  }

  // Metrics snapshot history for trend lines
  const [metricsHistory, setMetricsHistory] = useState([])

  // Track metrics updates to populate history list
  useEffect(() => {
    if (metrics) {
      setMetricsHistory(prev => {
        const last = prev[prev.length - 1]
        // Avoid duplicate concurrent logs
        if (last && last.total_revenue === metrics.total_revenue &&
            last.clicks === metrics.clicks &&
            last.views === metrics.views &&
            last.purchases === metrics.purchases) {
          return prev
        }
        const now = new Date()
        const timeLabel = now.toTimeString().split(' ')[0].substring(3) // MM:SS format
        return [...prev, { ...metrics, time: timeLabel }].slice(-10) // keep last 10 snapshots
      })
    }
  }, [metrics])

  // Form submission handler (Creates or Updates)
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormMessage('')

    const specsArray = newProduct.specs
      ? newProduct.specs.split(',').map(s => s.trim()).filter(Boolean)
      : []

    let imageUrl = newProduct.image

    // If an image file is selected, upload it first
    if (selectedFile) {
      setFormMessage('Uploading image file...')
      try {
        const formData = new FormData()
        formData.append('image', selectedFile)

        const uploadRes = await fetch(`${apiBase}/api/v1/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}))
          throw new Error(errData.error || `Upload failed: ${uploadRes.status}`)
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      } catch (err) {
        setFormMessage(`Error uploading image: ${err.message}`)
        setFormSubmitting(false)
        return
      }
    }

    const payload = {
      name: newProduct.name,
      price: parseFloat(newProduct.price) || 0,
      category: newProduct.category,
      badge: newProduct.badge,
      description: newProduct.description,
      specs: specsArray,
      image: imageUrl,
      theme: 'emerald' // Default styling theme context
    }

    try {
      const url = editingProductId
        ? `${apiBase}/api/v1/products/${editingProductId}`
        : `${apiBase}/api/v1/products`
        
      const method = editingProductId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP Error: ${res.status}`)
      }

      setFormMessage(editingProductId ? 'Success: Product updated successfully!' : 'Success: Product added successfully!')
      setNewProduct({
        name: '',
        price: '',
        category: '',
        badge: '',
        description: '',
        specs: '',
        image: ''
      })
      setSelectedFile(null)
      setFileInputKey(Date.now())
      setEditingProductId(null)

      if (typeof onProductAdded === 'function') {
        await onProductAdded()
      }
    } catch (err) {
      setFormMessage(`Error: ${err.message || 'Failed to submit'}`)
    } finally {
      setFormSubmitting(false)
    }
  }

  // Populate form with product fields for edit mode
  const handleStartEdit = (prod) => {
    setEditingProductId(prod.id || prod.name)
    setNewProduct({
      name: prod.name,
      price: prod.price.toString(),
      category: prod.category,
      badge: prod.badge || '',
      description: prod.description,
      specs: prod.specs ? prod.specs.join(', ') : '',
      image: prod.image || ''
    })
    setSelectedFile(null)
    setFileInputKey(Date.now())
    
    const formElement = document.getElementById('product-creator-panel')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Reset form and cancel edit mode
  const handleCancelEdit = () => {
    setEditingProductId(null)
    setNewProduct({
      name: '',
      price: '',
      category: '',
      badge: '',
      description: '',
      specs: '',
      image: ''
    })
    setSelectedFile(null)
    setFileInputKey(Date.now())
    setFormMessage('')
  }

  // Delete product API handler
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('මෙම නිෂ්පාදනය ඉවත් කිරීමට ඔබට අවශ්‍ය බව සහතිකද? (Are you sure you want to delete this product?)')) return

    try {
      const res = await fetch(`${apiBase}/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP Error: ${res.status}`)
      }

      if (typeof onProductAdded === 'function') {
        await onProductAdded()
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  // SVG Chart Math Calculation values
  const maxVal = Math.max(...metricsHistory.map(h => Math.max(h.views || 0, h.clicks || 0, h.purchases || 0)), 10)
  
  const getX = (index) => {
    if (metricsHistory.length <= 1) return 245
    return 55 + (index * (380 / (metricsHistory.length - 1)))
  }
  
  const getY = (val) => {
    return 155 - ((val / maxVal) * 110)
  }

  const viewsPoints = metricsHistory.map((h, idx) => `${getX(idx)},${getY(h.views || 0)}`).join(' ')
  const clicksPoints = metricsHistory.map((h, idx) => `${getX(idx)},${getY(h.clicks || 0)}`).join(' ')
  const purchasesPoints = metricsHistory.map((h, idx) => `${getX(idx)},${getY(h.purchases || 0)}`).join(' ')

  const totalViews = metrics.views || 0
  const totalClicks = metrics.clicks || 0
  const totalPurchases = metrics.purchases || 0
  const clickRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0
  const purchaseRate = totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0

  // Map Advanced Analytics Data
  const revenueData = advancedAnalytics?.revenue_trend?.map(item => ({
    date: item._id,
    revenue: item.total
  })) || []

  const productSalesData = advancedAnalytics?.top_products?.map(item => ({
    name: item._id,
    sales: item.sales
  })) || []

  // Create 7x24 Matrix
  const heatmapMatrix = Array(7).fill(0).map(() => Array(24).fill(0))
  let maxHeatval = 1
  if (advancedAnalytics && advancedAnalytics.heatmap) {
    advancedAnalytics.heatmap.forEach(item => {
      const d = item._id.day - 1 // Sunday (1) -> index 0
      const h = item._id.hour
      if (d >= 0 && d < 7 && h >= 0 && h < 24) {
        heatmapMatrix[d][h] = item.count
        if (item.count > maxHeatval) {
          maxHeatval = item.count
        }
      }
    })
  }

  const daysLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="font-sans text-slate-800">
      
      {/* Dashboard Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card: Total Revenue */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/40 relative overflow-hidden group hover:border-slate-800 transition duration-300">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition duration-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Total Revenue</span>
            <span className="p-2 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V5" />
              </svg>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-400">
            ${(metrics.total_revenue || 0).toFixed(2)}
          </div>
          <p className="text-xs text-slate-555 mt-2 font-medium">Accumulated sales value</p>
        </div>

        {/* Card: Purchases */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/40 relative overflow-hidden group hover:border-slate-800 transition duration-300">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500/5 rounded-full blur-xl group-hover:scale-150 transition duration-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Purchases</span>
            <span className="p-2 rounded-xl bg-teal-950/40 text-teal-400 border border-teal-900/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-teal-400">
            {metrics.purchases || 0}
          </div>
          <p className="text-xs text-slate-555 mt-2 font-medium">Completed conversions</p>
        </div>

        {/* Card: Views */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/40 relative overflow-hidden group hover:border-slate-800 transition duration-300">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:scale-150 transition duration-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Product Views</span>
            <span className="p-2 rounded-xl bg-cyan-950/40 text-cyan-400 border border-cyan-900/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-cyan-400">
            {metrics.views || 0}
          </div>
          <p className="text-xs text-slate-555 mt-2 font-medium">Product page visits</p>
        </div>

        {/* Card: Clicks */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/40 relative overflow-hidden group hover:border-slate-800 transition duration-300">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition duration-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Button Clicks</span>
            <span className="p-2 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-900/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-blue-400">
            {metrics.clicks || 0}
          </div>
          <p className="text-xs text-slate-555 mt-2 font-medium">Interactions and clicks tracked</p>
        </div>
      </section>

      {/* Recharts Visual Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Revenue Trend Area Chart */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm lg:col-span-2 shadow-xl flex flex-col justify-between min-h-[350px]">
          <div>
            <h2 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Daily Revenue Trend
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">
              Revenue tracking over the past 14 days. Hover on points to view details.
            </p>
          </div>

          <div className="w-full h-64 bg-black/30 rounded-xl p-4 border border-slate-950/60">
            {revenueData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                [SYSTEM] Awaiting revenue trend logs...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#34d399', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Selling Products Bar Chart */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm lg:col-span-1 shadow-xl flex flex-col justify-between min-h-[350px]">
          <div>
            <h2 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              Top Selling Products
            </h2>
            <p className="text-[11px] text-slate-550 mb-4">
              Top performing catalog products by transaction sales quantity.
            </p>
          </div>

          <div className="w-full h-64 bg-black/30 rounded-xl p-4 border border-slate-950/60">
            {productSalesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                [SYSTEM] Awaiting product checkout logs...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#60a5fa', fontSize: '12px' }}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {productSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </section>

      {/* Customer Activity Heatmap Matrix */}
      <section className="mb-8 p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm shadow-xl">
        <h2 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
          Customer Activity Heatmap
        </h2>
        <p className="text-xs text-slate-550 mb-6 leading-relaxed">
          Hourly user interaction frequency grouped by day of the week. Darker colors denote higher activity spikes.
        </p>

        <div className="overflow-x-auto">
          <div className="min-w-[760px] p-4 rounded-xl bg-black/40 border border-slate-900/60 shadow-2xl">
            {/* Hours Header Row */}
            <div className="flex mb-2 pl-12">
              {Array(24).fill(0).map((_, hour) => (
                <div key={hour} className="flex-1 text-center text-[9px] font-mono text-slate-500 select-none">
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Matrix Data Rows */}
            <div className="space-y-1.5">
              {daysLabel.map((dayLabel, dayIdx) => (
                <div key={dayIdx} className="flex items-center">
                  {/* Day Name Column */}
                  <div className="w-12 text-[10px] font-bold text-slate-400 select-none font-sans">
                    {dayLabel}
                  </div>
                  {/* 24 Hour Block cells */}
                  <div className="flex-1 flex gap-1">
                    {Array(24).fill(0).map((_, hourIdx) => {
                      const count = heatmapMatrix[dayIdx][hourIdx]
                      const intensity = count > 0 ? Math.max(0.12, count / maxHeatval) : 0
                      
                      return (
                        <div
                          key={hourIdx}
                          style={{
                            backgroundColor: count > 0 ? `rgba(16, 185, 129, ${intensity})` : '#0f172a',
                            border: count > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #1e293b'
                          }}
                          className="flex-1 aspect-square rounded-md transition duration-200 relative group cursor-pointer hover:scale-110 hover:border-emerald-400 hover:shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                          title={`${dayLabel}, ${hourIdx.toString().padStart(2, '0')}:00 - ${count} events`}
                        >
                          {/* Hover Tooltip box */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-slate-950 border border-slate-800 text-slate-200 text-[9px] font-mono rounded-lg py-1 px-2 whitespace-nowrap shadow-xl">
                            {count} events
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Simulator & Product Form */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Event Simulator panel */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse"></span>
                Event Simulator
              </h2>
              <p className="text-xs text-slate-555 mb-6 font-medium leading-relaxed">
                Click triggers below to emit simulated events and test connectivity to your Go backend API on port 8080.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => trackEvent('view', 0)}
                  disabled={isSubmitting || backendStatus !== 'connected'}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-blue-500/15 border border-blue-900/30 hover:border-blue-500/20 text-white transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  👁️ Simulate Page View
                </button>

                <button
                  onClick={() => trackEvent('click', 0)}
                  disabled={isSubmitting || backendStatus !== 'connected'}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-500/15 border border-emerald-900/30 hover:border-emerald-500/20 text-white transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  🖱️ Simulate Click
                </button>

                <div className="p-4 rounded-xl border border-blue-955/65 bg-blue-955/15 text-blue-400 text-xs leading-relaxed text-center font-semibold">
                  🛍️ Go to the Shop tab to buy real items and generate purchase metrics live!
                </div>
              </div>
            </div>

            {/* Auto refresh control info */}
            <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoRefresh && backendStatus === 'connected' ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${autoRefresh && backendStatus === 'connected' ? 'bg-emerald-500' : 'bg-slate-650'}`}></span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Auto-Refresh (5s)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-400 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white relative"></div>
              </label>
            </div>
          </div>

          {/* Product Creator/Editor Form */}
          <div id="product-creator-panel" className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-955/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${editingProductId ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'} animate-pulse`}></span>
                {editingProductId ? 'Product Editor' : 'Product Creator'}
              </h2>
              <p className="text-xs text-slate-555 mb-6 font-medium leading-relaxed">
                {editingProductId 
                  ? 'Update product details in MongoDB context.' 
                  : 'Add new tech items directly to MongoDB. Newly added items will be visible to users in real time.'}
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyper-Glow Charging Dock"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-955/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 49.99"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full bg-slate-955/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gear"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-955/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Badge (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. New Release"
                      value={newProduct.badge}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, badge: e.target.value }))}
                      className="w-full bg-slate-955/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Specs (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="RGB, Wireless, Fast Charge"
                      value={newProduct.specs}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, specs: e.target.value }))}
                      className="w-full bg-slate-955/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Upload Image File</label>
                    <input
                      type="file"
                      key={fileInputKey}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0])
                        }
                      }}
                      className="w-full bg-slate-955/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-955 file:text-blue-400 hover:file:bg-blue-900 cursor-pointer focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Or Paste Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={newProduct.image}
                      onChange={(e) => {
                        setNewProduct(prev => ({ ...prev, image: e.target.value }))
                        if (e.target.value) {
                          setSelectedFile(null)
                          setFileInputKey(Date.now())
                        }
                      }}
                      className="w-full bg-slate-955/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Ultra-fast Qi wireless charging stand with integrated ambient glow dynamic lights..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-955/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition resize-none font-sans"
                  />
                </div>

                {formMessage && (
                  <div className={`text-xs py-1.5 px-2.5 rounded-lg font-medium text-center ${
                    formMessage.includes('Success') 
                      ? 'bg-emerald-955/40 text-emerald-455 border border-emerald-900/30' 
                      : 'bg-rose-955/40 text-rose-455 border border-rose-900/30'
                  }`}>
                    {formMessage}
                  </div>
                )}

                <div className="flex gap-2.5">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-1/3 py-3 px-4 rounded-xl font-bold text-xs bg-slate-955 hover:bg-slate-900 border border-slate-850 text-slate-350 transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={formSubmitting || backendStatus !== 'connected'}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs hover:shadow-lg border text-white transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
                      editingProductId
                        ? 'bg-gradient-to-r from-blue-650 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 hover:shadow-blue-500/10 border-blue-900/30 hover:border-blue-500/20'
                        : 'bg-gradient-to-r from-emerald-655 to-teal-600 hover:from-emerald-600 hover:to-teal-500 hover:shadow-emerald-500/10 border-emerald-900/30 hover:border-emerald-500/20'
                    }`}
                  >
                    {editingProductId ? '💾 Update Product' : '📥 Add Product to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Right panel: Terminal Event Stream Logs */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Live Activity Monitor
            </h2>
            <p className="text-xs text-slate-550 mb-6 font-medium">
              Dynamic event stream registered in local context databases.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-end min-h-[350px]">
            {logs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm border border-dashed border-slate-900 rounded-xl bg-slate-950/20 font-mono my-auto">
                [SYSTEM] Awaiting simulated metric emissions...
              </div>
            ) : (
              <div 
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#1e293b transparent'
                }}
                className="font-mono text-xs text-slate-300 space-y-1.5 h-full max-h-[550px] overflow-y-auto bg-black/40 p-5 rounded-xl border border-slate-900/60 leading-relaxed shadow-2xl"
              >
                {logs.map((log, idx) => {
                  const timeMatch = log.match(/^\[(.*?)\]/)
                  const timestamp = timeMatch ? timeMatch[0] : ''
                  const remaining = timeMatch ? log.replace(timeMatch[0], '').trim() : log
                  
                  let typeClass = 'text-slate-300'
                  
                  if (remaining.includes('VIEW')) {
                    typeClass = 'text-cyan-400 font-semibold'
                  } else if (remaining.includes('CLICK')) {
                    typeClass = 'text-amber-400 font-semibold'
                  } else if (remaining.includes('PURCHASE') || remaining.includes('Checkout')) {
                    typeClass = 'text-emerald-400 font-bold'
                  }

                  return (
                    <div key={idx} className="flex gap-2.5 hover:bg-slate-900/20 py-0.5 px-2 rounded-lg transition duration-70">
                      <span className="text-blue-500 font-bold select-none">&gt;</span>
                      <span className="text-slate-555">{timestamp}</span>
                      <span className={typeClass}>{remaining}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Product Catalog Manager Table Panel */}
      <section className="mt-8 p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm shadow-xl">
        <h2 className="text-base font-bold text-slate-200 mb-1 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          Product Catalog Manager
        </h2>
        <p className="text-xs text-slate-550 mb-6 leading-relaxed">
          Update prices, edit metadata description fields, or delete items instantly inside MongoDB database.
        </p>

        {products.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-900 rounded-xl bg-slate-950/10 font-mono">
            [SYSTEM] No products retrieved from context. Check database status.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20 shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Product details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/30 text-slate-300">
                {products.map((prod) => (
                  <tr key={prod.id || prod.name} className="hover:bg-slate-900/10 transition duration-150">
                    <td className="p-4 max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-3">
                        {prod.image ? (
                          <img 
                            src={prod.image.startsWith('http') ? prod.image : `${apiBase}${prod.image}`} 
                            alt={prod.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-slate-800 bg-slate-950 shrink-0" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center shrink-0 text-slate-600 font-mono text-[10px]">
                            No img
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-100 text-xs truncate max-w-[200px]">{prod.name}</div>
                          <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[200px]" title={prod.description}>
                            {prod.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-950 border border-slate-850 text-slate-400 uppercase tracking-wider">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-450 text-xs">
                      ${(prod.price || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      {prod.badge ? (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-950/40 border border-emerald-900/20 text-emerald-455 uppercase tracking-wider">
                          {prod.badge}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleStartEdit(prod)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-blue-955/35 hover:bg-blue-900/40 border border-blue-900/20 text-blue-400 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id || prod.name)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-rose-955/35 hover:bg-rose-900/40 border border-rose-900/20 text-rose-455 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Customer Payments & Order History Panel */}
      <section className="mt-8 p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm shadow-xl">
        <h2 className="text-base font-bold text-slate-200 mb-1 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
          Customer Payments & Order History
        </h2>
        <p className="text-xs text-slate-550 mb-6 leading-relaxed">
          Monitor customer transactions, paid amounts, and payment timestamps in real time.
        </p>

        {loadingAdminOrders ? (
          <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-900 rounded-xl bg-slate-950/10 font-mono">
            [SYSTEM] Syncing transaction records...
          </div>
        ) : adminOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-900 rounded-xl bg-slate-955/10 font-mono">
            [SYSTEM] No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20 shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Customer Username</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Paid Amount</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Logistics Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/30 text-slate-300">
                {adminOrders.map((ord, idx) => (
                  <tr key={ord.id || ord.timestamp || idx} className="hover:bg-slate-900/10 transition duration-150">
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      {ord.id || `TXN_${idx + 1}`}
                    </td>
                    <td className="p-4 font-bold text-slate-100">
                      {ord.user_id}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-950 border border-slate-850 text-slate-300 uppercase tracking-wider">
                        {ord.product_id}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-450 text-xs">
                      ${(ord.price || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-400 text-[10px]">
                      {new Date(ord.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={ord.status || 'Processing'}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          try {
                            const targetId = ord.id || ord.product_id
                            const res = await fetch(`${apiBase}/api/v1/admin/orders/${targetId}/status`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ status: newStatus })
                            })
                            if (res.ok) {
                              if (typeof onProductAdded === 'function') {
                                onProductAdded()
                              }
                            }
                          } catch (err) {
                            console.error('Failed to update order status:', err)
                          }
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans font-bold cursor-pointer"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Inventory & Stock Manager Panel */}
      <section className="mt-8 p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm shadow-xl">
        <h2 className="text-base font-bold text-slate-200 mb-1 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
          Inventory & Stock Manager
        </h2>
        <p className="text-xs text-slate-550 mb-6 leading-relaxed">
          Monitor product stock counts. Out of stock products prevent checkout. Low stock is flagged under 5 items.
        </p>

        {products.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-900 rounded-xl bg-slate-950/10 font-mono">
            [SYSTEM] No catalog products found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20 shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Status Alert</th>
                  <th className="p-4 text-right">Stock Level Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/30 text-slate-300">
                {products.map((prod) => {
                  const targetId = prod.id || prod.name
                  const editVal = stockEdits[targetId] !== undefined ? stockEdits[targetId] : ''
                  
                  return (
                    <tr key={targetId} className="hover:bg-slate-900/10 transition duration-150">
                      <td className="p-4 font-bold text-slate-100">{prod.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-950 border border-slate-850 text-slate-400 uppercase tracking-wider">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-200 text-xs">{prod.stock}</td>
                      <td className="p-4">
                        {prod.stock === 0 ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-950 border border-rose-900/40 text-rose-450 uppercase tracking-wider animate-pulse">
                            Out of Stock
                          </span>
                        ) : prod.stock <= 5 ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-950 border border-amber-900/40 text-amber-450 uppercase tracking-wider">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-950 border border-emerald-900/40 text-emerald-450 uppercase tracking-wider">
                            Good
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="New stock"
                            value={editVal}
                            onChange={(e) => setStockEdits(prev => ({ ...prev, [targetId]: e.target.value }))}
                            className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-center"
                          />
                          <button
                            onClick={() => handleUpdateStock(targetId, prod.stock)}
                            disabled={editVal === ''}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-amber-955/35 hover:bg-amber-900/40 border border-amber-900/20 text-amber-400 transition disabled:opacity-50"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
