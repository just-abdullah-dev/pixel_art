'use client';

import { Tool } from '@/lib/types';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools: { name: Tool; label: string; icon: string }[] = [
  { name: 'pencil', label: 'Pencil', icon: '✏️' },
  { name: 'eraser', label: 'Eraser', icon: '🧹' },
  { name: 'fill', label: 'Fill Bucket', icon: '🪣' },
  { name: 'eyedropper', label: 'Eyedropper', icon: '💧' },
  { name: 'line', label: 'Line', icon: '📏' },
  { name: 'rectangle', label: 'Rectangle', icon: '⬜' },
  { name: 'circle', label: 'Circle', icon: '⭕' },
];

export default function Toolbar({ currentTool, onToolChange }: ToolbarProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-white font-medium mb-3">Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => onToolChange(tool.name)}
            className={`p-3 rounded text-sm flex flex-col items-center gap-1 transition ${
              currentTool === tool.name
                ? 'bg-purple-600 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
            title={tool.label}
          >
            <span className="text-2xl">{tool.icon}</span>
            <span className="text-xs">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
