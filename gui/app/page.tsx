'use client';

import { useState } from 'react';
import { chatApi } from '../api/chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = () => {
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage] as Message[]);
    setInput('');
    setIsLoading(true);

    try {
      let assistantMessage = { role: 'assistant', content: '', timestamp: Date.now() };
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
        }
      );
    } catch (error) {
      console.error('Chat Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI 助手</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={clearMessages}
              type="button"
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              清空对话
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-2`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 dark:text-white shadow-sm'}`}
            >
              <pre className="whitespace-pre-wrap break-words font-sans text-sm">
                {message.content}
              </pre>
              <div className="mt-1 text-xs opacity-70">
                {new Date(message.timestamp || Date.now()).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="输入消息...（按 Enter 发送）"
            className="flex-1 p-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </form>
    </div>
  );
}
