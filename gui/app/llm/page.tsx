'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import EmojiPicker from 'emoji-picker-react';
import { chatApi } from '@/api/chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

export default function LLMChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantMessage: Message = {
        role: 'assistant',
        content: ''
      };
      setMessages(prev => [...prev, assistantMessage]);

      await chatApi.sendMessage(input.trim(), true, (chunk) => {
        if (chunk.error) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: chunk.error?.message || '发生错误，请稍后重试',
              error: true
            };
            return newMessages;
          });
          return;
        }

        if (chunk.content) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: newMessages[newMessages.length - 1].content + chunk.content
            };
            return newMessages;
          });
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: '发生错误，请稍后重试',
          error: true
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setInput(input + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-auto p-4 flex justify-center">
        <div className="w-3/5 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : message.error ? 'bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2 max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-center">
        <div className="w-3/5 flex gap-2">
          <motion.input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <motion.button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-lg"
            whileHover={{ scale: 1.05, backgroundColor: '#e5e7eb' }}
            whileTap={{ scale: 0.95 }}
          >
            😊
          </motion.button>
          <motion.button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            Send
          </motion.button>
        </div>
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'relative', left: '-50%' }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
            </motion.div>
          </div>
        )}
      </footer>
    </div>
  );
}