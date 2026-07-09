import React, { useState, useEffect } from 'react';

interface ModalState { open: boolean; title: string; desc: string; body: React.ReactNode; onConfirm: (() => void) | null }
let modal: ModalState = { open: false, title: '', desc: '', body: null, onConfirm: null };
const listeners = new Set<() => void>();

export function showModal(title: string, desc: string, body: React.ReactNode, onConfirm?: () => void) {
  modal = { open: true, title, desc, body, onConfirm: onConfirm || null };
  document.body.style.overflow = 'hidden';
  listeners.forEach(fn => fn());
}
export function closeModal() {
  modal = { open: false, title: '', desc: '', body: null, onConfirm: null };
  document.body.style.overflow = '';
  listeners.forEach(fn => fn());
}
export function confirmModal() {
  if (modal.onConfirm) modal.onConfirm();
  closeModal();
}

export default function Modal() {
  const [, update] = useState(0);
  useEffect(() => {
    const fn = () => update(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  if (!modal.open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={closeModal}>
      <div className="bg-white rounded-2xl w-[calc(100%-48px)] max-w-md p-6 shadow-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-[17px] text-gray-900 mb-2">{modal.title}</h3>
        {modal.desc && <p className="text-[12px] text-gray-500 mb-4">{modal.desc}</p>}
        <div className="mb-4">{modal.body}</div>
        <div className="flex gap-3">
          <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-[14px]">取消</button>
          <button onClick={confirmModal} className="flex-1 py-3 rounded-xl bg-[#0085FF] text-white font-bold text-[14px]">确认</button>
        </div>
      </div>
    </div>
  );
}
