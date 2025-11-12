"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  ChevronDown,
  ArrowDown,
  FileText,
  Twitter,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import TokenSelector from "@/components/token-selector"
import Sidebar from "@/components/sidebar"
import TransactionModal from "@/components/transaction-modal"
import HeroGeometric from "@/components/hero-geometric"
import MentexSection from "@/components/mentex-section"
import Header from "@/components/header"
import IntroAnimation from "@/components/intro-animation"
import HowToUseSection from "@/components/how-to-use-section"

export default function SwapPage() {
  const [showIntro, setShowIntro] = useState(true)
  const [contentReady, setContentReady] = useState(false)
  const [fromToken, setFromToken] = useState({
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  })
  const [toToken, setToToken] = useState({
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  })
  const [showFromTokenSelector, setShowFromTokenSelector] = useState(false)
  const [showToTokenSelector, setShowToTokenSelector] = useState(false)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState(0)
  const [fromRate, setFromRate] = useState(3500)
  const [toRate, setToRate] = useState(65000)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [minimumAmount, setMinimumAmount] = useState("0.0005524 ETH")
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const [addressValidation, setAddressValidation] = useState(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [usingFallbackRates, setUsingFallbackRates] = useState(false)
  const fetchIntervalRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const [minimumUsdAmount] = useState(10) // $10 USD minimum
  const [minimumTokenAmount, setMinimumTokenAmount] = useState(0)
  const [showMinimumWarning, setShowMinimumWarning] = useState(false)
  const [isTokenChanging, setIsTokenChanging] = useState(false)

  const handleIntroComplete = () => {
    setShowIntro(false)
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setContentReady(true)
    }, 100)
  }

  // Get minimum amount from ChangeNOW
  const fetchMinimumAmount = useCallback(async () => {
    try {
      const res = await fetch(`/api/changenow/min-amount?from=${fromToken.id}&to=${toToken.id}`)
      const data = await res.json()
      
      if (data.minAmount) {
        const minAmount = parseFloat(data.minAmount)
        setMinimumTokenAmount(minAmount)
        setMinimumAmount(`${minAmount} ${fromToken.symbol.toUpperCase()}`)
        
        // Check if current amount is below minimum
        const numFromAmount = parseFloat(fromAmount) || 0
        if (numFromAmount > 0 && numFromAmount < minAmount) {
          setShowMinimumWarning(true)
        } else {
          setShowMinimumWarning(false)
        }
      }
    } catch (error) {
      console.error("Error fetching minimum amount:", error)
      // Fallback to a default minimum
      setMinimumTokenAmount(0.001)
      setMinimumAmount(`0.001 ${fromToken.symbol.toUpperCase()}`)
    }
  }, [fromToken.id, toToken.id, fromToken.symbol, fromAmount])

  // Get ChangeNOW estimate for swap
  const fetchEstimate = useCallback(
    async (customFromToken = null, customToToken = null, amount = fromAmount) => {
      const sourceToken = customFromToken || fromToken
      const targetToken = customToToken || toToken

      if (sourceToken.id === targetToken.id || !amount || parseFloat(amount) <= 0) {
        return
      }

      setIsLoading(true)

      try {
        const timestamp = Date.now()
        const res = await fetch(
          `/api/changenow/estimate?from=${sourceToken.id}&to=${targetToken.id}&amount=${amount}&_=${timestamp}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        )

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.message || `ChangeNOW API responded with status: ${res.status}`)
        }

        const data = await res.json()

        if (data.error) {
          throw new Error(data.message || "Failed to get exchange estimate")
        }

        // Update the estimated amount
        if (data.estimatedAmount) {
          setToAmount(parseFloat(data.estimatedAmount))
        }

        setLastUpdated(new Date())
        setFetchError(false)
        setErrorMessage("")
        setUsingFallbackRates(false)
        setIsTokenChanging(false)

        // Clear any retry timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
          retryTimeoutRef.current = null
        }
      } catch (error) {
        console.error("Error getting ChangeNOW estimate:", error)
        setFetchError(true)
        setErrorMessage(error.message || "Failed to get exchange estimate")
        setUsingFallbackRates(true)

        // Schedule a retry after a delay
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }

        retryTimeoutRef.current = setTimeout(() => {
          console.log(`Retrying estimate fetch after error...`)
          fetchEstimate(customFromToken, customToToken, amount)
        }, 5000)
      } finally {
        setIsLoading(false)
      }
    },
    [fromToken, toToken, fromAmount],
  )

  // This effect is no longer needed as we use ChangeNOW estimates directly

  useEffect(() => {
    fetchMinimumAmount()
  }, [fetchMinimumAmount])

  useEffect(() => {
    const numValue = Number.parseFloat(fromAmount) || 0
    if (numValue > 0 && numValue < minimumTokenAmount) {
      setShowMinimumWarning(true)
    } else {
      setShowMinimumWarning(false)
    }
  }, [fromAmount, minimumTokenAmount])

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      fetchEstimate()
    }

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [fetchEstimate])

  const handleFromAmountChange = (e) => {
    const rawValue = e.target.value

    if (!rawValue) {
      setFromAmount("")
      setToAmount(0)
      setShowMinimumWarning(false)
      return
    }

    if (!/^[0-9]*\.?[0-9]*$/.test(rawValue)) {
      return
    }

    setFromAmount(rawValue)

    const numValue = parseFloat(rawValue) || 0

    if (numValue > 0) {
      // Get real estimate from ChangeNOW
      fetchEstimate(null, null, rawValue)
    } else {
      setToAmount(0)
    }

    if (numValue > 0 && numValue < minimumTokenAmount) {
      setShowMinimumWarning(true)
    } else {
      setShowMinimumWarning(false)
    }
  }

  const handleSelectFromToken = (token) => {
    if (token.id === toToken.id) {
      setToToken(fromToken)
    }
    setFromToken(token)
    setShowFromTokenSelector(false)

    setIsTokenChanging(true)
    setToAmount(0)

    // Get new estimate with updated token
    if (fromAmount && parseFloat(fromAmount) > 0) {
      if (token.id === toToken.id) {
        fetchEstimate(token, fromToken, fromAmount)
      } else {
        fetchEstimate(token, toToken, fromAmount)
      }
    }
  }

  const handleSelectToToken = (token) => {
    if (token.id === fromToken.id) {
      setFromToken(toToken)
    }
    setToToken(token)
    setShowToTokenSelector(false)

    setIsTokenChanging(true)
    setToAmount(0)

    // Get new estimate with updated token
    if (fromAmount && parseFloat(fromAmount) > 0) {
      if (token.id === fromToken.id) {
        fetchEstimate(toToken, token, fromAmount)
      } else {
        fetchEstimate(fromToken, token, fromAmount)
      }
    }
  }

  const swapTokens = () => {
    const newFromToken = toToken
    const newToToken = fromToken

    setFromToken(newFromToken)
    setToToken(newToToken)

    setIsTokenChanging(true)
    setToAmount(0)

    if (fromAmount && parseFloat(fromAmount) > 0) {
      fetchEstimate(newFromToken, newToToken, fromAmount)
    }
  }

  const handleRefreshRates = () => {
    setIsTokenChanging(true)
    if (fromAmount && parseFloat(fromAmount) > 0) {
      fetchEstimate()
    }
  }

  const validateWalletAddress = () => {
    const numFromAmount = Number.parseFloat(fromAmount) || 0
    if (numFromAmount <= 0) {
      return
    }

    if (numFromAmount < minimumTokenAmount) {
      setShowMinimumWarning(true)
      return
    }

    if (!recipientAddress) {
      setAddressValidation({
        isValid: false,
        message: "Please enter a wallet address",
      })
      return
    }

    setIsValidatingAddress(true)
    setAddressValidation(null)

    setTimeout(() => {
      let isValid = false
      let message = ""

      if (toToken.symbol.toLowerCase() === "btc") {
        if (!/^(1|3|bc1)[a-zA-Z0-9]{25,42}$/.test(recipientAddress)) {
          isValid = false
          message = "Invalid Bitcoin address format"
        } else if (recipientAddress.startsWith("bc1") && recipientAddress.length < 42) {
          isValid = false
          message = "Invalid SegWit address length"
        } else if (
          (recipientAddress.startsWith("1") || recipientAddress.startsWith("3")) &&
          recipientAddress.length < 26
        ) {
          isValid = false
          message = "Invalid legacy address length"
        } else {
          isValid = true
          message = "Valid Bitcoin address"
        }
      } else if (toToken.symbol.toLowerCase() === "sol") {
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(recipientAddress)) {
          isValid = false
          message = "Invalid Solana address format"
        } else if (recipientAddress.length !== 44) {
          isValid = false
          message = "Invalid Solana address length"
        } else {
          isValid = true
          message = "Valid Solana address"
        }
      } else {
        if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
          isValid = false
          message = "Invalid Ethereum address format"
        } else {
          const hasUpperCase = /[A-F]/.test(recipientAddress)
          const hasLowerCase = /[a-f]/.test(recipientAddress)

          if (hasUpperCase && hasLowerCase) {
            isValid = validateEthereumChecksum(recipientAddress)
            message = isValid ? "Valid Ethereum address" : "Wallet address is not valid. Reason: Invalid checksum"
          } else {
            isValid = true
            message = "Valid Ethereum address (non-checksummed)"
          }
        }
      }

      setAddressValidation({ isValid, message })
      setIsValidatingAddress(false)

      if (isValid) {
        setTimeout(() => {
          setShowTransactionModal(true)
        }, 500)
      }
    }, 1500)
  }

  const validateEthereumChecksum = (address) => {
    const validChecksumAddresses = [
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
      "0x52908400098527886E0F7030069857D2E4169EE7",
      "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
    ]

    return validChecksumAddresses.includes(address)
  }

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />
  }

  return (
    <AnimatePresence>
      <motion.div
        className="flex min-h-screen bg-[#0a0b14] overflow-hidden flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Header />

        <div className="flex pt-24">
          <Sidebar />

          <div className="flex-1 flex flex-col md:flex-row">
            <HeroGeometric />

            <div className="w-full md:w-[45%] lg:w-[40%] p-6 md:p-8 lg:p-10 relative z-10">
              <div className="mb-3">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#1a1a2e]/60 text-green-400 text-xs">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                  AI SWAP
                </div>
              </div>

              <div className="mb-6">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Example: swap 1 btc to eth on arbitrum and send it to 0x..."
                    className="w-full bg-[#1a1a2e]/40 border border-gray-800/20 rounded-lg px-3 py-2 text-gray-300 focus:outline-none text-sm"
                  />
                  <button className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-0.5 rounded-md transition-colors text-xs">
                    Process
                  </button>
                </div>
              </div>

              <div className="max-w-lg">
                <h1 className="text-4xl font-bold mb-6 text-white leading-tight">
                  Your Gateway to
                  <br />
                  Instant AI Token
                  <br />
                  Swaps
                </h1>

                <p className="text-gray-400 mb-4 text-sm">
                  Enter the realm of next-generation crypto trading with Flow Swap— a revolutionary platform where over
                  600 tokens await your instant swap without any wallet connection.
                </p>

                <p className="text-gray-400 mb-4 text-sm">
                  Designed with cutting-edge technology and an intuitive interface, Flow Swap offers lightning-fast,
                  secure transactions that simplify your trading experience while maintaining the highest standards of
                  reliability.
                </p>

                <p className="text-gray-400 mb-6 text-sm">
                  Dive into a world where decentralized finance is reimagined, empowering you to seamlessly diversify
                  your portfolio and harness new opportunities, all in a single, user-friendly environment.
                </p>

                <div className="flex space-x-3">
                  <a
                    href="https://flowswap.gitbook.io/flowswap/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FileText className="mr-1.5 h-4 w-4" />
                    Read Documentation
                  </a>
                  <a
                    href="https://x.com/Officialflows"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-transparent border border-gray-700 hover:bg-gray-800/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Twitter className="mr-1.5 h-4 w-4" />
                    Twitter
                  </a>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[50%] lg:w-[55%] p-6 flex items-center justify-center overflow-hidden relative z-10">
              <div className="bg-[#0c0c14] rounded-3xl p-8 border border-[#3b52b4]/30 relative overflow-hidden w-full max-w-md mx-auto shadow-[0_0_20px_rgba(59,82,180,0.3)] before:absolute before:inset-0 before:rounded-3xl before:border before:border-[#3b52b4]/40 before:scale-[1.01] before:animate-[pulse_4s_ease-in-out_infinite] before:z-[-1] after:absolute after:inset-[-1px] after:rounded-[1.75rem] after:bg-gradient-to-r after:from-transparent after:via-[#3b52b4]/50 after:to-transparent after:z-[-2] after:animate-[pulse_6s_ease-in-out_infinite] after:blur-[3px]">
                <h2 className="text-2xl font-medium mb-8 text-white">Transfer</h2>

                <div className="mb-6">
                  <p className="text-gray-400 mb-3">Pay</p>
                  <div className="bg-[#0f0f1a] rounded-xl p-4 border border-[#1e2033] flex items-center justify-between">
                    <button onClick={() => setShowFromTokenSelector(true)} className="flex items-center space-x-2">
                      <img src={fromToken.image || "/placeholder.svg"} alt={fromToken.name} className="w-7 h-7" />
                      <span className="font-medium text-white text-lg ml-2">{fromToken.symbol.toUpperCase()}</span>
                      <ChevronDown className="h-5 w-5 text-gray-400 ml-1" />
                    </button>
                    <input
                      type="text"
                      value={fromAmount}
                      onChange={handleFromAmountChange}
                      placeholder="0.00"
                      className="bg-transparent text-right text-xl font-normal text-white w-1/2 focus:outline-none placeholder:text-gray-500 placeholder:opacity-50"
                    />
                  </div>
                </div>

                {showMinimumWarning && (
                  <div className="mb-4 px-3 py-2 bg-red-500/10 text-red-400 text-sm rounded-lg flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-1">
                      Minimum purchase amount is ${minimumUsdAmount} (≈ {minimumTokenAmount.toFixed(6)}{" "}
                      {fromToken.symbol.toUpperCase()})
                    </span>
                  </div>
                )}

                <div className="flex justify-center my-6">
                  <div
                    className="bg-[#1a1a2e]/40 p-3 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-[#1a1a2e]/60 transition-colors"
                    onClick={swapTokens}
                  >
                    <ArrowDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-400 mb-3">Receive (Estimated)</p>
                  <div
                    className={`bg-[#0f0f1a] rounded-xl p-4 border flex items-center justify-between transition-all duration-500 relative overflow-hidden ${
                      isTokenChanging || isLoading
                        ? "border-blue-500/40 shadow-[0_0_25px_rgba(59,82,180,0.5)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:animate-[shimmer_1.5s_ease-in-out_infinite]"
                        : "border-[#1e2033]"
                    }`}
                  >
                    <button
                      onClick={() => setShowToTokenSelector(true)}
                      className="flex items-center space-x-2 relative z-10"
                    >
                      <img src={toToken.image || "/placeholder.svg"} alt={toToken.name} className="w-7 h-7" />
                      <span className="font-medium text-white text-lg ml-2">{toToken.symbol.toUpperCase()}</span>
                      <ChevronDown className="h-5 w-5 text-gray-400 ml-1" />
                    </button>
                    <div className="bg-transparent text-right text-xl font-normal text-white w-1/2 truncate relative z-10">
                      {toAmount === 0 ? "0.00" : toAmount.toFixed(8)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 flex items-center justify-end">
                    <button
                      onClick={handleRefreshRates}
                      disabled={isLoading}
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh exchange rate"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                      <span className="ml-1">Refresh</span>
                    </button>
                  </div>
                  {fromAmount && Number(fromAmount) > 0 && (
                    <div className="mt-2 text-xs text-gray-500">0.1% platform fee deducted from estimate</div>
                  )}
                </div>

                {fetchError && (
                  <div className="mb-4 px-3 py-2 bg-yellow-500/10 text-yellow-400 text-sm rounded-lg flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-1">
                      {errorMessage.includes("rate limit")
                        ? "CoinGecko API rate limit reached. Using estimated rates."
                        : errorMessage || "Rate update failed. Using last known rates."}
                    </span>
                  </div>
                )}

                <div className="mb-2">
                  <p className="text-gray-400 text-sm mb-2">Recipient Address</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Enter ${toToken.symbol} address`}
                      value={recipientAddress}
                      onChange={(e) => {
                        setRecipientAddress(e.target.value)
                        setAddressValidation(null)
                      }}
                      className={`w-full bg-transparent border ${
                        addressValidation
                          ? addressValidation.isValid
                            ? "border-green-500/50"
                            : "border-red-500/50"
                          : "border-[#1e2033]"
                      } rounded-2xl px-4 py-4 text-gray-300 focus:outline-none h-[60px]`}
                    />
                    {isValidatingAddress && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                      </div>
                    )}
                    {addressValidation && !isValidatingAddress && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {addressValidation.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {addressValidation && !isValidatingAddress && (
                  <div
                    className={`mb-6 px-4 py-2 rounded-xl text-sm ${
                      addressValidation.isValid ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {addressValidation.message}
                  </div>
                )}

                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-400">Minimum amount</p>
                  <p className="text-white">{minimumAmount}</p>
                </div>

                <button
                  onClick={validateWalletAddress}
                  disabled={isValidatingAddress}
                  className={`w-full ${
                    isValidatingAddress
                      ? "bg-[#1e2033] cursor-not-allowed"
                      : !fromAmount
                        ? "bg-[#2d4380] hover:bg-[#3a5296] cursor-pointer"
                        : !recipientAddress || (addressValidation && !addressValidation.isValid)
                          ? "bg-[#2d4380] hover:bg-[#3a5296] cursor-pointer"
                          : addressValidation?.isValid
                            ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                            : "bg-[#2d4380] hover:bg-[#3a5296] cursor-pointer"
                  } text-white py-4 rounded-xl transition-colors font-medium text-lg`}
                >
                  {isValidatingAddress ? (
                    <>
                      <Loader2 className="inline animate-spin mr-2 h-5 w-5" />
                      Validating Address...
                    </>
                  ) : Number(fromAmount) < minimumTokenAmount && Number(fromAmount) > 0 ? (
                    `Minimum ${minimumUsdAmount}$ Required`
                  ) : !fromAmount ? (
                    "Enter Amount"
                  ) : !recipientAddress || (addressValidation && !addressValidation.isValid) ? (
                    "Enter Valid Address"
                  ) : addressValidation?.isValid ? (
                    "Swap"
                  ) : (
                    "Enter Valid Address"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:ml-[270px]">
          <HowToUseSection />
        </div>


        <div className="w-full md:ml-[270px]">
          <MentexSection />
        </div>

        {showFromTokenSelector && (
          <TokenSelector onSelectToken={handleSelectFromToken} onClose={() => setShowFromTokenSelector(false)} />
        )}

        {showToTokenSelector && (
          <TokenSelector onSelectToken={handleSelectToToken} onClose={() => setShowToTokenSelector(false)} />
        )}

        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          fromAmount={Number(fromAmount) || 0}
          fromToken={fromToken}
          toAmount={toAmount}
          toToken={toToken}
          recipientAddress={recipientAddress}
        />
      </motion.div>
    </AnimatePresence>
  )
}
