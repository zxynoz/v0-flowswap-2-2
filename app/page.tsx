"use client"

import { motion } from "framer-motion"
import { Star, Zap, Shield, Repeat } from "lucide-react"
import Sidebar from "@/components/sidebar"
import MobileHeader from "@/components/mobile-header"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-[#0a0b14]">
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#3b52b4]/10 blur-[120px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#7b52ff]/5 blur-[150px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-[60%] right-[30%] w-[200px] h-[200px] rounded-full bg-[#52a5ff]/10 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <MobileHeader />
      <Sidebar />

      {/* Main Content - Removed all padding to eliminate gap between sidebar and content */}
      <div className="flex-1 md:ml-[270px] relative z-10">
        <div className="min-h-screen">
          <div className="space-y-12">
            {/* Top Section - Text and Stats */}
            <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start p-6 md:p-8 lg:p-12">
              {/* Left Side - Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Trustpilot Rating */}
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-green-500 fill-green-500" />
                  <span className="text-gray-300 font-medium text-sm">Trustpilot</span>
                  <div className="flex gap-1 ml-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-blue-500 fill-blue-500" />
                    ))}
                  </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Flow Swap - faster than
                  <br />
                  you think
                </h1>

                {/* Subheading */}
                <p className="text-gray-400 text-base md:text-lg">We choose to be the best - you make the choice</p>

                {/* CTA Button */}
                <Link href="/swap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-medium text-base transition-all shadow-lg shadow-blue-500/30"
                  >
                    Exchange
                  </motion.button>
                </Link>
              </motion.div>

              {/* Right Side - Stats Container */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full lg:w-[600px]"
              >
                <div className="relative rounded-3xl overflow-hidden border border-gray-800/50 bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-gray-900/40 backdrop-blur-xl shadow-2xl">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>

                  {/* Header */}
                  <div className="px-6 py-5 border-b border-gray-800/50">
                    <h3 className="text-gray-400 text-base font-medium">All time</h3>
                  </div>

                  {/* Stats Grid */}
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/50 hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Total trading volume</span>
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                      <p className="text-white text-3xl font-bold">$4,682,770</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/50 hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Number of exchanges</span>
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-white text-3xl font-bold">10,919</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/50 hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">Number of exchange pairs</span>
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-white text-3xl font-bold">4,300</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/50 hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">The biggest exchange</span>
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-white text-3xl font-bold">$42,381</p>
                    </motion.div>
                  </div>

                  <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
                </div>
              </motion.div>
            </div>

            {/* Video Section - Prominently displayed in center */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full px-6 md:px-8 lg:px-12"
            >
              <div className="relative rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
                <video autoPlay loop muted playsInline className="w-full h-auto max-h-[500px] object-contain bg-black">
                  <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coin-carousel-hXCdO2shZMtTSwpP5ADtKX62l5JUnv.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>

            {/* Feature Cards Section - Added below video */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid md:grid-cols-3 gap-6 px-6 md:px-8 lg:px-12 pb-12"
            >
              {/* Speed Card */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-xl font-bold">Speed</h3>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">Instant exchange through full automation</p>
              </div>

              {/* Security Card */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-xl font-bold">Security</h3>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Strict protection methods to ensure the security of your funds
                </p>
              </div>

              {/* Usability Card */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-xl font-bold">Usability</h3>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Repeat className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  A user-friendly interface simplifies cryptocurrency exchange
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
