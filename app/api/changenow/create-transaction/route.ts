import { NextResponse } from "next/server"
import axios from "axios"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const CHANGENOW_API_KEY = "e51083be6c9bc7d1a1146817d79eb2e7fe8cc06e4f6c7afc6192d76546ded751"
const CHANGENOW_BASE_URL = "https://api.changenow.io/v1"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      fromCurrency, 
      toCurrency, 
      fromAmount, 
      address, 
      extraId = null,
      userId = null,
      contactEmail = null,
      refundAddress = null,
      refundExtraId = null
    } = body

    if (!fromCurrency || !toCurrency || !fromAmount || !address) {
      return NextResponse.json(
        { error: "Missing required parameters: fromCurrency, toCurrency, fromAmount, address" },
        { status: 400 }
      )
    }

    console.log(`Creating ChangeNOW transaction: ${fromAmount} ${fromCurrency} to ${toCurrency}`)
    console.log(`Recipient address: ${address}`)

    const transactionData = {
      from: fromCurrency.toLowerCase(),
      to: toCurrency.toLowerCase(),
      address: address,
      amount: parseFloat(fromAmount),
      extraId: extraId,
      userId: userId,
      contactEmail: contactEmail,
      refundAddress: refundAddress,
      refundExtraId: refundExtraId
    }

    // Remove null/undefined values
    Object.keys(transactionData).forEach(key => {
      if (transactionData[key] === null || transactionData[key] === undefined) {
        delete transactionData[key]
      }
    })

    const response = await axios.post(
      `${CHANGENOW_BASE_URL}/transactions/${CHANGENOW_API_KEY}`,
      transactionData,
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    )

    console.log(`ChangeNOW transaction created:`, response.data)

    return NextResponse.json({
      id: response.data.id,
      payinAddress: response.data.payinAddress,
      payoutAddress: response.data.payoutAddress,
      fromCurrency: response.data.fromCurrency,
      toCurrency: response.data.toCurrency,
      fromAmount: response.data.fromAmount,
      toAmount: response.data.toAmount,
      status: response.data.status,
      payinExtraId: response.data.payinExtraId,
      payoutExtraId: response.data.payoutExtraId,
      refundAddress: response.data.refundAddress,
      refundExtraId: response.data.refundExtraId,
      validUntil: response.data.validUntil,
      createdAt: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error creating ChangeNOW transaction:", error.message)
    
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
      { error: "Failed to create transaction", message: error.message },
      { status: 500 }
    )
  }
}