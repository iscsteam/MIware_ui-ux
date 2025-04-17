// src/components/WorkflowNode.tsx
import React from 'react';
import { NodeType } from './workflow-context'; // Adjust path

// Define styles mapping - using Record for type safety
const nodeStyles: Record<NodeType | 'DEFAULT', string> = {
  READ: 'bg-blue-100 border-blue-500',
  WRITE: 'bg-green-100 border-green-500',
  COPY: 'bg-yellow-100 border-yellow-500',
  CREATE: 'bg-purple-100 border-purple-500',
  start: 'bg-gray-100 border-gray-500 rounded-full',
  END: 'bg-red-100 border-red-500 rounded-full',
  DEFAULT: 'bg-gray-200 border-gray-400',
};

// Define props interface
interface WorkflowNodeProps {
  type: NodeType;
  id: string;
  onClick: (id: string, type: NodeType) => void; // Function prop signature
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ type, id, onClick }) => {
  const baseStyle = 'p-4 border-2 rounded shadow-md cursor-pointer hover:shadow-lg transition-shadow min-w-[100px] text-center';
  // Ensure type exists in nodeStyles, otherwise use DEFAULT
  const typeStyle = nodeStyles[type] ?? nodeStyles.DEFAULT;

  const handleClick = () => {
    onClick(id, type);
  };

  // Type the event handler for accessibility
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') { // Also trigger on spacebar
        event.preventDefault(); // Prevent scrolling on spacebar
        handleClick();
    }
  }

  return (
    <div
      className={`${baseStyle} ${typeStyle}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0} // Make it focusable
      aria-label={`Node type ${type}`} // Better accessibility
    >
      <span className="font-semibold">{type}</span>
      {/* You could add an icon here too */}
    </div>
  );
};

export default WorkflowNode;