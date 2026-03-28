export const WAHA_URL = process.env.WAHA_URL || 'https://waha-production-0fb7.up.railway.app'
export const WAHA_API_KEY = process.env.WAHA_API_KEY || 'd1c64646dfbc495db8741dae2cb22594'

export const getWahaHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Api-Key': WAHA_API_KEY,
})
