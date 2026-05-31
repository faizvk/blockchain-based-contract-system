import { useEffect, useRef } from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog and restore it when the modal closes — keeps
    // keyboard users from being stranded back at the document root.
    previouslyFocused.current = document.activeElement;
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-surface-200 focus:outline-none"
      >
        <div className="px-5 py-4 border-b border-surface-100">
          <h3 id="modal-title" className="font-semibold text-surface-900">
            {title}
          </h3>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-surface-100 bg-surface-50/60 rounded-b-2xl flex flex-col sm:flex-row justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
