import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChatRequestDto {
  @IsNotEmpty({ message: '消息不能为空' })
  @IsString({ message: '消息必须是字符串' })
  @MinLength(1, { message: '消息长度不能小于1' })
  message: string;
}

export class ChatResponseDto {
  code: number;
  timestamp: string;
  message: string;
  data: {
    model: string;
    message: string;
  };
  error?: any;
}

export class ErrorResponseDto {
  code: number;
  timestamp: string;
  error: {
    message: string;
    stack?: string;
  };
}
