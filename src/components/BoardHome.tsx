import { useTranslation } from 'react-i18next'
import type { TrackerBoard } from '../types'
import ImportPanel from './ImportPanel'
import { KanbanIcon, CloseIcon } from './icons'

interface Props {
  boards: TrackerBoard[]
  onImport: (board: TrackerBoard) => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

export default function BoardHome({ boards, onImport, onOpen, onDelete }: Props) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {boards.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">{t('home.yourBoards')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {boards.map(board => {
              const cardCount = board.columns.reduce((sum, col) => sum + col.cards.length, 0)
              return (
                <div key={board.id} className="card flex items-center justify-between gap-3">
                  <button type="button" onClick={() => onOpen(board.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <KanbanIcon className="w-5 h-5 text-brand-500 flex-shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium text-gray-900 dark:text-gray-50 truncate">{board.name}</span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500">
                        {t('home.boardMeta', { columns: board.columns.length, cards: cardCount })}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(board.id)}
                    aria-label={t('home.deleteBoard', { name: board.name })}
                    className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 flex-shrink-0"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        {boards.length === 0 && (
          <div className="text-center mb-6">
            <KanbanIcon className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">{t('home.emptyHeading')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('home.emptySubtitle')}</p>
          </div>
        )}
        <ImportPanel onImport={onImport} />
      </div>
    </div>
  )
}
