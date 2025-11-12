"use client"

import { useState } from "react"
import { Clock, ArrowRight, Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Sidebar from "@/components/sidebar"
import { useLocalStorage } from "@/hooks/use-local-storage"
import Header from "@/components/header"

// Transaction status types
type TransactionStatus = "waiting" | "processing" | "confirmed" | "failed"

// Transaction interface
interface Transaction {
  id: string
  fromAmount: number
  fromToken: {
    symbol: string
  }
  toAmount: number
  toToken: {
    symbol: string
  }
  depositAddress: string
  recipientAddress: string
  status: TransactionStatus
  confirmations: number
  createdAt: string
  updatedAt: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("flowswap-transactions", [])
  const [isCheckingStatus, setIsCheckingStatus] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  // Function to check transaction status
  const checkTransactionStatus = async (transaction: Transaction, index: number) => {
    if (isCheckingStatus[transaction.id]) return

    setIsCheckingStatus((prev) => ({ ...prev, [transaction.id]: true }))

    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update transaction status based on current status
      const updatedTransactions = [...transactions]
      const currentTransaction = { ...updatedTransactions[index] }

      if (currentTransaction.status === "waiting") {
        // 50% chance to move to processing
        if (Math.random() > 0.5) {
          currentTransaction.status = "processing"
          currentTransaction.confirmations = 1
        }
      } else if (currentTransaction.status === "processing") {
        // Increment confirmations
        currentTransaction.confirmations = Math.min((currentTransaction.confirmations || 0) + 1, 6)

        // If we reach 6 confirmations, mark as confirmed
        if (currentTransaction.confirmations >= 6) {
          currentTransaction.status = "confirmed"
        }
      }

      // Update timestamp
      currentTransaction.updatedAt = new Date().toISOString()

      updatedTransactions[index] = currentTransaction
      setTransactions(updatedTransactions)
    } catch (error) {
      console.error("Error checking transaction status:", error)
    } finally {
      setIsCheckingStatus((prev) => ({ ...prev, [transaction.id]: false }))
    }
  }

  // Function to handle copy
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString("en-GB").split("/").join("/")}${", "}${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
  }

  // Function to get status badge color
  const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500/20 text-yellow-500"
      case "processing":
        return "bg-blue-500/20 text-blue-500"
      case "confirmed":
        return "bg-green-500/20 text-green-500"
      case "failed":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  // Function to get status text
  const getStatusText = (status: TransactionStatus, confirmations?: number) => {
    switch (status) {
      case "waiting":
        return "Waiting"
      case "processing":
        return confirmations ? `Processing (${confirmations}/6)` : "Processing"
      case "confirmed":
        return "Confirmed"
      case "failed":
        return "Failed"
      default:
        return "Unknown"
    }
  }

  // Function to truncate address
  const truncateAddress = (address: string) => {
    if (!address) return ""
    if (address.length <= 16) return address
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`
  }

  // Filter out duplicate transactions (same from/to amounts and tokens)
  const uniqueTransactions = transactions.filter(
    (transaction, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.fromAmount === transaction.fromAmount &&
          t.fromToken.symbol === transaction.fromToken.symbol &&
          t.toAmount === transaction.toAmount &&
          t.toToken.symbol === transaction.toToken.symbol &&
          t.recipientAddress === transaction.recipientAddress,
      ),
  )

  return (
    <div className="flex min-h-screen bg-[#0a0b14] flex-col">
      {/* Add the Header component */}
      <Header />

      <div className="flex pt-24">
        {" "}
        {/* Added padding-top to account for the header */}
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-white">Transactions</h1>
            <p className="text-gray-400 mb-8">View your transaction history</p>

            {uniqueTransactions.length === 0 ? (
              <div className="bg-[#0c0c14] rounded-2xl p-8 border border-[#1e2033] text-center">
                <p className="text-gray-400 mb-4">No transactions yet</p>
                <p className="text-gray-500 text-sm">Your transaction history will appear here once you make a swap.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {uniqueTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="bg-[#0c0c14] rounded-2xl p-4 md:p-5 border border-[#1e2033]">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mr-2" />
                        <h2 className="text-lg md:text-xl font-medium text-white">Transaction</h2>
                      </div>
                      <div
                        className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ${getStatusBadgeClass(transaction.status)}`}
                      >
                        {getStatusText(transaction.status, transaction.confirmations)}
                      </div>
                    </div>

                    <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">ID: {transaction.id}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">From</p>
                        <p className="text-white text-base md:text-lg">
                          {transaction.fromAmount} {transaction.fromToken.symbol.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <ArrowRight className="hidden md:block text-gray-500 h-4 w-4 mx-3" />
                        <div className="md:ml-auto">
                          <p className="text-gray-400 text-xs mb-1">To</p>
                          <p className="text-white text-base md:text-lg">
                            {transaction.toAmount.toFixed(7)} {transaction.toToken.symbol.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Created</p>
                        <p className="text-white text-sm">{formatDate(transaction.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Updated</p>
                        <p className="text-white text-sm">{formatDate(transaction.updatedAt)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 md:mb-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Deposit Address</p>
                        <div className="flex items-center justify-between bg-[#0f0f1a] rounded-lg p-2 border border-[#1e2033]">
                          <p className="text-xs font-mono text-gray-300 truncate mr-2">{transaction.depositAddress}</p>
                          <button
                            onClick={() => handleCopy(transaction.depositAddress, `deposit-${transaction.id}`)}
                            className="flex items-center justify-center bg-transparent hover:bg-[#1e2033] p-1 rounded transition-colors"
                          >
                            {copied === `deposit-${transaction.id}` ? (
                              <span className="text-green-500 text-xs">Copied!</span>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-gray-400 text-xs">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-1">Recipient Address</p>
                        <div className="flex items-center justify-between bg-[#0f0f1a] rounded-lg p-2 border border-[#1e2033]">
                          <p className="text-xs font-mono text-gray-300 truncate mr-2">
                            {transaction.recipientAddress}
                          </p>
                          <button
                            onClick={() => handleCopy(transaction.recipientAddress, `recipient-${transaction.id}`)}
                            className="flex items-center justify-center bg-transparent hover:bg-[#1e2033] p-1 rounded transition-colors"
                          >
                            {copied === `recipient-${transaction.id}` ? (
                              <span className="text-green-500 text-xs">Copied!</span>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-gray-400 text-xs">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {transaction.status !== "failed" && (
                      <div className="mb-3 md:mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-gray-400 text-xs">Status</p>
                          <p className="text-white text-xs">
                            {transaction.status === "processing"
                              ? `${transaction.confirmations}/6 confirmations`
                              : getStatusText(transaction.status)}
                          </p>
                        </div>
                        <div className="h-1 w-full bg-[#1e2033] rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-[#3b52b4] to-[#3b9bd9] rounded-full transition-all duration-500 ease-in-out"
                            style={{
                              width:
                                transaction.status === "waiting"
                                  ? "25%"
                                  : transaction.status === "processing"
                                    ? `${40 + transaction.confirmations * 10}%`
                                    : transaction.status === "confirmed"
                                      ? "100%"
                                      : "0%",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => checkTransactionStatus(transaction, index)}
                      disabled={
                        isCheckingStatus[transaction.id] ||
                        transaction.status === "confirmed" ||
                        transaction.status === "failed"
                      }
                      className={`w-full ${
                        isCheckingStatus[transaction.id] ||
                        transaction.status === "confirmed" ||
                        transaction.status === "failed"
                          ? "bg-[#1e2033] cursor-not-allowed"
                          : "bg-[#2d4380] hover:bg-[#3a5296] cursor-pointer"
                      } text-white py-2 md:py-2.5 rounded-lg transition-colors font-medium text-xs md:text-sm flex justify-center items-center`}
                    >
                      {isCheckingStatus[transaction.id] ? (
                        <>
                          <Loader2 className="animate-spin mr-1.5 h-3 w-3 md:h-4 md:w-4" />
                          Checking Status...
                        </>
                      ) : transaction.status === "confirmed" ? (
                        <>
                          <CheckCircle className="mr-1.5 h-3 w-3 md:h-4 md:w-4 text-green-500" />
                          Transaction Confirmed
                        </>
                      ) : transaction.status === "failed" ? (
                        <>
                          <AlertCircle className="mr-1.5 h-3 w-3 md:h-4 md:w-4 text-red-500" />
                          Transaction Failed
                        </>
                      ) : (
                        "Check Transaction Status"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
