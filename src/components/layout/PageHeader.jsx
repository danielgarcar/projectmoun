/**
 * PageHeader
 * Props:
 *   title       – string (required)
 *   subtitle    – string (optional)
 *   rightSlot   – ReactNode (optional, e.g. avatar button)
 *   leftSlot    – ReactNode (optional, e.g. back button)
 *   transparent – boolean (skip glass bg)
 */
export default function PageHeader({
  title,
  subtitle,
  rightSlot,
  leftSlot,
  transparent = false,
}) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4"
      style={{
        height: '60px',
        background: transparent ? 'transparent' : 'rgba(10,10,10,0.92)',
        backdropFilter: transparent ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(12px)',
        borderBottom: transparent ? 'none' : '1px solid var(--color-border)',
      }}
    >
      {/* Left */}
      <div className="w-10 flex items-center justify-start">
        {leftSlot ?? <span />}
      </div>

      {/* Center */}
      <div className="flex flex-col items-center">
        <h1
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              marginTop: '1px',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right */}
      <div className="w-10 flex items-center justify-end">
        {rightSlot ?? <span />}
      </div>
    </header>
  );
}
