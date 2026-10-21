const currency = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function useClientFormatting() {
  function formatAmount(value) {
    const amount = Number(value)
    return Number.isFinite(amount) ? currency.format(amount) : '—'
  }

  function getClientName(client) {
    return client.name?.trim() || 'Unnamed client'
  }

  return { formatAmount, getClientName }
}
