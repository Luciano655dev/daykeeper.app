import { brand } from "../brand"

export default function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen"
      style={{ background: brand.paper, color: brand.ink }}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-14">
        <div className="w-full max-w-[28rem]">{children}</div>
      </div>
    </main>
  )
}
