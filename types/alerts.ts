export type AlertType = "warning" | "danger" | "info" | "success"

export interface AlertItem {
  id: string
  type: AlertType
  title: string
  message: string
  date: Date
  read: boolean
}
