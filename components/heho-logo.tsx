import Image from "next/image"

export function HeHoLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative w-12 h-12">
        <Image
          src="/app-icon.png"
          alt="HeHo Logo"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-xl font-bold text-foreground">Bacillus</span>
    </div>
  )
}
