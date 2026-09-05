import { useTranslation } from 'react-i18next'
import { loadDesignerBoards, formatRelativeTime } from '../designerImport'
import { unwrapBoardImport } from '../boardImport'
import type { TrackerBoard } from '../types'
import { KanbanIcon, ArrowRightIcon, LinkIcon } from './icons'

interface Props {
  onImport: (board: TrackerBoard) => void
}

const KANBAN_DESIGNER_URL = 'https://agile-toolkit.github.io/kanban-designer/'

/**
 * Reuses the existing "Don't have a board yet? Design one in Kanban
 * Designer" hint (unchanged copy/keys) as the only way forward when no
 * Designer boards are found — see ux-design.md's empty-state wireframe.
 */
function DesignHint() {
  const { t } = useTranslation()
  return (
    <p className="text-xs text-gray-400 dark:text-gray-600 flex items-start justify-center gap-1.5">
      <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
      <span>
        {t('import.designHint')}{' '}
        <a href={KANBAN_DESIGNER_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-300">
          {t('import.designLink')}
        </a>
      </span>
    </p>
  )
}

export default function ImportPanel({ onImport }: Props) {
  const { t, i18n } = useTranslation()
  const designerBoards = loadDesignerBoards()

  return (
    <div className="card max-w-lg mx-auto">
      <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">{t('import.title')}</h2>

      {designerBoards.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('import.explainer')}</p>
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('import.designerBoardsHeading')}</h3>
          <div className="border border-gray-100 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
            {designerBoards.map(entry => {
              const cardCount = entry.columns.reduce((sum, col) => sum + col.cards.length, 0)
              const meta = entry.updatedAt !== undefined
                ? t('import.designerBoardMeta', {
                    columns: entry.columns.length,
                    cards: cardCount,
                    time: formatRelativeTime(entry.updatedAt, i18n.language),
                  })
                : t('home.boardMeta', { columns: entry.columns.length, cards: cardCount })
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    const board = unwrapBoardImport(entry)
                    if (board) onImport(board)
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <KanbanIcon className="w-5 h-5 text-brand-500 flex-shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium text-gray-900 dark:text-gray-50 truncate">{entry.name}</span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500">{meta}</span>
                    </span>
                  </span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <KanbanIcon className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">{t('import.emptyHeading')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('import.emptySubtitle')}</p>
          <DesignHint />
        </div>
      )}
    </div>
  )
}
