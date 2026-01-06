'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { COLORS, getFinalResult, getFinalResultText, getVoteText } from '@/components/magi'

type MagiHistoryEntry = {
  id: string
  timestamp: string
  question: string
  melchior: {
    vote: 'YES' | 'NO'
    confidence: number
    reason: string
  }
  balthasar: {
    vote: 'YES' | 'NO'
    confidence: number
    reason: string
  }
  casper: {
    vote: 'YES' | 'NO'
    confidence: number
    reason: string
  }
}

const HistoryPage = () => {
  const [history, setHistory] = useState<MagiHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/magi/history')
        const data = await response.json()
        setHistory(data.history || [])
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-xl animate-pulse' style={{ color: COLORS.primary }}>
          LOADING HISTORY...
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black font-mono select-none' style={{ color: COLORS.primary }}>
      <main className='min-h-screen flex flex-col px-4 md:px-8 py-6 max-w-7xl mx-auto'>
        {/* ヘッダー */}
        <header className='mb-6'>
          <Link href='/'>
            <h1 className='text-2xl md:text-3xl font-bold font-matisse cursor-pointer hover:opacity-70 transition-opacity'>
              MAGI SYSTEM v1.1
            </h1>
          </Link>
          <div className='flex flex-wrap gap-4 md:gap-8 mt-2 text-xs md:text-sm'>
            <span>HISTORY LOG</span>
            <span>TOTAL: {history.length}</span>
          </div>
        </header>

        {/* 履歴一覧 */}
        {history.length === 0 ? (
          <div className='text-center py-12' style={{ color: COLORS.whiteBright }}>
            NO HISTORY RECORDS
          </div>
        ) : (
          <div className='space-y-4'>
            {history.map((entry) => {
              const units = [
                { name: 'MELCHIOR', ...entry.melchior },
                { name: 'BALTHASAR', ...entry.balthasar },
                { name: 'CASPER', ...entry.casper }
              ]
              const finalResult = getFinalResult(
                units.map((u) => ({
                  ...u,
                  status: 'COMPLETED' as const,
                  revealed: true,
                  fullName: '',
                  role: '',
                  modelName: '',
                  modelId: ''
                }))
              )

              return (
                <Link
                  key={entry.id}
                  href={`/result?q=${encodeURIComponent(entry.question)}`}
                  className='block border-2 p-4 hover:opacity-70 transition-opacity'
                  style={{ borderColor: COLORS.primary }}
                >
                  <div className='flex justify-between items-start gap-4'>
                    <div className='flex-1'>
                      <div className='text-xs mb-2' style={{ color: COLORS.yellow }}>
                        {new Date(entry.timestamp).toLocaleString('ja-JP')}
                      </div>
                      <div className='text-base md:text-lg font-matisse' style={{ color: COLORS.whiteBright }}>
                        {entry.question}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div
                        className='text-xl md:text-2xl font-bold font-matisse px-3 py-1 border-2'
                        style={{
                          color: finalResult === 'AGREE' ? COLORS.blueBright : COLORS.redBright,
                          borderColor: finalResult === 'AGREE' ? COLORS.blueBright : COLORS.redBright
                        }}
                      >
                        {getFinalResultText(finalResult)}
                      </div>
                      <div className='text-xs mt-2 space-x-2'>
                        {units.map((unit) => (
                          <span
                            key={unit.name}
                            style={{
                              color: unit.vote === 'YES' ? COLORS.blueBright : COLORS.redBright
                            }}
                          >
                            {unit.name}: {getVoteText(unit.vote)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* 戻るボタン */}
        <div className='mt-auto pt-12 text-center'>
          <Link
            href='/'
            className='inline-block border-2 px-8 py-2 hover:text-black transition-colors font-bold'
            style={{ borderColor: COLORS.primary, color: COLORS.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            NEW QUERY
          </Link>
        </div>
      </main>
    </div>
  )
}

export default HistoryPage
