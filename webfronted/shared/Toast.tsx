import { useState, useEffect } from 'react';

let toastMsg = '';
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

export function toast(msg: string) {
  toastMsg = msg;
  listeners.forEach(fn => fn());
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg = ''; listeners.forEach(fn => fn()); }, 2000);
}

export default function Toast() {
  const [, update] = useState(0);
  useEffect(() => {
    const fn = () => update(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  if (!toastMsg) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
      <div className="bg-gray-800 text-white px-5 py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap shadow-lg">{toastMsg}</div>
    </div>
  );
}
