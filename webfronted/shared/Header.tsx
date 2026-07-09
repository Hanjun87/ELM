import type React from 'react';

function BackArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export interface HeaderProps {
  /** Page title shown centered when no children are passed */
  title?: string;
  /** Back button handler. When set, a circular back arrow appears on the left. */
  onBack?: () => void;
  /** Custom content replacing the centered title + left/right layout */
  children?: React.ReactNode;
  /** Optional action slot anchored to the right edge */
  rightAction?: React.ReactNode;
  /** Transparent backdrop for hero-image overlays (e.g. StoreDetail) */
  transparent?: boolean;
  /** Extra class appended to the <header> element */
  className?: string;
}

/**
 * Fixed top header used across all four ELM apps.
 *
 * Layout:
 *   [back?]  [title | children]  [rightAction?]
 *
 * - Fixed at top, does not scroll with page content.
 * - Solid white backdrop with a soft drop shadow (no border line).
 * - Height: 56px (h-14). Content below must account for it (pt-14 / mt-14).
 */
export default function Header({ title, onBack, children, rightAction, transparent, className = '' }: HeaderProps) {
  const base = transparent
    ? 'fixed top-0 left-0 w-full z-50 flex items-center px-3'
    : 'fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 z-50 flex items-center px-3';

  const styling = transparent
    ? ''
    : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]';

  return (
    <header className={`${base} ${styling} ${className}`}>
      {/* Left slot — back button or spacer */}
      <div className="w-9 flex-shrink-0 flex items-center">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="返回"
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all -ml-1"
          >
            <BackArrow />
          </button>
        ) : (
          <span className="w-9" />
        )}
      </div>

      {/* Center slot */}
      {children ? (
        <div className="flex-1 min-w-0">{children}</div>
      ) : (
        <h1 className="flex-1 text-center text-[17px] font-bold text-gray-900 truncate select-none">
          {title}
        </h1>
      )}

      {/* Right slot */}
      <div className="w-9 flex-shrink-0 flex items-center justify-end">
        {rightAction ?? <span className="w-9" />}
      </div>
    </header>
  );
}
