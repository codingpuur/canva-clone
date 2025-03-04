// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  token?: string;
}

// Canvas Types
export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'flip';
  x: number;
  y: number;
  width: number;
  height: number;
  content: any;
  style?: any;
  zIndex: number;
}

export interface TextElement extends CanvasElement {
  type: 'text';
  content: string;
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
  };
}

export interface ImageElement extends CanvasElement {
  type: 'image';
  content: string; // URL
  style: {
    objectFit: 'cover' | 'contain' | 'fill';
    opacity: number;
    borderRadius: number;
  };
}

export interface FlipElement extends CanvasElement {
  type: 'flip';
  content: {
    front: string;
    back: string;
  };
  flipped: boolean;
}

export interface CanvasPage {
  id: string;
  name: string;
  elements: CanvasElement[];
  background: string;
}

export interface CanvasProject {
  id: string;
  name: string;
  pages: CanvasPage[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  collaborators: string[];
}


export interface CursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
}

// Weather Types
export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}