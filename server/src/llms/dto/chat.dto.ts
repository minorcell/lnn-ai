import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum ModelType {
  OPENAI = 'openai',
  OLLAMA = 'ollama',
}

export class ChatRequestDto {
  @IsNotEmpty({ message: '消息不能为空' })
  @IsString({ message: '消息必须是字符串' })
  @MinLength(1, { message: '消息长度不能小于1' })
  message: string;

  @IsEnum(ModelType, { message: '模型类型必须是 openai 或 ollama' })
  @IsOptional()
  modelType?: ModelType;

  @IsBoolean({ message: '流式标志必须是布尔值' })
  @IsOptional()
  stream?: boolean;
}

// OpenAI 响应的 DTO
export class OpenAIResponseDto {
  code: number;
  data: {
    message: string;
    id: string;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  error?: any;
}

// 本地模型响应的 DTO
export class LocalModelResponseDto {
  code: number;
  data: {
    model: string;
    message: string;
  };
  error?: any;
}

export class ErrorResponseDto {
  code: number;
  error:
    | string
    | {
        message: string;
        stack?: string;
      };
}
