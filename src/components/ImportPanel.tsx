import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parseBoardFile } from '../boardImport'
import type { TrackerBoard } from '../types'
import { UploadIcon, LinkIcon } from './icons'

interface Props {
  onImport: (board: TrackerBoard) => void
}

const KANBAN_DESIGNER_URL = 'https://agile-toolkit.github.io/kanban-designer/'

export default function ImportPanel({ onImport }: Props) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pasteText, setPasteText] = useState('')
  const [error, setError] = useState(false)

  const tryImport = (text: string) => {
    const board = parseBoardFile(text)
    if (!board) {
      setError(true)
      return
    }
    setError(false)
    setPasteText('')
    onImport(board)
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => tryImport(e.target?.result as string)
    reader.readAsText(file)
  }

  return (
    <div className="card max-w-lg mx-auto">
      <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">{t('import.title')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('import.explainer')}</p>

      <label className="btn-primary text-sm inline-flex items-center gap-2 cursor-pointer mb-4">
        <UploadIcon className="w-4 h-4" />
        {t('import.uploadButton')}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
      </label>

      <div className="mb-4">
        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('import.pasteLabel')}</label>
        <textarea
          className="input font-mono text-xs h-28 resize-none"
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
          placeholder={t('import.pastePlaceholder')}
        />
        <button
          type="button"
          onClick={() => tryImport(pasteText)}
          disabled={!pasteText.trim()}
          className="btn-secondary text-sm mt-2"
        >
          {t('import.pasteButton')}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{t('import.error')}</p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600 flex items-start gap-1.5">
        <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          {t('import.designHint')}{' '}
          <a href={KANBAN_DESIGNER_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-300">
            {t('import.designLink')}
          </a>
        </span>
      </p>
    </div>
  )
}
