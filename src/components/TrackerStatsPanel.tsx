import { useTranslation } from 'react-i18next'
import type { TrackerBoard } from '../types'
import { boardStats } from '../tracker'
import { CardsIcon, ClockIcon, CheckboxCheckedIcon, WarningIcon } from './icons'

interface Props {
  board: TrackerBoard
}

function StatCard({ icon, label, value, warn }: { icon: React.ReactNode; label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5">
      <span className={warn ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}>{icon}</span>
      <div className="min-w-0">
        <div className={`text-lg font-semibold tabular-nums leading-tight ${warn ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-50'}`}>
          {value}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{label}</div>
      </div>
    </div>
  )
}

export default function TrackerStatsPanel({ board }: Props) {
  const { t } = useTranslation()
  const stats = boardStats(board)

  return (
    <div className="mb-6" data-testid="stats-panel">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard icon={<CardsIcon className="w-4 h-4" />} label={t('stats.totalCards')} value={stats.totalCards} />
        <StatCard
          icon={<ClockIcon className="w-4 h-4" />}
          label={t('stats.overdue')}
          value={stats.overdueCount}
          warn={stats.overdueCount > 0}
        />
        <StatCard
          icon={<CheckboxCheckedIcon className="w-4 h-4" />}
          label={t('stats.checklist')}
          value={stats.checklist.total > 0 ? `${stats.checklist.done}/${stats.checklist.total}` : t('stats.checklistNone')}
        />
        <StatCard
          icon={<WarningIcon className="w-4 h-4" />}
          label={t('stats.wipViolations')}
          value={stats.wipViolations}
          warn={stats.wipViolations > 0}
        />
      </div>
      {stats.totalCards > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 px-1 text-[11px] text-gray-500 dark:text-gray-400">
          {stats.perColumn.map(col => (
            <span key={col.columnId}>
              <span className="font-medium text-gray-700 dark:text-gray-300">{col.name}</span>: {col.count}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
