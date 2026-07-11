import { useState, useEffect, useCallback } from 'react'
import Shop from './components/Shop'
import Dashboard from './components/admin/Dashboard'
import CartDrawer from './components/CartDrawer'
import Orders from './components/Orders'

function App() {
  // Navigation / View state
  const [view, setView] = useState('shop') // 'shop' or 'dashboard'
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('go_analytics_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => {
    return localStorage.getItem('go_analytics_token') || ''
  })
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem('go_analytics_user')
    if (saved) {
      const u = JSON.parse(saved)
      return u.role === 'admin'
    }
    return false
  })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [authTab, setAuthTab] = useState('login') // 'login' or 'register'
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('user') // 'user' or 'admin'
  const [loginError, setLoginError] = useState('')

  // Shopping Cart State
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [showOrderSuccessToast, setShowOrderSuccessToast] = useState(false)
  const [lastOrderTotal, setLastOrderTotal] = useState(0)
  const [activeInvoice, setActiveInvoice] = useState(null)

  // Config
  const [apiBase, setApiBase] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080')
  const [backendStatus, setBackendStatus] = useState('checking') // checking, connected, disconnected
  
  // Products Catalog State
  const [products, setProducts] = useState([])

  // Analytics Metrics State
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    clicks: 0,
    views: 0,
    purchases: 0
  })
  
  // Live Stream Logs (Simple array of strings)
  const [logs, setLogs] = useState([])
  
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [errorSummary, setErrorSummary] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [adminOrders, setAdminOrders] = useState([])
  const [loadingAdminOrders, setLoadingAdminOrders] = useState(false)
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null)
  const [loadingAdvanced, setLoadingAdvanced] = useState(false)
  const [wishlist, setWishlist] = useState([])

  // Handlers
  const checkHealth = useCallback(async (baseUrl) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/health`)
      if (res.ok) {
        setBackendStatus('connected')
        return true
      }
    } catch (err) {
      console.warn('Backend connection failed:', err)
    }
    setBackendStatus('disconnected')
    return false
  }, [])

  const fetchSummary = useCallback(async (baseUrl, userToken) => {
    if (!userToken) return
    setLoadingSummary(true)
    setErrorSummary(null)
    try {
      const res = await fetch(`${baseUrl}/api/v1/analytics/summary`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
      const data = await res.json()
      setMetrics({
        total_revenue: data.total_revenue || 0,
        clicks: data.clicks || 0,
        views: data.views || 0,
        purchases: data.purchases || 0
      })
    } catch (err) {
      setErrorSummary(err.message || 'Failed to fetch summary data')
    } finally {
      setLoadingSummary(false)
    }
  }, [])

  const fetchProducts = useCallback(async (baseUrl) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/products`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProducts(data || [])
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }, [])

  const fetchOrders = useCallback(async (baseUrl, username, userToken) => {
    if (!username || !userToken) return
    setLoadingOrders(true)
    try {
      const res = await fetch(`${baseUrl}/api/v1/orders`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
      const data = await res.json()
      setOrders(data || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  const fetchAdminOrders = useCallback(async (baseUrl, userToken) => {
    if (!userToken) return
    setLoadingAdminOrders(true)
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/orders`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
      const data = await res.json()
      setAdminOrders(data || [])
    } catch (err) {
      console.error('Failed to fetch admin orders:', err)
    } finally {
      setLoadingAdminOrders(false)
    }
  }, [])

  const fetchAdvancedAnalytics = useCallback(async (baseUrl, userToken) => {
    if (!userToken) return
    setLoadingAdvanced(true)
    try {
      const res = await fetch(`${baseUrl}/api/v1/analytics/advanced`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
      const data = await res.json()
      setAdvancedAnalytics(data)
    } catch (err) {
      console.error('Failed to fetch advanced analytics:', err)
    } finally {
      setLoadingAdvanced(false)
    }
  }, [])

  const fetchWishlist = useCallback(async (baseUrl, userToken) => {
    if (!userToken) return
    try {
      const res = await fetch(`${baseUrl}/api/v1/wishlist`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setWishlist(data || [])
    } catch (err) {
      console.error('Failed to fetch wishlist:', err)
    }
  }, [])

  const toggleWishlist = async (productId) => {
    if (!currentUser || !token) {
      setAuthTab('login')
      setShowLoginModal(true)
      return
    }
    const isWished = wishlist.includes(productId)
    try {
      if (isWished) {
        const res = await fetch(`${apiBase}/api/v1/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          setWishlist(prev => prev.filter(id => id !== productId))
        }
      } else {
        const res = await fetch(`${apiBase}/api/v1/wishlist`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ product_id: productId })
        })
        if (res.ok) {
          setWishlist(prev => [...prev, productId])
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err)
    }
  }

  useEffect(() => {
    checkHealth(apiBase).then((ok) => {
      if (ok) {
        fetchProducts(apiBase)
        if (isAdmin && token) {
          fetchSummary(apiBase, token)
          fetchAdminOrders(apiBase, token)
          fetchAdvancedAnalytics(apiBase, token)
        }
      }
    })
  }, [apiBase, checkHealth, fetchSummary, fetchProducts, fetchAdminOrders, fetchAdvancedAnalytics, isAdmin, token])

  // Fetch orders and wishlist when user changes or apiBase changes
  useEffect(() => {
    if (currentUser && token) {
      fetchOrders(apiBase, currentUser.username, token)
      fetchWishlist(apiBase, token)
    } else {
      setOrders([])
      setWishlist([])
    }
  }, [currentUser, apiBase, token, fetchOrders, fetchWishlist])

  // Custom listener to switch view to shop from other components
  useEffect(() => {
    const handleSwitch = () => setView('shop')
    window.addEventListener('switch-to-shop', handleSwitch)
    return () => window.removeEventListener('switch-to-shop', handleSwitch)
  }, [])

  useEffect(() => {
    if (!autoRefresh || backendStatus !== 'connected' || !isAdmin || !token) return
    const interval = setInterval(() => {
      fetchSummary(apiBase, token)
      fetchAdminOrders(apiBase, token)
      fetchAdvancedAnalytics(apiBase, token)
    }, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, backendStatus, apiBase, fetchSummary, fetchAdminOrders, fetchAdvancedAnalytics, isAdmin, token])

  // trackEvent implementation
  const trackEvent = async (eventType, price, productId) => {
    setIsSubmitting(true)
    
    // Generate random fake user and product IDs if not provided
    const randomUser = 'usr_fake_' + Math.floor(Math.random() * 90000 + 10000)
    const randomProduct = productId || ('prod_fake_' + Math.floor(Math.random() * 90000 + 10000))
    
    const payload = {
      user_id: randomUser,
      event_type: eventType,
      product_id: randomProduct,
      price: parseFloat(price) || 0
    }

    try {
      const res = await fetch(`${apiBase}/api/v1/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      // Prepend a timestamped log entry: [HH:MM:SS] EVENT_TYPE event emitted
      const now = new Date()
      const timestamp = now.toTimeString().split(' ')[0]
      const logEntry = `[${timestamp}] ${eventType.toUpperCase()} event emitted`
      
      setLogs(prev => [logEntry, ...prev].slice(0, 50)) // Keep last 50 logs

      // Re-fetch the summary data immediately
      await fetchSummary(apiBase)
    } catch (err) {
      console.error('Failed to send metrics event:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Backend Authentication Handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${apiBase}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      const user = data.user
      const userToken = data.token
      setCurrentUser(user)
      setToken(userToken)
      localStorage.setItem('go_analytics_user', JSON.stringify(user))
      localStorage.setItem('go_analytics_token', userToken)
      
      const userIsAdmin = user.role === 'admin'
      setIsAdmin(userIsAdmin)
      
      setShowLoginModal(false)
      setLoginUsername('')
      setLoginPassword('')
      
      if (userIsAdmin) {
        setView('dashboard')
      } else {
        setView('shop')
      }
    } catch (err) {
      setLoginError(err.message || 'Connection to authentication service failed')
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${apiBase}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          username: regUsername,
          password: regPassword,
          role: regRole
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }
      
      // Auto-login after registration
      const user = data.user
      const userToken = data.token
      setCurrentUser(user)
      setToken(userToken)
      localStorage.setItem('go_analytics_user', JSON.stringify(user))
      localStorage.setItem('go_analytics_token', userToken)
      
      const userIsAdmin = user.role === 'admin'
      setIsAdmin(userIsAdmin)
      
      setShowLoginModal(false)
      setRegName('')
      setRegUsername('')
      setRegPassword('')
      setRegRole('user')
      
      if (userIsAdmin) {
        setView('dashboard')
      } else {
        setView('shop')
      }
    } catch (err) {
      setLoginError(err.message || 'Connection to registration service failed')
    }
  }

  const handleUserLogout = () => {
    setCurrentUser(null)
    setToken('')
    setIsAdmin(false)
    localStorage.removeItem('go_analytics_user')
    localStorage.removeItem('go_analytics_token')
    setView('shop')
  }

  // Cart operations
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id || item.product.name === product.name)
      if (existing) {
        return prevCart.map(item => 
          (item.product.id === product.id || item.product.name === product.name)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { product, quantity: 1 }]
    })

    // Track an interaction click
    trackEvent('click', 0, product.name)
  }

  const handleUpdateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId)
      return
    }
    setCart(prevCart => prevCart.map(item => 
      (item.product.id === productId || item.product.name === productId)
        ? { ...item, quantity: newQty }
        : item
    ))
  }

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.product.id === productId || item.product.name === productId)
    ))
  }

  const handleCheckout = async (coupon = null) => {
    setIsCheckoutLoading(true)
    
    // Enforce authentication before checkout
    if (!currentUser || !token) {
      setAuthTab('login')
      setShowLoginModal(true)
      setIsCheckoutLoading(false)
      return
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
    const discount = coupon ? (coupon.discount_amount || 0) : 0
    const total = subtotal - discount

    // Build unified checkout request payload
    const payload = {
      items: cart.map(item => ({
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    }

    try {
      const res = await fetch(`${apiBase}/api/v1/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      // Generate invoice
      const invoice = {
        invoiceNo: 'INV-' + Math.floor(Math.random() * 900000 + 100000),
        date: new Date().toLocaleString(),
        customerName: currentUser.name,
        items: cart.map(item => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        subtotal,
        discount,
        total
      }

      // Push custom unified success receipt log to Admin Live Activity Stream
      const itemSummary = cart.map(item => `${item.product.name} (x${item.quantity})`).join(', ')
      const logEntry = `[Live Checkout] User ordered ${itemSummary} for a total of $${subtotal.toFixed(2)}`
      setLogs(prev => [logEntry, ...prev].slice(0, 50))

      // Trigger fetchSummary to update counters if admin is active
      if (isAdmin) {
        await fetchSummary(apiBase, token)
      }

      // Show gorgeous toast notice
      setLastOrderTotal(subtotal)
      setShowOrderSuccessToast(true)
      setTimeout(() => setShowOrderSuccessToast(false), 5000)

      // Set active invoice
      setActiveInvoice(invoice)

      // Clear cart & close drawer
      setCart([])
      setIsCartOpen(false)

      // Refresh orders list
      fetchOrders(apiBase, currentUser.username, token)
    } catch (err) {
      console.error('Checkout dispatch failed:', err)
      alert(`Checkout failed: ${err.message}`)
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  const inactiveBtnClass = view === 'dashboard'
    ? 'text-slate-400 hover:text-slate-100'
    : 'text-slate-500 hover:text-slate-850'

  return (
    <div className={`min-h-screen selection:bg-emerald-600 selection:text-white font-sans antialiased flex flex-col justify-between transition-colors duration-300 ${
      view === 'dashboard' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Background Decorative Gradients based on Theme */}
      {view === 'dashboard' ? (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-955/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-950/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-950/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-50/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-55/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      {/* Floating Order Success Toast Banner */}
      {showOrderSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in font-medium text-xs max-w-md">
          <span className="text-base select-none">🎉</span>
          <span>Order placed successfully! Total: <strong className="font-mono font-bold text-emerald-950">${lastOrderTotal.toFixed(2)}</strong> (check Analytics dashboard metrics).</span>
        </div>
      )}

      {/* Premium Glassmorphic Navigation Bar Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-lg shadow-sm transition-all duration-300 ${
        view === 'dashboard'
          ? 'border-slate-900/60 bg-slate-950/40 text-slate-100'
          : 'border-slate-200/60 bg-white/60 text-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-lg transition-all duration-300 ${
              view === 'shop' 
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/10' 
                : 'bg-gradient-to-tr from-blue-600 to-indigo-650 shadow-blue-500/20'
            }`}>
              GA
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ${
                view === 'shop' 
                  ? 'from-slate-900 via-slate-850 to-slate-700' 
                  : 'from-white via-slate-200 to-slate-400'
              }`}>
                Go-Analytics E-Store
              </h1>
              <p className={`text-xs font-medium transition-colors duration-300 ${
                view === 'shop' ? 'text-slate-500' : 'text-slate-555'
              }`}>Interactive Demo Store & Event Metrics System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center p-1.5 rounded-xl border backdrop-blur-md transition-colors duration-300 ${
              view === 'dashboard' || view === 'agency' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setView('shop')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 relative ${
                  view === 'shop' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-655 text-white shadow-md shadow-emerald-500/10' 
                    : inactiveBtnClass
                }`}
              >
                🛒 Premium Shop
                {view === 'shop' && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-emerald-400 rounded shadow-[0_0_8px_#34d399]"></span>
                )}
              </button>


              {currentUser && (
                <button
                  onClick={() => setView('orders')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 relative ${
                    view === 'orders' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-655 text-white shadow-md shadow-emerald-500/10' 
                      : inactiveBtnClass
                  }`}
                >
                  📦 My Orders
                  {view === 'orders' && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-emerald-400 rounded shadow-[0_0_8px_#34d399]"></span>
                  )}
                </button>
              )}

              {currentUser && isAdmin && (
                <button
                  onClick={() => setView('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 relative ${
                    view === 'dashboard' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-655 text-white shadow-lg shadow-blue-500/10' 
                      : inactiveBtnClass
                  }`}
                >
                  📊 Analytics Engine
                  {view === 'dashboard' && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-blue-400 rounded shadow-[0_0_8px_#3b82f6]"></span>
                  )}
                </button>
              )}
            </div>

            {/* User Profile / Auth Area */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-colors duration-300 ${
                    view === 'shop' 
                      ? 'bg-emerald-50/60 border-emerald-200/60 text-emerald-850' 
                      : 'bg-blue-950/30 border-blue-900/40 text-blue-200'
                  }`}>
                    <span className="text-xs font-semibold select-none">👤</span>
                    <span className="text-xs font-bold font-sans tracking-tight">
                      {currentUser.name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                      currentUser.role === 'admin' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <button
                    onClick={handleUserLogout}
                    className={`p-2 rounded-xl border transition-all duration-200 ${
                      view === 'shop' 
                        ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/40'
                    }`}
                    title="Sign Out of Session"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthTab('login')
                    setShowLoginModal(true)
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    view === 'shop'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-500/10 border-emerald-500/10'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/10 border-blue-500/10'
                  }`}
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>

          {/* Quick Info & Controls */}
          <div className="flex items-center gap-3 flex-wrap justify-end">

            {/* Health Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors duration-300 ${
              view === 'shop' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                backendStatus === 'disconnected' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' :
                'bg-amber-500 animate-pulse'
              }`}></div>
              <span className="text-[11px] font-semibold">
                {backendStatus === 'checking' ? 'Linking...' : backendStatus === 'connected' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative z-10">
        
        {/* Offline Warning Badge */}
        {backendStatus === 'disconnected' && (
          <div className={`mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold animate-pulse transition-colors duration-300 ${
            view === 'shop' 
              ? 'border-rose-200 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100' 
              : 'border-rose-950 bg-rose-950/20 text-rose-400'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"></span>
            <span>⚠️ Backend Offline: Port 8080 unreachable. Simulation disabled.</span>
          </div>
        )}

        {/* View switching logic */}
		{view === 'shop' ? (
          <Shop
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            currentUser={currentUser}
            apiBase={apiBase}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            token={token}
            onProductReviewed={() => fetchProducts(apiBase)}
          />
        ) : view === 'orders' ? (
          <Orders
            orders={orders}
            loading={loadingOrders}
            currentUser={currentUser}
          />
        ) : view === 'dashboard' && isAdmin ? (
          <Dashboard
            metrics={metrics}
            logs={logs}
            trackEvent={trackEvent}
            backendStatus={backendStatus}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            isSubmitting={isSubmitting}
            onProductAdded={() => fetchProducts(apiBase)}
            apiBase={apiBase}
            token={token}
            products={products}
            adminOrders={adminOrders}
            loadingAdminOrders={loadingAdminOrders}
            advancedAnalytics={advancedAnalytics}
          />
        ) : (
          <Shop
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            currentUser={currentUser}
            apiBase={apiBase}
          />
        )}
      </main>

      {/* Floating Shopping Cart Button */}
      {view === 'shop' && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white p-4 rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition duration-200 hover:scale-105 active:scale-95 flex items-center justify-center border border-emerald-500/10"
          title="Open Shopping Cart"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold font-mono text-[9px] w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
      )}

      {/* Shopping Cart Drawer Slide panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isCheckoutLoading={isCheckoutLoading}
        apiBase={apiBase}
        token={token}
      />

      {/* Sleek Authentication Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden group">
            {/* Ambient glows inside modal */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-teal-500/10 rounded-full blur-xl"></div>

            <button 
              onClick={() => {
                setShowLoginModal(false)
                setLoginUsername('')
                setLoginPassword('')
                setRegName('')
                setRegUsername('')
                setRegPassword('')
                setRegRole('user')
                setLoginError('')
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
              title="Close modal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-emerald-500/20 mb-4 mx-auto select-none">
                🔑
              </div>
              <h3 className="text-sm font-bold text-slate-100 text-center mb-4">
                Storefront Portal Access
              </h3>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login')
                    setLoginError('')
                  }}
                  className={`flex-1 pb-2.5 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                    authTab === 'login' 
                      ? 'text-emerald-400 border-b-2 border-emerald-500' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register')
                    setLoginError('')
                  }}
                  className={`flex-1 pb-2.5 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                    authTab === 'register' 
                      ? 'text-emerald-400 border-b-2 border-emerald-500' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Register
                </button>
              </div>

              {authTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  {loginError && (
                    <div className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-lg py-1.5 px-2.5 text-center font-medium">
                      ⚠️ {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Authenticate Session
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Choose username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Create password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  {loginError && (
                    <div className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-lg py-1.5 px-2.5 text-center font-medium">
                      ⚠️ {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Register Account
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative text-slate-800" id="printable-invoice">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-md select-none mb-3">
                  GA
                </div>
                <h3 className="text-lg font-black text-slate-900">Go-Analytics E-Store</h3>
                <p className="text-[10px] text-slate-400 font-medium">Receipt & Transaction Details</p>
              </div>
              <div className="text-right">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                  PAID SUCCESS
                </span>
                <p className="text-[11px] text-slate-500 font-mono mt-3 font-semibold">{activeInvoice.invoiceNo}</p>
                <p className="text-[9px] text-slate-400 font-medium mt-1">{activeInvoice.date}</p>
              </div>
            </div>

            {/* Bill Details */}
            <div className="space-y-4 mb-6">
              <div className="text-xs">
                <span className="text-slate-450 block font-semibold mb-0.5">Billed To:</span>
                <span className="font-bold text-slate-800">{activeInvoice.customerName}</span>
              </div>
              
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeInvoice.items.map((item, idx) => (
                      <tr key={idx} className="text-slate-750">
                        <td className="p-3 font-semibold">{item.name}</td>
                        <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">${item.price.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs mb-6">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-700">${activeInvoice.subtotal.toFixed(2)}</span>
              </div>
              {activeInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-650 font-bold">
                  <span>Discount Applied</span>
                  <span className="font-mono">-${activeInvoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-mono font-semibold text-slate-700">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Paid</span>
                <span className="font-mono text-base text-emerald-600">${activeInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions (Not printed) */}
            <div className="flex gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-6 py-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs mt-12 w-full transition-colors duration-300 ${
        view === 'shop' ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-900 bg-slate-950 text-slate-600'
      }`}>
        <p>© 2026 Go-Analytics Dashboard. Built with React, Vite, Tailwind CSS and powered by Go & MongoDB.</p>
      </footer>
    </div>
  )
}

export default App
