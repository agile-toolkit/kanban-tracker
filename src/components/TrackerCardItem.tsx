import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TrackerCard, TrackerColumn } from '../types'
import { daysInColumn, isOverdue, checklistProgress } from '../tracker'
import {
  CalendarIcon, PersonIcon, ClockIcon, TagIcon, CheckboxEmptyIcon, CheckboxCheckedIcon,
  ArrowRightIcon, EditIcon, CloseIcon, CheckIcon,
} from './icons'

interface Props {
  card: TrackerCard
  column: TrackerColumn
  otherColumns: TrackerColumn[]
  onMove: (toColumnId: string) => void
  onToggleChecklistItem: (itemId: string) => void
  onUpdateFields: (patch: { dueDate?: string; assignee?: string }) => void
  onAddChecklistItem: (text: string) => void
  onRemoveChecklistItem: (itemId: string) => void
}

export default function TrackerCardItem({
  card, column, otherColumns, onMove, onToggleChecklistItem,
  onUpdateFields, onAddChecklistItem, onRemoveChecklistItem,
}: Props) {
  const { t } = useTranslation()
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [editingFields, setEditingFields] = useState(false)
  const [dueDateInput, setDueDateInput] = useState(card.dueDate ?? '')
  const [assigneeInput, setAssigneeInput] = useState(card.assignee ?? '')
  const [newItemText, setNewItemText] = useState('')

  const overdue = isOverdue(card)
  const age = daysInColumn(card)
  const progress = checklistProgress(card)

  const startEditingFields = () => {
    setDueDateInput(card.dueDate ?? '')
    setAssigneeInput(card.assignee ?? '')
    setEditingFields(true)
  }

  const saveFields = () => {
    onUpdateFields({
      dueDate: dueDateInput.trim() || undefined,
      assignee: assigneeInput.trim() || undefined,
    })
    setEditingFields(false)
  }

  const handleAddItem = () => {
    if (!newItemText.trim()) return
    onAddChecklistItem(newItemText)
    setNewItemText('')
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-sm" style={card.color ? { borderLeftColor: card.color, borderLeftWidth: 3 } : undefined}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">{card.title}</h3>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {age > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500" title={t('card.ageTitle', { days: age })}>
              <ClockIcon className="w-3 h-3" />
              {age}{t('card.days')}
            </span>
          )}
          {!editingFields && (
            <button
              type="button"
              onClick={startEditingFields}
              aria-label={t('card.editFields')}
              className="text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {card.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{card.description}</p>
      )}

      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded px-1.5 py-0.5">
              <TagIcon className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {editingFields ? (
        <div className="flex flex-col gap-1.5 mb-2 p-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <input
              type="date"
              value={dueDateInput}
              onChange={e => setDueDateInput(e.target.value)}
              className="flex-1 min-w-0 bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <PersonIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <input
              type="text"
              value={assigneeInput}
              onChange={e => setAssigneeInput(e.target.value)}
              placeholder={t('card.assigneePlaceholder')}
              className="flex-1 min-w-0 bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </label>
          <div className="flex justify-end gap-2 mt-0.5">
            <button type="button" onClick={() => setEditingFields(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <CloseIcon className="w-4 h-4" />
            </button>
            <button type="button" onClick={saveFields} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
              <CheckIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        (card.dueDate || card.assignee) && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {card.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] rounded px-1.5 py-0.5 ${
                  overdue
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                <CalendarIcon className="w-3 h-3" />
                {card.dueDate}
                {overdue && <span className="font-medium">{t('card.overdue')}</span>}
              </span>
            )}
            {card.assignee && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <PersonIcon className="w-3 h-3" />
                {card.assignee}
              </span>
            )}
          </div>
        )
      )}

      <div className="mb-2">
        <button
          type="button"
          onClick={() => setChecklistOpen(v => !v)}
          className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
        >
          {progress ? t('card.checklistProgress', { done: progress.done, total: progress.total }) : t('card.addChecklist')}
        </button>
        {checklistOpen && (
          <div className="mt-1.5 space-y-1">
            {card.checklist?.map(item => (
              <div key={item.id} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 group">
                <button
                  type="button"
                  onClick={() => onToggleChecklistItem(item.id)}
                  className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                >
                  {item.done
                    ? <CheckboxCheckedIcon className="w-3.5 h-3.5 flex-shrink-0 text-brand-600" />
                    : <CheckboxEmptyIcon className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />}
                  <span className={`truncate ${item.done ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>{item.text}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveChecklistItem(item.id)}
                  aria-label={t('card.removeChecklistItem', { text: item.text })}
                  className="flex-shrink-0 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-0.5">
              <input
                type="text"
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem() } }}
                placeholder={t('card.addChecklistItemPlaceholder')}
                className="flex-1 min-w-0 text-xs bg-transparent border-b border-dashed border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none focus:border-brand-400 py-0.5"
              />
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!newItemText.trim()}
                aria-label={t('card.addChecklistItem')}
                className="flex-shrink-0 text-brand-600 hover:text-brand-700 dark:text-brand-400 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold leading-none px-1"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {otherColumns.length > 0 && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
          <ArrowRightIcon className="w-3 h-3 text-gray-300 dark:text-gray-600 flex-shrink-0" />
          <select
            value=""
            onChange={e => { if (e.target.value) onMove(e.target.value) }}
            aria-label={t('card.moveTo', { column: column.name })}
            className="flex-1 text-xs bg-transparent text-gray-500 dark:text-gray-400 border-none focus:outline-none focus:ring-1 focus:ring-brand-400 rounded cursor-pointer"
          >
            <option value="">{t('card.moveTo', { column: column.name })}</option>
            {otherColumns.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
