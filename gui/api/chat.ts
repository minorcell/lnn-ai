// API接口管理文件

const BASE_URL = 'http://localhost:3000';

interface ChatResponse {
    model: string;
    message: string;
}

interface StreamChunk {
    content?: string;
    done?: boolean;
    error?: {
        message: string;
        stack?: string;
    };
}

export const chatApi = {
    /**
     * 发送聊天消息
     * @param message 用户输入的消息
     * @param stream 是否使用流式响应
     * @param onChunk 流式响应的回调函数
     */
    sendMessage: async (message: string, stream = false, onChunk?: (chunk: StreamChunk) => void): Promise<ChatResponse | void> => {
        const response = await fetch(`${BASE_URL}/api/llms/lln-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, stream })
        });

        if (!response.ok) {
            throw new Error('请求失败');
        }

        if (stream && onChunk) {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('无法获取响应流');
            }

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const rawData = line.slice(6).trim();
                        if (rawData === '[DONE]') {
                            onChunk({ done: true });
                            break;
                        }
                        try {
                            const data = JSON.parse(rawData);
                            onChunk({
                                content: data.data?.message,
                                error: data.error
                            });
                            if (data.error) break;
                        } catch (e) {
                            console.error('解析数据失败:', e);
                            onChunk({
                                error: {
                                    message: '数据解析失败，请稍后重试'
                                }
                            });
                            break;
                        }
                    }
                }
            }
            return;
        }

        return response.json();
    }
};