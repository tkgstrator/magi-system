'use client'

import { Info } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { MagiUnit } from './types'
import { COLORS, getCardBackgroundColor, getCardBorderColor, getStatusText, getVoteText } from './utils'

type Props = {
  unit: MagiUnit
}

// 判断理由モーダル
const ReasonModal = ({ unit, onClose }: { unit: MagiUnit; onClose: () => void }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <motion.div
      className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role='dialog'
      aria-modal='true'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className='border-2 bg-black max-w-md w-full p-6 font-matisse'
        style={{ borderColor: COLORS.primary }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role='document'
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold' style={{ color: COLORS.primary }}>
            {unit.name}
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='hover:opacity-70 transition-opacity'
            style={{ color: COLORS.primary }}
          >
            ✕
          </button>
        </div>

        {/* TODO: モデル名表示を有効にする場合はコメントアウトを外す */}
        {/* <motion.div
          className="text-sm mb-4 font-semibold"
          style={{ color: COLORS.whiteBright }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {unit.fullName} / {unit.modelId}
        </motion.div> */}

        <motion.div
          className='mb-4'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className='text-sm mb-1 font-semibold' style={{ color: COLORS.yellow }}>
            判断
          </div>
          <div
            className='text-2xl font-bold'
            style={{
              color: unit.vote === 'YES' ? COLORS.blueBright : COLORS.redBright
            }}
          >
            {getVoteText(unit.vote)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className='text-sm mb-1 font-semibold' style={{ color: COLORS.yellow }}>
            根拠
          </div>
          <p className='text-sm leading-relaxed' style={{ color: COLORS.whiteBright }}>
            {unit.reason}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// MAGIユニットカードコンポーネント
export const MagiUnitCard = ({ unit }: Props) => {
  const [showModal, setShowModal] = useState(false)
  const isCompleted = unit.status === 'COMPLETED'

  const bgColor = isCompleted ? getCardBackgroundColor(unit.vote) : COLORS.green
  const borderColor = isCompleted ? getCardBorderColor(unit.vote) : COLORS.greenBright

  return (
    <>
      <motion.div
        className='border-2 flex flex-col'
        style={{ borderColor, backgroundColor: bgColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        layout
      >
        {/* ヘッダー部分 */}
        <div className='p-3 md:p-4 border-b-2 transition-colors duration-500' style={{ borderColor }}>
          <div className='flex justify-between items-center'>
            {/* 左側: 名前 + STATUS */}
            <div>
              <h3 className='text-xl md:text-2xl font-bold text-black font-matisse'>{unit.name}</h3>
              {/* TODO: モデル名表示を有効にする場合はコメントアウトを外す */}
              {/* <div className="text-black/80 text-xs md:text-sm font-bold mt-1">
                {unit.fullName}
              </div>
              <div className="text-black/60 text-[10px] md:text-xs mt-1 font-semibold">
                {unit.modelId}
              </div> */}
              <div className='text-black/80 text-[10px] md:text-xs mt-1 font-semibold'>
                STATUS: {getStatusText(unit.status)}
              </div>
            </div>
            {/* 右側: 承認/否定 */}
            <AnimatePresence>
              {isCompleted && (
                <motion.span
                  className='text-2xl md:text-3xl font-bold font-matisse text-black'
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {getVoteText(unit.vote)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Confidence部分 */}
        <div className='p-3 md:p-4 border-b-2 transition-colors duration-500' style={{ borderColor }}>
          <div className='text-black/60 text-xs font-semibold tracking-wider mb-2'>CONFIDENCE</div>
          {/* プログレスバー */}
          <div className='h-1.5 bg-black/30 relative overflow-hidden'>
            <motion.div
              className='h-full'
              style={{ backgroundColor: COLORS.greenBright }}
              initial={{ width: 0 }}
              animate={{ width: isCompleted ? `${unit.confidence}%` : '0%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 判断理由ボタン */}
        {isCompleted ? (
          <motion.button
            type='button'
            onClick={() => setShowModal(true)}
            className='p-3 md:p-4 bg-black/20 flex items-center justify-between text-black font-semibold text-sm hover:bg-black/30 transition-colors'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className='font-matisse'>根拠</span>
            <Info className='w-5 h-5' />
          </motion.button>
        ) : (
          <div className='p-3 md:p-4 bg-black/20'>
            <motion.div
              style={{ color: COLORS.yellow }}
              className='font-semibold text-sm font-matisse'
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              審議中...
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* モーダル */}
      <AnimatePresence>{showModal && <ReasonModal unit={unit} onClose={() => setShowModal(false)} />}</AnimatePresence>
    </>
  )
}
