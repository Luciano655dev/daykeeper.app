export function normalizeUsername(value: unknown): string {
  return String(value || "").trim().toLowerCase()
}

export function isSameUsername(a: unknown, b: unknown): boolean {
  const ua = normalizeUsername(a)
  const ub = normalizeUsername(b)
  if (!ua || !ub) return false
  return ua === ub
}
