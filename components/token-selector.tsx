"use client"

import { useState, useEffect } from "react"
import { Search, X, AlertCircle, RefreshCw } from "lucide-react"

const TokenSelector = ({ onSelectToken, onClose }) => {
  const [tokens, setTokens] = useState([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/changenow/currencies?_=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        })

        // Parse response
        const data = await res.json()

        // Validate that we received an array of tokens
        if (Array.isArray(data) && data.length > 0) {
          // Transform ChangeNOW currency format to our token format
          const validTokens = data
            .filter((currency) => currency && currency.ticker && currency.name)
            .map((currency) => ({
              id: currency.ticker,
              symbol: currency.ticker,
              name: currency.name,
              image: currency.image || `https://assets.coingecko.com/coins/images/1/large/${currency.ticker}.png`,
              current_price: 0,
              price_change_percentage_24h: 0,
              market_cap: 0,
            }))

          if (validTokens.length > 0) {
            setTokens(validTokens)
            setError(null)
            console.log(`[ChangeNOW] Successfully loaded ${validTokens.length} currencies`)
            setIsLoading(false)
            return
          }
        }

        // If we get here, data is not valid
        throw new Error("Invalid currency data received from ChangeNOW API")
      } catch (error) {
        console.error("[ChangeNOW] Error fetching currencies:", error.message)

        // Only show error if we don't have tokens already
        if (tokens.length === 0) {
          setError("Unable to load currency data. Please try again.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const filteredTokens = tokens.filter(
    (token) => {
      if (!search.trim()) return true
      const searchLower = search.toLowerCase().trim()
      return (
        token.name?.toLowerCase().includes(searchLower) ||
        token.symbol?.toLowerCase().includes(searchLower) ||
        token.id?.toLowerCase().includes(searchLower)
      )
    }
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-[#0c0c14] text-white p-8 rounded-2xl w-full max-w-md mx-auto border border-[#1e2033] shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Select a token</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#1e2033]/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && tokens.length === 0 && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 text-red-400 text-sm rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium mb-1">Unable to load tokens</p>
              <p className="text-xs opacity-90">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-md text-xs font-medium transition-colors flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Now
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or symbol"
              className="bg-[#0f0f1a] p-3 pl-10 rounded-xl w-full text-white border border-[#1e2033] focus:border-blue-500/50 focus:outline-none transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-gray-500 h-5 w-5" />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-gray-400 text-sm font-medium mb-3">Popular tokens</h3>
          <div className="grid grid-cols-4 gap-2">
            {isLoading
              ? Array(8)
                  .fill(0)
                  .map((_, i) => <div key={i} className="bg-[#0f0f1a] p-2 rounded-lg h-[60px] animate-pulse"></div>)
              : tokens.slice(0, 8).map((token) => (
                  <button
                    key={token.id}
                    className="bg-[#0f0f1a] p-2 rounded-xl flex flex-col items-center justify-center hover:bg-[#1e2033] transition-colors border border-[#1e2033]"
                    onClick={() => onSelectToken(token)}
                  >
                    <img src={token.image || "/placeholder.svg"} alt={token.name} className="w-6 h-6 mb-1" />
                    <span className="text-xs">{token.symbol.toUpperCase()}</span>
                  </button>
                ))}
          </div>
        </div>

        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-3">All tokens</h3>
          <div className="overflow-y-auto max-h-64 pr-2 -mr-2">
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center p-3 mb-2 bg-[#0f0f1a] rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-[#1e2033] rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-[#1e2033] rounded w-24 mb-2"></div>
                      <div className="h-3 bg-[#1e2033] rounded w-16"></div>
                    </div>
                  </div>
                ))
            ) : error && tokens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Failed to load tokens</p>
              </div>
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.id}
                  className="flex items-center p-3 w-full text-left hover:bg-[#0f0f1a] rounded-xl mb-1 transition-colors"
                  onClick={() => onSelectToken(token)}
                >
                  <img src={token.image || "/placeholder.svg"} alt={token.name} className="w-8 h-8 mr-4" />
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-gray-400 text-xs">{token.symbol.toUpperCase()}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-medium">${token.current_price?.toLocaleString() || "—"}</p>
                    <p
                      className={`text-xs ${token.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {token.price_change_percentage_24h > 0 ? "+" : ""}
                      {token.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No tokens found matching "{search}"</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenSelector
