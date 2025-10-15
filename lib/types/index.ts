export type Tool =
  | 'pencil'
  | 'eraser'
  | 'fill'
  | 'eyedropper'
  | 'line'
  | 'rectangle'
  | 'circle';

export interface Pixel {
  color: string;
}

export interface Layer {
  id: string;
  name: string;
  pixels: Pixel[][];
  visible: boolean;
  opacity: number;
}

export interface Frame {
  id: string;
  layers: Layer[];
  duration: number; // in milliseconds
}

export interface Project {
  id?: string;
  name: string;
  width: number;
  height: number;
  frames: Frame[];
  currentFrameIndex: number;
  currentLayerIndex: number;
}

export interface User {
  id: string;
  username: string;
  color: string; // for cursor display
  cursorX: number;
  cursorY: number;
}

export interface CollaborationState {
  projectId: string;
  users: User[];
}
