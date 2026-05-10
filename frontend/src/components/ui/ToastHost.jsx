import { useApp } from '../../context/AppContext'

export default function ToastHost() {
  const { toasts, dismissToast } = useApp()

  if (!toasts.length) return null

  return (
    <div className="toast-host">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type || 'error'}`}>
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            {toast.message && <div className="toast-message">{toast.message}</div>}
          </div>
          <button type="button" className="toast-close" onClick={() => dismissToast(toast.id)}>x</button>
        </div>
      ))}
    </div>
  )
}
