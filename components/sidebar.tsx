"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeftRight, Layers, Ghost, Clock, Layers3, FileText, Twitter, BarChart3 } from "lucide-react"

// Custom active link styles with animation and glow effect
const activeLinkClass =
  "text-blue-400 bg-blue-500/10 relative after:absolute after:content-[''] after:w-[3px] after:h-[70%] after:bg-blue-500 after:left-0 after:top-[15%] after:rounded-r-full after:shadow-[0_0_8px_rgba(59,130,246,0.5)] before:absolute before:content-[''] before:inset-0 before:bg-gradient-to-r before:from-blue-500/20 before:to-transparent before:opacity-50 before:rounded-lg before:-z-10"

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <div className="w-[270px] h-full min-h-screen bg-[#0a0b14] border-r border-gray-800/20 p-6 hidden md:block fixed top-0 left-0 z-20 overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-1">
            <Link
              href="/"
              className={`flex items-center relative overflow-hidden transition-all duration-300 ${
                pathname === "/" ? activeLinkClass : "text-gray-400 hover:text-white hover:bg-gray-800/20"
              } px-4 py-2 rounded-lg transition-colors`}
            >
              <ArrowLeftRight
                className={`mr-3 h-5 w-5 transition-transform duration-300 ${pathname === "/" ? "scale-110" : ""}`}
              />
              <span>Swap</span>
            </Link>

            <div className="flex items-center text-gray-400 px-4 py-2 rounded-lg">
              <Layers className="mr-3 h-5 w-5" />
              <span>Multi-Swap</span>
              <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded">Soon</span>
            </div>

            <Link
              href="/ghost-swap"
              className={`flex items-center relative overflow-hidden transition-all duration-300 ${
                pathname === "/ghost-swap" ? activeLinkClass : "text-gray-400 hover:text-white hover:bg-gray-800/20"
              } px-4 py-2 rounded-lg transition-colors`}
            >
              <Ghost
                className={`mr-3 h-5 w-5 transition-transform duration-300 ${pathname === "/ghost-swap" ? "scale-110" : ""}`}
              />
              <span>Ghost-Swap</span>
            </Link>

            <Link
              href="/transactions"
              className={`flex items-center relative overflow-hidden transition-all duration-300 ${
                pathname === "/transactions" ? activeLinkClass : "text-gray-400 hover:text-white hover:bg-gray-800/20"
              } px-4 py-2 rounded-lg transition-colors`}
            >
              <Clock
                className={`mr-3 h-5 w-5 transition-transform duration-300 ${pathname === "/transactions" ? "scale-110" : ""}`}
              />
              <span>Transactions</span>
            </Link>

            <Link
              href="/analytics"
              className={`flex items-center relative overflow-hidden transition-all duration-300 ${
                pathname === "/analytics" ? activeLinkClass : "text-gray-400 hover:text-white hover:bg-gray-800/20"
              } px-4 py-2 rounded-lg transition-colors`}
            >
              <BarChart3
                className={`mr-3 h-5 w-5 transition-transform duration-300 ${pathname === "/analytics" ? "scale-110" : ""}`}
              />
              <span>Analytics</span>
            </Link>

            <div className="flex items-center text-gray-400 px-4 py-2 rounded-lg">
              <Layers3 className="mr-3 h-5 w-5" />
              <span>Staking</span>
              <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded">Soon</span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800/20 space-y-1">
            <Link
              href="https://doc.flowswap.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800/20 transition-all duration-300"
            >
              <FileText className="mr-3 h-5 w-5" />
              <span>Docs</span>
            </Link>

            <Link
              href="https://x.com/Officialflows"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800/20 transition-all duration-300"
            >
              <Twitter className="mr-3 h-5 w-5" />
              <span>Twitter</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-[270px]"></div> {/* Spacer to prevent content overlap */}
    </>
  )
}
