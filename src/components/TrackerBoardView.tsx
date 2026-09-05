import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TrackerBoard } from '../types'
import { moveCard, toggleChecklistItem, updateCardFields, addChecklistItem, removeChecklistItem, wipStatus } from '../tracker'
import TrackerCardItem from './TrackerCardItem'
import { WarningIcon } from './icons'

interface Props {
  board: TrackerBoard
  onChange: (board: TrackerBoard) => void
}

export default function TrackerBoardView({ board, onChange }: Props) {
  const { t } = useTranslation()
  const [dragCard, setDragCard] = useState<{ cardId: string; fromColumnId: string } | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

  const handleMove = (cardId: string, fromColumnId: string, toColumnId: string) => {
    onChange(moveCard(board, cardId, fromColumnId, toColumnId))
  }

  const handleDrop = (toColumnId: string) => {
    if (dragCard && dragCard.fromColumnId !== toColumnId) {
      handleMove(dragCard.cardId, dragCard.fromColumnId, toColumnId)
    }
    setDragCard(null)
    setDragOverColumnId(null)
  }

  const handleToggleChecklistItem = (columnId: string, cardId: string, itemId: string) => {
    onChange(toggleChecklistItem(board, columnId, cardId, itemId))
  }

  const handleUpdateFields = (columnId: string, cardId: string, patch: { dueDate?: string; assignee?: string }) => {
    onChange(updateCardFields(board, columnId, cardId, patch))
  }

  const handleAddChecklistItem = (columnId: string, cardId: string, text: string) => {
    onChange(addChecklistItem(board, columnId, cardId, text))
  }

  const handleRemoveChecklistItem = (columnId: string, cardId: string, itemId: string) => {
    onChange(removeChecklistItem(board, columnId, cardId, itemId))
  }

  if (board.columns.length === 0) {
    return <p className="text-center text-gray-400 dark:text-gray-600 py-12 text-sm">{t('board.noColumns')}</p>
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {board.columns.map(column => {
        const status = wipStatus(column)
        const otherColumns = board.columns.filter(c => c.id !== column.id)
        return (
          <div key={column.id} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{column.name}</h2>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums rounded-full px-2 py-0.5 ${
                  status === 'over'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {status === 'over' && <WarningIcon className="w-3 h-3" />}
                {column.wipLimit != null ? `${column.cards.length}/${column.wipLimit}` : column.cards.length}
              </span>
            </div>
            {board.showWipWarnings && status === 'over' && (
              <p className="text-[11px] text-red-600 dark:text-red-400 px-1 mb-2">{t('board.wipExceeded')}</p>
            )}
            <div
              className={`space-y-2 min-h-[2rem] rounded-xl transition-colors ${
                dragOverColumnId === column.id && dragCard?.fromColumnId !== column.id
                  ? 'bg-brand-50 dark:bg-brand-950/30 ring-2 ring-inset ring-brand-300 dark:ring-brand-700'
                  : ''
              }`}
              onDragOver={e => {
                if (!dragCard) return
                e.preventDefault()
                setDragOverColumnId(column.id)
              }}
              onDragLeave={() => setDragOverColumnId(current => (current === column.id ? null : current))}
              onDrop={e => {
                e.preventDefault()
                handleDrop(column.id)
              }}
            >
              {column.cards.length === 0 ? (
                <p className="text-xs text-gray-300 dark:text-gray-700 px-1 py-2 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  {t('board.emptyColumn')}
                </p>
              ) : (
                column.cards.map(card => (
                  <TrackerCardItem
                    key={card.id}
                    card={card}
                    column={column}
                    otherColumns={otherColumns}
                    dragging={dragCard?.cardId === card.id}
                    onMove={toColumnId => handleMove(card.id, column.id, toColumnId)}
                    onToggleChecklistItem={itemId => handleToggleChecklistItem(column.id, card.id, itemId)}
                    onUpdateFields={patch => handleUpdateFields(column.id, card.id, patch)}
                    onAddChecklistItem={text => handleAddChecklistItem(column.id, card.id, text)}
                    onRemoveChecklistItem={itemId => handleRemoveChecklistItem(column.id, card.id, itemId)}
                    onDragStart={() => setDragCard({ cardId: card.id, fromColumnId: column.id })}
                    onDragEnd={() => {
                      setDragCard(null)
                      setDragOverColumnId(null)
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
