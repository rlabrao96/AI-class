interface Label {
  text: string
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  style?: 'default' | 'accent' | 'dark' | 'success' | 'warning' | 'danger'
}

interface ModuleImageProps {
  src: string
  alt: string
  caption?: string
  labels?: Label[]
}

const POSITION_CLASSES: Record<Label['position'], string> = {
  'top-left': 'top-3 left-3',
  'top-center': 'top-3 left-1/2 -translate-x-1/2',
  'top-right': 'top-3 right-3',
  'center-left': 'top-1/2 left-3 -translate-y-1/2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'center-right': 'top-1/2 right-3 -translate-y-1/2',
  'bottom-left': 'bottom-3 left-3',
  'bottom-center': 'bottom-3 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-3 right-3',
}

const STYLE_CLASSES: Record<NonNullable<Label['style']>, string> = {
  default: 'bg-white/90 text-gray-800 border border-gray-200',
  accent: 'bg-novartis-blue/90 text-white',
  dark: 'bg-gray-900/85 text-white',
  success: 'bg-emerald-600/90 text-white',
  warning: 'bg-amber-500/90 text-white',
  danger: 'bg-red-600/90 text-white',
}

export function ModuleImage({ src, alt, caption, labels }: ModuleImageProps) {
  return (
    <figure className="my-8 not-prose">
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className="w-full rounded-lg border border-gray-200"
          loading="lazy"
        />
        {labels?.map((label, idx) => (
          <span
            key={idx}
            className={`absolute px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm backdrop-blur-sm ${POSITION_CLASSES[label.position]} ${STYLE_CLASSES[label.style ?? 'default']}`}
          >
            {label.text}
          </span>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-gray-500 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
