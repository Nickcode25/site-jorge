"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const loadingRef = useRef(loading);

  useEffect(() => {
    onCancelRef.current = onCancel;
    loadingRef.current = loading;
  }, [loading, onCancel]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loadingRef.current) onCancelRef.current();
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="confirm-dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !loading) onCancel();
    }}>
      <section ref={dialogRef} className={`confirm-dialog ${tone === "danger" ? "confirm-dialog--danger" : ""}`} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <div className="confirm-dialog__icon"><AlertTriangle aria-hidden="true" /></div>
        <button type="button" className="confirm-dialog__close" onClick={onCancel} disabled={loading} aria-label="Fechar confirmação"><X /></button>
        <span className="section-label">Confirmação necessária</span>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{message}</p>
        <footer>
          <button ref={cancelButtonRef} type="button" className="button button--outline-dark" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
          <button type="button" className={`button confirm-dialog__confirm ${tone === "danger" ? "confirm-dialog__confirm--danger" : "button--gold"}`} onClick={onConfirm} disabled={loading}>{loading ? "Aguarde..." : confirmLabel}</button>
        </footer>
      </section>
    </div>
  );
}
