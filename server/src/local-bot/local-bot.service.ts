import { Injectable } from '@nestjs/common';
import ollama from 'ollama';

@Injectable()
export class LocalBotService {
    async chat(message: string) {
        try {
            const prompt = { role: 'user', content: message };
            const response = await ollama.chat({ model: 'qwen2.5:14b', messages: [prompt], stream: false });

            return {
                code: 200,
                timestamp: new Date().toISOString(),
                data: {
                    model: response.model,
                    message: response.message.content,
                },
            };
        } catch (error) {
            return {
                code: 500,
                timestamp: new Date().toISOString(),
                error: {
                    message: error.message || 'An unexpected error occurred',
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                },
            };
        }
    }

    async chatStream(message: string) {
        try {
            const prompt = { role: 'user', content: message };
            const response = await ollama.chat({ model: 'qwen2.5:14b', messages: [prompt], stream: true });

            for await (const part of response) {
                process.stdout.write(part.message.content)
            }
        } catch (error) {
            return {
                code: 500,
                timestamp: new Date().toISOString(),
                error: {
                    message: error.message || 'An unexpected error occurred',
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                },
            };
        }
    }
}
