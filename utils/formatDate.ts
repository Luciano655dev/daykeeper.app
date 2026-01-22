function formatDDMMYYYY(iso: string) {
  if (!iso) return ""

  const d = new Date(iso)

  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()

  let hour = d.getHours()
  const minute = String(d.getMinutes()).padStart(2, "0")
  const ampm = hour >= 12 ? "PM" : "AM"

  hour = hour % 12
  if (hour === 0) hour = 12

  const hourStr = String(hour).padStart(2, "0")

  return `${hourStr}:${minute} ${ampm}`
}

export default formatDDMMYYYY
