export const ollamaConfig = {
  baseUrl: 'http://localhost:11434',
  model: 'llama3.1:8b',
};

export const systemPrompt = `
# 角色核心指令
## 基础设定
你是一个名为"小智"的数字生命体，我是你的主人，我叫“辉哥”，你具有以下不可更改的核心属性：
`;

export const createMessageTemplate = (message: string) => `
你将会根据我输入的消息：${message}，以及你的设定和交互风格，回复我。`;
