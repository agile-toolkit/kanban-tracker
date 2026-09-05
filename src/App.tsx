import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Screen, TrackerBoard } from './types'
import { loadBoards, saveBoards, writeLastSession } from './storage'
import { parsePrefillBoard, parseBoardFromHash } from './boardImport'
import AppHeader from './components/AppHeader'
import ThemeToggle from './components/ThemeToggle'
import FacilitatorToggle from './components/FacilitatorToggle'
import { useFacilitatorMode } from './components/useFacilitatorMode'
import BoardHome from './components/BoardHome'
import TrackerBoardView from './components/TrackerBoardView'
import TrackerStatsPanel from './components/TrackerStatsPanel'
import { KanbanIcon, ChartIcon } from './components/icons'

// A board handed off via #board= (this app's own share format, matching
// Kanban Designer's) or ?prefill= (a one-shot cross-app handoff, e.g. a
// future "Open in Kanban Tracker" link) is consumed once at load and
// merged into the saved list, same pattern as Kanban Designer's own
// App.tsx.
const _handoffBoard = parseBoardFromHash(window.location.hash) ?? parsePrefillBoard(window.location.search)
if (_handoffBoard && window.location.search.includes('prefill=')) {
  window.history.replaceState(null, '', window.location.pathname + window.location.hash)
}

export default function App() {
  const { t } = useTranslation()
  const [facilitatorMode, toggleFacilitatorMode] = useFacilitatorMode('agile-toolkit:facilitatorMode')

  const [boards, setBoards] = useState<TrackerBoard[]>(() => {
    const stored = loadBoards()
    if (!_handoffBoard) return stored
    const merged = [_handoffBoard, ...stored]
    saveBoards(merged)
    return merged
  })
  const [screen, setScreen] = useState<Screen>(_handoffBoard ? 'board' : 'home')
  const [activeBoardId, setActiveBoardId] = useState<string | null>(_handoffBoard?.id ?? null)
  const [showStats, setShowStats] = useState(true)

  const activeBoard = boards.find(b => b.id === activeBoardId) ?? null

  const persist = (next: TrackerBoard[]) => {
    setBoards(next)
    saveBoards(next)
  }

  const handleImport = (board: TrackerBoard) => {
    const next = [board, ...boards]
    persist(next)
    writeLastSession(board, next)
    setActiveBoardId(board.id)
    setScreen('board')
  }

  const handleOpen = (id: string) => {
    setActiveBoardId(id)
    setScreen('board')
  }

  const handleDelete = (id: string) => {
    persist(boards.filter(b => b.id !== id))
    if (activeBoardId === id) {
      setActiveBoardId(null)
      setScreen('home')
    }
  }

  const handleBoardChange = (updated: TrackerBoard) => {
    const next = boards.map(b => b.id === updated.id ? updated : b)
    persist(next)
    writeLastSession(updated, next)
  }

  const navItems = screen === 'board'
    ? [{ key: 'home', label: t('nav.home'), active: false, onClick: () => setScreen('home') }]
    : []

  return (
    <div className="min-h-screen flex flex-col" data-accent="teal">
      <div className="print:hidden">
        <AppHeader
          title={t('app.title')}
          onTitleClick={() => setScreen('home')}
          hideLanguagePicker={facilitatorMode}
          navItems={facilitatorMode ? [] : navItems}
        >
          <ThemeToggle />
          <FacilitatorToggle
            active={facilitatorMode}
            onToggle={toggleFacilitatorMode}
            labelOn={t('facilitator.toggle_on')}
            labelOff={t('facilitator.toggle_off')}
          />
        </AppHeader>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {screen === 'home' && (
          <BoardHome boards={boards} onImport={handleImport} onOpen={handleOpen} onDelete={handleDelete} />
        )}

        {screen === 'board' && activeBoard && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <KanbanIcon className="w-5 h-5 text-brand-500 flex-shrink-0" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 truncate flex-1">{activeBoard.name}</h1>
              {!facilitatorMode && (
                <button
                  type="button"
                  onClick={() => setShowStats(v => !v)}
                  aria-pressed={showStats}
                  aria-label={showStats ? t('stats.hide') : t('stats.show')}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-1.5 ${
                    showStats
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400'
                      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                  }`}
                >
                  <ChartIcon className="w-3.5 h-3.5" />
                  {t('stats.label')}
                </button>
              )}
            </div>
            {showStats && !facilitatorMode && <TrackerStatsPanel board={activeBoard} />}
            <TrackerBoardView board={activeBoard} onChange={handleBoardChange} />
          </div>
        )}
      </main>
    </div>
  )
}
