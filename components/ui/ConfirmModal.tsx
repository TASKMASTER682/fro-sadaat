'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const variantStyles = {
  danger:  { btn: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30', icon: 'text-red-400 bg-red-400/10' },
  warning: { btn: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30', icon: 'text-amber-400 bg-amber-400/10' },
  default: { btn: 'btn-gold', icon: 'text-clan-gold bg-clan-gold/10' },
};

export default function ConfirmModal({
  isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', onConfirm, onCancel, isLoading,
}: ConfirmModalProps) {
  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50
                       w-full md:w-auto md:max-w-md md:rounded-2xl glass-panel rounded-none md:rounded-2xl border-0 md:border border-clan-border 
                       p-5 md:p-6 flex flex-col justify-center items-center"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
                <AlertTriangle size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-cinzel text-foreground font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{message}</p>
              </div>
              <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="btn-ghost text-sm px-4 py-2.5 flex-1 md:flex-none">
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`text-sm px-5 py-2.5 rounded-lg font-medium transition-all flex-1 md:flex-none ${styles.btn} disabled:opacity-50`}
              >
                {isLoading ? 'Processing…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
