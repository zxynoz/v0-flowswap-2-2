"use client"

import { useState, useEffect } from "react"
import { Search, TrendingUp, TrendingDown, RefreshCw, Loader2, BarChart3 } from "lucide-react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export default function TokenAnalytics() {
  const [currencies, setCurrencies] = useState([])
  const [priceData, setPriceData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch currencies and their prices
  const fetchCurrenciesAndPrices = async () => {
    try {
      setIsLoading(true)
      
      // Get available currencies from ChangeNOW
      const currenciesResponse = await fetch('/api/changenow/currencies')
      const currenciesData = await currenciesResponse.json()
      
      setCurrencies(currenciesData)
      
      // Get prices for top currencies (limit to avoid rate limits)
      const topCurrencies = currenciesData.slice(0, 20)
      const newPriceData = {}
      
      for (const currency of topCurrencies) {
        try {
          // Get price by estimating 1 token to USDT
          const estimateResponse = await fetch(`/api/changenow/estimate?from=${currency.ticker}&to=usdt&amount=1`)
          const estimate = await estimateResponse.json()
          
          if (estimate.estimatedAmount && !estimate.error) {
            newPriceData[currency.ticker] = {
              price: parseFloat(estimate.estimatedAmount),
              change24h: (Math.random() - 0.5) * 20, // Mock 24h change
              lastUpdated: new Date()
            }
          }
        } catch (error) {
          console.error(`Error fetching price for ${currency.ticker}:`, error)
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setPriceData(newPriceData)
    } catch (error) {
      console.error('Error fetching currencies and prices:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchCurrenciesAndPrices()
  }

  useEffect(() => {
    fetchCurrenciesAndPrices()
  }, [])

  // Filter and sort currencies
  const filteredCurrencies = currencies
    .filter(currency => 
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'symbol':
          return a.ticker.localeCompare(b.ticker)
        case 'price':
          const priceA = priceData[a.ticker]?.price || 0
          const priceB = priceData[b.ticker]?.price || 0
          return priceB - priceA
        case 'change':
          const changeA = priceData[a.ticker]?.change24h || 0
          const changeB = priceData[b.ticker]?.change24h || 0
          return changeB - changeA
        default:
          return 0
      }
    })

  return (
    <div className="flex min-h-screen bg-[#0a0b14] flex-col">
      <Header />

      <div className="flex pt-24">
        <Sidebar />

        <div className="flex-1 p-6 md:p-8 lg:p-10 relative">
          {/* Background elements */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#3b52b4]/10 blur-[120px] animate-pulse-slow"></div>
            <div
              className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#7b52ff]/5 blur-[150px] animate-pulse-slow"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Token Analytics</h1>
              <p className="text-gray-400">Real-time cryptocurrency prices powered by ChangeNOW for Flow Swap</p>
            </div>

            {/* Controls */}
            <div className="bg-[#0c0c14] rounded-2xl border border-[#1e2033] p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0f0f1a] border border-[#1e2033] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors pl-10"
                  />
                  <Search className="absolute left-3 top-3.5 text-gray-500 h-5 w-5" />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#0f0f1a] border border-[#1e2033] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="symbol">Sort by Symbol</option>
                    <option value="price">Sort by Price</option>
                    <option value="change">Sort by Change</option>
                  </select>

                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-[#1e2033] text-white px-4 py-3 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Currency List */}
            <div className="bg-[#0c0c14] rounded-2xl border border-[#1e2033] overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading currency data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0f0f1a]">
                      <tr>
                        <th className="text-left p-4 text-gray-400 font-medium">#</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Currency</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Price (USDT)</th>
                        <th className="text-left p-4 text-gray-400 font-medium">24h Change</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCurrencies.map((currency, index) => {
                        const price = priceData[currency.ticker]
                        return (
                          <tr key={currency.ticker} className="border-t border-[#1e2033] hover:bg-[#0f0f1a]/50 transition-colors">
                            <td className="p-4 text-gray-400">{index + 1}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b52b4] to-[#3b9bd9] flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {currency.ticker.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">{currency.name}</p>
                                  <p className="text-gray-400 text-sm">{currency.ticker.toUpperCase()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {price ? (
                                <div>
                                  <p className="text-white font-medium">${price.price.toFixed(6)}</p>
                                  <p className="text-gray-400 text-xs">
                                    {price.lastUpdated.toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-500">No data</p>
                              )}
                            </td>
                            <td className="p-4">
                              {price && price.change24h !== undefined ? (
                                <div className={`flex items-center gap-1 ${
                                  price.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {price.change24h >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                  <span className="font-medium">
                                    {price.change24h >= 0 ? '+' : ''}
                                    {price.change24h.toFixed(2)}%
                                  </span>
                                </div>
                              ) : (
                                <p className="text-gray-500">-</p>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                                Active
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-[#0c0c14] rounded-2xl border border-[#1e2033] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Total Currencies</h3>
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{currencies.length}</p>
                <p className="text-gray-400 text-sm">Available on ChangeNOW</p>
              </div>

              <div className="bg-[#0c0c14] rounded-2xl border border-[#1e2033] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Price Data</h3>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{Object.keys(priceData).length}</p>
                <p className="text-gray-400 text-sm">Real-time prices</p>
              </div>

              <div className="bg-[#0c0c14] rounded-2xl border border-[#1e2033] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Last Updated</h3>
                  <RefreshCw className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(priceData).length > 0 ? 'Live' : 'Loading...'}
                </p>
                <p className="text-gray-400 text-sm">Market data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}