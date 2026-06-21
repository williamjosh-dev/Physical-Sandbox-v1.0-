export interface Message {
    id: string;
    sender: 'user' | 'llm';
    text: string;
  }
  
  export interface ModelConfig {
    type: 'box' | 'sphere' | 'cylinder' | 'torus';
    position: [number, number, number];
    color: string;
    scale: [number, number, number];
    wireframe: boolean;
  }
  