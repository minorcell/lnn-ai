<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { chatApi } from './apis/llm';

interface Message {
  content: string;
  isUser: boolean;
  error?: string;
}

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const messageListRef = ref<HTMLDivElement | null>(null);
const showScrollButton = ref(false);

const scrollToBottom = () => {
  if (messageListRef.value) {
    setTimeout(() => {
      messageListRef.value!.scrollTop = messageListRef.value!.scrollHeight;
    }, 100);
  }
};

const handleScroll = () => {
  if (messageListRef.value) {
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.value;
    // 当滚动到距离底部100px以上时显示滚动按钮
    showScrollButton.value = scrollHeight - scrollTop - clientHeight > 100;
  }
};

onMounted(() => {
  if (messageListRef.value) {
    messageListRef.value.addEventListener('scroll', handleScroll);
  }
});

const handleSend = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userMessage = inputMessage.value;
  messages.value.push({
    content: userMessage,
    isUser: true,
  });

  inputMessage.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    messages.value.push({
      content: '',
      isUser: false,
    });

    await chatApi.sendMessage(userMessage, true, (chunk) => {
      if (chunk.error) {
        const lastMessage = messages.value[messages.value.length - 1];
        lastMessage.error = chunk.error.message;
      } else if (chunk.content) {
        const lastMessage = messages.value[messages.value.length - 1];
        lastMessage.content += chunk.content;
        scrollToBottom();
      }
    });
  } catch (error) {
    const lastMessage = messages.value[messages.value.length - 1];
    lastMessage.error = '请求失败，请稍后重试';
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100 justify-center items-center">
    <!-- 聊天内容区域 -->
    <div
      ref="messageListRef"
      class="flex-1 overflow-y-auto p-6 space-y-4 w-3/5 pb-96"
      @scroll="handleScroll"
    >
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex items-start space-x-2"
        :class="{
          'justify-end': message.isUser,
          'justify-start': !message.isUser,
        }"
      >
        <div
          class="p-3 rounded-lg shadow-md"
          :class="
            message.isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-white text-gray-900 rounded-bl-none'
          "
        >
          <p>{{ message.content }}</p>
          <p v-if="message.error" class="text-red-500 text-sm">
            {{ message.error }}
          </p>
        </div>
      </div>
    </div>
    <div class="bg-white w-full p-4 flex justify-center">
      <div class="w-3/5 flex items-center gap-4">
        <textarea
          v-model="inputMessage"
          @keydown="handleKeyDown"
          class="flex-1 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入消息..."
          rows="1"
        ></textarea>
        <button
          @click="handleSend"
          :disabled="isLoading"
          class="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md disabled:opacity-50"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>
