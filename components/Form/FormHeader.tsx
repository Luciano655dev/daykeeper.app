import { brand } from "../brand"

export default function FormHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-5 text-center">
      <h1
        className="text-2xl font-semibold tracking-tight"
        style={{ color: brand.ink }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm" style={{ color: brand.slate }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
