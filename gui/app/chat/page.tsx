'use client';

import { useState } from 'react';
import { chatApi } from '../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage] as Message[]);
    setInput('');
    setIsLoading(true);

    try {
      let assistantMessage = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage] as Message[]);

      await chatApi.sendMessage(
        userMessage.content,
        true,
        (chunk) => {
          if (chunk.content) {
            assistantMessage.content += chunk.content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: 'assistant' as const, content: assistantMessage.content };
              return newMessages;
            });
          }
          if (chunk.error) {
            console.error('Stream Error:', chunk.error);
            assistantMessage.content += '\n[Error: ' + chunk.error.message + ']';
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: 'assistant' as const, content: assistantMessage.content };
              return newMessages;
            });
          }
          if (chunk.done) {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Send Message Error:', error);
      const errorMessage = { role: 'assistant', content: '[Error: Failed to send message]' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage] as Message[]);
    } finally {
      if (isLoading) setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          发送
        </button>
      </form>
    </div>
  );
}