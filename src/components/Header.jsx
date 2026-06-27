// Header fijo en la parte superior de cada sección
export function Header({ title, subtitle, action }) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-rim"
      style={{
        backgroundColor: 'rgba(9, 9, 15, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h1
            className="text-lg font-bold text-ink leading-none"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-dim mt-1">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">{action}</div>
        )}
      </div>
    </header>
  )
}
