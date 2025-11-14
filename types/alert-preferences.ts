export interface AlertPreference {
  id: string
  name: string
  description: string
  enabled: boolean
  threshold?: number
}
