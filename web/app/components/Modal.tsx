import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type modalSize = "sm" | "md" | "lg" | "xl"

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: modalSize
  children: React.ReactNode
}

const sizes:Record<modalSize, string> = {
    sm: 'w-80',
    md: 'w-96', 
    lg: 'w-[560px]', 
    xl: 'w-[720px]',
}

export default function Modal({isOpen, onClose, title, size = 'md', children}: ModalProps) {
      return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/20 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className={`bg-white border border-neutral-200 rounded-2xl shadow-xl font-mp ${sizes[size]}`}
          >
            {title && (
              <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-800 text-base">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors hover:scale-105 hover:cursor-pointer p-1 rounded-lg hover:bg-neutral-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="px-6 py-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}