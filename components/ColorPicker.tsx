'use client';

import { useState } from 'react';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

const defaultPalette = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FFD700',
  '#4B0082', '#FF6347', '#40E0D0', '#EE82EE', '#F5DEB3',
];

export default function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const addCustomColor = (color: string) => {
    if (!customColors.includes(color) && color !== currentColor) {
      setCustomColors((prev) => [...prev.slice(-9), color]);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-white font-medium mb-3">Colors</h3>

      {/* Current Color Display */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-16 h-16 border-2 border-white rounded"
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex flex-col">
            <input
              type="text"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="px-2 py-1 text-sm rounded bg-gray-600 text-white border border-gray-500 font-mono"
            />
            <button
              onClick={() => setShowCustomPicker(!showCustomPicker)}
              className="mt-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Custom
            </button>
          </div>
        </div>

        {showCustomPicker && (
          <div className="mt-2">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => {
                onColorChange(e.target.value);
                addCustomColor(e.target.value);
              }}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Default Palette */}
      <div className="mb-3">
        <p className="text-gray-300 text-xs mb-2">Palette</p>
        <div className="grid grid-cols-5 gap-1">
          {defaultPalette.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-8 h-8 rounded border-2 hover:scale-110 transition ${
                currentColor === color ? 'border-white' : 'border-gray-500'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      {customColors.length > 0 && (
        <div>
          <p className="text-gray-300 text-xs mb-2">Custom Colors</p>
          <div className="grid grid-cols-5 gap-1">
            {customColors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded border-2 hover:scale-110 transition ${
                  currentColor === color ? 'border-white' : 'border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
