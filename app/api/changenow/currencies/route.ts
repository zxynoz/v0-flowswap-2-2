import { NextResponse } from "next/server"
import axios from "axios"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const CHANGENOW_API_KEY = "e51083be6c9bc7d1a1146817d79eb2e7fe8cc06e4f6c7afc6192d76546ded751"
const CHANGENOW_BASE_URL = "https://api.changenow.io/v1"

// Cache for currencies
const cache = new Map()
const CACHE_DURATION = 300 * 1000 // 5 minutes

export async function GET() {
  try {
    // Check cache first
    const cacheKey = "changenow-currencies"
    const cachedData = cache.get(cacheKey)
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("Returning cached ChangeNOW currencies")
      return NextResponse.json(cachedData.data)
    }

    console.log("Fetching currencies from ChangeNOW API...")

    const response = await axios.get(`${CHANGENOW_BASE_URL}/currencies`, {
      params: {
        active: true,
        fixedRate: false
      },
      headers: {
        "x-changenow-api-key": CHANGENOW_API_KEY,
        "Content-Type": "application/json"
      },
      timeout: 10000
    })

    // Cache the response
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    })

    console.log(`Successfully fetched ${response.data.length} currencies from ChangeNOW`)
    return NextResponse.json(response.data)

  } catch (error) {
    console.error("Error fetching ChangeNOW currencies:", error.message)
    
    // Return fallback currencies if API fails
    const fallbackCurrencies = [
      { ticker: "btc", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
      { ticker: "eth", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
      { ticker: "usdt", name: "Tether", image: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
      { ticker: "bnb", name: "BNB", image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
      { ticker: "sol", name: "Solana", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
      { ticker: "usdc", name: "USD Coin", image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { ticker: "xrp", name: "XRP", image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
      { ticker: "ada", name: "Cardano", image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" }
    ]

    return NextResponse.json(fallbackCurrencies)
  }
}