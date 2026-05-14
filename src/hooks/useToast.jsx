import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
});

const iconsByType = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timeout = timeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = 'info' }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, title, message, type }]);

      const timeout = window.setTimeout(() => removeToast(id), 3600);
      timeouts.current.set(id, timeout);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-3">
          <AnimatePresence>
            {toasts.map((toast) => {
              const Icon = iconsByType[toast.type] || Info;

              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: -20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  className="pointer-events-auto rounded-[1.6rem] border border-white/10 bg-slate-950/95 p-4 shadow-soft backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-violet-500/15 p-2 text-violet-200">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{toast.title}</p>
                      {toast.message ? <p className="mt-1 text-sm text-slate-300">{toast.message}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeToast(toast.id)}
                      className="rounded-full p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
