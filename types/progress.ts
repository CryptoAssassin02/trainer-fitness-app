export interface ProgressCheckin {
  id?: string
  user_id: string
  check_in_date: string
  weight: number
  body_fat?: number | null
  measurements?: {
    chest?: number
    waist?: number
    hips?: number
    biceps?: number
    thighs?: number
  } | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProgressStats {
  weightChange: number
  bodyFatChange?: number
  measurementChanges?: {
    chest?: number
    waist?: number
    hips?: number
    biceps?: number
    thighs?: number
  }
  startDate: string
  endDate: string
} 