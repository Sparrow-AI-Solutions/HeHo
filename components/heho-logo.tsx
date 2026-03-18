import Image from "next/image"

export function HeHoLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative w-8 h-8">
        <Image
          src="/app-icon.png"
          alt="HeHo Logo"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-xl font-bold text-foreground">HeHo</span>
    </div>
  )
}
