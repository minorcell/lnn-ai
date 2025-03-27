export class BaseResponseDto<T> {
  code: number;
  data?: T;
  error?: any;
}
