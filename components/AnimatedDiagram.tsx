interface AnimatedDiagramProps {
  children: React.ReactNode
}

export function AnimatedDiagram({ children }: AnimatedDiagramProps) {
  return (
    <div className="w-full border border-[#e4e4e7] rounded-lg p-4 bg-white overflow-auto">
      {children}
    </div>
  )
}
