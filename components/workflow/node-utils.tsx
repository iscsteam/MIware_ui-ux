"use client"

import type { NodeType } from "./workflow-context"

export function getNodeIcon(type: NodeType) {
  const iconSize = "h-10 w-10"

  const iconMap: Record<NodeType, string> = {
    start: "/play-button.png",
    "create-file": "/create.png",
    "read-file": "/read.png",
    "write-file": "/write.png",
    "copy-file": "copy.png",
    end: "/stop.png",
    code: "/icons/code.png", 
  }

  const src = iconMap[type]

  return <img src={src} alt={type} className={iconSize} draggable={false} />
}