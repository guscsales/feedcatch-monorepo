import { StatusCodes } from '@/helpers/enums/status-codes';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const SCHEMA_VALIDATOR_KEY = 'schema-validator';

export const SchemaValidator = (schema: any) =>
  SetMetadata(SCHEMA_VALIDATOR_KEY, schema);

@Injectable()
export class SchemaValidatorGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const schemaToValidate = this.reflector.get(
      SCHEMA_VALIDATOR_KEY,
      context.getHandler(),
    );

    if (!schemaToValidate) {
      return true;
    }

    const http = context.switchToHttp();
    const { body } = http.getRequest();
    const res = http.getResponse();

    try {
      schemaToValidate.parse(body);
      return true;
    } catch (e) {
      res.status(StatusCodes.BadRequest).json({ errors: e?.issues || [] });
      return false;
    }
  }
}
