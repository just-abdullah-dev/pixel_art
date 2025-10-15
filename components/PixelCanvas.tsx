'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Layer, Tool } from '@/lib/types';

interface PixelCanvasProps {
  width: number;
  height: number;
  layers: Layer[];
  currentLayerIndex: number;
  currentTool: Tool;
  currentColor: string;
  onPixelChange: (layerIndex: number, x: number, y: number, color: string) => void;
  onColorPick?: (color: string) => void;
  scale?: number;
}

export default function PixelCanvas({
  width,
  height,
  layers,
  currentLayerIndex,
  currentTool,
  currentColor,
  onPixelChange,
  onColorPick,
  scale = 16,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Render the canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isLight = (x + y) % 2 === 0;
        ctx.fillStyle = isLight ? '#ffffff' : '#e5e5e5';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // Draw all visible layers
    layers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.globalAlpha = layer.opacity;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixel = layer.pixels[y]?.[x];
          if (pixel && pixel.color && pixel.color !== 'transparent') {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
      ctx.globalAlpha = 1;
    });

    // Draw grid
    ctx.strokeStyle = '#00000020';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, height * scale);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale);
      ctx.lineTo(width * scale, y * scale);
      ctx.stroke();
    }
  }, [layers, width, height, scale]);

  useEffect(() => {
    render();
  }, [render]);

  const getPixelPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);

    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return { x, y };
  };

  const drawPixel = (x: number, y: number) => {
    if (currentTool === 'pencil') {
      onPixelChange(currentLayerIndex, x, y, currentColor);
    } else if (currentTool === 'eraser') {
      onPixelChange(currentLayerIndex, x, y, 'transparent');
    } else if (currentTool === 'eyedropper') {
      const pixel = layers[currentLayerIndex]?.pixels[y]?.[x];
      if (pixel && pixel.color && onColorPick) {
        onColorPick(pixel.color);
      }
    }
  };

  const floodFill = (startX: number, startY: number, targetColor: string, fillColor: string) => {
    if (targetColor === fillColor) return;

    const layer = layers[currentLayerIndex];
    if (!layer) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const currentPixel = layer.pixels[y]?.[x];
      const currentColor = currentPixel?.color || 'transparent';

      if (currentColor !== targetColor) continue;

      visited.add(key);
      onPixelChange(currentLayerIndex, x, y, fillColor);

      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPixelPosition(e);
    if (!pos) return;

    setIsDrawing(true);
    setStartPos(pos);

    if (currentTool === 'fill') {
      const layer = layers[currentLayerIndex];
      if (!layer) return;
      const targetColor = layer.pixels[pos.y]?.[pos.x]?.color || 'transparent';
      floodFill(pos.x, pos.y, targetColor, currentColor);
    } else if (currentTool === 'pencil' || currentTool === 'eraser' || currentTool === 'eyedropper') {
      drawPixel(pos.x, pos.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPixelPosition(e);
    if (!pos) return;

    if (isDrawing && (currentTool === 'pencil' || currentTool === 'eraser')) {
      drawPixel(pos.x, pos.y);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPixelPosition(e);
    if (!pos || !startPos) {
      setIsDrawing(false);
      setStartPos(null);
      return;
    }

    if (currentTool === 'line') {
      drawLine(startPos.x, startPos.y, pos.x, pos.y);
    } else if (currentTool === 'rectangle') {
      drawRectangle(startPos.x, startPos.y, pos.x, pos.y);
    } else if (currentTool === 'circle') {
      drawCircle(startPos.x, startPos.y, pos.x, pos.y);
    }

    setIsDrawing(false);
    setStartPos(null);
  };

  const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      onPixelChange(currentLayerIndex, x, y, currentColor);

      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  };

  const drawRectangle = (x0: number, y0: number, x1: number, y1: number) => {
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    for (let x = minX; x <= maxX; x++) {
      onPixelChange(currentLayerIndex, x, minY, currentColor);
      onPixelChange(currentLayerIndex, x, maxY, currentColor);
    }
    for (let y = minY; y <= maxY; y++) {
      onPixelChange(currentLayerIndex, minX, y, currentColor);
      onPixelChange(currentLayerIndex, maxX, y, currentColor);
    }
  };

  const drawCircle = (x0: number, y0: number, x1: number, y1: number) => {
    const radius = Math.round(Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2));
    let x = radius;
    let y = 0;
    let err = 0;

    while (x >= y) {
      onPixelChange(currentLayerIndex, x0 + x, y0 + y, currentColor);
      onPixelChange(currentLayerIndex, x0 + y, y0 + x, currentColor);
      onPixelChange(currentLayerIndex, x0 - y, y0 + x, currentColor);
      onPixelChange(currentLayerIndex, x0 - x, y0 + y, currentColor);
      onPixelChange(currentLayerIndex, x0 - x, y0 - y, currentColor);
      onPixelChange(currentLayerIndex, x0 - y, y0 - x, currentColor);
      onPixelChange(currentLayerIndex, x0 + y, y0 - x, currentColor);
      onPixelChange(currentLayerIndex, x0 + x, y0 - y, currentColor);

      if (err <= 0) {
        y += 1;
        err += 2 * y + 1;
      }
      if (err > 0) {
        x -= 1;
        err -= 2 * x + 1;
      }
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-800 p-4 rounded-lg">
      <canvas
        ref={canvasRef}
        width={width * scale}
        height={height * scale}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
        className="border-2 border-gray-600 cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
