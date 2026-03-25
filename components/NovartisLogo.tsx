interface NovartisLogoProps {
  className?: string
  width?: number
  showText?: boolean
}

export function NovartisLogo({ className = '', width = 180, showText = true }: NovartisLogoProps) {
  const aspectRatio = showText ? 4.2 : 1.1
  const height = width / aspectRatio

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showText ? '0 0 420 100' : '0 0 110 100'}
      width={width}
      height={height}
      className={className}
      aria-label="Novartis"
    >
      {/* Flame icon */}
      <g transform="translate(10, 5) scale(0.9)">
        {/* Orange/red left flame */}
        <path
          d="M30 95 C10 70, 5 50, 20 30 C25 22, 30 15, 35 5 C38 15, 36 28, 40 38 C44 28, 42 18, 45 10 C48 25, 55 40, 55 55 C55 75, 45 90, 30 95Z"
          fill="#E03C31"
        />
        {/* Yellow inner flame */}
        <path
          d="M32 95 C18 78, 15 60, 25 42 C28 36, 32 28, 35 20 C37 28, 36 36, 39 44 C42 36, 40 28, 43 22 C45 32, 48 42, 48 52 C48 72, 42 88, 32 95Z"
          fill="#F0AB00"
        />
        {/* Blue pen/flame center */}
        <path
          d="M42 95 C42 95, 48 70, 48 50 C48 35, 45 22, 42 10 C42 8, 42 5, 42 2 C42 5, 42 8, 42 10 C39 22, 36 35, 36 50 C36 70, 42 95, 42 95Z"
          fill="#0460A9"
        />
      </g>

      {showText && (
        <text
          x="115"
          y="68"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="52"
          fontWeight="400"
          fill="#0460A9"
          letterSpacing="4"
        >
          NOVARTIS
        </text>
      )}
    </svg>
  )
}
