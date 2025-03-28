import { Response } from 'express';

export interface LLMService {
  chat(
    message: string,
    stream?: boolean,
    response?: EnhancedResponse,
  ): Promise<any>;
}

export interface EnhancedResponse extends Response {
  flush?: () => void;
}

// OpenAI 响应接口
export interface OpenAIResponse {
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// OpenAI 流式响应接口
export interface OpenAIStreamResponse {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}

// Ollama 响应接口
export interface OllamaResponse {
  model: string;
  message: {
    content: string;
  };
}
