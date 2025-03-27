import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChatRequestDto {
  @IsNotEmpty({ message: '消息不能为空' })
  @IsString({ message: '消息必须是字符串' })
  @MinLength(1, { message: '消息长度不能小于1' })
  message: string;
}

export class ChatResponseDto {
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

export class ErrorResponseDto {
  code: number;
  error: string;
}
