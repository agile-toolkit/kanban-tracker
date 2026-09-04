export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface TrackerCard {
  id: string
  title: string
  description?: string
  swimLane?: string
  color?: string
  dueDate?: string
  tags?: string[]
  assignee?: string
  /** Stamped whenever the card enters a column — powers the aging badge. */
  enteredColumnAt?: string
  checklist?: ChecklistItem[]
}

export interface TrackerColumn {
  id: string
  name: string
  wipLimit: number | null
  cards: TrackerCard[]
  subColumns?: TrackerColumn[]
  collapsed?: boolean
}

export interface TrackerBoard {
  id: string
  name: string
  columns: TrackerColumn[]
  swimLanes: string[]
  showWipWarnings: boolean
  /** Last save time, shown in the board list. */
  updatedAt?: number
}

export type Screen = 'home' | 'board'
