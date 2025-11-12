"use client"

import { useState, useEffect } from "react"
import { ArrowRightLeft, Shield, Wallet } from "lucide-react"

export default function MentexSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0b14] via-[#0f1018] to-[#141824] opacity-90 z-0"></div>

      <div className="max-w-5xl ml-0 md:ml-8 relative z-10">
        <div
          className={`transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"} max-w-6xl ml-0`}
        >
          <div className="text-left mb-8">
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs mb-3">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
              INTRODUCING FLOWBIT
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Future of Token Swapping</h2>
            <p className="text-gray-400 max-w-2xl mr-auto text-base">
              FlowBit is revolutionizing the way you trade cryptocurrencies with lightning-fast swaps, enhanced
              security, and an intuitive interface designed for both beginners and experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full max-w-6xl mx-auto">
            {/* Left side - GIF and stats */}
            <div className="relative">
              <div className="w-full ml-0">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl p-1 shadow-lg shadow-blue-500/20 w-full md:w-11/12">
                  <div className="bg-[#0c0c14]/80 backdrop-blur-md rounded-3xl overflow-hidden">
                    <video
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Animation%20-%201743564978510-9Tah0HvfEX1nrn4yFMv0xA93vKVNrm.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-auto rounded-3xl"
                    />
                  </div>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#0c0c14]/80 backdrop-blur-sm border border-gray-800/30 rounded-xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-white mb-1">600+</div>
                  <div className="text-gray-400 text-sm">Supported Tokens</div>
                </div>
                <div className="bg-[#0c0c14]/80 backdrop-blur-sm border border-gray-800/30 rounded-xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-white mb-1">3</div>
                  <div className="text-gray-400 text-sm">Swap Modes</div>
                </div>
                <div className="bg-[#0c0c14]/80 backdrop-blur-sm border border-gray-800/30 rounded-xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-white mb-1">0.1%</div>
                  <div className="text-gray-400 text-sm">Low Fees</div>
                </div>
                <div className="bg-[#0c0c14]/80 backdrop-blur-sm border border-gray-800/30 rounded-xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-gray-400 text-sm">Support</div>
                </div>
              </div>
            </div>

            {/* Right side - Features */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Key Features</h3>

              {/* Feature cards */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0c0c14] border border-gray-800/30 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <ArrowRightLeft className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-white">Instant Token Swaps</h4>
                      <p className="text-gray-400 mt-2">
                        Swap any supported cryptocurrency in seconds with minimal slippage and competitive rates across
                        multiple blockchains.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0c0c14] border border-gray-800/30 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <Wallet className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-white">Ghost-Swap Privacy</h4>
                      <p className="text-gray-400 mt-2">
                        Our unique Ghost-Swap technology ensures your transactions remain private and secure, with
                        optional anonymity features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0c0c14] border border-gray-800/30 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-white">Security First</h4>
                      <p className="text-gray-400 mt-2">
                        Advanced encryption and multi-signature technology protect your assets at every step of the
                        transaction process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Get in touch section */}
          <div className="mt-20 pt-16 pb-12 border-t border-gray-800/30 text-center">
            <div className="relative mb-20"></div>

            <div className="text-sm text-gray-500">
              2024 © powered by{" "}
              <a href="https://x.com/Officialflows" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Flow Swap
              </a>{" "}
              • Website by{" "}
              <a href="https://x.com/Officialflows" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Flow Swap Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
