'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PixelCanvas from '@/components/PixelCanvas';
import Toolbar from '@/components/Toolbar';
import ColorPicker from '@/components/ColorPicker';
import LayerPanel from '@/components/LayerPanel';
import Timeline from '@/components/Timeline';
import { Tool, Layer, Frame, Pixel, Project } from '@/lib/types';

// Helper function to create empty pixels
const createEmptyPixels = (width: number, height: number): Pixel[][] => {
  return Array(height).fill(null).map(() =>
    Array(width).fill(null).map(() => ({ color: 'transparent' }))
  );
};

// Helper function to create a new layer
const createNewLayer = (width: number, height: number, name: string): Layer => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  pixels: createEmptyPixels(width, height),
  visible: true,
  opacity: 1,
});

// Helper function to create a new frame
const createNewFrame = (width: number, height: number): Frame => ({
  id: Math.random().toString(36).substr(2, 9),
  layers: [createNewLayer(width, height, 'Layer 1')],
  duration: 100,
});

export default function EditorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Project state
  const [project, setProject] = useState<Project>({
    name: 'Untitled Project',
    width: 32,
    height: 32,
    frames: [createNewFrame(32, 32)],
    currentFrameIndex: 0,
    currentLayerIndex: 0,
  });

  // Tool state
  const [currentTool, setCurrentTool] = useState<Tool>('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Undo/Redo state
  const [history, setHistory] = useState<Project[]>([project]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setIsLoading(false);
      } catch (error) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  // Save to history for undo/redo
  const saveToHistory = useCallback((newProject: Project) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(newProject))]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setProject(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setProject(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [historyIndex, history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'z' && e.shiftKey || e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          saveProject();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Animation playback
  useEffect(() => {
    if (isPlaying) {
      const playAnimation = () => {
        const currentFrame = project.frames[project.currentFrameIndex];
        animationRef.current = window.setTimeout(() => {
          setProject((prev) => ({
            ...prev,
            currentFrameIndex: (prev.currentFrameIndex + 1) % prev.frames.length,
          }));
          playAnimation();
        }, currentFrame.duration);
      };
      playAnimation();
    } else {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, project.currentFrameIndex, project.frames]);

  const currentFrame = project.frames[project.currentFrameIndex];
  const currentLayers = currentFrame.layers;

  const handlePixelChange = (layerIndex: number, x: number, y: number, color: string) => {
    setProject((prev) => {
      const newProject = JSON.parse(JSON.stringify(prev));
      if (!newProject.frames[prev.currentFrameIndex].layers[layerIndex].pixels[y]) {
        newProject.frames[prev.currentFrameIndex].layers[layerIndex].pixels[y] = [];
      }
      newProject.frames[prev.currentFrameIndex].layers[layerIndex].pixels[y][x] = { color };
      return newProject;
    });
  };

  const handleLayerAdd = () => {
    setProject((prev) => {
      const newProject = JSON.parse(JSON.stringify(prev));
      newProject.frames[prev.currentFrameIndex].layers.push(
        createNewLayer(prev.width, prev.height, `Layer ${newProject.frames[prev.currentFrameIndex].layers.length + 1}`)
      );
      newProject.currentLayerIndex = newProject.frames[prev.currentFrameIndex].layers.length - 1;
      saveToHistory(newProject);
      return newProject;
    });
  };

  const handleLayerDelete = (index: number) => {
    setProject((prev) => {
      const newProject = JSON.parse(JSON.stringify(prev));
      newProject.frames[prev.currentFrameIndex].layers.splice(index, 1);
      newProject.currentLayerIndex = Math.min(newProject.currentLayerIndex, newProject.frames[prev.currentFrameIndex].layers.length - 1);
      saveToHistory(newProject);
      return newProject;
    });
  };

  const handleFrameAdd = () => {
    setProject((prev) => {
      const newProject = JSON.parse(JSON.stringify(prev));
      newProject.frames.push(createNewFrame(prev.width, prev.height));
      newProject.currentFrameIndex = newProject.frames.length - 1;
      saveToHistory(newProject);
      return newProject;
    });
  };

  const handleFrameDelete = (index: number) => {
    setProject((prev) => {
      const newProject = JSON.parse(JSON.stringify(prev));
      newProject.frames.splice(index, 1);
      newProject.currentFrameIndex = Math.min(newProject.currentFrameIndex, newProject.frames.length - 1);
      saveToHistory(newProject);
      return newProject;
    });
  };

  const saveProject = async () => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) {
        alert('Project saved successfully!');
      }
    } catch (error) {
      alert('Failed to save project');
    }
  };

  const exportPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = project.width;
    canvas.height = project.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    currentLayers.forEach((layer) => {
      if (!layer.visible) return;
      ctx.globalAlpha = layer.opacity;
      for (let y = 0; y < project.height; y++) {
        for (let x = 0; x < project.width; x++) {
          const pixel = layer.pixels[y]?.[x];
          if (pixel && pixel.color && pixel.color !== 'transparent') {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
          >
            ← Dashboard
          </button>
          <input
            type="text"
            value={project.name}
            onChange={(e) => setProject({ ...project, name: e.target.value })}
            className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Welcome, {user?.username}</span>
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
          <button
            onClick={saveProject}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            title="Save (Ctrl+S)"
          >
            💾 Save
          </button>
          <button
            onClick={exportPNG}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            📥 Export PNG
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="grid grid-cols-[250px_1fr_250px] gap-4">
        {/* Left Sidebar */}
        <div className="space-y-4">
          <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
          <ColorPicker currentColor={currentColor} onColorChange={setCurrentColor} />
        </div>

        {/* Center - Canvas */}
        <div className="space-y-4">
          <PixelCanvas
            width={project.width}
            height={project.height}
            layers={currentLayers}
            currentLayerIndex={project.currentLayerIndex}
            currentTool={currentTool}
            currentColor={currentColor}
            onPixelChange={handlePixelChange}
            onColorPick={setCurrentColor}
          />
          <Timeline
            frames={project.frames}
            currentFrameIndex={project.currentFrameIndex}
            onFrameSelect={(index) => setProject({ ...project, currentFrameIndex: index })}
            onFrameAdd={handleFrameAdd}
            onFrameDelete={handleFrameDelete}
            onFrameDurationChange={(index, duration) => {
              setProject((prev) => {
                const newProject = JSON.parse(JSON.stringify(prev));
                newProject.frames[index].duration = duration;
                return newProject;
              });
            }}
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
          />
        </div>

        {/* Right Sidebar */}
        <div>
          <LayerPanel
            layers={currentLayers}
            currentLayerIndex={project.currentLayerIndex}
            onLayerSelect={(index) => setProject({ ...project, currentLayerIndex: index })}
            onLayerAdd={handleLayerAdd}
            onLayerDelete={handleLayerDelete}
            onLayerToggleVisibility={(index) => {
              setProject((prev) => {
                const newProject = JSON.parse(JSON.stringify(prev));
                newProject.frames[prev.currentFrameIndex].layers[index].visible =
                  !newProject.frames[prev.currentFrameIndex].layers[index].visible;
                return newProject;
              });
            }}
            onLayerOpacityChange={(index, opacity) => {
              setProject((prev) => {
                const newProject = JSON.parse(JSON.stringify(prev));
                newProject.frames[prev.currentFrameIndex].layers[index].opacity = opacity;
                return newProject;
              });
            }}
            onLayerRename={(index, name) => {
              setProject((prev) => {
                const newProject = JSON.parse(JSON.stringify(prev));
                newProject.frames[prev.currentFrameIndex].layers[index].name = name;
                return newProject;
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
