import { NextResponse } from "next/server"
import axios from "axios"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const CHANGENOW_API_KEY = "e51083be6c9bc7d1a1146817d79eb2e7fe8cc06e4f6c7afc6192d76546ded751"
const CHANGENOW_BASE_URL = "https://api.changenow.io/v1"

// Cache for minimum amounts
const cache = new Map()
const CACHE_DURATION = 300 * 1000 // 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromCurrency = searchParams.get("from")?.toLowerCase()
    const toCurrency = searchParams.get("to")?.toLowerCase()

    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: "Missing required parameters: from, to" },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = `min-amount-${fromCurrency}-${toCurrency}`
    const cachedData = cache.get(cacheKey)
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log(`Returning cached minimum amount for ${fromCurrency} to ${toCurrency}`)
      return NextResponse.json(cachedData.data)
    }

    console.log(`Getting ChangeNOW minimum amount: ${fromCurrency} to ${toCurrency}`)

    const response = await axios.get(
      `${CHANGENOW_BASE_URL}/min-amount/${fromCurrency}_${toCurrency}`,
      {
        params: {
          api_key: CHANGENOW_API_KEY
        },
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    )

    const result = {
      minAmount: response.data.minAmount,
      fromCurrency: fromCurrency,
      toCurrency: toCurrency
    }

    // Cache the response
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    console.log(`ChangeNOW minimum amount result:`, result)

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error getting ChangeNOW minimum amount:", error.message)
    
    if (error.response) {
      console.error("ChangeNOW API Error:", error.response.data)
      return NextResponse.json(
        { 
          error: "ChangeNOW API Error", 
          message: error.response.data.message || error.message,
          details: error.response.data
        },
        { status: error.response.status || 500 }
      )
    }

    // Return fallback minimum amounts
    const fallbackMinAmount = {
      minAmount: "0.001",
      fromCurrency: searchParams.get("from")?.toLowerCase(),
      toCurrency: searchParams.get("to")?.toLowerCase()
    }

    return NextResponse.json(fallbackMinAmount)
  }
}