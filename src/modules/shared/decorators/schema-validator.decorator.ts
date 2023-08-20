import { StatusCodes } from '@/helpers/enums/status-codes';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const SCHEMA_VALIDATOR_KEY = 'schemaValidator';

type ValidatorSources = 'body' | 'query' | 'params';

export const SchemaValidator = (
  schema: any,
  validatorSource: ValidatorSources = 'body',
) => SetMetadata(SCHEMA_VALIDATOR_KEY, { schema, validatorSource });

@Injectable()
export class SchemaValidatorGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const schemaValidatorProps = this.reflector.get(
      SCHEMA_VALIDATOR_KEY,
      context.getHandler(),
    );

    if (!schemaValidatorProps) {
      return true;
    }

    const { schema: schemaToValidate, validatorSource } = schemaValidatorProps;

    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    try {
      schemaToValidate.parse(req[validatorSource]);
      return true;
    } catch (e) {
      res.status(StatusCodes.BadRequest).json({ errors: e?.issues || [] });
      return false;
    }
  }
}