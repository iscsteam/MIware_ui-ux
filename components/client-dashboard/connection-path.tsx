"use client"

interface Node {
  id: string
  type: string
  x: number
  y: number
  label: string
  status?: "idle" | "running" | "success" | "error"
}

interface ConnectionPathProps {
  from: Node
  to: Node
  status?: string
}

export function ConnectionPath({ from, to, status }: ConnectionPathProps) {
  // Calculate connection points
  const fromX = from.x + 128 // Node width (32 * 4)
  const fromY = from.y + 40 // Half node height (20 * 4 / 2)
  const toX = to.x
  const toY = to.y + 40

  // Control points for Bezier curve
  const controlOffset = Math.abs(toX - fromX) * 0.5
  const fromControlX = fromX + controlOffset
  const toControlX = toX - controlOffset

  const pathData = `M ${fromX},${fromY} C ${fromControlX},${fromY} ${toControlX},${toY} ${toX},${toY}`

  const getPathColor = () => {
    switch (status) {
      case "success":
        return "#22c55e" // green-500
      case "error":
        return "#ef4444" // red-500
      case "running":
        return "#3b82f6" // blue-500
      default:
        return "#6b7280" // gray-500
    }
  }

  const getPathAnimation = () => {
    if (status === "running") {
      return {
        strokeDasharray: "8 4",
        animation: "dash 1s linear infinite",
      }
    }
    return {}
  }

  return (
    <>
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -12;
          }
        }
      `}</style>

      {/* Shadow/glow effect */}
      <path d={pathData} stroke={getPathColor()} strokeWidth="6" fill="none" opacity="0.3" filter="url(#glow)" />

      {/* Main path */}
      <path d={pathData} stroke={getPathColor()} strokeWidth="2" fill="none" style={getPathAnimation()} />

      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrow-${from.id}-${to.id}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={getPathColor()} />
        </marker>
      </defs>

      <path
        d={pathData}
        stroke={getPathColor()}
        strokeWidth="2"
        fill="none"
        markerEnd={`url(#arrow-${from.id}-${to.id})`}
        style={getPathAnimation()}
      />
    </>
  )
}
