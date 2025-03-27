import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  data?: T;
  error?: unknown;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data): Response<T> => {
        if (data && typeof data === 'object' && 'code' in data) {
          return data as Response<T>;
        }

        const responseData: Response<T> = {
          code: 200,
          data: data as T,
        };
        return responseData;
      }),
    );
  }
}
