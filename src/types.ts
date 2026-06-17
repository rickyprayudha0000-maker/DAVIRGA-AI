export interface ApiConfig {
  apiKey: string;
  apiKeys?: string[];
  baseUrl: string;
  imageModel: string;
  videoModel: string;
  musicModel: string;
}

export type GenerationTab = 
  | '3saudara-ai'
  | 'txt2img'
  | 'img2img'
  | 'txt2vid'
  | 'img2vid'
  | 'music'
  | 'storyboard'
  | 'enhancer'
  | 'chat'
  | 'settings';

export interface GenerationHistoryItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'storyboard' | 'prompt' | 'chat';
  title: string;
  prompt: string;
  negativePrompt?: string;
  timestamp: string;
  outputUrl: string; // url or data:uri
  thumbnailUrl?: string;
  meta?: {
    ratio?: string;
    duration?: string;
    model?: string;
    genre?: string;
    scenes?: StoryboardScene[];
    enhancedPrompt?: string;
  };
}

export interface StoryboardScene {
  sceneNo: number;
  title: string;
  description: string;
  visualPrompt: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
