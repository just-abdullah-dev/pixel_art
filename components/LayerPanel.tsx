'use client';

import { Layer } from '@/lib/types';

interface LayerPanelProps {
  layers: Layer[];
  currentLayerIndex: number;
  onLayerSelect: (index: number) => void;
  onLayerAdd: () => void;
  onLayerDelete: (index: number) => void;
  onLayerToggleVisibility: (index: number) => void;
  onLayerOpacityChange: (index: number, opacity: number) => void;
  onLayerRename: (index: number, name: string) => void;
}

export default function LayerPanel({
  layers,
  currentLayerIndex,
  onLayerSelect,
  onLayerAdd,
  onLayerDelete,
  onLayerToggleVisibility,
  onLayerOpacityChange,
  onLayerRename,
}: LayerPanelProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Layers</h3>
        <button
          onClick={onLayerAdd}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition"
          title="Add Layer"
        >
          + New
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`p-2 rounded cursor-pointer transition ${
              currentLayerIndex === index
                ? 'bg-purple-600 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
            onClick={() => onLayerSelect(index)}
          >
            <div className="flex items-center justify-between mb-1">
              <input
                type="text"
                value={layer.name}
                onChange={(e) => {
                  e.stopPropagation();
                  onLayerRename(index, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-transparent border-none outline-none text-sm font-medium w-24 ${
                  currentLayerIndex === index ? 'text-white' : 'text-gray-200'
                }`}
              />
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggleVisibility(index);
                  }}
                  className="p-1 hover:bg-gray-700 rounded text-xs"
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? '👁️' : '🙈'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (layers.length > 1) {
                      onLayerDelete(index);
                    }
                  }}
                  className={`p-1 hover:bg-red-600 rounded text-xs ${
                    layers.length === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={layers.length === 1 ? 'Cannot delete last layer' : 'Delete Layer'}
                  disabled={layers.length === 1}
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs">Opacity:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={layer.opacity}
                onChange={(e) => onLayerOpacityChange(index, parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs w-8">{Math.round(layer.opacity * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
