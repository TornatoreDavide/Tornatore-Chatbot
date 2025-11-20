export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface VideoGenerationState {
  isLoading: boolean;
  videoUrl: string | null;
  error: string | null;
  progressStep?: string;
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

// Augment window for Veo API key selection
declare global {
  // The environment defines window.aistudio as type AIStudio.
  // We augment the AIStudio interface to ensure the methods we need are available.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
