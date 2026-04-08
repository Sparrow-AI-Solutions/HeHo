"use client"

import React from "react"

const featuredItems = [
  {
    name: "Startup Fame",
    url: "https://startupfa.me/s/heho.vercel.app-863?utm_source=heho.vercel.app",
    img: "https://startupfa.me/badges/featured/default.webp",
    alt: "heho.vercel.app - Featured on Startup Fame",
    width: 171,
    height: 54,
  },
  {
    name: "Product Hunt",
    url: "https://www.producthunt.com/products/heho?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-heho",
    img: "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1118506&theme=light&t=1775628653295",
    alt: "HeHo - The AI-Powered Backend Orchestrator | Product Hunt",
    width: 250,
    height: 54,
  },
  {
    name: "AI Directories",
    url: "https://www.aidirectori.es",
    img: "https://cdn.aidirectori.es/ai-tools/badges/dark-mode.png",
    alt: "AI Directories Badge",
    width: 171,
    height: 54,
  },
]

export function FeaturedOn() {
  return (
    <section className="py-12 bg-background overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl font-bold text-center text-foreground">Featured on</h2>
      </div>
      <div className="relative flex overflow-x-hidden">
        <div className="py-4 animate-marquee whitespace-nowrap flex items-center">
          {/* First set of items */}
          {featuredItems.map((item, idx) => (
            <a
              key={`set1-${idx}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-12 transition-opacity hover:opacity-80 inline-block"
            >
              <img
                src={item.img}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="h-12 w-auto grayscale hover:grayscale-0 transition-all"
              />
            </a>
          ))}
          {/* Duplicate set for infinite loop */}
          {featuredItems.map((item, idx) => (
            <a
              key={`set2-${idx}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-12 transition-opacity hover:opacity-80 inline-block"
            >
              <img
                src={item.img}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="h-12 w-auto grayscale hover:grayscale-0 transition-all"
              />
            </a>
          ))}
          {/* Third set to ensure no gaps on large screens */}
          {featuredItems.map((item, idx) => (
            <a
              key={`set3-${idx}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-12 transition-opacity hover:opacity-80 inline-block"
            >
              <img
                src={item.img}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="h-12 w-auto grayscale hover:grayscale-0 transition-all"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
