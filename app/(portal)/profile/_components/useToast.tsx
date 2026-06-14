'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function useToast() {
  const [visible, setVisible] = useState(false)

  const showToast = useCallback(() => {
    setVisible(true)
    setTimeout(() => setVisible(false), 2800)
  }, [])

  const ToastEl = visible ? (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg bg-gray-900 text-white px-4 py-2.5 text-[13px] shadow-lg animate-in slide-in-from-bottom-2 duration-200">
      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
      Saved successfully
    </div>
  ) : null

  return { showToast, ToastEl }
}
