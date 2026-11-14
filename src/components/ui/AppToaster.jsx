// src/components/ui/AppToaster.jsx — ერთადერთი შეტყობინებების კონტეინერი მთელ საიტზე
// 3 წამში ქრება ავტომატურად, ყოველ შეტყობინებას აქვს X ღილაკი
import React from 'react';
import { Toaster, ToastBar, toast } from 'react-hot-toast';

const DURATION = 3000;

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: DURATION,
        success: { duration: DURATION },
        error: { duration: DURATION },
        loading: { duration: Infinity },
      }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            maxWidth: '92vw',
          }}
        >
          {({ icon, message }) => (
            <>
              {icon}
              <div className="flex-1 min-w-0 break-words">{message}</div>
              {t.type !== 'loading' && (
                <button
                  type="button"
                  onClick={() => toast.dismiss(t.id)}
                  aria-label="დახურვა"
                  className="ml-2 shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
