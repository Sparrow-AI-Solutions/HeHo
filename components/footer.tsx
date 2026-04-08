"use client"

import { HeHoLogo } from "./heho-logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-card/30 border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <HeHoLogo className="mb-4" />
            <p className="text-muted-foreground mb-6 max-w-md">
              HeHo is an AI-powered platform for building intelligent chatbots, autonomous backends, and custom APIs. Connect your database and deploy in minutes.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="https://startupfa.me/s/heho.vercel.app-863?utm_source=heho.vercel.app" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                <img src="https://startupfa.me/badges/featured/default.webp" alt="heho.vercel.app - Featured on Startup Fame" width="171" height="54" className="h-auto" />
              </a>
              <a href="https://www.producthunt.com/products/heho?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-heho" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1118506&theme=light&t=1775628653295" alt="HeHo - The AI-Powered Backend Orchestrator | Product Hunt" width="250" height="54" className="h-auto" />
              </a>

            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-foreground transition-colors">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/models" className="hover:text-foreground transition-colors">
                  AI Models
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>HeHo is defined and owned by Sparrow AI Solutions 2026 HeHo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
