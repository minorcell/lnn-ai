import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  code: number;
  error: {
    message: string;
    path?: string;
    stack?: string;
  };
}

interface HttpExceptionResponse {
  message: string | string[];
  [key: string]: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionResponse =
        exception.getResponse() as HttpExceptionResponse;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        const exceptionMessage = exceptionResponse.message;
        if (Array.isArray(exceptionMessage)) {
          message = exceptionMessage[0];
        } else if (typeof exceptionMessage === 'string') {
          message = exceptionMessage;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      code: status,
      error: {
        message,
        path: request.url,
        stack:
          process.env.NODE_ENV === 'development' && exception instanceof Error
            ? exception.stack
            : undefined,
      },
    };

    response.status(status).json(errorResponse);
  }
}
