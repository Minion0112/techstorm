import type { ReactNode } from "react"

export interface Section {
  id: string
  title?: string
  subtitle?: ReactNode
  content?: string
  showButton?: boolean
  buttonText?: string
  customContent?: ReactNode
}

export interface SectionProps {
  id: string
  title?: string
  subtitle?: React.ReactNode
  content?: string
  isActive?: boolean
  showButton?: boolean
  buttonText?: string
  customContent?: React.ReactNode
  background?: React.ReactNode
}
