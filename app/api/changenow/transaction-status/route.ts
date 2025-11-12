import { NextResponse } from "next/server"
import axios from "axios"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const CHANGENOW_API_KEY = "e51083be6c9bc7d1a1146817d79eb2e7fe8cc06e4f6c7afc6192d76546ded751"
const CHANGENOW_BASE_URL = "https://api.changenow.io/v1"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("id")

    if (!transactionId) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      )
    }

    console.log(`Getting ChangeNOW transaction status for: ${transactionId}`)

    const response = await axios.get(
      `${CHANGENOW_BASE_URL}/transactions/${transactionId}/${CHANGENOW_API_KEY}`,
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    )

    console.log(`ChangeNOW transaction status:`, response.data)

    return NextResponse.json({
      id: response.data.id,
      status: response.data.status,
      payinAddress: response.data.payinAddress,
      payoutAddress: response.data.payoutAddress,
      payinExtraId: response.data.payinExtraId,
      payoutExtraId: response.data.payoutExtraId,
      fromCurrency: response.data.fromCurrency,
      toCurrency: response.data.toCurrency,
      expectedAmountFrom: response.data.expectedAmountFrom,
      expectedAmountTo: response.data.expectedAmountTo,
      amountFrom: response.data.amountFrom,
      amountTo: response.data.amountTo,
      networkFee: response.data.networkFee,
      changenowFee: response.data.changenowFee,
      payinHash: response.data.payinHash,
      payoutHash: response.data.payoutHash,
      refundHash: response.data.refundHash,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
      depositReceivedAt: response.data.depositReceivedAt,
      exchangedAt: response.data.exchangedAt,
      payoutSentAt: response.data.payoutSentAt,
      validUntil: response.data.validUntil
    })

  } catch (error) {
    console.error("Error getting ChangeNOW transaction status:", error.message)
    
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
      { error: "Failed to get transaction status", message: error.message },
      { status: 500 }
    )
  }
}