import type React from "react"
import "./globals.css"

// Update the metadata export to include comprehensive website information
export const metadata = {
  title: "Flow Swap | AI-Powered Token Swap Platform",
  description:
    "Flow Swap is a revolutionary platform for instant AI token swaps with enhanced privacy and security. Swap over 600 tokens without wallet connection.",
  keywords: "crypto, token swap, cryptocurrency exchange, AI swap, blockchain, flow swap, ghost swap",
  authors: [{ name: "Flow Swap Team" }],
  creator: "Flow Swap",
  publisher: "Flow Swap",
  openGraph: {
    title: "Flow Swap | AI-Powered Token Swap Platform",
    description:
      "Instant AI token swaps with enhanced privacy and security. Swap over 600 tokens without wallet connection.",
    url: "https://flowswap.vercel.app",
    siteName: "Flow Swap",
  },
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove any fake chart elements
              function removeUnwantedElements() {
                try {
                  // Remove elements containing "Real-time data and insights for cryptocurrency markets"
                  const elements = document.querySelectorAll('*')
                  elements.forEach(el => {
                    if (el.textContent && el.textContent.includes('Real-time data and insights for cryptocurrency markets')) {
                      const container = el.closest('div[class*="bg-"]')
                      if (container && container.innerHTML.includes('Price Chart')) {
                        container.remove()
                      }
                    }
                  })
                  
                  // Remove specific selectors
                  const selectors = [
                    'body > div > div:nth-child(4) > div',
                    '[class*="token-data-section"]',
                    'div[class*="w-full bg-[#0a0b14] py-16"]'
                  ]
                  selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector)
                    elements.forEach(el => {
                      if (el && el.innerHTML && el.innerHTML.includes('Token Analytics')) {
                        el.remove()
                      }
                    })
                  })
                } catch (e) {}
              }
              
              // Run immediately and after DOM changes
              setTimeout(removeUnwantedElements, 500)
              setTimeout(removeUnwantedElements, 2000)
              
              // Observer for dynamic content
              if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(removeUnwantedElements)
                observer.observe(document.body, { childList: true, subtree: true })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
