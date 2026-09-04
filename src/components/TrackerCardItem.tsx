import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TrackerCard, TrackerColumn } from '../types'
import { daysInColumn, isOverdue, checklistProgress } from '../tracker'
import { CalendarIcon, PersonIcon, ClockIcon, TagIcon, CheckboxEmptyIcon, CheckboxCheckedIcon, ArrowRightIcon } from './icons'

interface Props {
  card: TrackerCard
  column: TrackerColumn
  otherColumns: TrackerColumn[]
  onMove: (toColumnId: string) => void
  onToggleChecklistItem: (itemId: string) => void
}

export default function TrackerCardItem({ card, column, otherColumns, onMove, onToggleChecklistItem }: Props) {
  const { t } = useTranslation()
  const [checklistOpen, setChecklistOpen] = useState(false)
  const overdue = isOverdue(card)
  const age = daysInColumn(card)
  const progress = checklistProgress(card)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-sm" style={card.color ? { borderLeftColor: card.color, borderLeftWidth: 3 } : undefined}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">{card.title}</h3>
        {age > 0 && (
          <span className="flex-shrink-0 inline-flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500" title={t('card.ageTitle', { days: age })}>
            <ClockIcon className="w-3 h-3" />
            {age}{t('card.days')}
          </span>
        )}
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

      {progress && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setChecklistOpen(v => !v)}
            className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
          >
            {t('card.checklistProgress', { done: progress.done, total: progress.total })}
          </button>
          {checklistOpen && (
            <ul className="mt-1.5 space-y-1">
              {card.checklist!.map(item => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onToggleChecklistItem(item.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50 w-full text-left"
                  >
                    {item.done
                      ? <CheckboxCheckedIcon className="w-3.5 h-3.5 flex-shrink-0 text-brand-600" />
                      : <CheckboxEmptyIcon className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />}
                    <span className={item.done ? 'line-through text-gray-400 dark:text-gray-500' : ''}>{item.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
