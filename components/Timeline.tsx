'use client';

import { Frame } from '@/lib/types';

interface TimelineProps {
  frames: Frame[];
  currentFrameIndex: number;
  onFrameSelect: (index: number) => void;
  onFrameAdd: () => void;
  onFrameDelete: (index: number) => void;
  onFrameDurationChange: (index: number, duration: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export default function Timeline({
  frames,
  currentFrameIndex,
  onFrameSelect,
  onFrameAdd,
  onFrameDelete,
  onFrameDurationChange,
  isPlaying,
  onPlayToggle,
}: TimelineProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Animation Timeline</h3>
        <div className="flex gap-2">
          <button
            onClick={onPlayToggle}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
            title={isPlaying ? 'Stop' : 'Play'}
          >
            {isPlaying ? '⏸️ Stop' : '▶️ Play'}
          </button>
          <button
            onClick={onFrameAdd}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition"
            title="Add Frame"
          >
            + Frame
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            className="flex-shrink-0"
          >
            <div
              onClick={() => onFrameSelect(index)}
              className={`w-24 h-24 border-2 rounded cursor-pointer p-2 transition ${
                currentFrameIndex === index
                  ? 'border-purple-500 bg-gray-600'
                  : 'border-gray-500 bg-gray-800 hover:border-gray-400'
              }`}
            >
              <div className="text-xs text-gray-300 mb-1">Frame {index + 1}</div>
              <div className="text-xs text-gray-400">{frame.duration}ms</div>
            </div>

            <div className="mt-1 flex gap-1">
              <input
                type="number"
                value={frame.duration}
                onChange={(e) => onFrameDurationChange(index, parseInt(e.target.value) || 100)}
                onClick={(e) => e.stopPropagation()}
                className="w-16 px-1 py-0.5 text-xs bg-gray-600 text-white rounded border border-gray-500"
                min="50"
                step="50"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (frames.length > 1) {
                    onFrameDelete(index);
                  }
                }}
                className={`px-2 py-0.5 text-xs rounded transition ${
                  frames.length === 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                title={frames.length === 1 ? 'Cannot delete last frame' : 'Delete Frame'}
                disabled={frames.length === 1}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
