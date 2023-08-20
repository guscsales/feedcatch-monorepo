import { Body, Controller, Post, Query } from '@nestjs/common';
import { AuthService } from '@/modules/auth/services/auth.service';
import { SchemaValidator } from '@/modules/shared/decorators/schema-validator.decorator';
import { loginOrCreateFromMagicLinkValidator } from '@/modules/auth/validators/login-or-create-from-magic-link.validator';
import { authenticateFromMagicLinkValidator } from '../validators/authenticate-from-magic-link.validator copy';
import { PublicRoute } from '@/modules/auth/decorators/auth-validation.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @PublicRoute()
  @Post('/magic/login')
  @SchemaValidator(loginOrCreateFromMagicLinkValidator)
  public async loginOrCreateFromMagicLink(@Body() payload) {
    const data = await this.authService.loginOrCreateFromMagicLink(payload);
    return data;
  }

  @PublicRoute()
  @Post('/magic/authenticate')
  @SchemaValidator(authenticateFromMagicLinkValidator, 'query')
  public async authenticateFromMagicLink(@Query('token') token: string) {
    const data = await this.authService.authenticateFromMagicLink({ token });

    return data;
  }
}
