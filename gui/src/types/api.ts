export interface ChatMessage {
    role: 'user' | 'system';
    content: string;
}

export interface ChatRequest {
    messages: ChatMessage[];
    stream?: boolean;
}

export interface ChatResponse {
    content: string;
    role: 'assistant';
}
