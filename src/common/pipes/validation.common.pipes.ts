import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'validation error',
        cause: {
          issues: result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
      });
    }

    return result.data;
  }
}
