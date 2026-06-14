export function formatSqft(sqft: number): string {
  return sqft.toFixed(1) + ' sqft'
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

export function formatDimensions(lengthMm: number, widthMm: number): string {
  const lengthIn = (lengthMm / 25.4).toFixed(0)
  const widthIn = (widthMm / 25.4).toFixed(0)
  return `${lengthIn} × ${widthIn} in`
}

export function formatThickness(cm: number): string {
  return `${cm} cm`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
