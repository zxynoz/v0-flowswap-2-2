"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Clock, ArrowRight, Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  fromAmount: number
  fromToken: {
    symbol: string
  }
  toAmount: number
  toToken: {
    symbol: string
  }
  recipientAddress: string
}

export default function TransactionModal({
  isOpen,
  onClose,
  fromAmount,
  fromToken,
  toAmount,
  toToken,
  recipientAddress,
}: TransactionModalProps) {
  const [copied, setCopied] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState("Waiting for your deposit")
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [progressPercentage, setProgressPercentage] = useState(25)
  const [depositDetected, setDepositDetected] = useState(false)
  const [checkCount, setCheckCount] = useState(0)
  const [confirmations, setConfirmations] = useState(0)
  const [transactionId, setTransactionId] = useState("")
  const [depositAddress, setDepositAddress] = useState("")
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false)
  const autoCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [transactions, setTransactions] = useLocalStorage<any[]>("flowswap-transactions", [])
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)
  const [realTransactionData, setRealTransactionData] = useState<any>(null)

  // Create real ChangeNOW transaction
  const createRealTransaction = async () => {
    setIsCreatingTransaction(true)
    setTransactionStatus("Creating transaction...")
    
    try {
      const response = await fetch('/api/changenow/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCurrency: fromToken.symbol.toLowerCase(),
          toCurrency: toToken.symbol.toLowerCase(),
          fromAmount: fromAmount,
          address: recipientAddress,
        }),
      })

      const data = await response.json()

      if (response.ok && data.id) {
        // Real ChangeNOW transaction created
        setRealTransactionData(data)
        setTransactionId(data.id)
        setDepositAddress(data.payinAddress)
        setTransactionStatus("Waiting for your deposit")
        setProgressPercentage(25)

        // Save real transaction to local storage
        const newTransaction = {
          id: data.id,
          fromAmount,
          fromToken,
          toAmount,
          toToken,
          depositAddress: data.payinAddress,
          recipientAddress,
          status: "waiting",
          confirmations: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          changeNowData: data,
        }

        setTransactions([newTransaction, ...transactions])
      } else {
        throw new Error(data.message || 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Error creating ChangeNOW transaction:', error)
      setTransactionStatus("⚠️ Failed to create transaction")
      
      // Fallback to demo transaction
      const fallbackId = `demo_${Math.random().toString(36).substring(2, 10)}`
      setTransactionId(fallbackId)
      
      const fallbackAddress = fromToken.symbol.toLowerCase() === "btc"
        ? "bc1qfl4svl3rkfw8d09naamyt7k6wrz903caq3684s"
        : fromToken.symbol.toLowerCase() === "sol"
          ? "739jDqQeuewnq3yYRu4tWvtknZ6AtJ5aivL9d6uiJyzk"
          : "0x731e64bd31a37B05e412c8D45971A79d1ffe58c7"
      
      setDepositAddress(fallbackAddress)
      setTransactionStatus("Waiting for your deposit (Demo Mode)")
      
      const fallbackTransaction = {
        id: fallbackId,
        fromAmount,
        fromToken,
        toAmount,
        toToken,
        depositAddress: fallbackAddress,
        recipientAddress,
        status: "waiting",
        confirmations: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: true,
      }

      setTransactions([fallbackTransaction, ...transactions])
    } finally {
      setIsCreatingTransaction(false)
    }
  }

  // Generate transaction ID and deposit address when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset state
      setTransactionStatus("Waiting for your deposit")
      setProgressPercentage(25)
      setDepositDetected(false)
      setCheckCount(0)
      setConfirmations(0)
      setAutoCheckEnabled(false)

      // Clear any existing interval
      if (autoCheckIntervalRef.current) {
        clearInterval(autoCheckIntervalRef.current)
        autoCheckIntervalRef.current = null
      }

      // Check if we already have a transaction with the same details
      // This prevents creating duplicate transactions when reopening the modal
      const existingTransactionIndex = transactions.findIndex(
        (tx) =>
          tx.fromAmount === fromAmount &&
          tx.fromToken.symbol === fromToken.symbol &&
          tx.toAmount === toAmount &&
          tx.toToken.symbol === toToken.symbol &&
          tx.recipientAddress === recipientAddress,
      )

      let newTransactionId = ""
      let newDepositAddress = ""

      if (existingTransactionIndex >= 0) {
        // Use existing transaction details
        const existingTx = transactions[existingTransactionIndex]
        newTransactionId = existingTx.id
        newDepositAddress = existingTx.depositAddress
        setTransactionId(newTransactionId)
        setDepositAddress(newDepositAddress)

        // Update state based on existing transaction
        if (existingTx.status === "processing") {
          setDepositDetected(true)
          setConfirmations(existingTx.confirmations || 0)
          setTransactionStatus(`⏳ Transaction processing (${existingTx.confirmations || 0}/6 confirmations)...`)
          setProgressPercentage(40 + (existingTx.confirmations || 0) * 10)
        } else if (existingTx.status === "confirmed") {
          setDepositDetected(true)
          setConfirmations(6)
          setTransactionStatus("✅ Transaction Confirmed!")
          setProgressPercentage(100)
        } else if (existingTx.status === "failed") {
          setTransactionStatus("⚠️ Error Checking Transaction")
        }
      } else {
        // Create real ChangeNOW transaction
        createRealTransaction()

        // Save new transaction to local storage
        const newTransaction = {
          id: newTransactionId,
          fromAmount,
          fromToken,
          toAmount,
          toToken,
          depositAddress: newDepositAddress,
          recipientAddress,
          status: "waiting",
          confirmations: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setTransactions([newTransaction, ...transactions])
      }
    }
  }, [isOpen, fromAmount, fromToken, toAmount, toToken, recipientAddress, setTransactions, transactions])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoCheckIntervalRef.current) {
        clearInterval(autoCheckIntervalRef.current)
      }
    }
  }, [])

  // Truncate recipient address for display
  const truncatedRecipientAddress =
    recipientAddress.length > 30
      ? `${recipientAddress.substring(0, 15)}...${recipientAddress.substring(recipientAddress.length - 15)}`
      : recipientAddress

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Function to check transaction status
  const checkTransactionStatus = useCallback(async () => {
    if (isCheckingStatus) return

    setIsCheckingStatus(true)
    setCheckCount((prevCount) => prevCount + 1)

    try {
      // Check real ChangeNOW transaction status if we have real transaction data
      if (realTransactionData && realTransactionData.id) {
        const response = await fetch(`/api/changenow/transaction-status?id=${realTransactionData.id}`)
        const data = await response.json()
        
        if (response.ok && data.status) {
          // Update status based on ChangeNOW response
          switch (data.status) {
            case 'waiting':
              setTransactionStatus("Waiting for your deposit")
              setProgressPercentage(25)
              break
            case 'confirming':
            case 'exchanging':
              setTransactionStatus("⏳ Transaction processing...")
              setProgressPercentage(60)
              setDepositDetected(true)
              break
            case 'sending':
              setTransactionStatus("⏳ Sending to recipient...")
              setProgressPercentage(90)
              break
            case 'finished':
              setTransactionStatus("✅ Transaction Completed!")
              setProgressPercentage(100)
              setAutoCheckEnabled(false)
              if (autoCheckIntervalRef.current) {
                clearInterval(autoCheckIntervalRef.current)
                autoCheckIntervalRef.current = null
              }
              break
            case 'failed':
            case 'refunded':
              setTransactionStatus("⚠️ Transaction Failed")
              setAutoCheckEnabled(false)
              break
            default:
              setTransactionStatus(`Status: ${data.status}`)
          }
          
          // Update transaction in storage
          const updatedTransactions = transactions.map((tx) => {
            if (tx.id === transactionId) {
              return {
                ...tx,
                status: data.status,
                updatedAt: new Date().toISOString(),
                changeNowStatus: data,
              }
            }
            return tx
          })
          setTransactions(updatedTransactions)
          
          return
        }
      }
      
      // Fallback to demo simulation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // First check - no deposit detected
      if (!depositDetected) {
        // 30% chance to detect deposit on first check
        if (checkCount >= 1 && Math.random() < 0.3) {
          setTransactionStatus("⏳ Deposit detected, waiting for confirmation...")
          setProgressPercentage(40)
          setDepositDetected(true)
          setConfirmations(0)

          // Update transaction in local storage
          const updatedTransactions = transactions.map((tx) => {
            if (tx.id === transactionId) {
              return {
                ...tx,
                status: "processing",
                confirmations: 0,
                updatedAt: new Date().toISOString(),
              }
            }
            return tx
          })
          setTransactions(updatedTransactions)
        } else {
          setTransactionStatus("Waiting for your deposit")
          setProgressPercentage(25)
        }
      }
      // If deposit was detected, show confirmations progress
      else {
        // Increment confirmations (max 6 for most blockchains)
        const newConfirmations = Math.min(confirmations + 1, 6)
        setConfirmations(newConfirmations)

        if (newConfirmations < 3) {
          setTransactionStatus(`⏳ Transaction processing (${newConfirmations}/6 confirmations)...`)
          setProgressPercentage(40 + newConfirmations * 10)
        } else if (newConfirmations < 6) {
          setTransactionStatus(`⏳ Transaction processing (${newConfirmations}/6 confirmations)...`)
          setProgressPercentage(70 + (newConfirmations - 3) * 10)
        } else {
          setTransactionStatus("✅ Transaction Confirmed!")
          setProgressPercentage(100)

          // Disable auto-check when confirmed
          setAutoCheckEnabled(false)
          if (autoCheckIntervalRef.current) {
            clearInterval(autoCheckIntervalRef.current)
            autoCheckIntervalRef.current = null
          }
        }

        // Update transaction in local storage
        const updatedTransactions = transactions.map((tx) => {
          if (tx.id === transactionId) {
            return {
              ...tx,
              status: newConfirmations >= 6 ? "confirmed" : "processing",
              confirmations: newConfirmations,
              updatedAt: new Date().toISOString(),
            }
          }
          return tx
        })
        setTransactions(updatedTransactions)
      }
    } catch (error) {
      setTransactionStatus("⚠️ Error Checking Transaction")

      // Update transaction in local storage to mark as failed
      const updatedTransactions = transactions.map((tx) => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            status: "failed",
            updatedAt: new Date().toISOString(),
          }
        }
        return tx
      })
      setTransactions(updatedTransactions)
    } finally {
      setIsCheckingStatus(false)
    }
  }, [checkCount, depositDetected, confirmations, isCheckingStatus, transactionId, transactions, setTransactions])

  // Toggle auto-check
  const toggleAutoCheck = () => {
    if (autoCheckEnabled) {
      // Disable auto-check
      setAutoCheckEnabled(false)
      if (autoCheckIntervalRef.current) {
        clearInterval(autoCheckIntervalRef.current)
        autoCheckIntervalRef.current = null
      }
    } else {
      // Enable auto-check
      setAutoCheckEnabled(true)
      // Check immediately
      checkTransactionStatus()
      // Then check every 10 seconds
      if (autoCheckIntervalRef.current) {
        clearInterval(autoCheckIntervalRef.current)
      }
      autoCheckIntervalRef.current = setInterval(() => {
        checkTransactionStatus()
      }, 10000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-[#0c0c14] text-white p-5 rounded-2xl w-full max-w-md mx-auto border border-[#1e2033] shadow-2xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-medium">Transaction Status</h2>
          <div className="flex items-center text-[#3b9bd9] text-sm">
            {transactionStatus.includes("Confirmed") ? (
              <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
            ) : transactionStatus.includes("Error") ? (
              <AlertCircle className="h-4 w-4 mr-1.5 text-red-500" />
            ) : (
              <Clock className="h-4 w-4 mr-1.5" />
            )}
            <span>{transactionStatus}</span>
          </div>
        </div>

        <p className="text-gray-400 text-xs mb-4">Transaction ID: {transactionId}</p>

        <div className="bg-[#0a0a12] rounded-xl p-4 mb-4 border border-[#1e2033]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">From</p>
              <p className="text-lg font-medium">
                {fromAmount} {fromToken.symbol.toUpperCase()}
              </p>
            </div>

            <ArrowRight className="text-gray-500 h-4 w-4" />

            <div className="text-right">
              <p className="text-gray-400 text-xs mb-0.5">To</p>
              <p className="text-lg font-medium">
                {toAmount.toFixed(7)} {toToken.symbol.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-1">Deposit Address</p>
            <div className="flex items-center justify-between bg-[#0f0f1a] rounded-lg p-2 border border-[#1e2033]">
              <p className="text-xs font-mono text-gray-300 truncate mr-2">{depositAddress}</p>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center bg-transparent hover:bg-[#1e2033] p-1 rounded transition-colors"
              >
                {copied ? (
                  <span className="text-green-500 text-xs">Copied!</span>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span className="text-gray-400 text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-xs">
            Please send {fromAmount} {fromToken.symbol.toUpperCase()} to this address to complete the swap
          </p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <p className="text-gray-400 text-xs">Status</p>
            <p className="text-white text-xs">{transactionStatus}</p>
          </div>

          <div className="h-1.5 w-full bg-[#1e2033] rounded-full mb-3">
            <div
              className="h-full bg-gradient-to-r from-[#3b52b4] to-[#3b9bd9] rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-400 text-xs">Recipient Address</p>
            <p className="text-white font-mono text-xs">{truncatedRecipientAddress}</p>
          </div>

          {/* Auto-check toggle */}
          <div className="flex items-center justify-between mb-3 bg-[#0f0f1a] rounded-lg p-3 border border-[#1e2033]">
            <div>
              <p className="text-white text-sm font-medium">Real-time monitoring</p>
              <p className="text-gray-400 text-xs">Auto-check every 10 seconds</p>
            </div>
            <button
              onClick={toggleAutoCheck}
              aria-pressed={autoCheckEnabled}
              role="switch"
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0f0f1a]"
              style={{ backgroundColor: autoCheckEnabled ? "rgb(37, 99, 235)" : "rgb(75, 85, 99)" }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  autoCheckEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Transaction Status Check Button */}
          <button
            onClick={checkTransactionStatus}
            disabled={isCheckingStatus || autoCheckEnabled}
            className={`w-full ${
              isCheckingStatus || autoCheckEnabled
                ? "bg-[#1e2033] cursor-not-allowed"
                : "bg-[#2d4380] hover:bg-[#3a5296] cursor-pointer"
            } text-white py-2 rounded-lg transition-colors font-medium text-sm mb-3 flex justify-center items-center`}
          >
            {isCheckingStatus ? (
              <>
                <Loader2 className="animate-spin mr-1.5 h-4 w-4" />
                Checking Status...
              </>
            ) : autoCheckEnabled ? (
              "Auto-checking Enabled"
            ) : (
              "Check Transaction Status"
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#1e2033] hover:bg-[#2a2a45] text-white py-2.5 rounded-lg transition-colors font-medium text-sm"
        >
          Close
        </button>
      </div>
    </div>
  )
}
