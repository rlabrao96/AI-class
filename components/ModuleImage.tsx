interface ModuleImageProps {
  src: string
  alt: string
  caption?: string
}

export function ModuleImage({ src, alt, caption }: ModuleImageProps) {
  return (
    <figure className="my-8 not-prose">
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg border border-gray-200"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-gray-500 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
