'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  COLORS,
  ConfigBox,
  getFinalResult,
  getFinalResultText,
  getResultColor,
  type MagiApiResponse,
  type MagiUnit,
  MagiUnitCard
} from '@/components/magi'

// ランダムなハッシュ文字列を生成
const _generateHash = () => Math.random().toString(16).slice(2, 10)

const INITIAL_UNITS: MagiUnit[] = [
  {
    name: 'BALTHASAR',
    fullName: 'BALTHASAR-2',
    role: 'Mother - 母としての人格',
    modelName: 'GPT-4o',
    modelId: 'gpt-4o',
    vote: 'PENDING',
    confidence: 0,
    reason: '',
    status: 'PENDING',
    revealed: false
  },
  {
    name: 'CASPER',
    fullName: 'CASPER-3',
    role: 'Woman - 女としての人格',
    modelName: 'GPT-4o',
    modelId: 'gpt-4o',
    vote: 'PENDING',
    confidence: 0,
    reason: '',
    status: 'PENDING',
    revealed: false
  },
  {
    name: 'MELCHIOR',
    fullName: 'MELCHIOR-1',
    role: 'Scientist - 科学者としての人格',
    modelName: 'GPT-4o-mini',
    modelId: 'gpt-4o-mini',
    vote: 'PENDING',
    confidence: 0,
    reason: '',
    status: 'PENDING',
    revealed: false
  }
]

const ResultContent = () => {
  const searchParams = useSearchParams()
  const question = searchParams.get('q') || 'No question provided'
  const [bootPhase, setBootPhase] = useState(0)
  const [magiUnits, setMagiUnits] = useState<MagiUnit[]>(INITIAL_UNITS)
  const [showResult, setShowResult] = useState(false)
  const [showVetoMessage, setShowVetoMessage] = useState(false)

  useEffect(() => {
    const fetchMagiDecision = async () => {
      // Boot phaseアニメーション
      const bootInterval = setInterval(() => {
        setBootPhase((prev) => Math.min(prev + 1, 4))
      }, 300)

      try {
        const response = await fetch('/api/magi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: decodeURIComponent(question) })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch MAGI decision')
        }

        const data: MagiApiResponse = await response.json()
        clearInterval(bootInterval)
        setBootPhase(4)

        // 順番に結果を表示: GPT(BALTHASAR) → GEMINI(CASPER) → CLAUDE(MELCHIOR)
        const voteOrder = [
          { index: 0, data: data.balthasar },
          { index: 1, data: data.casper },
          { index: 2, data: data.melchior }
        ]

        voteOrder.forEach(({ index, data: unitData }, order) => {
          // Thinking状態に
          setTimeout(() => {
            setMagiUnits((prev) => prev.map((unit, i) => (i === index ? { ...unit, status: 'THINKING' } : unit)))
          }, order * 800)

          // 結果表示
          setTimeout(
            () => {
              setMagiUnits((prev) =>
                prev.map((unit, i) =>
                  i === index
                    ? {
                        ...unit,
                        vote: unitData.vote,
                        confidence: unitData.confidence,
                        reason: unitData.reason,
                        status: 'COMPLETED',
                        revealed: true
                      }
                    : unit
                )
              )
            },
            (order + 1) * 800
          )
        })

        setTimeout(() => setShowResult(true), (voteOrder.length + 1) * 800)
        setTimeout(() => setShowVetoMessage(true), (voteOrder.length + 1) * 800 + 400)
      } catch (error) {
        console.error('Error fetching MAGI decision:', error)
        clearInterval(bootInterval)
      }
    }

    fetchMagiDecision()
  }, [question])

  const finalResult = getFinalResult(magiUnits)
  const allCompleted = magiUnits.every((u) => u.status === 'COMPLETED')

  return (
    <div className='min-h-screen bg-black font-mono select-none relative' style={{ color: COLORS.primary }}>
      <main className='min-h-screen flex flex-col px-4 md:px-8 py-6 max-w-7xl mx-auto'>
        {/* ヘッダー */}
        <header className='mb-6'>
          <Link href='/'>
            <h1 className='text-2xl md:text-3xl font-bold font-matisse cursor-pointer hover:opacity-70 transition-opacity'>
              MAGI SYSTEM v1.1
            </h1>
          </Link>
          <div className='flex flex-wrap gap-4 md:gap-8 mt-2 text-xs md:text-sm'>
            <span>STATUS: {allCompleted ? 'COMPLETED' : 'THINKING'}</span>
            <span>BOOT PHASE: {bootPhase}/4</span>
          </div>
        </header>

        {/* 提訴・決議エリア */}
        <div className='flex gap-4 mb-6'>
          {/* Config Box (デスクトップのみ枠の外側左に表示) */}
          <ConfigBox result={finalResult} isCompleted={allCompleted} />

          <div className='border-2 p-4 md:p-6 flex-1' style={{ borderColor: COLORS.primary }}>
            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
              {/* 提訴(質問) */}
              <div className='flex-1'>
                <div className='text-2xl md:text-3xl font-matisse font-bold mb-3' style={{ color: COLORS.yellow }}>
                  提訴決議
                </div>
                <p className='text-base md:text-xl font-matisse leading-relaxed' style={{ color: COLORS.whiteBright }}>
                  {decodeURIComponent(question)}
                </p>
              </div>

              {/* 決議(結果) */}
              <div className='text-right md:text-left'>
                <motion.div
                  className='inline-block p-0.5'
                  style={{
                    border: `2px solid ${allCompleted ? getResultColor(finalResult) : COLORS.yellow}`
                  }}
                  animate={allCompleted ? { opacity: [0, 1] } : { opacity: [1, 0, 1] }}
                  transition={
                    allCompleted
                      ? { duration: 0.5, ease: 'easeIn' }
                      : { duration: 0.8, repeat: Number.POSITIVE_INFINITY }
                  }
                >
                  <div
                    className='px-3 py-1 text-3xl md:text-4xl font-matisse font-bold'
                    style={{
                      color: allCompleted ? getResultColor(finalResult) : COLORS.yellow,
                      border: `2px solid ${allCompleted ? getResultColor(finalResult) : COLORS.yellow}`
                    }}
                  >
                    {allCompleted ? getFinalResultText(finalResult) : '審議中'}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* 拒否権発動メッセージ */}
        {showVetoMessage &&
          (() => {
            const vetoUnit = magiUnits.find((u) => u.vote === 'NO' && u.confidence >= 90)
            // 他の2つが承認している場合のみメッセージを表示
            const otherUnits = magiUnits.filter((u) => u.name !== vetoUnit?.name)
            const wouldHaveApproved = otherUnits.every((u) => u.vote === 'YES')

            return vetoUnit && wouldHaveApproved ? (
              <motion.div
                className='mb-6 border-2 p-4 text-center'
                style={{ borderColor: COLORS.redBright, backgroundColor: 'rgba(200, 0, 16, 0.1)' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div
                  className='flex items-center justify-center gap-2 text-2xl md:text-3xl font-matisse font-bold'
                  style={{ color: COLORS.redBright }}
                >
                  VETO ACTIVATED
                </div>
                <div className='mt-2 text-sm font-matisse md:text-xl' style={{ color: COLORS.whiteBright }}>
                  {vetoUnit.name} が否決しました
                </div>
              </motion.div>
            ) : null
          })()}

        {/* MAGIユニットカード */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
          {magiUnits.map((unit) => (
            <MagiUnitCard key={unit.name} unit={unit} />
          ))}
        </div>

        {/* 戻るボタン */}
        {showResult && (
          <div className='mt-6 text-center'>
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
        )}
      </main>
    </div>
  )
}

const ResultPage = () => {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-black flex items-center justify-center'>
          <div className='text-xl animate-pulse' style={{ color: COLORS.primary }}>
            INITIALIZING MAGI SYSTEM...
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}

export default ResultPage
