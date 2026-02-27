import Image from "next/image"

export default function FormLogo({ src = "/logo-main.svg" }: { src?: string }) {
  return (
    <div className="mb-8 flex justify-center">
      <div className="relative h-20 w-20">
        <Image
          src={src}
          alt="DayKeeper"
          fill
          priority
          className="object-contain"
        />
      </div>
    </div>
  )
}
