import { NextResponse } from "next/server"
import axios from "axios"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const CHANGENOW_API_KEY = "e51083be6c9bc7d1a1146817d79eb2e7fe8cc06e4f6c7afc6192d76546ded751"
const CHANGENOW_BASE_URL = "https://api.changenow.io/v1"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromCurrency = searchParams.get("from")?.toLowerCase()
    const toCurrency = searchParams.get("to")?.toLowerCase()
    const fromAmount = searchParams.get("amount")

    if (!fromCurrency || !toCurrency || !fromAmount) {
      return NextResponse.json(
        { error: "Missing required parameters: from, to, amount" },
        { status: 400 }
      )
    }

    console.log(`Getting ChangeNOW estimate: ${fromAmount} ${fromCurrency} to ${toCurrency}`)

    const response = await axios.get(
      `${CHANGENOW_BASE_URL}/exchange-amount/${fromAmount}/${fromCurrency}_${toCurrency}`,
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

    console.log(`ChangeNOW estimate result:`, response.data)

    return NextResponse.json({
      estimatedAmount: response.data.estimatedAmount,
      transactionSpeedForecast: response.data.transactionSpeedForecast,
      warningMessage: response.data.warningMessage,
      fromAmount: fromAmount,
      fromCurrency: fromCurrency,
      toCurrency: toCurrency
    })

  } catch (error) {
    console.error("Error getting ChangeNOW estimate:", error.message)
    
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

    return NextResponse.json(
      { error: "Failed to get exchange estimate", message: error.message },
      { status: 500 }
    )
  }
}